import { BookCheck, CalendarCheck2, Flame, Target } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { CategoryAccuracyChart, DailyTrendCharts } from "@/components/dashboard/stats-charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { WeakCategoryList } from "@/components/dashboard/weak-category-list";
import { getDashboardStatistics } from "@/lib/db/statistics";
import { formatAccuracy } from "@/lib/stats/accuracy";

export default async function DashboardPage() {
  const stats = await getDashboardStatistics();
  return (
    <>
      <PageHeader title="学习概览" description="记录每一次练习，看见稳定进步。" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="今日做题" value={`${stats.today.totalQuestions} 题`} detail={`答对 ${stats.today.correctQuestions} 题`} icon={CalendarCheck2} />
        <MetricCard label="今日正确率" value={formatAccuracy(stats.today.accuracy)} detail={stats.today.accuracy === null ? "完成练习后显示" : "按今日总题量加权"} icon={Target} />
        <MetricCard label="累计做题" value={`${stats.allTime.totalQuestions} 题`} detail={`累计正确率 ${formatAccuracy(stats.allTime.accuracy)}`} icon={BookCheck} />
        <MetricCard label="连续学习" value={`${stats.streak} 天`} detail={stats.streak ? "保持当前节奏" : "今天记录后开始累计"} icon={Flame} />
      </div>
      <div className="mt-5"><DailyTrendCharts data={stats.dailyTrend} /></div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]"><CategoryAccuracyChart data={stats.categories} /><WeakCategoryList categories={stats.weakCategories} /></div>
    </>
  );
}
