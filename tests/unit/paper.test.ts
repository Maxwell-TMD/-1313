import { describe, expect, it } from "vitest";
import { paperSchema } from "@/lib/validation/paper";

const basePaper = {
  date: "2026-07-31",
  name: "国考模拟卷",
  examType: "国考",
  notes: "",
  modules: [
    {
      primaryCategoryId: "data",
      totalQuestions: "20",
      correctQuestions: "16",
      score: "16.5",
    },
  ],
};

describe("paper validation", () => {
  it("parses numeric module values", () => {
    const result = paperSchema.parse(basePaper);
    expect(result.modules[0]).toMatchObject({
      totalQuestions: 20,
      correctQuestions: 16,
      score: 16.5,
    });
  });

  it("rejects correct answers greater than the question count", () => {
    const result = paperSchema.safeParse({
      ...basePaper,
      modules: [
        {
          ...basePaper.modules[0],
          totalQuestions: "10",
          correctQuestions: "11",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one module with questions", () => {
    const result = paperSchema.safeParse({
      ...basePaper,
      modules: [
        {
          ...basePaper.modules[0],
          totalQuestions: "0",
          correctQuestions: "0",
          score: "0",
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
