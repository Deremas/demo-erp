"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { BarChart2, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { TrendPoint, TopDashboardProduct } from "@/lib/types";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#6366F1", "#EC4899", "#8B5CF6"];
const chartLabelStyle = { fill: "#94a3b8", fontSize: 11, fontWeight: 600, letterSpacing: "0.025em" };
const tooltipStyle = {
  borderRadius: "16px",
  border: "none",
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  fontSize: "12px",
  fontWeight: "700",
  backgroundColor: "#ffffff",
};

// ─── Monthly Sales Trend (Full Row) ─────────────────────────────────────────
export function MonthlySalesTrendChart({ data, lastUpdated }: { data: TrendPoint[]; lastUpdated: string }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  const currentYear = new Date().getFullYear();

  if (!isMounted) {
    return <Card className="h-[400px] w-full rounded-[2rem] bg-slate-50/50 animate-pulse" />;
  }


  return (
    <Card className="group relative border border-slate-200/60 shadow-[0_15px_45px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] xl:rounded-[2.5rem] overflow-hidden bg-white transition-all duration-500 hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)]">
      <CardHeader className="bg-white py-6 px-6 sm:py-8 sm:px-10 border-b border-slate-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Performance Analytics</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Monthly Sales Trend
            </CardTitle>
            <p className="hidden sm:block text-[13px] font-medium text-slate-400">
              {currentYear} Financial trajectory and market insights
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-slate-100">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sync</p>
              <p className="text-[12px] font-black text-slate-700">{lastUpdated}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-10 pt-8 sm:pt-12">
        <div className="h-[300px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" strokeWidth={1} />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={chartLabelStyle} 
                dy={15} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={chartLabelStyle} 
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
                width={40} 
              />
              <Tooltip
                contentStyle={{ ...tooltipStyle, padding: "10px 14px" }}
                itemStyle={{ color: "#3B82F6" }}
                formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
                labelStyle={{ color: "#94a3b8", marginBottom: "4px", fontWeight: 800, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#monthlyGradient)" 
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4, stroke: "#fff" }} 
                activeDot={{ r: 6, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Weekly Revenue Chart ─────────────────────────────────────────────────────
export function WeeklyRevenueChart({ data }: { data: TrendPoint[] }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return <div className="h-[280px] w-full bg-slate-50/50 rounded-2xl animate-pulse" />;

  return (
    <Card className="border border-slate-200/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white h-full transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">
      <CardHeader className="bg-white py-5 px-6 sm:px-8 border-b border-slate-50">
        <CardTitle className="text-[15px] font-bold text-slate-900 tracking-tight">Weekly Revenue</CardTitle>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <div className="h-[240px] sm:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="weeklyColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={chartLabelStyle} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={chartLabelStyle} tickFormatter={(v) => {
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                return String(v);
              }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [formatCurrency(Number(v)), "Revenue"]} />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#weeklyColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Financial Distribution Chart ────────────────────────────────────────────
export function FinancialDistributionChart({ data }: { data: TrendPoint[] }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return <div className="h-[240px] w-full bg-slate-50/50 rounded-2xl animate-pulse" />;

  return (
    <Card className="border border-slate-200/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white h-full transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">
      <CardHeader className="bg-white py-5 px-6 sm:px-8 border-b border-slate-50">
        <CardTitle className="text-[15px] font-bold text-slate-900 tracking-tight">Finance Split</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="h-[200px] sm:h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" nameKey="label">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] as string} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4 sm:gap-6">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] as string }} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Top Selling Products ─────────────────────────────────────────────────────
export function TopProductsCard({ products }: { products: TopDashboardProduct[] }) {
  const maxRevenue = Math.max(...products.map(p => p.totalRevenue), 1);

  return (
    <Card className="border border-slate-200/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white h-full transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">
      <CardHeader className="bg-white py-5 px-6 sm:px-8 border-b border-slate-50">
        <CardTitle className="text-[15px] font-bold text-slate-900 tracking-tight">Top Products</CardTitle>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 space-y-6">
        {products.length === 0 ? (
          <p className="text-center py-8 text-[13px] font-medium text-slate-400">No sales data yet</p>
        ) : (
          products.map((product, i) => {
            const pct = Math.round((product.totalRevenue / maxRevenue) * 100);
            const color = COLORS[i % COLORS.length]!;
            return (
              <div key={product.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: color }}>
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-bold text-slate-800 truncate tracking-tight">{product.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-black text-slate-900 tracking-tight">{formatCurrency(product.totalRevenue)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.quantity} U</p>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// ─── Inventory Distribution by Location ──────────────────────────────────────
export function InventoryDistributionChart({ data }: { data: TrendPoint[] }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return <div className="h-[380px] w-full bg-slate-50/50 rounded-2xl animate-pulse" />;

  return (
    <Card className="border border-slate-200/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white h-full transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">
      <CardHeader className="bg-white py-5 px-6 sm:px-8 border-b border-slate-50">
        <CardTitle className="text-[15px] font-bold text-slate-900 tracking-tight">Stock by Location</CardTitle>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <div className="h-[300px] sm:h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 60, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={chartLabelStyle} width={100} />
              <Tooltip
                cursor={{ fill: "#f1f5f9", radius: 8 }}
                contentStyle={tooltipStyle}
                formatter={(v: any) => [formatCurrency(Number(v)), "Stock Value"]}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={28}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] as string} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(val: any) => `${(Number(val) / 1000).toFixed(0)}k`}
                  style={{ fill: "#0f172a", fontSize: 11, fontWeight: 800 }}
                  offset={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Customer Breakdown Card ──────────────────────────────────────────────────
export function CustomerBreakdownCard({ data }: { data: TrendPoint[] }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return <div className="h-[240px] w-full bg-slate-50/50 rounded-2xl animate-pulse" />;

  return (
    <Card className="border border-slate-200/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white h-full transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">
      <CardHeader className="bg-white py-5 px-6 sm:px-8 border-b border-slate-50">
        <CardTitle className="text-[15px] font-bold text-slate-900 tracking-tight">Customers</CardTitle>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 flex flex-col items-center">
        <div className="h-[200px] sm:h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" nameKey="label">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] as string} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ ...tooltipStyle, borderRadius: "20px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 w-full space-y-3 border-t border-slate-50 pt-6">
          {data.map((dist, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] as string }} />
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{dist.label}</span>
              </div>
              <span className="text-[14px] font-black text-slate-900 tracking-tight">{dist.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Legacy composite export (kept for compatibility) ─────────────────────────
export function DashboardCharts({ salesTrend, paymentMethods, branchStock, customerDist = [], mode }: {
  salesTrend: TrendPoint[];
  paymentMethods: TrendPoint[];
  branchStock: TrendPoint[];
  customerDist?: TrendPoint[];
  mode?: "default" | "compact";
}) {
  if (mode === "compact") {
    return (
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={customerDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" nameKey="label">
              {customerDist.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] as string} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ ...tooltipStyle, borderRadius: "16px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return null;
}