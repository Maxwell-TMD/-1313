import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, FileText, Pencil } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { DeleteRecordDialog } from "@/components/records/delete-record-dialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
import { getRecordById } from "@/lib/db/records";
import { calculateAccuracy, formatAccuracy } from "@/lib/stats/accuracy";

export default async function RecordDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ status?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const record = await getRecordById(id);
  if (!record) notFound();
  const accuracy = formatAccuracy(calculateAccuracy(record.correctQuestions, record.totalQuestions));

  return (
    <>
      <PageHeader title="练习详情" description={formatDate(record.date)} />
      {query.status === "updated" ? <Alert variant="success" className="mb-4">记录更新成功。</Alert> : null}
      <Card>
        <CardContent className="pt-5">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-sm text-muted-foreground">考试与科目</p><p className="mt-1 font-medium">{record.examType} · {record.subject}</p></div>
            <div><p className="text-sm text-muted-foreground">模块</p><p className="mt-1 font-medium">{record.primaryCategory.name}{record.secondaryCategory ? ` / ${record.secondaryCategory.name}` : ""}</p></div>
            <div><p className="text-sm text-muted-foreground">答题结果</p><p className="mt-1 font-medium">{record.correctQuestions} / {record.totalQuestions} 题</p></div>
            <div><p className="text-sm text-muted-foreground">正确率</p><p className="mt-1 text-xl font-semibold text-primary">{accuracy}</p></div>
            <div><p className="flex items-center gap-1 text-sm text-muted-foreground"><Clock3 className="size-4" aria-hidden="true" />用时</p><p className="mt-1 font-medium">{record.durationMinutes} 分钟</p></div>
            <div><p className="text-sm text-muted-foreground">题目来源</p><p className="mt-1 font-medium">{record.source || "未填写"}</p></div>
          </div>
          <div className="mt-6 border-t pt-5"><p className="flex items-center gap-1 text-sm text-muted-foreground"><FileText className="size-4" aria-hidden="true" />备注</p><p className="mt-2 whitespace-pre-wrap leading-7">{record.notes || "暂无备注"}</p></div>
          <div className="mt-6 flex flex-wrap gap-3 border-t pt-5"><Button asChild><Link href={`/records/${record.id}/edit`}><Pencil aria-hidden="true" />编辑记录</Link></Button><DeleteRecordDialog id={record.id} /><Button asChild variant="outline"><Link href="/records">返回历史</Link></Button></div>
        </CardContent>
      </Card>
    </>
  );
}
