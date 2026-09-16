"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { getNavigationTitle } from "@/lib/constants/navigation";
import { authClient } from "@/lib/auth/client";
import type { CurrentUser } from "@/lib/types";

export function AppHeader({
  user,
  onMenuToggle,
}: {
  user: CurrentUser;
  onMenuToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSignOutPending, startSignOutTransition] = useTransition();
  const pageTitle = getNavigationTitle(pathname);
  const topbarControlClass =
    "border-border bg-card text-foreground shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition hover:border-[hsl(var(--brand-cyan)/0.45)] hover:bg-accent";
  const topbarMutedTextClass = "text-muted-foreground";

  function handleSignOut() {
    startSignOutTransition(async () => {
      try {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      } catch {
        toast.error("Unable to sign out right now.");
      }
    });
  }

  return (
    <header className="sticky top-0 z-30 max-w-full shrink-0 overflow-x-clip border-b border-border bg-[linear-gradient(135deg,hsl(var(--topbar-surface)/0.98),hsl(var(--accent)/0.52))] px-8 py-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="!w-full !max-w-none min-w-0">
        <div className="flex min-w-0 items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-6">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={`h-12 w-12 rounded-xl border-2 ${topbarControlClass}`}
              onClick={onMenuToggle}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {pageTitle}
                </h1>
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-4 sm:gap-6">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`flex items-center gap-4 rounded-2xl px-5 py-2.5 border-2 ${topbarControlClass}`}
                >
                  <Avatar name={user.name} className="h-10 w-10 shadow-md ring-2 ring-white" />
                  <div className="hidden text-left lg:block">
                    <p className="max-w-[12rem] truncate text-[14px] font-semibold text-foreground uppercase tracking-tight">
                      {user.name}
                    </p>
                    <p className={`text-[11px] font-medium uppercase tracking-[0.2em] ${topbarMutedTextClass}`}>{user.role}</p>
                  </div>
                  <ChevronDown className={`h-5 w-5 ${topbarMutedTextClass} opacity-70`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 rounded-3xl border-border p-3 shadow-[0_30px_60px_rgba(2,8,23,0.14)]">
                <DropdownMenuLabel className="px-5 py-4">
                  <div className="space-y-1.5">
                    <p className="text-md font-bold uppercase tracking-tight">{user.name}</p>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{user.username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-2 h-px bg-border" />
                <DropdownMenuItem className="cursor-pointer rounded-2xl px-5 py-4 text-[13px] font-semibold uppercase tracking-wide focus:bg-[hsl(var(--accent))]" onSelect={() => router.push("/profile")}>
                  <UserRound className="mr-4 h-5 w-5 text-primary" />
                  Security Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="mx-2 h-px bg-border" />
                <DropdownMenuItem disabled={isSignOutPending} className="cursor-pointer rounded-2xl px-5 py-4 text-[13px] font-semibold uppercase tracking-wide text-rose-600 focus:bg-rose-50 focus:text-rose-700" onSelect={handleSignOut}>
                  <LogOut className="mr-4 h-5 w-5" />
                  {isSignOutPending ? "Signing Out..." : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}