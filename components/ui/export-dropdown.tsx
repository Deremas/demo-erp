"use client";

import * as React from "react";
import { ChevronDown, FileSpreadsheet, FileText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportDropdownProps {
  reportName: string;
  onExport: (format: "pdf" | "excel") => void;
  isLoading?: boolean;
}

export function ExportDropdown({
  reportName,
  onExport,
  isLoading,
}: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Export ${reportName}`}
          className="rounded-xl border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
          disabled={isLoading}
        >
          <Share2 className="mr-2 h-4 w-4 text-slate-500" />
          <span>Export</span>
          <ChevronDown className="ml-2 h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl">
        <DropdownMenuItem
          onClick={() => onExport("pdf")}
          className="flex cursor-pointer items-center gap-3 rounded-lg py-2.5 transition-colors focus:bg-slate-100 dark:focus:bg-slate-800"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/30">
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Export as PDF
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
              Document format
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onExport("excel")}
          className="flex cursor-pointer items-center gap-3 rounded-lg py-2.5 transition-colors focus:bg-slate-100 dark:focus:bg-slate-800"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Export as Excel
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
              Data spreadsheet
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}