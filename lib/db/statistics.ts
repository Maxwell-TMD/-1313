import { prisma } from "@/lib/db/prisma";
import { buildRecordWhere } from "@/lib/db/records";
import { addDays, enumerateDates, getAppDateString } from "@/lib/dates";
import { aggregateByCategory, aggregateByDate, aggregateSummary } from "@/lib/stats/aggregate";
import { calculateStudyStreak } from "@/lib/stats/streak";
import { rankWeakCategories } from "@/lib/stats/weak-categories";
import type { RecordFilters } from "@/lib/validation/record";

const statisticsInclude = {
  primaryCategory: { select: { id: true, name: true } },
  secondaryCategory: { select: { id: true, name: true } },
} as const;

export async function getDashboardStatistics() {
  const today = getAppDateString();
  const sevenDayStart = addDays(today, -6);
  const records = await prisma.practiceRecord.findMany({
    where: { ownerKey: "single-user" },
    include: statisticsInclude,
  });
  const todayRecords = records.filter((record) => record.date === today);
  const sevenDayRecords = records.filter((record) => record.date >= sevenDayStart && record.date <= today);
  const categoryStats = aggregateByCategory(records);

  return {
    today: aggregateSummary(todayRecords),
    allTime: aggregateSummary(records),
    streak: calculateStudyStreak(records.map((record) => record.date), today),
    dailyTrend: aggregateByDate(sevenDayRecords, enumerateDates(sevenDayStart, today)),
    categories: categoryStats.sort((left, right) => (right.accuracy ?? -1) - (left.accuracy ?? -1)),
    weakCategories: rankWeakCategories(categoryStats).slice(0, 3),
  };
}

export async function getAnalyticsStatistics(
  filters: Partial<RecordFilters>,
  granularity: "primary" | "secondary",
) {
  const records = await prisma.practiceRecord.findMany({
    where: buildRecordWhere(filters),
    include: statisticsInclude,
    orderBy: { date: "asc" },
  });
  const categories = aggregateByCategory(records, granularity).sort(
    (left, right) => (right.accuracy ?? -1) - (left.accuracy ?? -1),
  );
  return {
    summary: aggregateSummary(records),
    dailyTrend: aggregateByDate(records),
    categories,
    weakCategories: rankWeakCategories(categories),
  };
}
