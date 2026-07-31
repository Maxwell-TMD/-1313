import { describe, expect, it } from "vitest";
import { aggregateByCategory, aggregateByDate, aggregateSummary } from "@/lib/stats/aggregate";
import type { StatsRecord } from "@/lib/stats/types";

const records: StatsRecord[] = [
  { date: "2026-07-29", totalQuestions: 10, correctQuestions: 8, durationMinutes: 12, primaryCategory: { id: "a", name: "言语" }, secondaryCategory: null },
  { date: "2026-07-30", totalQuestions: 20, correctQuestions: 10, durationMinutes: 18, primaryCategory: { id: "a", name: "言语" }, secondaryCategory: null },
  { date: "2026-07-30", totalQuestions: 10, correctQuestions: 9, durationMinutes: 10, primaryCategory: { id: "b", name: "资料" }, secondaryCategory: null },
];

describe("aggregation", () => {
  it("uses weighted accuracy and average time", () => {
    const result = aggregateSummary(records);
    expect(result.totalQuestions).toBe(40);
    expect(result.correctQuestions).toBe(27);
    expect(result.accuracy).toBe(67.5);
    expect(result.averageSecondsPerQuestion).toBe(60);
  });

  it("aggregates by date and category", () => {
    expect(aggregateByDate(records)).toHaveLength(2);
    const categories = aggregateByCategory(records);
    expect(categories.find((item) => item.id === "a")?.totalQuestions).toBe(30);
    expect(categories.find((item) => item.id === "b")?.accuracy).toBe(90);
  });

  it("handles an empty database", () => {
    expect(aggregateSummary([])).toEqual({ totalQuestions: 0, correctQuestions: 0, durationMinutes: 0, accuracy: null, averageSecondsPerQuestion: null });
  });
});
