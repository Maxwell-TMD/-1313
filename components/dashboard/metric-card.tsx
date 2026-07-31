import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail?: string; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>{detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}</div>
          <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><Icon aria-hidden="true" className="size-5" /></span>
        </div>
      </CardContent>
    </Card>
  );
}
