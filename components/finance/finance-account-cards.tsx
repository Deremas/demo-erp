import Link from "next/link";
import { CreditCard, Landmark, Wallet, ArrowUpRight, ArrowDownLeft, Pencil, Trash2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type AccountCardData = {
  id: string;
  name: string;
  code: string;
  type: "CASH" | "BANK";
  bankName?: string;
  accountNumber?: string;
  balance: number;
  location: string;
};

export function FinanceAccountCards({ accounts }: { accounts: AccountCardData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
      {accounts.map((account) => (
        <Card 
          key={account.id} 
          className={cn(
            "group relative overflow-hidden border-none shadow-md transition-all hover:shadow-xl hover:-translate-y-1",
            account.type === "BANK" 
              ? "bg-gradient-to-br from-indigo-600 to-violet-700 text-white" 
              : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
          )}
        >
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 z-10">
            <Link
              href={`?editAccountId=${account.id}`}
              className="rounded-lg p-1.5 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Edit Account"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <Link
              href={`?deleteAccountId=${account.id}`}
              className="rounded-lg p-1.5 hover:bg-rose-500/80 text-white/80 hover:text-white transition-colors"
              title="Delete Account"
            >
              <Trash2 className="h-4 w-4" />
            </Link>
          </div>
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                {account.type === "BANK" ? (
                  <Landmark className="h-5 w-5" />
                ) : (
                  <Wallet className="h-5 w-5" />
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                  {account.code}
                </p>
                <p className="text-[9px] font-black uppercase opacity-50">
                  {account.location}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black truncate max-w-[200px]">
                {account.name}
              </h3>
              {account.type === "BANK" && (
                <p className="text-[10px] font-medium opacity-80 flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3" />
                  {account.bankName} • {account.accountNumber}
                </p>
              )}
            </div>

            <div className="mt-8 flex items-baseline justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Balance</p>
                <p className="text-2xl font-black tracking-tighter tabular-nums">
                  {formatCurrency(account.balance)}
                </p>
              </div>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-md",
                account.balance >= 0 ? "bg-white/20" : "bg-rose-500/30"
              )}>
                {account.balance >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardContent>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all" />
          <div className="absolute top-0 right-0 h-16 w-16 bg-white/5 clip-path-poly-card transition-all group-hover:scale-110" />
        </Card>
      ))}
    </div>
  );
}