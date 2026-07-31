"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DailyAnalyticsChart({ data }: { data: Array<{ date: string; accuracy: number | null; totalQuestions: number }> }) {
  return (
    <Card><CardHeader><CardTitle>每日正确率变化</CardTitle><CardDescription>当前筛选范围内的每日加权正确率</CardDescription></CardHeader><CardContent>{data.length ? <div className="h-72" aria-label="每日正确率变化折线图"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tickFormatter={(value) => String(value).slice(5)} minTickGap={24} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} width={45} /><Tooltip labelFormatter={(label) => `日期：${label}`} formatter={(value, name) => name === "accuracy" ? [`${Number(value).toFixed(1)}%`, "正确率"] : [`${value} 题`, "题量"]} /><Line type="monotone" dataKey="accuracy" stroke="var(--primary)" strokeWidth={2.5} dot={data.length <= 31} connectNulls={false} /></LineChart></ResponsiveContainer></div> : <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">当前筛选条件下暂无每日数据</div>}</CardContent></Card>
  );
}
