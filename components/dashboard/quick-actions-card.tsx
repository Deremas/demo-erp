import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  ReceiptText,
  ShoppingCart,
  ListPlus,
  Truck,
  UsersRound,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppPermission, AppRole } from "@/lib/rbac";
import { hasPermission } from "@/lib/rbac";

type QuickAction = {
  title: string;
  description: string;
  href: Route;
  permission: AppPermission;
  icon: typeof ShoppingCart;
};

const quickActions: QuickAction[] = [
  {
    title: "POS Sale",
    description: "Checkout items with cash, bank, or customer credit.",
    href: "/sales/pos" as Route,
    permission: "sales:create",
    icon: ShoppingCart,
  },
  {
    title: "Wholesale",
    description: "Record many sold items in one fast entry screen.",
    href: "/sales/wholesale" as Route,
    permission: "sales:create",
    icon: ListPlus,
  },
  {
    title: "Purchase Stock",
    description: "Receive supplier stock with buying and selling prices.",
    href: "/purchases/new",
    permission: "purchases:create",
    icon: Truck,
  },
  {
    title: "Import Purchase",
    description: "Receive a USD import into a warehouse or store.",
    href: "/purchases/imports" as Route,
    permission: "purchases:view",
    icon: Truck,
  },
  {
    title: "Agents",
    description: "Review agent credit limits and outstanding balances.",
    href: "/sales/agents" as Route,
    permission: "customers:view",
    icon: UsersRound,
  },
  {
    title: "Transfer Items",
    description: "Move stock between stores and shops.",
    href: "/inventory/transfers",
    permission: "inventory:transfer",
    icon: Truck,
  },
  {
    title: "Customers",
    description: "Review customer details and settle credit balances.",
    href: "/sales/customers",
    permission: "customers:create",
    icon: UsersRound,
  },
  {
    title: "Suppliers",
    description: "Review suppliers and payable balances.",
    href: "/purchases/suppliers",
    permission: "suppliers:create",
    icon: Truck,
  },
  {
    title: "Expense",
    description: "Record daily running costs.",
    href: "/finance/expenses",
    permission: "expenses:create",
    icon: ReceiptText,
  },
];

export function QuickActionsCard({ role, permissions = [] }: { role: AppRole; permissions?: readonly string[] }) {
  const visibleActions = quickActions.filter((action) => hasPermission(role, action.permission, permissions));
  
  const salesActions = visibleActions.filter(a => a.href.startsWith("/sales"));
  const purchaseActions = visibleActions.filter(a => a.href.startsWith("/purchases"));
  const inventoryActions = visibleActions.filter(a => a.href.startsWith("/inventory"));
  const financeActions = visibleActions.filter(a => a.href.startsWith("/finance"));

  const groups = [
    { name: "Sales", actions: salesActions },
    { name: "Purchasing", actions: purchaseActions },
    { name: "Inventory", actions: inventoryActions },
    { name: "Expenses", actions: financeActions },
  ].filter(g => g.actions.length > 0);

  return (
    <Card className="h-full border-none bg-transparent shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Daily Work
        </CardTitle>
        <CardDescription className="text-sm font-medium text-slate-500">
          Fast access to the simple Demo ERP workflows.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-0">
        {groups.map((group) => (
          <div key={group.name} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-blue-600" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {group.name}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.actions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[15px] font-bold tracking-tight text-card-foreground">
                          {action.title}
                        </p>
                        <p className="text-[11px] font-medium leading-relaxed text-muted-foreground line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 dark:text-blue-400">
                      <span>Start Now</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}