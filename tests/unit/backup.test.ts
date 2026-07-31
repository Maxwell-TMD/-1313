import { describe, expect, it } from "vitest";
import { backupSchema } from "@/lib/validation/backup";

const category = { id: "p", subject: "行测", name: "言语", sortOrder: 0, isActive: true, secondaryCategories: [{ id: "s", name: "片段阅读", sortOrder: 0, isActive: true }] };
const record = { id: "r", date: "2026-07-31", examType: "国考", subject: "行测", primaryCategoryId: "p", secondaryCategoryId: "s", totalQuestions: 10, correctQuestions: 8, durationMinutes: 10, source: null, notes: null, createdAt: "2026-07-31T00:00:00.000Z", updatedAt: "2026-07-31T00:00:00.000Z" };

describe("backup validation", () => {
  it("accepts a valid backup", () => {
    expect(backupSchema.safeParse({ schemaVersion: 1, exportedAt: "2026-07-31T00:00:00.000Z", categories: [category], records: [record] }).success).toBe(true);
  });

  it("rejects invalid references without mutating data", () => {
    const result = backupSchema.safeParse({ schemaVersion: 1, exportedAt: "2026-07-31T00:00:00.000Z", categories: [category], records: [{ ...record, primaryCategoryId: "missing" }] });
    expect(result.success).toBe(false);
  });
});
