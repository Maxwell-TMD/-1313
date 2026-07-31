import { prisma } from "@/lib/db/prisma";
import { rowsToCsv } from "@/lib/csv";
import { calculateAccuracy } from "@/lib/stats/accuracy";

export async function GET() {
  const records = await prisma.practiceRecord.findMany({
    where: { ownerKey: "single-user" },
    include: { primaryCategory: true, secondaryCategory: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  const rows: Array<Array<string | number | null>> = [
    ["日期", "考试类型", "科目", "一级模块", "二级模块", "做题数量", "答对数量", "正确率", "用时（分钟）", "题目来源", "备注"],
    ...records.map((record) => [
      record.date,
      record.examType,
      record.subject,
      record.primaryCategory.name,
      record.secondaryCategory?.name ?? "",
      record.totalQuestions,
      record.correctQuestions,
      `${calculateAccuracy(record.correctQuestions, record.totalQuestions)?.toFixed(1) ?? ""}%`,
      record.durationMinutes,
      record.source,
      record.notes,
    ]),
  ];
  const date = new Date().toISOString().slice(0, 10);
  return new Response(rowsToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gongkao-records-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
