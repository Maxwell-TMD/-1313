"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { PrimaryCategory } from "@prisma/client";
import { FileCheck2, Loader2 } from "lucide-react";
import type { PaperActionState } from "@/lib/actions/papers";
import { EXAM_TYPES } from "@/lib/constants/exams";
import { getLocalDateString } from "@/lib/dates";
import { calculateAccuracy, formatAccuracy } from "@/lib/stats/accuracy";
import { CategoryIcon } from "@/components/records/category-icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ModuleRow = {
  primaryCategoryId: string;
  totalQuestions: string;
  correctQuestions: string;
  score: string;
};

const initialState: PaperActionState = { success: false };
const selectClassName =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm shadow-xs";

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? (
    <p className="mt-1.5 text-sm text-destructive">{errors[0]}</p>
  ) : null;
}

export function PaperForm({
  action,
  categories,
}: {
  action: (
    state: PaperActionState,
    formData: FormData,
  ) => Promise<PaperActionState>;
  categories: PrimaryCategory[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [rows, setRows] = useState<ModuleRow[]>(() =>
    categories.map((category) => ({
      primaryCategoryId: category.id,
      totalQuestions: "0",
      correctQuestions: "0",
      score: "0",
    })),
  );

  useEffect(() => {
    if (!state.values) return;
    const saved = new Map(
      state.values.modules.map((result) => [result.primaryCategoryId, result]),
    );
    setRows(
      categories.map(
        (category) =>
          saved.get(category.id) ?? {
            primaryCategoryId: category.id,
            totalQuestions: "0",
            correctQuestions: "0",
            score: "0",
          },
      ),
    );
  }, [categories, state.attemptId, state.values]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (result, row) => {
          result.totalQuestions += numberValue(row.totalQuestions);
          result.correctQuestions += numberValue(row.correctQuestions);
          result.score += numberValue(row.score);
          return result;
        },
        { totalQuestions: 0, correctQuestions: 0, score: 0 },
      ),
    [rows],
  );
  const accuracy = calculateAccuracy(
    totals.correctQuestions,
    totals.totalQuestions,
  );

  function updateRow(
    index: number,
    field: "totalQuestions" | "correctQuestions" | "score",
    value: string,
  ) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  return (
    <form
      key={state.attemptId ?? "initial"}
      action={formAction}
      className="space-y-5"
      noValidate
    >
      {state.message ? <Alert variant="destructive">{state.message}</Alert> : null}

      <Card>
        <CardHeader>
          <CardTitle>试卷信息</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="date">日期</Label>
            <Input
              id="date"
              name="date"
              type="date"
              className="mt-2"
              defaultValue={state.values?.date ?? getLocalDateString()}
              required
            />
            <FieldError errors={state.fieldErrors?.date} />
          </div>
          <div>
            <Label htmlFor="examType">考试类型</Label>
            <select
              id="examType"
              name="examType"
              className={`${selectClassName} mt-2`}
              defaultValue={state.values?.examType ?? "国考"}
            >
              {EXAM_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <FieldError errors={state.fieldErrors?.examType} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="name">试卷名称</Label>
            <Input
              id="name"
              name="name"
              className="mt-2"
              placeholder="例如：2026 国考行政执法卷"
              defaultValue={state.values?.name ?? ""}
              maxLength={100}
              required
            />
            <FieldError errors={state.fieldErrors?.name} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>各模块成绩</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            未涉及的模块保持为 0；至少填写一个模块的题目数。
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldError errors={state.fieldErrors?.modules} />
          {categories.map((category, index) => {
            const row = rows[index];
            return (
              <section
                key={category.id}
                className="rounded-lg border bg-muted/20 p-4"
                aria-labelledby={`paper-module-${category.id}`}
              >
                <input type="hidden" name="moduleId" value={category.id} />
                <div className="mb-3 flex items-center gap-2.5">
                  <CategoryIcon categoryId={category.id} />
                  <h3 id={`paper-module-${category.id}`} className="font-medium">
                    {category.name}
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`module-total-${category.id}`}>题目数</Label>
                    <Input
                      id={`module-total-${category.id}`}
                      name="moduleTotal"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="mt-1.5"
                      value={row?.totalQuestions ?? "0"}
                      onChange={(event) =>
                        updateRow(index, "totalQuestions", event.target.value)
                      }
                    />
                    <FieldError
                      errors={
                        state.fieldErrors?.[`modules.${index}.totalQuestions`]
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`module-correct-${category.id}`}>答对数</Label>
                    <Input
                      id={`module-correct-${category.id}`}
                      name="moduleCorrect"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="mt-1.5"
                      value={row?.correctQuestions ?? "0"}
                      onChange={(event) =>
                        updateRow(index, "correctQuestions", event.target.value)
                      }
                    />
                    <FieldError
                      errors={
                        state.fieldErrors?.[`modules.${index}.correctQuestions`]
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`module-score-${category.id}`}>得分</Label>
                    <Input
                      id={`module-score-${category.id}`}
                      name="moduleScore"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.1"
                      className="mt-1.5"
                      value={row?.score ?? "0"}
                      onChange={(event) =>
                        updateRow(index, "score", event.target.value)
                      }
                    />
                    <FieldError
                      errors={state.fieldErrors?.[`modules.${index}.score`]}
                    />
                  </div>
                </div>
              </section>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>试卷汇总</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-muted p-3">
              <dt className="text-xs text-muted-foreground">总题数</dt>
              <dd className="mt-1 text-lg font-semibold">{totals.totalQuestions}</dd>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <dt className="text-xs text-muted-foreground">总答对</dt>
              <dd className="mt-1 text-lg font-semibold">{totals.correctQuestions}</dd>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <dt className="text-xs text-muted-foreground">总得分</dt>
              <dd className="mt-1 text-lg font-semibold">{totals.score.toFixed(1)}</dd>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <dt className="text-xs text-muted-foreground">正确率</dt>
              <dd className="mt-1 text-lg font-semibold">{formatAccuracy(accuracy)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <Label htmlFor="notes">备注（可选）</Label>
          <Textarea
            id="notes"
            name="notes"
            className="mt-2"
            placeholder="记录试卷来源、考试状态或复盘重点"
            defaultValue={state.values?.notes ?? ""}
            maxLength={1000}
          />
          <FieldError errors={state.fieldErrors?.notes} />
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <FileCheck2 aria-hidden="true" />
        )}
        {pending ? "正在保存…" : "保存试卷"}
      </Button>
    </form>
  );
}
