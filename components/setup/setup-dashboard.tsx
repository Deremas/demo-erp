"use client";

import { useState, useTransition, useEffect } from "react";
import { Download, Database, Trash2, ShieldCheck, HardDrive, RefreshCw, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createDatabaseBackupAction, deleteBackupAction, checkAndTriggerWeeklyBackupAction } from "@/lib/actions/setup";
import { cn, formatCurrency } from "@/lib/utils";
import { CompanyProfileForm } from "./company-profile-form";

type Backup = {
  id: string;
  fileName: string;
  fileSize: number;
  status: string;
  createdAt: Date;
};

export function SetupDashboard({ 
  initialBackups, 
  companySettings,
  health 
}: { 
  initialBackups: Backup[], 
  companySettings: any,
  health: any
}) {
  const [isPending, startTransition] = useTransition();
  const [backups, setBackups] = useState(initialBackups);
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" });

  useEffect(() => {
    async function checkWeekly() {
      const result = await checkAndTriggerWeeklyBackupAction();
      if (result.success && result.fileName) {
        toast.info("A scheduled weekly backup was generated and is ready for download.", {
          action: {
            label: "Download Now",
            onClick: () => {
              const link = document.createElement('a');
              link.href = `/api/backups/${result.fileName}`;
              link.download = result.fileName;
              link.click();
            }
          }
        });
      }
    }
    checkWeekly();
  }, []);

  function handleCreateBackup() {
    startTransition(async () => {
      const result = await createDatabaseBackupAction({
        ...(filters.dateFrom ? { dateFrom: new Date(filters.dateFrom) } : {}),
        ...(filters.dateTo ? { dateTo: new Date(filters.dateTo) } : {}),
      });
      if (result.success) {
        toast.success(result.message);
        // Page will refresh via revalidatePath
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDeleteBackup(id: string) {
    if (!confirm("Are you sure you want to delete this backup?")) return;
    
    startTransition(async () => {
      const result = await deleteBackupAction(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function formatSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* System Status */}
      <div className="lg:col-span-1 space-y-8">
        <Card className="rounded-3xl border-none shadow-xl bg-[linear-gradient(135deg,hsl(var(--brand-blue)),hsl(var(--brand-cyan)))] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <CardHeader>
            <CardTitle className="text-xl font-black">Demo ERP</CardTitle>
            <CardDescription className="text-blue-100 font-bold uppercase tracking-widest text-[10px]">Operational System</CardDescription>
          </CardHeader>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Maintenance Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Backup</p>
                  <p className="font-bold text-sm text-slate-700">
                    {health?.lastBackupAt ? new Date(health.lastBackupAt).toLocaleString() : "Never"}
                  </p>
                </div>
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  health?.lastBackupAt ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                )} />
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => window.location.href='/inventory/low-stock'}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Low Stock Alerts</p>
                  <p className="font-bold text-sm text-amber-600">{health?.lowStockCount || 0} Products</p>
                </div>
                {health?.lowStockCount > 0 && <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => window.location.href='/sales/sales-list?status=DRAFT'}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Draft Sales</p>
                  <p className="font-bold text-sm text-slate-700">{health?.draftSales || 0} Pending</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => window.location.href='/inventory/transfers?status=DRAFT'}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unposted Transfers</p>
                  <p className="font-bold text-sm text-slate-700">{health?.draftTransfers || 0} Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="justify-start h-11 rounded-xl font-bold" asChild>
              <a href="/admin/users">User Management</a>
            </Button>
            <Button variant="outline" className="justify-start h-11 rounded-xl font-bold" asChild>
              <a href="/finance/ledger">Audit Trail</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Database Backups & Company Profile */}
      <div className="lg:col-span-2 space-y-8">
        <CompanyProfileForm initialSettings={companySettings} />
        
        <Card className="rounded-3xl border-slate-200 shadow-sm min-h-[400px]">
          <CardHeader className="flex flex-col gap-6 border-b border-slate-100 pb-6">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  Database Backups
                </CardTitle>
                <CardDescription>Generate snapshots or filter data by date range for targeted exports.</CardDescription>
              </div>
              <Button 
                onClick={handleCreateBackup} 
                disabled={isPending}
                className="rounded-xl font-black bg-blue-600 hover:bg-blue-700 h-11 px-6 shadow-lg shadow-blue-200"
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
                {isPending ? "Generating..." : "Run New Backup"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Start Date (Optional)
                  </Label>
                  <Input 
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="h-10 rounded-xl bg-white border-slate-200"
                  />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> End Date (Optional)
                  </Label>
                  <Input 
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="h-10 rounded-xl bg-white border-slate-200"
                  />
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {initialBackups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                <HardDrive className="h-12 w-12 opacity-20" />
                <p className="font-bold">No backups found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {initialBackups.map((backup) => (
                  <div key={backup.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <p className="font-black text-slate-900">{backup.fileName}</p>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>{new Date(backup.createdAt).toLocaleString()}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{formatSize(backup.fileSize)}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        {(backup as any).dateFrom || (backup as any).dateTo ? (
                          <>
                            <span className="text-amber-600 flex items-center gap-1">
                              <Filter className="h-3 w-3" /> Filtered
                            </span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                          </>
                        ) : null}
                        <span className="text-emerald-600">{backup.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-lg border-slate-200" asChild>
                        <a href={`/api/backups/${backup.fileName}`} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg border-slate-200 text-[10px] font-black" asChild>
                        <a href={`/api/backups/${backup.fileName.replace(/\.json$/i, ".xlsx")}`} download>
                          XLSX
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg border-slate-200 text-[10px] font-black" asChild>
                        <a href={`/api/backups/${backup.fileName.replace(/\.json$/i, "_report.html")}`} target="_blank" rel="noreferrer">
                          PDF
                        </a>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 w-9 p-0 rounded-lg border-slate-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => handleDeleteBackup(backup.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}