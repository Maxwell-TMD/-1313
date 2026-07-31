import Link from "next/link";
import type { PrimaryCategory, SecondaryCategory } from "@prisma/client";
import { RotateCcw, Search } from "lucide-react";
import { EXAM_TYPES, SUBJECTS } from "@/lib/constants/exams";
import type { RecordFilters } from "@/lib/validation/record";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CategoryWithChildren = PrimaryCategory & { secondaryCategories: SecondaryCategory[] };
const selectClassName = "h-10 w-full rounded-lg border bg-background px-3 text-sm";

export function RecordFiltersForm({
  filters,
  categories,
}: {
  filters: RecordFilters;
  categories: CategoryWithChildren[];
}) {
  return (
    <Card className="mb-5">
      <CardContent className="pt-5">
        <form method="get" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <div>
            <Label htmlFor="startDate">开始日期</Label>
            <Input id="startDate" name="startDate" type="date" className="mt-2 h-10" defaultValue={filters.startDate} />
          </div>
          <div>
            <Label htmlFor="endDate">结束日期</Label>
            <Input id="endDate" name="endDate" type="date" className="mt-2 h-10" defaultValue={filters.endDate} />
          </div>
          <div>
            <Label htmlFor="examType">考试类型</Label>
            <select id="examType" name="examType" className={`${selectClassName} mt-2`} defaultValue={filters.examType ?? ""}>
              <option value="">全部</option>
              {EXAM_TYPES.map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="subject">科目</Label>
            <select id="subject" name="subject" className={`${selectClassName} mt-2`} defaultValue={filters.subject ?? ""}>
              <option value="">全部</option>
              {SUBJECTS.map((value) => <option key={value}>{value}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="primaryCategoryId">一级模块</Label>
            <select id="primaryCategoryId" name="primaryCategoryId" className={`${selectClassName} mt-2`} defaultValue={filters.primaryCategoryId ?? ""}>
              <option value="">全部</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="secondaryCategoryId">二级模块</Label>
            <select id="secondaryCategoryId" name="secondaryCategoryId" className={`${selectClassName} mt-2`} defaultValue={filters.secondaryCategoryId ?? ""}>
              <option value="">全部</option>
              {categories.flatMap((category) => category.secondaryCategories).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 sm:col-span-2 xl:col-span-6 xl:justify-end">
            <Button type="submit" size="sm"><Search aria-hidden="true" />筛选</Button>
            <Button asChild type="button" variant="outline" size="sm"><Link href="/records"><RotateCcw aria-hidden="true" />清除</Link></Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
