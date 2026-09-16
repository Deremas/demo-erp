export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Receipt, 
  Tag, 
  MapPin,
  Wallet,
  CheckCircle2,
  FileText
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, toTitleCase } from "@/lib/utils";

export default async function ExpenseDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const expense = await prisma.expense.findUnique({
    where: { id: params.id },
    include: {
      location: true,
      expenseCategory: true,
      createdBy: true,
      financeAccount: true,
    },
  });

  if (!expense) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      {/* Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="h-9 rounded-xl">
            <Link href="/finance/expenses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Expenses
            </Link>
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <h1 className="text-xl font-black tracking-tight uppercase">Expense Record</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-slate-200 shadow-sm">
            <Receipt className="mr-2 h-4 w-4" />
            Print Voucher
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            Edit Record
          </Button>
        </div>
      </div>

      {/* Main Detail Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Primary Info Card */}
        <Card className="lg:col-span-2 border-none bg-slate-50/50 shadow-none dark:bg-slate-900/40">
          <CardContent className="p-8 space-y-10">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Expense Reference</p>
                <h2 className="text-3xl font-black tracking-tighter uppercase">{expense.expenseNumber}</h2>
              </div>
              <Badge variant="success" className="rounded-lg px-3 py-1 font-bold">POSTED</Badge>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</p>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <p className="font-bold text-lg">{expense.expenseCategory.name}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</p>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <p className="font-bold">{expense.name}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  <p className="font-bold">{expense.location.name}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recorded By</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <p className="font-bold">{expense.createdBy.name}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Note</p>
              <p className="text-slate-600 italic">
                {expense.note || "No additional notes provided for this expense record."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Info Card */}
        <div className="space-y-6">
          <Card className="border-none bg-slate-900 text-white shadow-xl shadow-slate-200/50 dark:shadow-none">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount Paid</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-slate-500 text-lg font-bold">ETB</span>
                  <span className="text-4xl font-black tracking-tighter">{formatCurrency(Number(expense.amount)).replace("ETB ", "")}</span>
                </div>
              </div>

              <div className="h-px bg-slate-800" />

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Account</span>
                  <div className="flex items-center gap-2 font-bold">
                    <Wallet className="h-3.5 w-3.5 text-slate-500" />
                    <span>{expense.financeAccount.name}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Date</span>
                  <div className="flex items-center gap-2 font-bold">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>{format(new Date(expense.expenseDate), "dd MMM yyyy")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm dark:border-slate-800/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Payment Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase">
                <span className="text-slate-400">Account Type</span>
                <span>{toTitleCase(expense.financeAccount.type)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase">
                <span className="text-slate-400">Bank</span>
                <span>{expense.financeAccount.bankName || "Cash Account"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}