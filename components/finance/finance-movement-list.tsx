"use client";

import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, FileText, ShoppingBag, ShoppingCart, Tag, RefreshCw, Download } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LedgerMovement = {
  id: string;
  entryDate: string;
  location: string;
  account: string;
  type: string;
  direction: "DEBIT" | "CREDIT";
  amount: number;
  reference: string;
  description?: string;
};

const typeIcons: Record<string, any> = {
  SALE: ShoppingCart,
  PURCHASE: ShoppingBag,
  EXPENSE: Tag,
  CUSTOMER_PAYMENT: ArrowUpRight,
  SUPPLIER_PAYMENT: ArrowDownLeft,
  CASH_TRANSFER: RefreshCw,
  OPENING_BALANCE: FileText,
  ADJUSTMENT: RefreshCw,
};

const typeLabels: Record<string, string> = {
  SALE: "Customer Sale",
  PURCHASE: "Inventory Purchase",
  EXPENSE: "Operating Expense",
  CUSTOMER_PAYMENT: "Customer Payment",
  SUPPLIER_PAYMENT: "Supplier Settlement",
  CASH_TRANSFER: "Funds Transfer",
  OPENING_BALANCE: "Opening Balance",
  ADJUSTMENT: "Ledger Adjustment",
};

export function FinanceMovementList({ movements }: { movements: LedgerMovement[] }) {
  const handleExport = () => {
    const headers = [
      "Date",
      "Account",
      "Location",
      "Type",
      "Reference",
      "Direction",
      "Amount",
    ];
    const escapeCsv = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`;
    const rows = movements.map((movement) => [
      format(new Date(movement.entryDate), "yyyy-MM-dd HH:mm"),
      movement.account,
      movement.location,
      typeLabels[movement.type] || movement.type,
      movement.reference,
      movement.direction === "DEBIT" ? "In" : "Out",
      movement.amount,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rungo-finance-ledger-${format(new Date(), "yyyy-MM-dd")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <FileText className="h-10 w-10 mb-3 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest">No movements found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExport} className="h-8 text-xs font-bold rounded-lg bg-white shadow-sm hover:bg-slate-50 dark:bg-slate-950">
          <Download className="mr-2 h-3 w-3" />
          Export CSV
        </Button>
      </div>
      <div className="space-y-2">
      {movements.map((movement) => {
        const Icon = typeIcons[movement.type] || FileText;
        const isIn = movement.direction === "DEBIT";

        return (
          <Card 
            key={movement.id} 
            className="group overflow-hidden border-slate-100 bg-white hover:border-slate-300 hover:shadow-md transition-all dark:bg-slate-950 dark:border-slate-800"
          >
            <CardContent className="p-3 md:p-4 flex items-center gap-4">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                isIn 
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" 
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
              )}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">
                    {typeLabels[movement.type] || movement.type}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-900">
                    {movement.reference}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                    {movement.account} / {movement.location}
                  </p>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {format(new Date(movement.entryDate), "dd MMM, HH:mm")}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={cn(
                  "text-sm font-black tracking-tight",
                  isIn ? "text-emerald-600" : "text-rose-600"
                )}>
                  {isIn ? "+" : "-"} {formatCurrency(movement.amount)}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-70">
                  {isIn ? "Deposit" : "Withdrawal"}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
}