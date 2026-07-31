import type { CategoryStat } from "@/lib/stats/types";

export function rankWeakCategories(
  categories: CategoryStat[],
  minimumQuestions = 10,
) {
  return categories
    .filter(
      (category) =>
        category.totalQuestions >= minimumQuestions && category.accuracy !== null,
    )
    .sort((left, right) => {
      const accuracyDifference = (left.accuracy ?? 0) - (right.accuracy ?? 0);
      if (accuracyDifference !== 0) return accuracyDifference;
      if (left.totalQuestions !== right.totalQuestions) {
        return right.totalQuestions - left.totalQuestions;
      }
      return left.name.localeCompare(right.name, "zh-CN");
    });
}
