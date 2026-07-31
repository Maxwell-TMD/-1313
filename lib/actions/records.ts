"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createRecord,
  deleteRecord,
  updateRecord,
} from "@/lib/db/records";
import { recordSchema } from "@/lib/validation/record";

export type RecordActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
  attemptId?: number;
};

function getFormValues(formData: FormData) {
  const keys = [
    "date",
    "examType",
    "subject",
    "primaryCategoryId",
    "secondaryCategoryId",
    "totalQuestions",
    "correctQuestions",
    "durationMinutes",
    "source",
    "notes",
  ];
  return Object.fromEntries(
    keys.map((key) => [key, String(formData.get(key) ?? "")]),
  );
}

function parseFormData(values: Record<string, string>) {
  return recordSchema.safeParse({
    ...values,
    secondaryCategoryId: values.secondaryCategoryId || undefined,
    source: values.source || undefined,
    notes: values.notes || undefined,
  });
}

export async function createRecordAction(
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  const values = getFormValues(formData);
  const parsed = parseFormData(values);
  if (!parsed.success) {
    return {
      success: false,
      message: "请检查表单中的错误",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
      attemptId: Date.now(),
    };
  }

  try {
    await createRecord(parsed.data);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "保存失败，请稍后重试",
      values,
      attemptId: Date.now(),
    };
  }

  revalidatePath("/");
  revalidatePath("/records");
  revalidatePath("/analytics");
  redirect("/records?status=created");
}

export async function updateRecordAction(
  id: string,
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  const values = getFormValues(formData);
  const parsed = parseFormData(values);
  if (!parsed.success) {
    return {
      success: false,
      message: "请检查表单中的错误",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
      attemptId: Date.now(),
    };
  }

  try {
    await updateRecord(id, parsed.data);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "更新失败，请稍后重试",
      values,
      attemptId: Date.now(),
    };
  }

  revalidatePath("/");
  revalidatePath("/records");
  revalidatePath(`/records/${id}`);
  revalidatePath("/analytics");
  redirect(`/records/${id}?status=updated`);
}

export async function deleteRecordAction(id: string) {
  try {
    await deleteRecord(id);
  } catch (error) {
    redirect(
      `/records?status=error&message=${encodeURIComponent(
        error instanceof Error ? error.message : "删除失败",
      )}`,
    );
  }
  revalidatePath("/");
  revalidatePath("/records");
  revalidatePath("/analytics");
  redirect("/records?status=deleted");
}
