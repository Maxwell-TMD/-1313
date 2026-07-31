import { z } from "zod";
import { EXAM_TYPES, SUBJECTS } from "@/lib/constants/exams";

const secondaryCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

const primaryCategorySchema = z.object({
  id: z.string().min(1),
  subject: z.enum(SUBJECTS),
  name: z.string().min(1).max(50),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  secondaryCategories: z.array(secondaryCategorySchema),
});

const backupRecordSchema = z
  .object({
    id: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    examType: z.enum(EXAM_TYPES),
    subject: z.enum(SUBJECTS),
    primaryCategoryId: z.string().min(1),
    secondaryCategoryId: z.string().nullable(),
    totalQuestions: z.number().int().positive(),
    correctQuestions: z.number().int().min(0),
    durationMinutes: z.number().int().min(0),
    source: z.string().max(100).nullable(),
    notes: z.string().max(1000).nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .refine((record) => record.correctQuestions <= record.totalQuestions, {
    message: "备份中存在答对数量大于做题数量的记录",
  });

const backupPaperModuleSchema = z
  .object({
    id: z.string().min(1),
    primaryCategoryId: z.string().min(1),
    totalQuestions: z.number().int().positive(),
    correctQuestions: z.number().int().min(0),
    score: z.number().min(0),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .refine((result) => result.correctQuestions <= result.totalQuestions, {
    message: "备份中存在试卷答对数大于题目数的模块",
  });

const backupPaperSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().min(1).max(100),
  examType: z.enum(EXAM_TYPES),
  notes: z.string().max(1000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  moduleResults: z.array(backupPaperModuleSchema),
});

export const backupSchema = z
  .object({
    schemaVersion: z.union([z.literal(1), z.literal(2)]),
    exportedAt: z.string().datetime(),
    categories: z.array(primaryCategorySchema),
    records: z.array(backupRecordSchema).max(100000),
    papers: z.array(backupPaperSchema).max(10000).default([]),
  })
  .superRefine((backup, context) => {
    const primaryIds = new Set<string>();
    const secondaryParents = new Map<string, string>();
    for (const category of backup.categories) {
      if (primaryIds.has(category.id)) {
        context.addIssue({ code: "custom", message: `一级模块 ID 重复：${category.id}` });
      }
      primaryIds.add(category.id);
      for (const secondary of category.secondaryCategories) {
        if (secondaryParents.has(secondary.id)) {
          context.addIssue({ code: "custom", message: `二级模块 ID 重复：${secondary.id}` });
        }
        secondaryParents.set(secondary.id, category.id);
      }
    }

    const recordIds = new Set<string>();
    for (const record of backup.records) {
      if (recordIds.has(record.id)) {
        context.addIssue({ code: "custom", message: `练习记录 ID 重复：${record.id}` });
      }
      recordIds.add(record.id);
      if (!primaryIds.has(record.primaryCategoryId)) {
        context.addIssue({ code: "custom", message: `记录引用了不存在的一级模块：${record.id}` });
      }
      if (
        record.secondaryCategoryId &&
        secondaryParents.get(record.secondaryCategoryId) !== record.primaryCategoryId
      ) {
        context.addIssue({ code: "custom", message: `记录的二级模块引用无效：${record.id}` });
      }
    }

    const paperIds = new Set<string>();
    const paperModuleIds = new Set<string>();
    for (const paper of backup.papers) {
      if (paperIds.has(paper.id)) {
        context.addIssue({ code: "custom", message: `试卷 ID 重复：${paper.id}` });
      }
      paperIds.add(paper.id);
      const paperCategories = new Set<string>();
      for (const result of paper.moduleResults) {
        if (paperModuleIds.has(result.id)) {
          context.addIssue({ code: "custom", message: `试卷模块结果 ID 重复：${result.id}` });
        }
        paperModuleIds.add(result.id);
        if (!primaryIds.has(result.primaryCategoryId)) {
          context.addIssue({ code: "custom", message: `试卷引用了不存在的一级模块：${paper.id}` });
        }
        if (paperCategories.has(result.primaryCategoryId)) {
          context.addIssue({ code: "custom", message: `试卷包含重复模块：${paper.id}` });
        }
        paperCategories.add(result.primaryCategoryId);
      }
    }
  });

export type BackupPayload = z.infer<typeof backupSchema>;
