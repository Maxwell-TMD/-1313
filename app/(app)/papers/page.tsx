import Link from "next/link";
import {
  CheckCircle2,
  FilePlus2,
  Files,
  Percent,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CategoryIcon } from "@/components/records/category-icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPaperDashboard } from "@/lib/db/papers";
import { formatAccuracy } from "@/lib/stats/accuracy";

function getText(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatScore(score: number) {
  return score.toFixed(1).replace(/\.0$/, "");
}

export default async function PapersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [dashboard, params] = await Promise.all([
    getPaperDashboard(),
    searchParams,
  ]);
  const status = getText(params.status);

  return (
    <>
      <PageHeader
        title="试卷统计"
        description="试卷成绩独立统计，不与日常刷题记录混合。"
      />

      <div className="mb-5 flex justify-end">
        <Button asChild>
          <Link href="/papers/new">
            <FilePlus2 aria-hidden="true" />
            新增试卷
          </Link>
        </Button>
      </div>

      {status === "deleted" ? (
        <Alert variant="success" className="mb-4">试卷已删除。</Alert>
      ) : null}
      {status === "error" ? (
        <Alert variant="destructive" className="mb-4">
          {getText(params.message) ?? "操作失败，请重试。"}
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="试卷数量"
          value={`${dashboard.paperCount} 套`}
          detail="仅统计完整试卷记录"
          icon={Files}
        />
        <MetricCard
          label="累计题目"
          value={`${dashboard.totalQuestions} 题`}
          detail={`累计答对 ${dashboard.correctQuestions} 题`}
          icon={CheckCircle2}
        />
        <MetricCard
          label="累计正确率"
          value={formatAccuracy(dashboard.accuracy)}
          detail="总答对数 ÷ 总题数"
          icon={Percent}
        />
        <MetricCard
          label="平均得分"
          value={dashboard.averageScore === null ? "暂无数据" : formatScore(dashboard.averageScore)}
          detail={`累计得分 ${formatScore(dashboard.totalScore)}`}
          icon={Trophy}
        />
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>试卷模块汇总</CardTitle>
          <CardDescription>各模块在全部试卷中的累计表现</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboard.modules.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              保存第一张试卷后，这里会显示各模块统计。
            </p>
          ) : (
            <div className="space-y-3">
              {dashboard.modules.map((module) => (
                <div
                  key={module.id}
                  className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(10rem,1fr)_repeat(3,minmax(5rem,auto))] sm:items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon categoryId={module.id} />
                    <span className="font-medium">{module.name}</span>
                  </div>
                  <p className="text-sm"><span className="text-muted-foreground">题目 </span>{module.totalQuestions}</p>
                  <p className="text-sm"><span className="text-muted-foreground">得分 </span>{formatScore(module.score)}</p>
                  <p className="text-sm font-semibold">{formatAccuracy(module.accuracy)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>试卷记录</CardTitle>
          <CardDescription>按日期倒序展示</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboard.papers.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">还没有试卷记录。</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/papers/new">记录第一张试卷</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.papers.map((paper) => (
                <Link
                  key={paper.id}
                  href={`/papers/${paper.id}`}
                  className="block rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{paper.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {paper.date} · {paper.examType}
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                      {formatAccuracy(paper.accuracy)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {paper.correctQuestions}/{paper.totalQuestions} 题 · 得分 {formatScore(paper.score)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
