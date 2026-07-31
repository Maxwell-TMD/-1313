import { describe, expect, it } from "vitest";
import { rankWeakCategories } from "@/lib/stats/weak-categories";

describe("weak category ranking", () => {
  it("requires at least ten questions", () => {
    const result = rankWeakCategories([
      { id: "a", name: "A", totalQuestions: 9, correctQuestions: 1, accuracy: 11.1 },
      { id: "b", name: "B", totalQuestions: 10, correctQuestions: 8, accuracy: 80 },
    ]);
    expect(result.map((item) => item.id)).toEqual(["b"]);
  });

  it("sorts equal accuracy by question volume descending", () => {
    const result = rankWeakCategories([
      { id: "a", name: "A", totalQuestions: 20, correctQuestions: 10, accuracy: 50 },
      { id: "b", name: "B", totalQuestions: 40, correctQuestions: 20, accuracy: 50 },
      { id: "c", name: "C", totalQuestions: 10, correctQuestions: 4, accuracy: 40 },
    ]);
    expect(result.map((item) => item.id)).toEqual(["c", "b", "a"]);
  });
});
