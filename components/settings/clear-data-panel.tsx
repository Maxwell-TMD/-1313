"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { clearAllDataAction } from "@/lib/actions/data-management";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ClearDataPanel() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [pending, startTransition] = useTransition();
  function confirmClear() {
    startTransition(async () => {
      const result = await clearAllDataAction(confirmation);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      if (result.success) router.refresh();
    });
  }
  return (
    <Card className="border-destructive/35"><CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><Trash2 className="size-5" aria-hidden="true" />危险操作</CardTitle><CardDescription>清空全部练习和试卷记录，默认模块会保留。</CardDescription></CardHeader><CardContent><AlertDialog.Root onOpenChange={(open) => { if (!open) setConfirmation(""); }}><AlertDialog.Trigger className={buttonVariants({ variant: "destructive" })}>清空全部数据</AlertDialog.Trigger><AlertDialog.Portal><AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/45" /><AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-xl"><AlertDialog.Title className="text-lg font-semibold text-destructive">此操作无法撤销</AlertDialog.Title><AlertDialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">请输入“清空全部数据”确认。建议先导出 JSON 备份。</AlertDialog.Description><Input className="mt-4" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="清空全部数据" autoComplete="off" /><div className="mt-6 flex justify-end gap-3"><AlertDialog.Cancel className={buttonVariants({ variant: "outline" })}>取消</AlertDialog.Cancel><Button variant="destructive" disabled={confirmation !== "清空全部数据" || pending} onClick={confirmClear}>{pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}确认清空</Button></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root></CardContent></Card>
  );
}
