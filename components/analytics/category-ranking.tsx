import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAccuracy } from "@/lib/stats/accuracy";
import type { CategoryStat } from "@/lib/stats/types";

export function CategoryRanking({ categories }: { categories: CategoryStat[] }) {
  return (
    <Card><CardHeader><CardTitle>模块表现排名</CardTitle><CardDescription>按正确率从高到低，同时展示练习题量</CardDescription></CardHeader><CardContent>{categories.length ? <div className="space-y-4">{categories.map((category, index) => <div key={category.id} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3"><span className="text-sm font-semibold text-muted-foreground">{index + 1}</span><div><div className="flex justify-between gap-3 text-sm"><span className="font-medium">{category.name}</span><span>{category.totalQuestions} 题</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${category.accuracy ?? 0}%` }} /></div></div><span className="min-w-16 text-right font-semibold">{formatAccuracy(category.accuracy)}</span></div>)}</div> : <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">当前筛选条件下暂无模块数据</div>}</CardContent></Card>
  );
}
