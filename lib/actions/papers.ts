"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPaper, deletePaper } from "@/lib/db/papers";
import { paperSchema } from "@/lib/validation/paper";

type PaperFormModuleValue = {
  primaryCategoryId: string;
  totalQuestions: string;
  correctQuestions: string;
  score: string;
};

export type PaperActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: {
    date: string;
    name: string;
    examType: string;
    notes: string;
    modules: PaperFormModuleValue[];
  };
  attemptId?: number;
};

function getPaperFormValues(formData: FormData) {
  const moduleIds = formData.getAll("moduleId").map(String);
  const totals = formData.getAll("moduleTotal").map(String);
  const correct = formData.getAll("moduleCorrect").map(String);
  const scores = formData.getAll("moduleScore").map(String);

  return {
    date: String(formData.get("date") ?? ""),
    name: String(formData.get("name") ?? ""),
    examType: String(formData.get("examType") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    modules: moduleIds.map((primaryCategoryId, index) => ({
      primaryCategoryId,
      totalQuestions: totals[index] ?? "0",
      correctQuestions: correct[index] ?? "0",
      score: scores[index] ?? "0",
    })),
  };
}

function getFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    errors[key] = [...(errors[key] ?? []), issue.message];
  }
  return errors;
}

export async function createPaperAction(
  _previousState: PaperActionState,
  formData: FormData,
): Promise<PaperActionState> {
  const values = getPaperFormValues(formData);
  const parsed = paperSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: "请检查试卷信息",
      fieldErrors: getFieldErrors(parsed.error.issues),
      values,
      attemptId: Date.now(),
    };
  }

  let paperId: string;
  try {
    const paper = await createPaper(parsed.data);
    paperId = paper.id;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "试卷保存失败",
      values,
      attemptId: Date.now(),
    };
  }

  revalidatePath("/papers");
  redirect(`/papers/${paperId}?status=created`);
}

export async function deletePaperAction(id: string) {
  try {
    await deletePaper(id);
  } catch (error) {
    redirect(
      `/papers?status=error&message=${encodeURIComponent(
        error instanceof Error ? error.message : "删除失败",
      )}`,
    );
  }
  revalidatePath("/papers");
  redirect("/papers?status=deleted");
}
