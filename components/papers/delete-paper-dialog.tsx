"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deletePaperAction } from "@/lib/actions/papers";
import { Button, buttonVariants } from "@/components/ui/button";

export function DeletePaperDialog({ id }: { id: string }) {
  const action = deletePaperAction.bind(null, id);
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className={buttonVariants({ variant: "destructive" })}>
        <Trash2 aria-hidden="true" />
        删除试卷
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold">
            确认删除这张试卷？
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
            删除后，各模块成绩和试卷统计会同步更新，且无法恢复。
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel className={buttonVariants({ variant: "outline" })}>
              取消
            </AlertDialog.Cancel>
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
