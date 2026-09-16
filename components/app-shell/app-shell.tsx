"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/app-shell/header";
import { AppSidebar } from "@/components/app-shell/sidebar";
import { UserProvider } from "@/components/app-shell/user-context";
import { BuiltByFooter } from "@/components/shared/built-by-footer";
import type { CurrentUser } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  function handleSidebarToggle() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setDesktopSidebarOpen((current) => !current);
      return;
    }

    setMobileSidebarOpen((current) => !current);
  }

  return (
    <UserProvider user={user}>
      <div className="flex min-h-screen w-full bg-background font-sans text-foreground antialiased selection:bg-primary/10 selection:text-primary">
        <AppSidebar
          role={user.role}
          permissions={user.permissions}
          desktopOpen={desktopSidebarOpen}
          mobileOpen={mobileSidebarOpen}
          onNavigate={() => setMobileSidebarOpen(false)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <div className={cn(
          "flex min-w-0 flex-1 flex-col overflow-x-clip transition-all duration-300",
          desktopSidebarOpen ? "lg:pl-72" : "lg:pl-0"
        )}>
          <AppHeader
            user={user}
            onMenuToggle={handleSidebarToggle}
          />
          <main className="flex-1 min-w-0 overflow-x-clip p-4 sm:p-6 lg:p-8">
            <div className="flex w-full min-w-0 max-w-full flex-col gap-6 overflow-x-clip">
              {children}
            </div>
            <div className="mt-auto pt-8">
              <BuiltByFooter className="justify-center" />
            </div>
          </main>
        </div>
      </div>
    </UserProvider>
  );
}