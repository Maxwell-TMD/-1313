import { calculateAccuracy } from "@/lib/stats/accuracy";
import type { CategoryStat, StatsRecord } from "@/lib/stats/types";

export function aggregateSummary(records: StatsRecord[]) {
  const totals = records.reduce(
    (result, record) => ({
      totalQuestions: result.totalQuestions + record.totalQuestions,
      correctQuestions: result.correctQuestions + record.correctQuestions,
      durationMinutes: result.durationMinutes + record.durationMinutes,
    }),
    { totalQuestions: 0, correctQuestions: 0, durationMinutes: 0 },
  );

  return {
    ...totals,
    accuracy: calculateAccuracy(totals.correctQuestions, totals.totalQuestions),
    averageSecondsPerQuestion:
      totals.totalQuestions > 0
        ? (totals.durationMinutes * 60) / totals.totalQuestions
        : null,
  };
}

export function aggregateByDate(records: StatsRecord[], dates?: string[]) {
  const groups = new Map<string, StatsRecord[]>();
  records.forEach((record) => {
    groups.set(record.date, [...(groups.get(record.date) ?? []), record]);
  });

  const keys = dates ?? [...groups.keys()].sort();
  return keys.map((date) => {
    const summary = aggregateSummary(groups.get(date) ?? []);
    return { date, ...summary };
  });
}

export function aggregateByCategory(
  records: StatsRecord[],
  granularity: "primary" | "secondary" = "primary",
): CategoryStat[] {
  const groups = new Map<string, { name: string; records: StatsRecord[] }>();
  records.forEach((record) => {
    const category =
      granularity === "secondary" && record.secondaryCategory
        ? record.secondaryCategory
        : record.primaryCategory;
    const existing = groups.get(category.id);
    groups.set(category.id, {
      name: category.name,
      records: [...(existing?.records ?? []), record],
    });
  });

  return [...groups.entries()].map(([id, group]) => {
    const summary = aggregateSummary(group.records);
    return {
      id,
      name: group.name,
      totalQuestions: summary.totalQuestions,
      correctQuestions: summary.correctQuestions,
      accuracy: summary.accuracy,
    };
  });
}
