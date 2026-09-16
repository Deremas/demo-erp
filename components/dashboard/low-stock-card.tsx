import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SimpleRow } from "@/lib/table";

export function LowStockCard({ rows }: { rows: SimpleRow[] }) {
  const previewRows = rows.slice(0, 5);
  const remainingCount = Math.max(rows.length - previewRows.length, 0);

  return (
    <Card className="border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-black tracking-tight text-slate-900">
          Low Stock Items
        </CardTitle>
        <CardDescription className="text-xs font-medium text-slate-500">
          Items currently below their location alert threshold.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm font-medium text-slate-400 py-4 text-center">
            No low stock items right now.
          </p>
        ) : (
          <div className="space-y-3">
            {previewRows.map((row) => (
              <div
                key={row.id}
                className="group relative min-w-0 rounded-2xl border border-slate-200/60 bg-white p-4 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/10 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-slate-900 dark:text-slate-100">
                      {String(row.name)}
                    </p>
                    <p className="truncate text-[11px] font-medium text-slate-500">
                      {String(row.location ?? row.branch)}
                    </p>
                  </div>
                  <p className="shrink-0 whitespace-nowrap text-xs font-black text-rose-600">
                    {String(row.currentStock)} PCS
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-50 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <p className="truncate">{String(row.status)}</p>
                  <p className="shrink-0 whitespace-nowrap">
                    THRESHOLD: {String(row.minimumStockAlert)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {remainingCount > 0 ? (
          <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            +{remainingCount} more low stock items
          </p>
        ) : null}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button asChild size="sm" variant="outline" className="h-8 rounded-lg border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 sm:flex-1">
            <Link href="/inventory/low-stock">See All Low Stock</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-8 rounded-lg border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 sm:flex-1">
            <Link href="/inventory/out-of-stock">Out of Stock</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}