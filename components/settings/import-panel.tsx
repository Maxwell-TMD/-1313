"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { replaceAllDataAction } from "@/lib/actions/data-management";
import { backupSchema, type BackupPayload } from "@/lib/validation/backup";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ImportPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [backup, setBackup] = useState<BackupPayload | null>(null);
  const [serialized, setSerialized] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function selectFile(file?: File) {
    setBackup(null);
    setSerialized("");
    setError("");
    if (!file) return;
    if (file.size > 5_000_000) { setError("文件不能超过 5 MB"); return; }
    try {
      const content = await file.text();
      const parsed = backupSchema.safeParse(JSON.parse(content));
      if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "备份格式不正确"); return; }
      setBackup(parsed.data);
      setSerialized(content);
    } catch { setError("文件不是有效的 JSON 备份"); }
  }

  const dates = backup?.records.map((record) => record.date).sort() ?? [];

  function confirmImport() {
    startTransition(async () => {
      const result = await replaceAllDataAction(serialized);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      if (result.success) {
        setBackup(null);
        setSerialized("");
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      }
    });
  }

  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileUp className="size-5" aria-hidden="true" />恢复 JSON 备份</CardTitle><CardDescription>导入会覆盖当前记录；确认前不会修改任何数据。</CardDescription></CardHeader><CardContent className="space-y-4"><Input ref={inputRef} type="file" accept="application/json,.json" onChange={(event) => void selectFile(event.target.files?.[0])} />{error ? <Alert variant="destructive">{error}</Alert> : null}{backup ? <div className="rounded-lg border bg-muted/40 p-4 text-sm"><p className="font-medium">备份摘要</p><dl className="mt-3 grid gap-2 sm:grid-cols-3"><div><dt className="text-muted-foreground">练习记录</dt><dd className="font-semibold">{backup.records.length} 条</dd></div><div><dt className="text-muted-foreground">一级模块</dt><dd className="font-semibold">{backup.categories.length} 个</dd></div><div><dt className="text-muted-foreground">日期范围</dt><dd className="font-semibold">{dates.length ? `${dates[0]} 至 ${dates.at(-1)}` : "无记录"}</dd></div></dl><Alert variant="destructive" className="mt-4">继续操作将覆盖当前全部练习记录。</Alert><Button variant="destructive" className="mt-4" disabled={pending} onClick={confirmImport}>{pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}{pending ? "正在恢复…" : "确认覆盖并恢复"}</Button></div> : null}</CardContent></Card>
  );
}
