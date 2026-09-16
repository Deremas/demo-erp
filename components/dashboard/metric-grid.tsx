"use client";

import Link from "next/link";
import {
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Layers,
  Users,
  Truck,
  MapPin,
  ArrowUpRight,
  ArrowDownLeft,
  BellRing,
  AlertTriangle,
  ArrowLeftRight,
  Clock,
  ArrowRight,
  TrendingDown,
  Percent,
  Landmark,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MetricCard as MetricCardType } from "@/lib/types";

const iconMap = {
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Layers,
  Users,
  Truck,
  MapPin,
  ArrowUpRight,
  ArrowDownLeft,
  BellRing,
  AlertTriangle,
  ArrowLeftRight,
  Clock,
  Percent,
  Landmark,
};

const toneClasses = {
  success: {
    dot: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    accent: "bg-emerald-500",
    footer: "text-emerald-600 dark:text-emerald-400",
    glow: "from-emerald-500/20",
    base: "bg-emerald-50/20 border-emerald-100/50 dark:bg-emerald-500/5 dark:border-emerald-500/10",
    hover: "hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10",
  },
  warning: {
    dot: "bg-amber-500",
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    accent: "bg-amber-500",
    footer: "text-amber-600 dark:text-amber-400",
    glow: "from-amber-500/20",
    base: "bg-amber-50/20 border-amber-100/50 dark:bg-amber-500/5 dark:border-amber-500/10",
    hover: "hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-500/10",
  },
  danger: {
    dot: "bg-rose-500",
    icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    accent: "bg-rose-500",
    footer: "text-rose-600 dark:text-rose-400",
    glow: "from-rose-500/20",
    base: "bg-rose-50/20 border-rose-100/50 dark:bg-rose-500/5 dark:border-rose-500/10",
    hover: "hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-500/10",
  },
  default: {
    dot: "bg-blue-600",
    icon: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    accent: "bg-blue-600",
    footer: "text-blue-600 dark:text-blue-400",
    glow: "from-blue-500/20",
    base: "bg-blue-50/20 border-blue-100/50 dark:bg-blue-500/5 dark:border-blue-500/10",
    hover: "hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-500/10",
  },
};

