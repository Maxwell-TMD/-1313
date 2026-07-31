import { CheckCircle2, Clock3, Percent, Rows3 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { formatAccuracy } from "@/lib/stats/accuracy";

export function AnalyticsSummary({ summary }: { summary: { totalQuestions: number; correctQuestions: number; accuracy: number | null; averageSecondsPerQuestion: number | null } }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="做题总量" value={`${summary.totalQuestions} 题`} icon={Rows3} />
      <MetricCard label="答对总量" value={`${summary.correctQuestions} 题`} icon={CheckCircle2} />
      <MetricCard label="平均正确率" value={formatAccuracy(summary.accuracy)} detail="按总题量加权计算" icon={Percent} />
      <MetricCard label="平均每题用时" value={summary.averageSecondsPerQuestion === null ? "暂无数据" : `${summary.averageSecondsPerQuestion.toFixed(0)} 秒`} icon={Clock3} />
    </div>
  );
}
