"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteRecordAction } from "@/lib/actions/records";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DeleteRecordDialog({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const action = deleteRecordAction.bind(null, id);
  const [pending, startTransition] = useTransition();
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        className={cn(
          buttonVariants({ variant: compact ? "ghost" : "destructive", size: compact ? "sm" : "default" }),
          compact && "text-destructive hover:bg-destructive/10 hover:text-destructive",
        )}
      >
        <Trash2 aria-hidden="true" />
        删除
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold">确认删除这条记录？</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
            删除后无法恢复，相关统计结果也会同步变化。
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel className={buttonVariants({ variant: "outline" })}>取消</AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={() => startTransition(async () => action())}
              >
                {pending ? "正在删除…" : "确认删除"}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