export function MetricCard({
  title,
  value,
  tone,
  meta,
  icon,
  href,
  footerLabel,
  trend,
  subStats,
  progress,
  featured,
}: MetricCardType & { featured?: boolean }) {
  const Icon = icon ? (iconMap[icon as keyof typeof iconMap] || DollarSign) : null;
  const t = toneClasses[tone as keyof typeof toneClasses] ?? toneClasses.default;

  const isLong = value.length > 12;
  const isVeryLong = value.length > 15;
  const isHuge = value.length > 18;

  /* ── FEATURED (full-width) layout ── */
  if (featured) {
    const inner = (
      <div className="flex h-full flex-col lg:flex-row lg:items-center relative z-10">
        {/* Left: title + main value */}
        <div className="shrink-0 lg:w-64 xl:w-72">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn("h-2 w-2 rounded-full shrink-0", t.dot)} />
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              {title}
            </p>
            {Icon && (
              <div className={cn("ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", t.icon)}>
                <Icon className="h-4 w-4" />
              </div>
            )}
          </div>
          <h3 className="text-2xl font-black tracking-tighter text-foreground xl:text-3xl">
            {value}
          </h3>
          {meta && (
            <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {meta}
            </span>
          )}
          {trend && (
            <div
              className={cn(
                "mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black shadow",
                trend.isUp ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
              )}
            >
              {trend.isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-muted self-stretch mx-8 xl:mx-12" />

        {/* Right: sub-stats spread equally */}
        {subStats && subStats.length > 0 && (
          <div className="flex flex-1 flex-wrap lg:flex-nowrap gap-0 mt-6 lg:mt-0 pt-6 lg:pt-0 border-t lg:border-0 border-border/50">
            {subStats.map((stat, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 min-w-[100px]",
                  i > 0 && "border-l border-border/50 pl-6 lg:pl-8"
                )}
              >
                <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1.5">
                  {stat.label}
                </p>
                <p className="text-lg font-black tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Progress (if any) */}
        {progress && (
          <div className="mt-4 lg:mt-0 lg:ml-8 lg:w-40 xl:w-56">
            <div className="flex justify-between text-[11px] font-bold mb-1.5">
              <span className="text-muted-foreground">{progress.label}</span>
              <span className="text-foreground font-black">{progress.value}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all duration-1000", progress.color || "bg-gradient-to-r from-blue-600 to-indigo-500")}
                style={{ width: `${progress.value}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer link for featured */}
        {footerLabel && href && (
          <div className="hidden lg:flex items-center gap-1.5 ml-8 shrink-0">
            <span className={cn("text-[10px] font-black uppercase tracking-widest", t.footer)}>
              {footerLabel}
            </span>
            <ArrowRight className="h-3 w-3 text-slate-300" />
          </div>
        )}
      </div>
    );

    const cls = cn(
      "group relative overflow-hidden rounded-2xl p-6 shadow-sm transition-all duration-300 border",
      href && "cursor-pointer hover:-translate-y-1 hover:shadow-xl",
      t.base,
      t.hover
    );

    return href ? (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Link href={href as any}>
        <Card className={cls}>
          <div className={cn("absolute top-0 left-0 h-[3px] w-full opacity-0 transition-opacity group-hover:opacity-100", t.accent)} />
          {inner}
        </Card>
      </Link>
    ) : (
      <Card className={cls}>
        <div className={cn("absolute top-0 left-0 h-[3px] w-full opacity-0 transition-opacity group-hover:opacity-100", t.accent)} />
        {inner}
      </Card>
    );
  }

  /* ── NORMAL card layout ── */
  const inner = (
    <div className="flex h-full flex-col relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", t.dot)} />
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest truncate">
            {title}
          </p>
        </div>
        {Icon && (
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all group-hover:scale-110", t.icon)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-auto space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className={cn(
              "font-black tracking-tighter text-foreground leading-none",
              isHuge ? "text-sm" : isVeryLong ? "text-base" : isLong ? "text-lg" : "text-xl xl:text-2xl"
            )}
          >
            {value}
          </h3>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0",
                trend.isUp ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
              )}
            >
              {trend.isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        {meta && (
          <span className="inline-block rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {meta}
          </span>
        )}
      </div>

      {/* Sub-stats */}
      {subStats && subStats.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
          {subStats.map((stat, i) => (
            <div key={i} className="space-y-0.5 min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider truncate">
                {stat.label}
              </p>
              <p className="text-sm font-black tracking-tight text-foreground truncate">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Progress */}
      {progress && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-muted-foreground truncate">{progress.label}</span>
            <span className="text-foreground font-black shrink-0">{progress.value}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", progress.color || "bg-gradient-to-r from-blue-600 to-indigo-500")}
              style={{ width: `${progress.value}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      {footerLabel && (
        <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-1.5">
            <div className={cn("h-1 w-1 rounded-full shrink-0", t.dot)} />
            <span className={cn("text-[10px] font-black uppercase tracking-widest", t.footer)}>
              {footerLabel}
            </span>
          </div>
          <ArrowRight className="h-3 w-3 text-slate-300 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </div>
  );

  const cls = cn(
    "group relative h-full overflow-hidden rounded-2xl p-6 shadow-sm transition-all duration-300 border",
    href && "cursor-pointer hover:-translate-y-1 hover:shadow-xl",
    t.base,
    t.hover
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return href ? (
    <Link href={href as any}>
      <Card className={cls}>
        <div className={cn("absolute top-0 left-0 h-[4px] w-full opacity-0 transition-all duration-300 group-hover:opacity-100", t.accent)} />
        <div className={cn("absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br to-transparent blur-[60px] opacity-0 transition-opacity duration-500 group-hover:opacity-60", t.glow)} />
        {inner}
      </Card>
    </Link>
  ) : (
    <Card className={cls}>
      <div className={cn("absolute top-0 left-0 h-[4px] w-full opacity-0 transition-all duration-300 group-hover:opacity-100", t.accent)} />
      <div className={cn("absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br to-transparent blur-[60px] opacity-0 transition-opacity duration-500 group-hover:opacity-60", t.glow)} />
      {inner}
    </Card>
  );
}

export function MetricGrid({
  metrics,
  columns = 5,
}: {
  metrics: MetricCardType[];
  columns?: number;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 items-stretch",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 2 && "sm:grid-cols-2",
        columns === 1 && "grid-cols-1",
        (!columns || columns === 5) &&
          "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10"
      )}
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} featured={columns === 1} />
      ))}
    </div>
  );
}

export function SummaryGrid({
  metrics,
  title,
  columns = 5,
}: {
  metrics: MetricCardType[];
  title?: string;
  columns?: number;
}) {
  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center gap-2.5 px-1">
          <div className="h-4 w-1 rounded-full bg-blue-600" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {title}
          </h2>
        </div>
      )}
      <MetricGrid metrics={metrics} columns={columns} />
    </div>
  );
}