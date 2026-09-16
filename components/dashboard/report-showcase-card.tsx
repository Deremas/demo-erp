import Link from "next/link";
import {
  ArrowRight,
  ChartColumnIncreasing,
  ReceiptText,
  Boxes,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ReportShortcut = {
  title: string;
  description: string;
  href: string;
  icon: typeof ChartColumnIncreasing;
};

const reportShortcuts: ReportShortcut[] = [
  {
    title: "Sales Profit",
    description: "See what was sold, cost used, and gross profit.",
    href: "/reports/sales-profitability",
    icon: ChartColumnIncreasing,
  },
  {
    title: "Current Stock",
    description: "Review item quantities and inventory value by location.",
    href: "/inventory/stock",
    icon: Boxes,
  },
  {
    title: "Expense Summary",
    description: "Review spending by category for the selected period.",
    href: "/reports/expense-analysis",
    icon: ReceiptText,
  },
];

export function ReportShowcaseCard() {
  return (
    <Card className="h-full border-slate-200/60 bg-slate-50/30 dark:bg-slate-900/20 shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-black tracking-tight text-slate-900">
            Helpful Reports
          </CardTitle>
          <CardDescription className="text-xs font-medium text-slate-500">
            Start with the simplest views for daily checking.
          </CardDescription>
        </div>
        <Button asChild size="sm" variant="outline" className="h-8 rounded-lg border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50">
          <Link href="/reports">All reports</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 max-[359px]:grid-cols-1">
        {reportShortcuts.map((report) => {
          const Icon = report.icon;

          return (
            <Link
              key={report.href}
              href={report.href as any}
              className="group relative flex h-full min-w-0 flex-col justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
            >
              <div className="flex min-w-0 items-start gap-3.5">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-500/10 dark:text-blue-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {report.title}
                  </p>
                  <p className="text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                    {report.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <span>View Report</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}