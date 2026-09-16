"use client";

import { format } from "date-fns";
import { ArrowRight, History, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import type { RecentTransaction, SimpleRow } from "@/lib/types";

interface ActivityTablesProps {
  recentTransactions: RecentTransaction[];
  lowStock: SimpleRow[];
}

export function ActivityTables({ recentTransactions, lowStock }: ActivityTablesProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:gap-10">
      {/* Recent Transactions */}
      <Card className="border border-border/60 shadow-[0_15px_45px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-card transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">
        <CardHeader className="flex flex-row items-center justify-between bg-card py-6 px-6 sm:py-7 sm:px-10 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <History className="h-5 w-5" />
            </div>
            <CardTitle className="text-[15px] sm:text-[17px] font-extrabold text-foreground tracking-tight">Transactions</CardTitle>
          </div>
          <Link
            href={"/sales/history" as any}
            className="group flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-[12px] font-bold text-slate-500 transition-all hover:bg-primary hover:text-white"
          >
            History
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[400px] sm:min-w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-50 h-14 bg-slate-50/30">
                <TableHead className="px-6 sm:px-10 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Ref / Date</TableHead>
                <TableHead className="px-6 sm:px-10 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Type</TableHead>
                <TableHead className="px-6 sm:px-10 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id} className="group h-20 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="px-6 sm:px-10">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[13px] sm:text-[14px] text-foreground tracking-tight truncate max-w-[120px] sm:max-w-none">{tx.reference}</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {format(new Date(tx.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 sm:px-10">
                    <Badge
                      variant="secondary"
                      className={cn(
                          "font-bold text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-widest",
                          tx.type === "Sale" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600 border border-slate-200"
                      )}
                    >
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 sm:px-10 text-right font-black text-[14px] sm:text-[16px] text-foreground tabular-nums whitespace-nowrap">
                    {formatCurrency(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {recentTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center text-[14px] font-bold text-slate-400 italic">
                    No recent transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Critical Stock Alerts */}
      <Card className="border border-slate-200/60 shadow-[0_15px_45px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">
        <CardHeader className="flex flex-row items-center justify-between bg-white py-6 px-6 sm:py-7 sm:px-10 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
            </div>
            <CardTitle className="text-[15px] sm:text-[17px] font-extrabold text-foreground tracking-tight">Alerts</CardTitle>
          </div>
          <Link
            href={"/inventory/alerts" as any}
            className="group flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-[12px] font-bold text-slate-500 transition-all hover:bg-rose-600 hover:text-white"
          >
            Manage
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[400px] sm:min-w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-100 h-14 bg-slate-50/30">
                <TableHead className="px-6 sm:px-10 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Product / Location</TableHead>
                <TableHead className="px-6 sm:px-10 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.map((item) => (
                <TableRow key={item.id} className="group h-20 border-b border-slate-50 last:border-0 hover:bg-rose-50/10 transition-colors">
                  <TableCell className="px-6 sm:px-10">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[13px] sm:text-[14px] text-foreground tracking-tight truncate max-w-[150px] sm:max-w-none">{item.name}</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[150px] sm:max-w-none">{item.location}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 sm:px-10 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn(
                          "font-black text-[14px] sm:text-[16px] tabular-nums whitespace-nowrap",
                          item.status === "CRITICAL" ? "text-rose-600" : "text-amber-600"
                      )}>
                        {item.currentStock} Units
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Thresh: {item.minimumStockAlert}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {lowStock.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="h-48 text-center text-[14px] font-bold text-slate-400 italic">
                    All inventory levels are optimal
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}