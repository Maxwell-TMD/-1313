import { describe, expect, it } from "vitest";
import { calculateAccuracy, formatAccuracy } from "@/lib/stats/accuracy";

describe("accuracy", () => {
  it("calculates the correct percentage", () => {
    expect(calculateAccuracy(8, 10)).toBe(80);
    expect(formatAccuracy(calculateAccuracy(2, 3))).toBe("66.7%");
  });

  it("returns no data when total is zero", () => {
    expect(calculateAccuracy(0, 0)).toBeNull();
    expect(formatAccuracy(null)).toBe("暂无数据");
  });
});
