import { prisma } from "@/lib/db/prisma";
import { calculateAccuracy } from "@/lib/stats/accuracy";
import type { PaperInput } from "@/lib/validation/paper";

const OWNER_KEY = "single-user";

export async function assertPaperCategories(input: PaperInput) {
  const categoryIds = input.modules.map((result) => result.primaryCategoryId);
  const categories = await prisma.primaryCategory.findMany({
    where: {
      id: { in: categoryIds },
      subject: "行测",
      isActive: true,
    },
    select: { id: true },
  });

  if (categories.length !== categoryIds.length) {
    throw new Error("试卷中存在无效的行测模块");
  }
}

export async function createPaper(input: PaperInput) {
  await assertPaperCategories(input);
  return prisma.paper.create({
    data: {
      ownerKey: OWNER_KEY,
      date: input.date,
      name: input.name,
      examType: input.examType,
      notes: input.notes ?? null,
      moduleResults: {
        create: input.modules.map((result) => ({
          primaryCategoryId: result.primaryCategoryId,
          totalQuestions: result.totalQuestions,
          correctQuestions: result.correctQuestions,
          score: result.score,
        })),
      },
    },
  });
}

export function getPaperById(id: string) {
  return prisma.paper.findFirst({
    where: { id, ownerKey: OWNER_KEY },
    include: {
      moduleResults: {
        include: { primaryCategory: true },
        orderBy: { primaryCategory: { sortOrder: "asc" } },
      },
    },
  });
}

export async function deletePaper(id: string) {
  const result = await prisma.paper.deleteMany({
    where: { id, ownerKey: OWNER_KEY },
  });
  if (result.count === 0) throw new Error("试卷不存在或已被删除");
}

export async function getPaperDashboard() {
  const papers = await prisma.paper.findMany({
    where: { ownerKey: OWNER_KEY },
    include: {
      moduleResults: {
        include: { primaryCategory: true },
        orderBy: { primaryCategory: { sortOrder: "asc" } },
      },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  const moduleMap = new Map<
    string,
    {
      id: string;
      name: string;
      sortOrder: number;
      totalQuestions: number;
      correctQuestions: number;
      score: number;
      paperCount: number;
    }
  >();

  let totalQuestions = 0;
  let correctQuestions = 0;
  let totalScore = 0;

  const paperSummaries = papers.map((paper) => {
    const summary = paper.moduleResults.reduce(
      (result, module) => {
        result.totalQuestions += module.totalQuestions;
        result.correctQuestions += module.correctQuestions;
        result.score += module.score;
        return result;
      },
      { totalQuestions: 0, correctQuestions: 0, score: 0 },
    );

    totalQuestions += summary.totalQuestions;
    correctQuestions += summary.correctQuestions;
    totalScore += summary.score;

    for (const moduleResult of paper.moduleResults) {
      const current = moduleMap.get(moduleResult.primaryCategoryId) ?? {
        id: moduleResult.primaryCategoryId,
        name: moduleResult.primaryCategory.name,
        sortOrder: moduleResult.primaryCategory.sortOrder,
        totalQuestions: 0,
        correctQuestions: 0,
        score: 0,
        paperCount: 0,
      };
      current.totalQuestions += moduleResult.totalQuestions;
      current.correctQuestions += moduleResult.correctQuestions;
      current.score += moduleResult.score;
      current.paperCount += 1;
      moduleMap.set(moduleResult.primaryCategoryId, current);
    }

    return {
      id: paper.id,
      date: paper.date,
      name: paper.name,
      examType: paper.examType,
      ...summary,
      accuracy: calculateAccuracy(summary.correctQuestions, summary.totalQuestions),
    };
  });

  const modules = [...moduleMap.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((moduleResult) => ({
      ...moduleResult,
      accuracy: calculateAccuracy(
        moduleResult.correctQuestions,
        moduleResult.totalQuestions,
      ),
    }));

  return {
    paperCount: papers.length,
    totalQuestions,
    correctQuestions,
    totalScore,
    averageScore: papers.length ? totalScore / papers.length : null,
    accuracy: calculateAccuracy(correctQuestions, totalQuestions),
    modules,
    papers: paperSummaries,
  };
}
