import {
  BarChart3,
  ClipboardList,
  CreditCard,
  Database,
  FileSearch,
  History,
  Landmark,
  Layers,
  Package,
  PieChart,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { getTablePageConfig } from "@/lib/page-data";

export type ReportCategory = "Sales" | "Inventory" | "Procurement" | "Finance" | "Administrative";

export type ReportFilterKind = "location" | "dateFrom" | "dateTo" | "search" | "status" | "paymentMethod" | "paymentStatus" | "product" | "category" | "customer" | "supplier" | "user" | "movementType" | "accountType" | "financeAccount" | "sortBy" | "lowStockOnly" | "comparisonRanges";

export type ReportDefinition = {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  icon: LucideIcon;
  filters: ReportFilterKind[];
  tableKey?: Parameters<typeof getTablePageConfig>[0];
  highlight?: boolean;
};

export const reportDefinitions: ReportDefinition[] = [
  { id: "sales-history", title: "Sales List", description: "Completed, draft, and voided sales with payment and customer filters.", category: "Sales", icon: ShoppingCart, filters: ["location", "dateFrom", "dateTo", "customer", "user", "status", "paymentMethod", "paymentStatus", "search"], tableKey: "salesList", highlight: true },
  { id: "sold-items", title: "Sold Items", description: "Item-level sales breakdown with base quantities and unit prices.", category: "Sales", icon: ClipboardList, filters: ["location", "dateFrom", "dateTo", "product", "category", "customer", "user", "paymentMethod", "paymentStatus", "search"], tableKey: "salesSoldItems" },
  { id: "sales-profitability", title: "Sales Profitability", description: "Sales value, estimated cost, gross profit, and margin without batch allocation.", category: "Sales", icon: PieChart, filters: ["location", "dateFrom", "dateTo", "product", "category", "customer", "user", "paymentMethod", "search"], tableKey: "reportsSales", highlight: true },
  { id: "customer-credit-aging", title: "Customer Credit & Aging", description: "Customer receivables, outstanding balances, and aging visibility.", category: "Sales", icon: Wallet, filters: ["location", "dateFrom", "dateTo", "customer", "paymentStatus", "search"], tableKey: "salesCustomerCredit" },
  { id: "agent-credit-aging", title: "Agent Credit & Aging", description: "Agent outstanding balances, credit limits, and aging visibility.", category: "Sales", icon: Wallet, filters: ["location", "dateFrom", "dateTo", "customer", "paymentStatus", "search"], tableKey: "salesAgentCredit", highlight: true },
  { id: "product-ranking", title: "Product Ranking", description: "Rank products by quantity sold, revenue, or estimated profit.", category: "Sales", icon: BarChart3, filters: ["location", "dateFrom", "dateTo", "product", "category", "sortBy", "search"] },
  { id: "payment-method-breakdown", title: "Payment Method Breakdown", description: "Sales totals grouped by cash, bank, and credit payment methods.", category: "Sales", icon: CreditCard, filters: ["location", "dateFrom", "dateTo", "paymentMethod", "paymentStatus"] },
  { id: "periodic-comparison", title: "Periodic Comparison", description: "Compare two or three custom date ranges, with optional quick month selection for each range.", category: "Sales", icon: BarChart3, filters: ["location", "category", "product", "comparisonRanges"], highlight: true },
  {
    id: "discounted-items",
    title: "Discounted Items",
    description: "Detailed list of sold items where discounts were applied.",
    category: "Sales",
    icon: Receipt,
    filters: ["location", "dateFrom", "dateTo", "product", "category", "customer", "search"],
    tableKey: "discountedItemsReport",
    highlight: true,
  },
  { id: "stock-valuation", title: "Stock Valuation", description: "Current stock value by product and location from StockMovement totals.", category: "Inventory", icon: Layers, filters: ["location", "product", "category", "lowStockOnly", "search"], tableKey: "reportsInventory", highlight: true },
  { id: "items-list", title: "Items List", description: "Item code and item name export with base-unit inventory context.", category: "Inventory", icon: Package, filters: ["location", "category", "search"], highlight: true },
  { id: "stock-run-in", title: "Stock Run-In Report", description: "Calculates how long current stock can last based on average monthly sales.", category: "Inventory", icon: History, filters: ["location", "dateFrom", "dateTo", "product", "category", "search"], highlight: true },
  { id: "inventory-by-quantity", title: "Inventory by Quantity", description: "Simple stock quantity report without prices or valuation columns.", category: "Inventory", icon: Layers, filters: ["location", "product", "category", "search"], highlight: true },
  { id: "stock-movement-log", title: "Stock Movement Log", description: "All stock entries and exits with transaction unit context.", category: "Inventory", icon: History, filters: ["location", "product", "category", "movementType", "dateFrom", "dateTo", "search"], tableKey: "inventoryStockMovements" },
  { id: "digital-bin-card", title: "Digital Bin Card", description: "Sequential stock ledger with running balance per item and location.", category: "Inventory", icon: Layers, filters: ["location", "product", "category", "movementType", "dateFrom", "dateTo", "search"], tableKey: "inventoryDigitalBinCard", highlight: true },
  { id: "location-transfers", title: "Location Transfers", description: "Stock movement between stores and shops.", category: "Inventory", icon: Truck, filters: ["location", "product", "category", "status", "dateFrom", "dateTo", "search"], tableKey: "inventoryTransfers" },
  { id: "stock-replenishment", title: "Stock Replenishment", description: "Items below alert level with suggested reorder quantities.", category: "Inventory", icon: Package, filters: ["location", "product", "category", "search"], tableKey: "inventoryLowStock" },
  { id: "expiry-alert", title: "Expiry Alert", description: "Batches that have expired or are expiring within 90 days.", category: "Inventory", icon: ShieldCheck, filters: ["location", "product", "category", "search"], tableKey: "inventoryExpiryAlert", highlight: true },
  { id: "procurement-history", title: "Purchase List", description: "Supplier purchase history and item-level procurement visibility.", category: "Procurement", icon: Receipt, filters: ["location", "dateFrom", "dateTo", "supplier", "product", "category", "status", "paymentStatus", "search"], tableKey: "reportsPurchases" },
  { id: "import-purchases", title: "Import Purchases", description: "USD-tracked import invoices, warehouse receiving, and outstanding supplier balances.", category: "Procurement", icon: Truck, filters: ["location", "dateFrom", "dateTo", "supplier", "product", "category", "status", "paymentStatus", "search"], tableKey: "purchasesImports", highlight: true },
  { id: "purchased-items", title: "Purchased Items", description: "Item-level procurement breakdown with supplier and cost details.", category: "Procurement", icon: ClipboardList, filters: ["location", "dateFrom", "dateTo", "product", "category", "supplier", "search"], tableKey: "purchasesPurchasedItems" },
  { id: "supplier-payables", title: "Supplier Payables", description: "Outstanding supplier debt and last purchase visibility.", category: "Procurement", icon: Users, filters: ["location", "dateFrom", "dateTo", "supplier", "paymentStatus", "search"], tableKey: "purchasesSuppliers" },
  { id: "expense-analysis", title: "Expense Analysis", description: "Expenses by category, location, account, and recorded user.", category: "Finance", icon: FileSearch, filters: ["location", "dateFrom", "dateTo", "category", "financeAccount", "user", "status", "search"], tableKey: "financeExpenses", highlight: true },
  { id: "cash-flow", title: "Cash Flow", description: "Inflows and outflows from sales, payments, purchases, expenses, and account movements.", category: "Finance", icon: Landmark, filters: ["location", "dateFrom", "dateTo", "financeAccount", "search"], highlight: true },
  { id: "account-ledger", title: "Account Ledger", description: "Chronological finance ledger with debit, credit, and references.", category: "Finance", icon: Database, filters: ["location", "dateFrom", "dateTo", "financeAccount", "status", "search"], tableKey: "financeLedger" },
  { id: "cash-bank-account-report", title: "Cash/Bank Account Report", description: "Liquidity by cash and bank account.", category: "Finance", icon: Landmark, filters: ["location", "accountType", "financeAccount", "dateFrom", "dateTo"], tableKey: "financeAccounts" },
  { id: "audit-security-logs", title: "Audit & Security Logs", description: "System activity, data changes, and security-relevant events.", category: "Administrative", icon: ShieldCheck, filters: ["location", "user", "status", "dateFrom", "dateTo", "search"], tableKey: "adminAuditLogs" },
];

export function getReportDefinition(reportId: string) {
  return reportDefinitions.find((report) => report.id === reportId) ?? null;
}