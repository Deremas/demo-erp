export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import {
  MonthlySalesTrendChart,
  WeeklyRevenueChart,
  FinancialDistributionChart,
  InventoryDistributionChart,
  TopProductsCard,
  CustomerBreakdownCard,
} from "@/components/dashboard/dashboard-charts";
import { ActivityTables } from "@/components/dashboard/activity-tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { hasPermission } from "@/lib/rbac";

export default async function DashboardPage(props: {
  searchParams: Promise<{ locationId?: string; branchId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const locationId = searchParams.locationId ?? searchParams.branchId;

  const currentUser = await getCurrentUser();
  const role = currentUser?.role ?? "SALES";
  const canViewAllLocations = Boolean(
    currentUser && hasPermission(role, "location:view-all", currentUser.permissions),
  );
  
  // For admins, we allow no locationId to represent a global view
  const activeLocationId = locationId || (canViewAllLocations ? undefined : currentUser?.activeLocationId);

  const selectedLocationIds = activeLocationId ? activeLocationId.split(",") : [];
  const activeBranchName = selectedLocationIds.length === 0
    ? "All Locations"
    : selectedLocationIds.length === 1
      ? currentUser?.locations.find(l => l.id === selectedLocationIds[0])?.name
      : `Aggregated View (${selectedLocationIds.length} Locations)`;

  const dashboardSnapshot = await getDashboardSnapshot(role, activeLocationId);
  const lastUpdated = new Date().toLocaleTimeString();

  return (
    <div className="flex flex-col gap-6 bg-background">
      {/* Hero / Greeting */}
      <DashboardHero
        userName={currentUser?.name ?? "User"}
        activeBranchName={activeBranchName}
        lastUpdated={lastUpdated}
        role={role}
        locations={currentUser?.locations ?? []}
      />

      {/* Row 1: Primary KPI Cards — 3 equal columns */}
      <MetricGrid metrics={dashboardSnapshot.metrics.slice(0, 3)} columns={3} />

      {/* Row 2: Featured Metric (Full Width) for large amounts */}
      <div className="w-full">
        <MetricGrid metrics={[dashboardSnapshot.metrics[3]!]} columns={1} />
      </div>

      {/* Row 3: Operational Context — 3 equal columns */}
      <MetricGrid
        metrics={dashboardSnapshot.summary.slice(0, 3)}
        columns={3}
      />

      {/* Row 4: Critical Financials & Alerts — 3 equal columns */}
      <MetricGrid
        metrics={[
          dashboardSnapshot.alerts[0]!, // System Alerts
          dashboardSnapshot.summary[3]!, // Receivables
          dashboardSnapshot.summary[4]!, // Payables
        ]}
        columns={3}
      />

      {/* Row 5: USD Exposure Summary */}
      {canViewAllLocations && (
        <div className="grid grid-cols-1 gap-6">
          {/* USD Liability Exposure */}
          <a href="/purchases/supplier-payments" className="block group">
            <Card className="relative overflow-hidden border border-slate-800 bg-slate-900 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500/60 cursor-pointer">
              <div className="absolute top-0 left-0 h-[3px] w-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">USD Liability Exposure</p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/60 border border-blue-500/30 rounded px-1.5 py-0.5">Foreign Currency</span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-black tracking-tighter tabular-nums">
                    {dashboardSnapshot.usdExposure?.totalPayable.toLocaleString() ?? "0"}
                  </span>
                  <span className="text-xs font-black text-blue-400">USD</span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Total outstanding payables in foreign currency</p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">View Supplier Payments</span>
                  <svg className="h-3 w-3 text-blue-400 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>
      )}


      {/* Row 6: Operational Alerts — 2 equal columns */}
      <MetricGrid
        metrics={[
          dashboardSnapshot.alerts[1]!, // Critical Stock
          dashboardSnapshot.alerts[2]!, // Pending Transfers
        ]}
        columns={2}
      />

      {/* Row 4: Monthly Sales Trend — Full width */}
      <MonthlySalesTrendChart
        data={dashboardSnapshot.monthlySalesTrend}
        lastUpdated={lastUpdated}
      />

      {/* Row 5: Analytics Grid
          Band A: [Weekly Revenue (4)] [Financial Distribution (4)] [Top Selling Products (4)]
          Band B: [Inventory Distribution (8)]            [Customer Breakdown (4)]
      */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        {/* Band A — top row of 3 equal cards */}
        <div className="xl:col-span-4">
          <WeeklyRevenueChart data={dashboardSnapshot.salesTrend} />
        </div>
        <div className="xl:col-span-4">
          <FinancialDistributionChart data={dashboardSnapshot.charts.paymentMethods} />
        </div>
        <div className="xl:col-span-4">
          <TopProductsCard products={dashboardSnapshot.topProducts} />
        </div>

        {/* Band B — bottom row: wide chart + narrow breakdown */}
        <div className="xl:col-span-8">
          <InventoryDistributionChart data={dashboardSnapshot.charts.locationStock} />
        </div>
        <div className="xl:col-span-4">
          <CustomerBreakdownCard data={dashboardSnapshot.charts.customerDist} />
        </div>
      </div>

      {/* Row 6: Activity Tables */}
      <ActivityTables
        recentTransactions={dashboardSnapshot.recentTransactions}
        lowStock={dashboardSnapshot.lowStock}
      />

      {hasPermission(role, "demo:view", currentUser?.permissions) ? (
        <Card>
          <CardHeader>
            <CardTitle>Client demo path</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 text-sm">
            <a className="rounded-full border px-3 py-1 hover:border-sky-400" href="/purchases/imports">1. Receive import</a>
            <a className="rounded-full border px-3 py-1 hover:border-sky-400" href="/inventory/transfers">2. Transfer to shop</a>
            <a className="rounded-full border px-3 py-1 hover:border-sky-400" href="/sales/pos">3. Cash/credit sale</a>
            <a className="rounded-full border px-3 py-1 hover:border-sky-400" href="/sales/agents">4. Agent balances</a>
            <a className="rounded-full border px-3 py-1 hover:border-sky-400" href="/finance/ledger">5. Accounting ledger</a>
            <a className="rounded-full border px-3 py-1 hover:border-sky-400" href="/reports">6. Reports</a>
            <a className="rounded-full border px-3 py-1 hover:border-sky-400" href="/admin/audit-logs">7. Audit</a>
            <a className="rounded-full border px-3 py-1 hover:border-sky-400" href="/admin/backups">8. Backup</a>
            <a className="rounded-full border px-3 py-1 hover:border-sky-400" href="/assistant">9. AI</a>
            <a className="rounded-full border px-3 py-