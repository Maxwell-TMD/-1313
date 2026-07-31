import { DesktopSidebar } from "@/components/app-shell/desktop-sidebar";
import { MobileBottomNav } from "@/components/app-shell/mobile-bottom-nav";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:translate-y-0"
      >
        跳到主要内容
      </a>
      <DesktopSidebar />
      <main
        id="main-content"
        className="mx-auto min-h-screen max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:ml-60 lg:px-8 lg:py-8"
      >
        {children}
      </main>
      <MobileBottomNav />
    </>
  );
}
