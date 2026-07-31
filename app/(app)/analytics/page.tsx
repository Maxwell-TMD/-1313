import { PageHeader } from "@/components/app-shell/page-header";
import { AnalyticsFilters, type AnalyticsFilterValues } from "@/components/analytics/analytics-filters";
import { AnalyticsSummary } from "@/components/analytics/analytics-summary";
import { CategoryRanking } from "@/components/analytics/category-ranking";
import { CategoryAccuracyChart } from "@/components/dashboard/stats-charts";
import { WeakCategoryList } from "@/components/dashboard/weak-category-list";
import { addDays, getAppDateString } from "@/lib/dates";
import { getCategories } from "@/lib/db/categories";
import { getAnalyticsStatistics } from "@/lib/db/statistics";
import { DailyAnalyticsChart } from "@/components/analytics/daily-analytics-chart";

function text(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const range = (["7", "30", "all", "custom"].includes(text(params.range) ?? "") ? text(params.range) : "30") as AnalyticsFilterValues["range"];
  const granularity = text(params.granularity) === "secondary" ? "secondary" : "primary";
  const today = getAppDateString();
  const values: AnalyticsFilterValues = {
    range,
    granularity,
    startDate: text(params.startDate) || undefined,
    endDate: text(params.endDate) || undefined,
    examType: text(params.examType) || undefined,
    subject: text(params.subject) || undefined,
    primaryCategoryId: text(params.primaryCategoryId) || undefined,
    secondaryCategoryId: text(params.secondaryCategoryId) || undefined,
  };
  const filters = {
    startDate: range === "7" ? addDays(today, -6) : range === "30" ? addDays(today, -29) : range === "custom" ? values.startDate : undefined,
    endDate: range === "7" || range === "30" ? today : range === "custom" ? values.endDate : undefined,
    examType: values.examType as "国考" | "省考" | "事业单位" | "其他" | undefined,
    subject: values.subject as "行测" | "申论" | undefined,
    primaryCategoryId: values.primaryCategoryId,
    secondaryCategoryId: values.secondaryCategoryId,
  };
  const [statistics, categories] = await Promise.all([getAnalyticsStatistics(filters, granularity), getCategories()]);
  return (
    <>
      <PageHeader title="统计分析" description="对比模块表现，定位最值得提升的方向。" />
      <AnalyticsFilters values={values} categories={categories} />
      <AnalyticsSummary summary={statistics.summary} />
      <div className="mt-5"><DailyAnalyticsChart data={statistics.dailyTrend} /></div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2"><CategoryAccuracyChart data={statistics.categories} title={granularity === "primary" ? "一级模块正确率" : "二级模块正确率"} /><CategoryRanking categories={statistics.categories} /></div>
      <div className="mt-5"><WeakCategoryList categories={statistics.weakCategories.slice(0, 5)} /></div>
    </>
  );
}
