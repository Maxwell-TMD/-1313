"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DailyPoint = { date: string; totalQuestions: number; accuracy: number | null };
type CategoryPoint = { id: string; name: string; totalQuestions: number; accuracy: number | null };

function EmptyChart({ message }: { message: string }) {
  return <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">{message}</div>;
}

export function DailyTrendCharts({ data }: { data: DailyPoint[] }) {
  const hasQuestions = data.some((point) => point.totalQuestions > 0);
  const chartData = data.map((point) => ({ ...point, label: point.date.slice(5) }));
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card><CardHeader><CardTitle>最近 7 天题量</CardTitle><CardDescription>每日完成的题目数量</CardDescription></CardHeader><CardContent>{hasQuestions ? <div className="h-64" aria-label="最近 7 天题量柱状图"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} /><Tooltip formatter={(value) => [`${value} 题`, "题量"]} /><Bar dataKey="totalQuestions" fill="var(--primary)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyChart message="记录练习后显示题量趋势" />}</CardContent></Card>
      <Card><CardHeader><CardTitle>最近 7 天正确率</CardTitle><CardDescription>按每日总答对数 ÷ 总题数计算</CardDescription></CardHeader><CardContent>{hasQuestions ? <div className="h-64" aria-label="最近 7 天正确率折线图"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} width={45} /><Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "正确率"]} /><Line type="monotone" dataKey="accuracy" stroke="var(--primary)" strokeWidth={2.5} connectNulls={false} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div> : <EmptyChart message="记录练习后显示正确率趋势" />}</CardContent></Card>
    </div>
  );
}

export function CategoryAccuracyChart({ data, title = "各模块正确率" }: { data: CategoryPoint[]; title?: string }) {
  const available = data.filter((item) => item.accuracy !== null);
  return (
    <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>百分比数字与柱长共同表示结果</CardDescription></CardHeader><CardContent>{available.length ? <div className="h-72" aria-label={`${title}横向柱状图`}><ResponsiveContainer width="100%" height="100%"><BarChart data={available} layout="vertical" margin={{ left: 8, right: 28 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} /><YAxis type="category" dataKey="name" width={92} tickLine={false} axisLine={false} /><Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "正确率"]} /><Bar dataKey="accuracy" radius={[0, 5, 5, 0]}>{available.map((item) => <Cell key={item.id} fill="var(--primary)" />)}</Bar></BarChart></ResponsiveContainer></div> : <EmptyChart message="暂无可对比的模块数据" />}</CardContent></Card>
  );
}
