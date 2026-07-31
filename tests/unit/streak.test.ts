import { describe, expect, it } from "vitest";
import { calculateStudyStreak } from "@/lib/stats/streak";

describe("study streak", () => {
  it("counts consecutive dates ending today", () => {
    expect(calculateStudyStreak(["2026-07-29", "2026-07-30", "2026-07-31"], "2026-07-31")).toBe(3);
    expect(calculateStudyStreak(["2026-07-30"], "2026-07-31")).toBe(0);
  });
});
