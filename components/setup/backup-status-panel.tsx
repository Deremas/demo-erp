"use client";

import { useState, useTransition } from "react";
import { 
  Calendar, 
  Database, 
  Download, 
  RefreshCw, 
  Trash2, 
  FileJson, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Info,
  Layers,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDatabaseBackupAction, deleteBackupAction, toggleWeeklyBackupAction } from "@/lib/actions/setup";
import { cn } from "@/lib/utils";

type Backup = {
  id: string;
  fileName: string;
  fileSize: number;
  status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  createdAt: Date;
};

function formatSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function BackupStatusPanel({
  initialBackups,
  weeklyEnabled,
  lastWeeklyBackupAt,
}: {
  initialBackups: Backup[];
  weeklyEnabled: boolean;
  lastWeeklyBackupAt: Date | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" });

  function createBackup() {
    startTransition(async () => {
      const result = await createDatabaseBackupAction({
        ...(filters.dateFrom ? { dateFrom: new Date(filters.dateFrom) } : {}),
        ...(filters.dateTo ? { dateTo: new Date(filters.dateTo) } : {}),
      });
      if (result.success) {
        toast.success(result.message);
        window.location.reload();
        return;
      }
      toast.error(result.message);
    });
  }

  function handleToggleWeekly() {
    startTransition(async () => {
      const result = await toggleWeeklyBackupAction();
      if (result.success) {
        toast.success(result.message);
        window.location.reload();
        return;
      }
      toast.error(result.message);
    });
  }

  function deleteBackup(id: string) {
    if (!confirm("Are you sure you want to permanently delete this backup?")) return;
    startTransition(async () => {
      const result = await deleteBackupAction(id);
      if (result.success) {
        toast.success(result.message);
        window.location.reload();
        return;
      }
      toast.error(result.message);
    });
  }

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 p-6 shadow-sm ring-1 ring-slate-100 dark:from-slate-900 dark:to-slate-950">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Weekly Backups</p>
              <p className="mt-2 text-3xl font-black text-indigo-950 dark:text-white">
                {weeklyEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleToggleWeekly}
                disabled={isPending}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50",
                  weeklyEnabled ? "bg-indigo-600" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    weeklyEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-slate-400">
            Automatically backs up active data every 7 days when settings are active.
          </p>
        </Card>

        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 p-6 shadow-sm ring-1 ring-slate-100 dark:from-slate-900 dark:to-slate-950">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Last Weekly Run</p>
              <p className="mt-2 text-base font-black text-emerald-950 dark:text-emerald-400 truncate">
                {lastWeeklyBackupAt ? new Date(lastWeeklyBackupAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never"}
              </p>
            </div>
            <div className="rounded-full bg-emerald-100/50 p-2.5 dark:bg-emerald-950/50">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-slate-400">
            {lastWeeklyBackupAt ? `Last active run: ${new Date(lastWeeklyBackupAt).toLocaleTimeString()}` : "Toggle on weekly backup option above."}
          </p>
        </Card>

        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 p-6 shadow-sm ring-1 ring-slate-100 dark:from-slate-900 dark:to-slate-950">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-amber-500/5 blur-xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Backups</p>
              <p className="mt-2 text-3xl font-black text-amber-950 dark:text-amber-400">
                {initialBackups.length}
              </p>
            </div>
            <div className="rounded-full bg-amber-100/50 p-2.5 dark:bg-amber-950/50">
              <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-slate-400">
            Historical system records stored locally in directory backups folder.
          </p>
        </Card>
      </div>

      {/* Manual Backup Card */}
      <Card className="border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        <CardHeader className="border-b border-slate-100 bg-slate-50/40 p-6 dark:border-slate-800 dark:bg-slate-900/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
                <Database className="h-5 w-5 text-indigo-500" />
                Backup Generator
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-400">
                Generate a full operational system backup or create a custom date-filtered export.
              </CardDescription>
            </div>
            <Button 
              onClick={createBackup} 
              disabled={isPending}
              className="h-11 rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-[1.01] dark:shadow-none"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
              {isPending ? "Generating files..." : "Run Active Backup"}
            </Button>
          </div>
          
          <div className="grid gap-4 pt-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                Start Date (Optional)
              </Label>
              <Input 
                type="date" 
                value={filters.dateFrom} 
                onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })}
                className="h-10 text-xs font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                End Date (Optional)
              </Label>
              <Input 
                type="date" 
                value={filters.dateTo} 
                onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })}
                className="h-10 text-xs font-bold"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {initialBackups.length === 0 ? (
            <div className="p-16 text-center text-sm font-medium text-slate-400 bg-slate-50/20">
              No system backups generated yet. Click "Run Active Backup" above.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialBackups.map((backup) => (
                <div key={backup.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 dark:text-white truncate max-w-md">
                        {backup.fileName}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        SUCCESS
                      </span>
                      {backup.dateFrom || backup.dateTo ? (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                          Export
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-400">
                      <span>{new Date(backup.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>Total size: {formatSize(backup.fileSize)}</span>
                      {backup.dateFrom || backup.dateTo ? (
                        <>
                          <span>•</span>
                          <span>
                            Range: {backup.dateFrom ? new Date(backup.dateFrom).toLocaleDateString() : "Beginning"} to{" "}
                            {backup.dateTo ? new Date(backup.dateTo).toLocaleDateString() : "Present"}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm" className="h-9 rounded-lg font-bold border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:hover:bg-slate-800">
                      <a href={`/api/backups/${backup.fileName}`} download>
                        <FileJson className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                        JSON
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-9 rounded-lg font-bold border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:hover:bg-slate-800">
                      <a href={`/api/backups/${backup.fileName.replace(/\.json$/i, ".xlsx")}`} download>
                        <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                        Excel
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-9 rounded-lg font-bold border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:hover:bg-slate-800">
                      <a href={`/api/backups/${backup.fileName.replace(/\.json$/i, "_report.html")}`} target="_blank" rel="noreferrer">
                        <FileText className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                        HTML Report
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteBackup(backup.id)} 
                      disabled={isPending}
                      className="h-9 rounded-lg font-bold border-rose-100 text-rose-600 hover:bg-rose-50 dark:border-rose-950/30 dark:hover:bg-rose-950/20"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Strategy & Strategy Panel */}
      <Card className="overflow-hidden border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 bg-gradient-to-br from-indigo-50/10 via-slate-50/30 to-sky-50/10 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
          {/* Left panel: Info */}
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Data Integrity Blueprint
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Data Partitioning & Strategy Panel
            </h3>
            <p className="text-xs leading-relaxed font-medium text-slate-400">
              Demo ERP operates a strict three-tier data partition standard for maximum resilience, human auditing capability, and secure database seeding. All backups generate three coordinated assets in parallel:
            </p>

            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <FileJson className="h-5 w-5 text-indigo-500" />
                <h4 className="mt-2 text-xs font-black text-slate-900 dark:text-white">Structured JSON</h4>
                <p className="mt-1 text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Lossless, relational schema map. Ideal for total disaster recovery and automated reseeding.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                <h4 className="mt-2 text-xs font-black text-slate-900 dark:text-white">Formatted Excel</h4>
                <p className="mt-1 text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Beautiful tabular workbook with custom sheet names. Optimized for quick management reviews.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <FileText className="h-5 w-5 text-amber-500" />
                <h4 className="mt-2 text-xs font-black text-slate-900 dark:text-white">A4 Print Report</h4>
                <p className="mt-1 text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Polished HTML blueprint designed to print directly to PDF or paper for physical compliance reviews.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel: Tabular sheet description */}
          <div className="w-full lg:w-[380px] shrink-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-indigo-500" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Excel Workbook Mapping</span>
            </div>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-[11px] font-semibold text-slate-400 divide-y divide-slate-50 dark:divide-slate-900">
              <div className="flex justify-between py-2.5">
                <span className="text-slate-600 dark:text-slate-300">Sales & Placed Items</span>
                <span className="font-bold text-slate-900 dark:text-white">Sales List & Sold Items Detail</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-600 dark:text-slate-300">Purchases & Ledger</span>
                <span className="font-bold text-slate-900 dark:text-white">Purchases & Purchased Items</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-600 dark:text-slate-300">Stock Movements</span>
                <span className="font-bold text-slate-900 dark:text-white">Stock Movement Log</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-600 dark:text-slate-300">Financial Ledger</span>
                <span className="font-bold text-slate-900 dark:text-white">Financial Ledger</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-600 dark:text-slate-300">Payments & Costs</span>
                <span className="font-bold text-slate-900 dark:text-white">Customer/Supplier Payments</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-600 dark:text-slate-300">Core Masters</span>
                <span className="font-bold text-slate-900 dark:text-white">Products, Users, Locations Master</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-900/50 flex gap-2">
              <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                <strong className="text-slate-700 dark:text-slate-200">Confirmation Note:</strong> In compliance with latest directives, all deprecated schemas including sellers, seller collections, and intake items have been excluded end-to-end to maximize backup speed and efficiency.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}