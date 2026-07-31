import Link from "next/link";
import type { PracticeRecord, PrimaryCategory, SecondaryCategory } from "@prisma/client";
import { ChevronLeft, ChevronRight, Eye, Pencil } from "lucide-react";
import { DeleteRecordDialog } from "@/components/records/delete-record-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
import { calculateAccuracy, formatAccuracy } from "@/lib/stats/accuracy";

type RecordWithCategories = PracticeRecord & {
  primaryCategory: PrimaryCategory;
  secondaryCategory: SecondaryCategory | null;
};

function pageHref(current: URLSearchParams, page: number) {
  const params = new URLSearchParams(current);
  params.set("page", String(page));
  return `/records?${params.toString()}`;
}

export function RecordList({
  records,
  page,
  totalPages,
  query,
}: {
  records: RecordWithCategories[];
  page: number;
  totalPages: number;
  query: URLSearchParams;
}) {
  if (records.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-14 text-center">
          <p className="font-medium">没有找到练习记录</p>
          <p className="mt-1 text-sm text-muted-foreground">调整筛选条件，或先新增一次练习。</p>
          <Button asChild className="mt-5"><Link href="/records/new">新增记录</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {records.map((record) => {
          const accuracy = formatAccuracy(calculateAccuracy(record.correctQuestions, record.totalQuestions));
          return (
            <Card key={record.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{record.primaryCategory.name}{record.secondaryCategory ? ` · ${record.secondaryCategory.name}` : ""}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDate(record.date)} · {record.examType} · {record.subject}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{accuracy}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div><span className="block text-xs text-muted-foreground">题量</span>{record.totalQuestions} 题</div>
                  <div><span className="block text-xs text-muted-foreground">答对</span>{record.correctQuestions} 题</div>
                  <div><span className="block text-xs text-muted-foreground">用时</span>{record.durationMinutes} 分钟</div>
                </div>
                <div className="mt-4 flex border-t pt-3">
                  <Button asChild variant="ghost" size="sm"><Link href={`/records/${record.id}`}><Eye aria-hidden="true" />详情</Link></Button>
                  <Button asChild variant="ghost" size="sm"><Link href={`/records/${record.id}/edit`}><Pencil aria-hidden="true" />编辑</Link></Button>
                  <DeleteRecordDialog id={record.id} compact />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/60 text-muted-foreground">
            <tr><th className="px-4 py-3 font-medium">日期</th><th className="px-4 py-3 font-medium">考试 / 科目</th><th className="px-4 py-3 font-medium">模块</th><th className="px-4 py-3 font-medium">题量</th><th className="px-4 py-3 font-medium">正确率</th><th className="px-4 py-3 font-medium">用时</th><th className="px-4 py-3 text-right font-medium">操作</th></tr>
          </thead>
          <tbody className="divide-y">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-muted/35">
                <td className="whitespace-nowrap px-4 py-3">{formatDate(record.date)}</td>
                <td className="px-4 py-3">{record.examType} · {record.subject}</td>
                <td className="px-4 py-3">{record.primaryCategory.name}{record.secondaryCategory ? ` / ${record.secondaryCategory.name}` : ""}</td>
                <td className="px-4 py-3">{record.correctQuestions}/{record.totalQuestions}</td>
                <td className="px-4 py-3 font-medium">{formatAccuracy(calculateAccuracy(record.correctQuestions, record.totalQuestions))}</td>
                <td className="px-4 py-3">{record.durationMinutes} 分钟</td>
                <td className="px-4 py-3"><div className="flex justify-end"><Button asChild variant="ghost" size="sm"><Link href={`/records/${record.id}`}>详情</Link></Button><Button asChild variant="ghost" size="sm"><Link href={`/records/${record.id}/edit`}>编辑</Link></Button><DeleteRecordDialog id={record.id} compact /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <nav className="mt-5 flex items-center justify-between" aria-label="历史记录分页">
          <Button asChild={page > 1} variant="outline" size="sm" disabled={page <= 1}>{page > 1 ? <Link href={pageHref(query, page - 1)}><ChevronLeft aria-hidden="true" />上一页</Link> : <><ChevronLeft aria-hidden="true" />上一页</>}</Button>
          <span className="text-sm text-muted-foreground">第 {page} / {totalPages} 页</span>
          <Button asChild={page < totalPages} variant="outline" size="sm" disabled={page >= totalPages}>{page < totalPages ? <Link href={pageHref(query, page + 1)}>下一页<ChevronRight aria-hidden="true" /></Link> : <>下一页<ChevronRight aria-hidden="true" /></>}</Button>
        </nav>
      ) : null}
    </>
  );
}
