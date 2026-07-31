import { prisma } from "@/lib/db/prisma";
import type { BackupPayload } from "@/lib/validation/backup";

export async function createBackupPayload(): Promise<BackupPayload> {
  const [categories, records] = await Promise.all([
    prisma.primaryCategory.findMany({
      include: { secondaryCategories: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ subject: "desc" }, { sortOrder: "asc" }],
    }),
    prisma.practiceRecord.findMany({
      where: { ownerKey: "single-user" },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    categories: categories.map((category) => ({
      id: category.id,
      subject: category.subject as "行测" | "申论",
      name: category.name,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      secondaryCategories: category.secondaryCategories.map((secondary) => ({
        id: secondary.id,
        name: secondary.name,
        sortOrder: secondary.sortOrder,
        isActive: secondary.isActive,
      })),
    })),
    records: records.map((record) => ({
      id: record.id,
      date: record.date,
      examType: record.examType as "国考" | "省考" | "事业单位" | "其他",
      subject: record.subject as "行测" | "申论",
      primaryCategoryId: record.primaryCategoryId,
      secondaryCategoryId: record.secondaryCategoryId,
      totalQuestions: record.totalQuestions,
      correctQuestions: record.correctQuestions,
      durationMinutes: record.durationMinutes,
      source: record.source,
      notes: record.notes,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    })),
  };
}

export async function replaceAllData(backup: BackupPayload) {
  await prisma.$transaction(async (transaction) => {
    await transaction.practiceRecord.deleteMany({ where: { ownerKey: "single-user" } });
    await transaction.secondaryCategory.deleteMany();
    await transaction.primaryCategory.deleteMany();

    for (const category of backup.categories) {
      await transaction.primaryCategory.create({
        data: {
          id: category.id,
          subject: category.subject,
          name: category.name,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
          secondaryCategories: {
            create: category.secondaryCategories.map((secondary) => ({
              id: secondary.id,
              name: secondary.name,
              sortOrder: secondary.sortOrder,
              isActive: secondary.isActive,
            })),
          },
        },
      });
    }

    for (const record of backup.records) {
      await transaction.practiceRecord.create({
        data: {
          ...record,
          ownerKey: "single-user",
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
        },
      });
    }
  });
}
