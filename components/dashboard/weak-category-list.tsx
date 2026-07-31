import type { CategoryStat } from "@/lib/stats/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAccuracy } from "@/lib/stats/accuracy";

export function WeakCategoryList({ categories }: { categories: CategoryStat[] }) {
  return (
    <Card><CardHeader><CardTitle>当前薄弱模块</CardTitle><CardDescription>至少完成 10 题后参与排名</CardDescription></CardHeader><CardContent>{categories.length ? <ol className="space-y-4">{categories.map((category, index) => <li key={category.id} className="flex items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-sm font-semibold text-destructive">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><span className="truncate font-medium">{category.name}</span><span className="font-semibold">{formatAccuracy(category.accuracy)}</span></div><p className="mt-1 text-xs text-muted-foreground">累计 {category.totalQuestions} 题，答对 {category.correctQuestions} 题</p></div></li>)}</ol> : <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed px-6 text-center text-sm text-muted-foreground">各模块累计完成至少 10 题后，将在这里显示薄弱项。</div>}</CardContent></Card>
  );
}
