import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpDown,
  BookOpenText,
  Brain,
  Building2,
  Calculator,
  CalendarRange,
  ChartNoAxesCombined,
  CircleDot,
  Clock3,
  Ellipsis,
  FileCheck2,
  Files,
  Flag,
  Gauge,
  History,
  Landmark,
  Languages,
  Lightbulb,
  ListChecks,
  Newspaper,
  PenLine,
  PieChart,
  Plus,
  Puzzle,
  RefreshCcw,
  Scale,
  ScrollText,
  Search,
  SearchCheck,
  Shuffle,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, LucideIcon> = {
  "xingce-politics": Landmark,
  "xingce-common-sense": Lightbulb,
  "xingce-language": BookOpenText,
  "xingce-quantity": Calculator,
  "xingce-reasoning": Puzzle,
  "xingce-data": ChartNoAxesCombined,
  "shenlun-summary": ListChecks,
  "shenlun-analysis": Search,
  "shenlun-solutions": Lightbulb,
  "shenlun-implementation": FileCheck2,
  "shenlun-essay": PenLine,

  "xingce-politics-xi-theory": Sparkles,
  "xingce-politics-modernization": Building2,
  "xingce-politics-policy": ScrollText,
  "xingce-politics-documents": Files,
  "xingce-politics-current-affairs": Newspaper,
  "xingce-politics-party-history": Flag,
  "xingce-politics-comprehensive": Brain,

  "xingce-language-1": Puzzle,
  "xingce-language-2": BookOpenText,
  "xingce-language-3": Languages,
  "xingce-quantity-1": Calculator,
  "xingce-quantity-2": TrendingUp,
  "xingce-reasoning-1": Puzzle,
  "xingce-reasoning-2": SearchCheck,
  "xingce-reasoning-3": ArrowUpDown,
  "xingce-reasoning-4": Brain,

  "xingce-data-simple": SearchCheck,
  "xingce-data-current-value": Clock3,
  "xingce-data-base-value": History,
  "xingce-data-2": Plus,
  "xingce-data-1": TrendingUp,
  "xingce-data-interval-growth": RefreshCcw,
  "xingce-data-annual-growth": CalendarRange,
  "xingce-data-mixed-growth": Shuffle,
  "xingce-data-contribution": Target,
  "xingce-data-current-proportion": PieChart,
  "xingce-data-base-proportion": History,
  "xingce-data-two-period-proportion": RefreshCcw,
  "xingce-data-current-average": Gauge,
  "xingce-data-base-average": Scale,
  "xingce-data-average-growth": Activity,
  "xingce-data-5": X,
  "xingce-data-comparison": ArrowUpDown,
  "xingce-data-comprehensive": Brain,
  "xingce-data-other": Ellipsis,
};

function categoryTone(categoryId: string) {
  if (categoryId.startsWith("xingce-politics")) {
    return "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300";
  }
  if (categoryId.startsWith("xingce-data")) {
    return "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300";
  }
  if (categoryId.startsWith("xingce-language")) {
    return "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300";
  }
  if (categoryId.startsWith("xingce-quantity")) {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  }
  if (categoryId.startsWith("xingce-reasoning")) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  }
  return "bg-secondary text-secondary-foreground";
}

export function CategoryIcon({
  categoryId,
  className,
}: {
  categoryId: string;
  className?: string;
}) {
  const Icon = categoryIcons[categoryId] ?? CircleDot;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-md",
        categoryTone(categoryId),
        className,
      )}
    >
      <Icon className="size-3.5" />
    </span>
  );
}
