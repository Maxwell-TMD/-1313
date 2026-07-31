"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { PrimaryCategory, SecondaryCategory } from "@prisma/client";
import { Loader2, Save } from "lucide-react";
import type { RecordActionState } from "@/lib/actions/records";
import { EXAM_TYPES, SUBJECTS } from "@/lib/constants/exams";
import { getLocalDateString } from "@/lib/dates";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CategoryWithChildren = PrimaryCategory & {
  secondaryCategories: SecondaryCategory[];
};

const initialRecordActionState: RecordActionState = { success: false };

export type RecordFormValues = {
  date: string;
  examType: string;
  subject: string;
  primaryCategoryId: string;
  secondaryCategoryId: string;
  totalQuestions: number;
  correctQuestions: number;
  durationMinutes: number;
  source: string;
  notes: string;
};

const selectClassName =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm shadow-xs";

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? (
    <p className="mt-1.5 text-sm text-destructive">{errors[0]}</p>
  ) : null;
}

export function RecordForm({
  action,
  categories,
  initialValues,
  submitLabel,
}: {
  action: (state: RecordActionState, formData: FormData) => Promise<RecordActionState>;
  categories: CategoryWithChildren[];
  initialValues?: Partial<RecordFormValues>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialRecordActionState);
  const [subject, setSubject] = useState(initialValues?.subject ?? "行测");
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    initialValues?.primaryCategoryId ?? "",
  );

  useEffect(() => {
    if (state.values) {
      setSubject(state.values.subject ?? "行测");
      setPrimaryCategoryId(state.values.primaryCategoryId ?? "");
    }
  }, [state.attemptId, state.values]);

  const primaryCategories = useMemo(
    () => categories.filter((category) => category.subject === subject),
    [categories, subject],
  );
  const secondaryCategories =
    categories.find((category) => category.id === primaryCategoryId)
      ?.secondaryCategories ?? [];

  return (
    <Card>
      <CardContent className="pt-5">
        <form key={state.attemptId ?? "initial"} action={formAction} className="space-y-6" noValidate>
          {state.message ? (
            <Alert variant="destructive">{state.message}</Alert>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="date">日期</Label>
              <Input id="date" name="date" type="date" className="mt-2" defaultValue={state.values?.date ?? initialValues?.date ?? getLocalDateString()} required />
              <FieldError errors={state.fieldErrors?.date} />
            </div>
            <div>
              <Label htmlFor="examType">考试类型</Label>
              <select id="examType" name="examType" className={`${selectClassName} mt-2`} defaultValue={state.values?.examType ?? initialValues?.examType ?? "国考"}>
                {EXAM_TYPES.map((value) => <option key={value}>{value}</option>)}
              </select>
              <FieldError errors={state.fieldErrors?.examType} />
            </div>
            <div>
              <Label htmlFor="subject">科目</Label>
              <select
                id="subject"
                name="subject"
                className={`${selectClassName} mt-2`}
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value);
                  setPrimaryCategoryId("");
                }}
              >
                {SUBJECTS.map((value) => <option key={value}>{value}</option>)}
              </select>
              <FieldError errors={state.fieldErrors?.subject} />
            </div>
            <div>
              <Label htmlFor="primaryCategoryId">一级模块</Label>
              <select
                id="primaryCategoryId"
                name="primaryCategoryId"
                className={`${selectClassName} mt-2`}
                value={primaryCategoryId}
                onChange={(event) => setPrimaryCategoryId(event.target.value)}
                required
              >
                <option value="">请选择</option>
                {primaryCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <FieldError errors={state.fieldErrors?.primaryCategoryId} />
            </div>
            <div>
              <Label htmlFor="secondaryCategoryId">二级模块（可选）</Label>
              <select id="secondaryCategoryId" name="secondaryCategoryId" className={`${selectClassName} mt-2`} defaultValue={state.values?.secondaryCategoryId ?? initialValues?.secondaryCategoryId ?? ""} disabled={secondaryCategories.length === 0}>
                <option value="">{secondaryCategories.length ? "请选择" : "该模块暂无二级分类"}</option>
                {secondaryCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <FieldError errors={state.fieldErrors?.secondaryCategoryId} />
            </div>
            <div>
              <Label htmlFor="source">题目来源（可选）</Label>
              <Input id="source" name="source" className="mt-2" placeholder="例如：粉笔模考第 12 期" defaultValue={state.values?.source ?? initialValues?.source ?? ""} maxLength={100} />
              <FieldError errors={state.fieldErrors?.source} />
            </div>
            <div>
              <Label htmlFor="totalQuestions">做题数量</Label>
              <Input id="totalQuestions" name="totalQuestions" type="number" inputMode="numeric" className="mt-2" min={1} defaultValue={state.values?.totalQuestions ?? initialValues?.totalQuestions ?? 20} required />
              <FieldError errors={state.fieldErrors?.totalQuestions} />
            </div>
            <div>
              <Label htmlFor="correctQuestions">答对数量</Label>
              <Input id="correctQuestions" name="correctQuestions" type="number" inputMode="numeric" className="mt-2" min={0} defaultValue={state.values?.correctQuestions ?? initialValues?.correctQuestions ?? 0} required />
              <FieldError errors={state.fieldErrors?.correctQuestions} />
            </div>
            <div>
              <Label htmlFor="durationMinutes">用时（分钟）</Label>
              <Input id="durationMinutes" name="durationMinutes" type="number" inputMode="numeric" className="mt-2" min={0} defaultValue={state.values?.durationMinutes ?? initialValues?.durationMinutes ?? 0} required />
              <FieldError errors={state.fieldErrors?.durationMinutes} />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">备注（可选）</Label>
            <Textarea id="notes" name="notes" className="mt-2" placeholder="记录本次练习的感受、问题或复盘重点" defaultValue={state.values?.notes ?? initialValues?.notes ?? ""} maxLength={1000} />
            <FieldError errors={state.fieldErrors?.notes} />
          </div>

          <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
            {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            {pending ? "正在保存…" : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
