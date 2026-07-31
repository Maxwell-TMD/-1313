import { Download, FileJson, Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ExportPanel() {
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Download className="size-5" aria-hidden="true" />导出数据</CardTitle><CardDescription>JSON 包含练习和试卷，可完整恢复；CSV 仅导出练习记录。</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-3"><Button asChild><a href="/api/export/json" download><FileJson aria-hidden="true" />导出 JSON 备份</a></Button><Button asChild variant="outline"><a href="/api/export/csv" download><Sheet aria-hidden="true" />导出 CSV</a></Button></CardContent></Card>
  );
}
