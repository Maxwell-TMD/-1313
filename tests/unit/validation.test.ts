import { describe, expect, it } from "vitest";
import { recordSchema } from "@/lib/validation/record";

const valid = { date: "2026-07-31", examType: "国考", subject: "行测", primaryCategoryId: "category", totalQuestions: 10, correctQuestions: 8, durationMinutes: 12, source: "", notes: "" };

describe("record validation", () => {
  it("rejects correct questions above total", () => {
    expect(recordSchema.safeParse({ ...valid, correctQuestions: 11 }).success).toBe(false);
  });

  it("rejects zero total and negative duration", () => {
    expect(recordSchema.safeParse({ ...valid, totalQuestions: 0 }).success).toBe(false);
    expect(recordSchema.safeParse({ ...valid, durationMinutes: -1 }).success).toBe(false);
  });
});
