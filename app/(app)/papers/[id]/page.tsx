import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Percent, Trophy } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DeletePaperDialog } from "@/components/papers/delete-paper-dialog";
import { CategoryIcon } from "@/components/records/category-icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories } from "@/lib/db/categories";
import { getPaperById } from "@/lib/db/papers";
import { calculateAccuracy, formatAccuracy } from "@/lib/stats/accuracy";

function formatScore(score: number) {
  return score.toFixed(1).replace(/\.0$/, "");
}

export default async function PaperDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [paper, categories] = await Promise.all([
    getPaperById(id),
    getCategories(),
  ]);
  if (!paper) notFound();

  const resultMap = new Map(
    paper.moduleResults.map((result) => [result.primaryCategoryId, result]),
  );
  const modules = categories
    .filter((category) => category.subject === "行测")
    .map((category) => ({ category, result: resultMap.get(category.id) }));
  const totals = paper.moduleResults.reduce(
    (result, module) => {
      result.totalQuestions += module.totalQuestions;
      result.correctQuestions += module.correctQuestions;
      result.score += module.score;
      return result;
    },
    { totalQuestions: 0, correctQuestions: 0, score: 0 },
  );
  const accuracy = calculateAccuracy(totals.correctQuestions, totals.totalQuestions);

  return (
    <>
      <PageHeader title={paper.name} description={`${paper.date} · ${paper.examType}`} />
      {query.status === "created" ? (
        <Alert variant="success" className="mb-4">试卷保存成功。</Alert>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/papers"><ArrowLeft aria-hidden="true" />返回试卷统计</Link>
        </Button>
        <DeletePaperDialog id={paper.id} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="答题情况"
          value={`${totals.correctQuestions}/${totals.totalQuestions}`}
          detail="答对数 / 总题数"
          icon={CheckCircle2}
        />
        <MetricCard
          label="正确率"
          value={formatAccuracy(accuracy)}
          detail="按整张试卷加权计算"
          icon={Percent}
        />
        <MetricCard
          label="总得分"
          value={formatScore(totals.score)}
          detail="各模块得分之和"
          icon={Trophy}
        />
      </div>

      <Card className="mt-5">
        <CardHeader><CardTitle>各模块成绩</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {modules.map(({ category, result }) => {
            const moduleAccuracy = calculateAccuracy(
              result?.correctQuestions ?? 0,
              result?.totalQuestions ?? 0,
            );
            return (
              <div
                key={category.id}
                className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(10rem,1fr)_repeat(4,minmax(5rem,auto))] sm:items-center"
              >
                <div className="flex items-center gap-2.5">
                  <CategoryIcon categoryId={category.id} />
                  <span className="font-medium">{category.name}</span>
                </div>
                <p className="text-right text-sm sm:text-left"><span className="text-muted-foreground">题目 </span>{result?.totalQuestions ?? 0}</p>
                <p className="text-sm"><span className="text-muted-foreground">答对 </span>{result?.correctQuestions ?? 0}</p>
                <p className="text-sm"><span className="text-muted-foreground">得分 </span>{formatScore(result?.score ?? 0)}</p>
                <p className="text-sm font-semibold">{formatAccuracy(moduleAccuracy)}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {paper.notes ? (
        <Card className="mt-5">
          <CardHeader><CardTitle>备注</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap text-sm leading-6">{paper.notes}</p></CardContent>
        </Card>
      ) : null}
    </>
  );
}
