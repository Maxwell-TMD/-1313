import * as React from "react";
import { cn } from "@/lib/utils";

export function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: "default" | "destructive" | "success" }) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variant === "default" && "bg-muted",
        variant === "destructive" && "border-destructive/40 bg-destructive/10 text-destructive",
        variant === "success" && "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
        className,
      )}
      {...props}
    />
  );
}
