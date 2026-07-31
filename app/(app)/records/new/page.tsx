import { PageHeader } from "@/components/app-shell/page-header";
import { RecordForm } from "@/components/records/record-form";
import { createRecordAction } from "@/lib/actions/records";
import { getCategories } from "@/lib/db/categories";

export default async function NewRecordPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHeader
        title="新增刷题记录"
        description="填写本次练习的题量、正确数和模块。"
      />
      <RecordForm
        action={createRecordAction}
        categories={categories}
        submitLabel="保存记录"
      />
    </>
  );
}
