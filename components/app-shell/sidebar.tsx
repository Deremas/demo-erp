"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import {
  getOpenGroupForPath,
  getVisibleNavigation,
  isNavHrefActive,
  navHrefMatches,
} from "@/lib/constants/navigation";
import { getIcon } from "@/lib/icons";
import type { AppRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export function AppSidebar({
  role,
  permissions,
  desktopOpen,
  mobileOpen,
  onNavigate,
  onCloseMobile,
}: {
  role: AppRole;
  permissions: readonly string[];
  desktopOpen: boolean;
  mobileOpen: boolean;
  onNavigate: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const entries = useMemo(() => getVisibleNavigation(role, permissions), [role, permissions]);
  const competingHrefs = useMemo(
    () =>
      entries.flatMap((entry) =>
        entry.type === "link" ? [entry.href] : entry.items.map((item) => item.href),
      ),
    [entries],
  );
  const [openGroup, setOpenGroup] = useState<string | null>(
    getOpenGroupForPath(pathname, role, permissions),
  );

  useEffect(() => {
    const activeGroup = getOpenGroupForPath(pathname, role, permissions);
    if (activeGroup) {
      setOpenGroup(activeGroup);
    }
  }, [pathname, role, permissions]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-white/10 bg-[linear-gradient(180deg,hsl(var(--brand-navy)),hsl(220_70%_18%)_52%,hsl(var(--brand-blue)))] text-white shadow-2xl transition-all duration-300 ease-in-out lg:shadow-none",
          desktopOpen ? "translate-x-0" : "-translate-x-full lg:pointer-events-none lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-none lg:opacity-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-[0_18px_38px_rgba(2,8,23,0.24)] ring-1 ring-white/50">
              <Image
                src="/rungo-logo.png"
                alt="Demo ERP"
                width={48}
                height={48}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[17px] font-bold uppercase tracking-tight text-white">
                Demo ERP
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-100/75">
                Operational System
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-cyan-300/20 lg:hidden"
            onClick={onCloseMobile}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-7">
          <div className="space-y-2">
            {entries.map((entry) => {
              const Icon = getIcon(entry.icon);

              if (entry.type === "link") {
                const active = isNavHrefActive(pathname, entry.href, competingHrefs);

                return (
                  <Link
                    key={entry.href}
                    href={entry.href as Route}
                    prefetch={false}
                    className={cn(
                      "group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-[linear-gradient(135deg,hsl(var(--brand-cyan)),hsl(var(--brand-blue)))] text-white shadow-[0_18px_34px_rgba(3,105,161,0.34)] ring-1 ring-cyan-200/35"
                        : "text-sky-50/82 hover:bg-white/10 hover:text-white hover:ring-1 hover:ring-white/10",
                    )}
                    onClick={onNavigate}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-sky-100/60 group-hover:text-cyan-100")} />
                    <span className="tracking-[0.08em] uppercase text-[12px]">{entry.title}</span>
                  </Link>
                );
              }

              const groupActive = entry.items.some((item) => navHrefMatches(pathname, item.href));
              const expanded = openGroup === entry.title;

              return (
                <div key={entry.title} className="space-y-2">
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-all duration-200",
                      groupActive
                        ? "bg-white/[0.13] text-white shadow-[inset_3px_0_0_hsl(var(--brand-cyan))]"
                        : expanded
                        ? "bg-white/[0.09] text-white"
                        : "text-sky-50/82 hover:bg-white/10 hover:text-white",
                    )}
                    onClick={() =>
                      setOpenGroup((current) =>
                        current === entry.title ? null : entry.title,
                      )
                    }
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", groupActive || expanded ? "text-cyan-100" : "text-sky-100/60")} />
                    <span className="flex-1 tracking-[0.08em] uppercase text-[12px]">{entry.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-300 opacity-80",
                        expanded && "rotate-180 opacity-100",
                      )}
                    />
                  </button>

                  {expanded && (
                    <div className="ml-5 space-y-2 border-l border-cyan-100/16 pl-4 pt-2">
                      {entry.items.map((item) => {
                        const ItemIcon = getIcon(item.icon);
                        const itemActive = isNavHrefActive(pathname, item.href, competingHrefs);

                        return (
                          <Link
                            key={item.href}
                            href={item.href as Route}
                            prefetch={false}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-200",
                              itemActive
                                ? "bg-white text-[hsl(var(--brand-blue))] shadow-[0_14px_24px_rgba(2,8,23,0.18)] ring-1 ring-cyan-200/70"
                                : "text-sky-100/58 hover:bg-white/10 hover:text-white",
                            )}
                            onClick={onNavigate}
                          >
                            <ItemIcon className={cn("h-[18px] w-[18px] shrink-0", itemActive ? "text-[hsl(var(--brand-cyan))]" : "text-current")} />
                            <span>{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

      </aside>
    </>
  );
}