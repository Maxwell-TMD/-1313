"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Target } from "lucide-react";
import { navigation } from "./navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-card lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 px-6">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Target aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="font-semibold">公考刷题统计</p>
          <p className="text-xs text-muted-foreground">每天进步一点</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="主导航">
        {navigation.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : item.href === "/records/new"
                ? pathname === "/records/new"
                : item.href === "/records"
                  ? pathname.startsWith("/records") && pathname !== "/records/new"
                  : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                active && "bg-secondary text-secondary-foreground",
              )}
            >
              <Icon aria-hidden="true" className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between border-t p-4">
        <span className="text-xs text-muted-foreground">本机单用户</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
