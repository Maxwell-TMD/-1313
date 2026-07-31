"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { replaceAllData } from "@/lib/backup";
import { backupSchema } from "@/lib/validation/backup";

export type DataActionResult = { success: boolean; message: string };

function revalidateStatistics() {
  revalidatePath("/");
  revalidatePath("/records");
  revalidatePath("/analytics");
  revalidatePath("/settings");
}

export async function replaceAllDataAction(serialized: string): Promise<DataActionResult> {
  if (serialized.length > 10_000_000) return { success: false, message: "备份文件过大" };
  let data: unknown;
  try {
    data = JSON.parse(serialized);
  } catch {
    return { success: false, message: "JSON 文件无法解析" };
  }
  const parsed = backupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "备份格式不正确" };
  }
  try {
    await replaceAllData(parsed.data);
    revalidateStatistics();
    return { success: true, message: `已恢复 ${parsed.data.records.length} 条记录` };
  } catch {
    return { success: false, message: "恢复失败，原有数据未被修改" };
  }
}

export async function clearAllDataAction(confirmation: string): Promise<DataActionResult> {
  if (confirmation !== "清空全部数据") {
    return { success: false, message: "确认文字不正确" };
  }
  await prisma.practiceRecord.deleteMany({ where: { ownerKey: "single-user" } });
  revalidateStatistics();
  return { success: true, message: "全部练习记录已清空" };
}
