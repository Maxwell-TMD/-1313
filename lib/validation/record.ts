import { z } from "zod";
import { EXAM_TYPES, SUBJECTS } from "@/lib/constants/exams";

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const recordSchema = z
  .object({
    date: z.string().refine(isValidDate, "请选择有效日期"),
    examType: z.enum(EXAM_TYPES, { message: "请选择考试类型" }),
    subject: z.enum(SUBJECTS, { message: "请选择科目" }),
    primaryCategoryId: z.string().min(1, "请选择一级模块"),
    secondaryCategoryId: z.string().optional(),
    totalQuestions: z.coerce
      .number({ message: "请输入做题数量" })
      .int("做题数量必须是整数")
      .positive("做题数量必须大于 0"),
    correctQuestions: z.coerce
      .number({ message: "请输入答对数量" })
      .int("答对数量必须是整数")
      .min(0, "答对数量不能小于 0"),
    durationMinutes: z.coerce
      .number({ message: "请输入用时" })
      .int("用时必须是整数")
      .min(0, "用时不能为负数"),
    source: z.string().trim().max(100, "题目来源不能超过 100 个字").optional(),
    notes: z.string().trim().max(1000, "备注不能超过 1000 个字").optional(),
  })
  .refine((data) => data.correctQuestions <= data.totalQuestions, {
    message: "答对数量不能大于做题数量",
    path: ["correctQuestions"],
  });

export type RecordInput = z.infer<typeof recordSchema>;

export const recordFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  examType: z.enum(EXAM_TYPES).optional(),
  subject: z.enum(SUBJECTS).optional(),
  primaryCategoryId: z.string().optional(),
  secondaryCategoryId: z.string().optional(),
  page: z.coerce.number().int().positive().catch(1),
});

export type RecordFilters = z.infer<typeof recordFilterSchema>;
