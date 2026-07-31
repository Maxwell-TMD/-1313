import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { RecordFilters, RecordInput } from "@/lib/validation/record";

const OWNER_KEY = "single-user";
export const RECORDS_PER_PAGE = 20;

export function buildRecordWhere(
  filters: Partial<RecordFilters>,
): Prisma.PracticeRecordWhereInput {
  return {
    ownerKey: OWNER_KEY,
    ...(filters.startDate || filters.endDate
      ? {
          date: {
            ...(filters.startDate ? { gte: filters.startDate } : {}),
            ...(filters.endDate ? { lte: filters.endDate } : {}),
          },
        }
      : {}),
    ...(filters.examType ? { examType: filters.examType } : {}),
    ...(filters.subject ? { subject: filters.subject } : {}),
    ...(filters.primaryCategoryId
      ? { primaryCategoryId: filters.primaryCategoryId }
      : {}),
    ...(filters.secondaryCategoryId
      ? { secondaryCategoryId: filters.secondaryCategoryId }
      : {}),
  };
}

export async function getPaginatedRecords(filters: RecordFilters) {
  const where = buildRecordWhere(filters);
  const [records, total] = await prisma.$transaction([
    prisma.practiceRecord.findMany({
      where,
      include: { primaryCategory: true, secondaryCategory: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (filters.page - 1) * RECORDS_PER_PAGE,
      take: RECORDS_PER_PAGE,
    }),
    prisma.practiceRecord.count({ where }),
  ]);

  return {
    records,
    total,
    totalPages: Math.max(1, Math.ceil(total / RECORDS_PER_PAGE)),
  };
}

export function getRecordById(id: string) {
  return prisma.practiceRecord.findFirst({
    where: { id, ownerKey: OWNER_KEY },
    include: { primaryCategory: true, secondaryCategory: true },
  });
}

export async function assertCategorySelection(input: RecordInput) {
  const primary = await prisma.primaryCategory.findFirst({
    where: { id: input.primaryCategoryId, subject: input.subject },
  });
  if (!primary) throw new Error("所选一级模块与科目不匹配");

  if (input.secondaryCategoryId) {
    const secondary = await prisma.secondaryCategory.findFirst({
      where: {
        id: input.secondaryCategoryId,
        primaryCategoryId: input.primaryCategoryId,
      },
    });
    if (!secondary) throw new Error("所选二级模块与一级模块不匹配");
  }
}

export async function createRecord(input: RecordInput) {
  await assertCategorySelection(input);
  return prisma.practiceRecord.create({
    data: {
      ...input,
      ownerKey: OWNER_KEY,
      secondaryCategoryId: input.secondaryCategoryId || null,
      source: input.source || null,
      notes: input.notes || null,
    },
  });
}

export async function updateRecord(id: string, input: RecordInput) {
  await assertCategorySelection(input);
  const existing = await prisma.practiceRecord.findFirst({
    where: { id, ownerKey: OWNER_KEY },
    select: { id: true },
  });
  if (!existing) throw new Error("记录不存在或已被删除");

  return prisma.practiceRecord.update({
    where: { id },
    data: {
      ...input,
      secondaryCategoryId: input.secondaryCategoryId || null,
      source: input.source || null,
      notes: input.notes || null,
    },
  });
}

export async function deleteRecord(id: string) {
  const result = await prisma.practiceRecord.deleteMany({
    where: { id, ownerKey: OWNER_KEY },
  });
  if (result.count === 0) throw new Error("记录不存在或已被删除");
}
