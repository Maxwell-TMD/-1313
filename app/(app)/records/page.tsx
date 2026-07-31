import { PageHeader } from "@/components/app-shell/page-header";
import { RecordFiltersForm } from "@/components/records/record-filters";
import { RecordList } from "@/components/records/record-list";
import { Alert } from "@/components/ui/alert";
import { getCategories } from "@/lib/db/categories";
import { getPaginatedRecords } from "@/lib/db/records";
import { recordFilterSchema } from "@/lib/validation/record";

function getText(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = recordFilterSchema.parse({
    startDate: getText(raw.startDate) || undefined,
    endDate: getText(raw.endDate) || undefined,
    examType: getText(raw.examType) || undefined,
    subject: getText(raw.subject) || undefined,
    primaryCategoryId: getText(raw.primaryCategoryId) || undefined,
    secondaryCategoryId: getText(raw.secondaryCategoryId) || undefined,
    page: getText(raw.page) || 1,
  });
  const [{ records, total, totalPages }, categories] = await Promise.all([
    getPaginatedRecords(filters),
    getCategories(),
  ]);
  const query = new URLSearchParams();
  Object.entries(raw).forEach(([key, value]) => {
    const text = getText(value);
    if (text && key !== "status" && key !== "message") query.set(key, text);
  });

  const status = getText(raw.status);
  return (
    <>
      <PageHeader title="历史记录" description={`共 ${total} 条练习记录，按日期倒序展示。`} />
      {status === "created" ? <Alert variant="success" className="mb-4">记录保存成功。</Alert> : null}
      {status === "deleted" ? <Alert variant="success" className="mb-4">记录已删除。</Alert> : null}
      {status === "error" ? <Alert variant="destructive" className="mb-4">{getText(raw.message) ?? "操作失败，请重试。"}</Alert> : null}
      <RecordFiltersForm filters={filters} categories={categories} />
      <RecordList records={records} page={filters.page} totalPages={totalPages} query={query} />
    </>
  );
}
