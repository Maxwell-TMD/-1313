import { z } from "zod";
import { EXAM_TYPES } from "@/lib/constants/exams";

const moduleResultSchema = z
  .object({
    primaryCategoryId: z.string().min(1),
    totalQuestions: z.coerce.number().int().min(0, "题目数不能为负数"),
    correctQuestions: z.coerce.number().int().min(0, "答对数不能为负数"),
    score: z.coerce.number().min(0, "得分不能为负数"),
  })
  .superRefine((result, context) => {
    if (result.correctQuestions > result.totalQuestions) {
      context.addIssue({
        code: "custom",
        path: ["correctQuestions"],
        message: "答对数不能大于题目数",
      });
    }
    if (result.totalQuestions === 0 && result.score > 0) {
      context.addIssue({
        code: "custom",
        path: ["score"],
        message: "填写得分前请先填写题目数",
      });
    }
  });

export const paperSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "请选择有效日期"),
    name: z.string().trim().min(1, "请输入试卷名称").max(100, "试卷名称不能超过 100 字"),
    examType: z.enum(EXAM_TYPES),
    notes: z.string().trim().max(1000, "备注不能超过 1000 字").optional(),
    modules: z.array(moduleResultSchema).min(1),
  })
  .superRefine((paper, context) => {
    const ids = new Set<string>();
    for (const [index, result] of paper.modules.entries()) {
      if (ids.has(result.primaryCategoryId)) {
        context.addIssue({
          code: "custom",
          path: ["modules", index, "primaryCategoryId"],
          message: "试卷模块不能重复",
        });
      }
      ids.add(result.primaryCategoryId);
    }

    if (!paper.modules.some((result) => result.totalQuestions > 0)) {
      context.addIssue({
        code: "custom",
        path: ["modules"],
        message: "请至少填写一个模块的题目数",
      });
    }
  })
  .transform((paper) => ({
    ...paper,
    notes: paper.notes || undefined,
    modules: paper.modules.filter((result) => result.totalQuestions > 0),
  }));

export type PaperInput = z.infer<typeof paperSchema>;
