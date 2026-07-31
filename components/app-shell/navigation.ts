import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
  Settings,
} from "lucide-react";

export const navigation = [
  { href: "/", label: "首页", icon: LayoutDashboard },
  { href: "/records/new", label: "记录", icon: PlusCircle },
  { href: "/records", label: "历史", icon: ClipboardList },
  { href: "/analytics", label: "分析", icon: BarChart3 },
  { href: "/settings", label: "设置", icon: Settings },
] as const;
