"use client";

import { ChevronDown, FileSpreadsheet, FileText, Share2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/shared/print-button";

function triggerDownload(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

type SaleReceiptActionsProps = {
  saleId: string;
};

export function SaleReceiptActions({ saleId }: SaleReceiptActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PrintButton
        url={`/print/sale/${saleId}`}
        variant="outline"
        className="rounded-xl border-slate-200 shadow-sm"
        label="Print Receipt"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
          >
            <Share2 className="mr-2 h-4 w-4 text-slate-500" />
            <span>Export</span>
            <ChevronDown className="ml-2 h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl p-1 shadow-xl">
          <DropdownMenuItem
            onClick={() => triggerDownload(`/api/sales/${saleId}/receipt/pdf`)}
            className="flex cursor-pointer items-center gap-3 rounded-lg py-2.5 transition-colors focus:bg-slate-100 dark:focus:bg-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/30">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                PDF Receipt
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                Direct PDF download
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => triggerDownload(`/api/sales/${saleId}/receipt/excel`)}
            className="flex cursor-pointer items-center gap-3 rounded-lg py-2.5 transition-colors focus:bg-slate-100 dark:focus:bg-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Excel Receipt
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                Direct spreadsheet download
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}