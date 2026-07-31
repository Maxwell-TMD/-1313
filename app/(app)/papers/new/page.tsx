import { PageHeader } from "@/components/app-shell/page-header";
import { PaperForm } from "@/components/papers/paper-form";
import { createPaperAction } from "@/lib/actions/papers";
import { getCategories } from "@/lib/db/categories";

export default async function NewPaperPage() {
  const categories = (await getCategories()).filter(
    (category) => category.subject === "行测",
  );

  return (
    <>
      <PageHeader
        title="新增试卷"
        description="分别填写各模块的题目数、答对数和得分。"
      />
      <PaperForm action={createPaperAction} categories={categories} />
    </>
  );
}
