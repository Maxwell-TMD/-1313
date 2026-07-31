import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app-shell/page-header";
import { RecordForm } from "@/components/records/record-form";
import { updateRecordAction } from "@/lib/actions/records";
import { getCategories } from "@/lib/db/categories";
import { getRecordById } from "@/lib/db/records";

export default async function EditRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [record, categories] = await Promise.all([getRecordById(id), getCategories({ includeInactive: true })]);
  if (!record) notFound();
  const action = updateRecordAction.bind(null, id);

  return (
    <>
      <PageHeader title="编辑刷题记录" description="修改后会自动刷新所有统计结果。" />
      <RecordForm
        action={action}
        categories={categories}
        submitLabel="保存修改"
        initialValues={{
          date: record.date,
          examType: record.examType,
          subject: record.subject,
          primaryCategoryId: record.primaryCategoryId,
          secondaryCategoryId: record.secondaryCategoryId ?? "",
          totalQuestions: record.totalQuestions,
          correctQuestions: record.correctQuestions,
          durationMinutes: record.durationMinutes,
          source: record.source ?? "",
          notes: record.notes ?? "",
        }}
      />
    </>
  );
}
