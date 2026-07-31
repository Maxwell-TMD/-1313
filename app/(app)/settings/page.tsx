import { PageHeader } from "@/components/app-shell/page-header";
import { ClearDataPanel } from "@/components/settings/clear-data-panel";
import { ExportPanel } from "@/components/settings/export-panel";
import { ImportPanel } from "@/components/settings/import-panel";
import { AccessPanel } from "@/components/settings/access-panel";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="数据管理" description="备份、恢复或清空个人练习数据。" />
      <div className="space-y-5"><AccessPanel /><ExportPanel /><ImportPanel /><ClearDataPanel /></div>
    </>
  );
}
