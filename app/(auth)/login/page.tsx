export const dynamic = "force-dynamic";

import Image from "next/image";
import { ShoppingCart, Truck, UsersRound, Package, ShoppingBag, BarChart2 } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { sanitizeReturnToPath } from "@/lib/auth/return-to";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type LoginPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = sanitizeReturnToPath(getSingleSearchParam(params, "next"));

  return (
    <div className="h-full overflow-hidden bg-[linear-gradient(135deg,rgba(247,250,252,0.98),rgba(225,242,250,0.96)_42%,rgba(14,116,144,0.95))] lg:grid lg:grid-cols-[1fr_1fr] lg:rounded-[2rem]">
      <div className="hidden lg:block">
        <Card className="h-full overflow-hidden border-0 bg-transparent text-slate-950 shadow-none">
          <CardContent className="flex h-full flex-col justify-between gap-5 p-6 xl:gap-6 xl:p-7">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sky-100">
                  <Image
                    src="/rungo-logo.png"
                    alt="Demo ERP"
                    width={58}
                    height={58}
                    className="h-14 w-14 object-contain"
                    priority
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-800">
                    Demo ERP
                  </p>
                  <p className="text-sm text-slate-600">Operational System</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "POS", icon: ShoppingCart },
                { label: "Inventory", icon: Package },
                { label: "Purchases", icon: ShoppingBag },
                { label: "Transfers", icon: Truck },
                { label: "Credit", icon: UsersRound },
                { label: "Reports", icon: BarChart2 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
                    <Icon className="h-5 w-5 text-sky-700" />
                    <p className="mt-3 text-sm font-semibold">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex h-full items-center px-4 py-4 sm:px-6 sm:py-6 lg:min-h-0 lg:bg-white/6 lg:px-4 lg:py-4 xl:px-5 xl:py-5">
        <Card className="w-full border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.98))] text-slate-950 shadow-[0_26px_70px_rgba(15,23,42,0.24)] lg:border-white/55">
          <CardContent className="p-5 sm:p-8 lg:p-6 xl:p-7">
            <div className="mx-auto max-w-md space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 lg:hidden">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-sky-100">
                    <Image
                      src="/rungo-logo.png"
                      alt="Demo ERP"
                      width={44}
                      height={44}
                      className="h-10 w-10 object-contain"
                      priority
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Demo ERP</p>
                    <p className="text-xs text-slate-600">Operational System</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm leading-6 text-slate-700 lg:hidden">
                    Manage POS sales, stock, transfers, and customer credit.
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/90">
                    Sign In
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-[2.2rem]">
                    Welcome back
                  </h2>
                  <p className="text-sm text-slate-600">
                    Sign in to continue to your dashboard.
                  </p>
                </div>
              </div>
              <LoginForm redirectTo={redirectTo} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}