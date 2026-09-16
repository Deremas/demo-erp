import type { IconName } from "@/lib/icons";
import { hasPermission, type AppPermission, type AppRole } from "@/lib/rbac";

export type NavigationItem = {
  title: string;
  href: string;
  icon: IconName;
  roles?: AppRole[];
  permission?: AppPermission;
};

export type NavigationEntry =
  | ({
      type: "link";
    } & NavigationItem)
  | {
      type: "group";
      title: string;
      icon: IconName;
      roles?: AppRole[];
      permission?: AppPermission;
      items: NavigationItem[];
    };

export const navigationEntries: NavigationEntry[] = [
  {
    type: "link",
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    permission: "dashboard:view",
  },
  {
    type: "group",
    title: "Inventory",
    icon: "inventory",
    items: [
      { title: "Current Stock", href: "/inventory/stock", icon: "stockOverview", permission: "inventory:view" },
      { title: "Transfers", href: "/inventory/transfers", icon: "transfers", permission: "inventory:transfer" },
      { title: "Stock Movements", href: "/inventory/stock-movements", icon: "stockMovements", permission: "inventory:view" },
      { title: "Low Stock", href: "/inventory/low-stock", icon: "lowStock", permission: "inventory:view" },
      { title: "Out of Stock", href: "/inventory/out-of-stock", icon: "alertRecords", permission: "inventory:view" },
      { title: "Alert Records", href: "/inventory/alert-records", icon: "alertRecords", permission: "inventory:view" },
      { title: "Price Adjustment", href: "/inventory/price-adjustments", icon: "finance", permission: "inventory:adjust-prices" },
      { title: "Items", href: "/inventory/products", icon: "products", permission: "inventory:edit" },
      { title: "Categories", href: "/inventory/categories", icon: "products", permission: "inventory:edit" },
      { title: "Units", href: "/inventory/units", icon: "alertRecords", permission: "inventory:edit" },
    ],
  },
  {
    type: "group",
    title: "Sales",
    icon: "sales",
    items: [
      { title: "POS Sale", href: "/sales/pos", icon: "newSale", permission: "sales:create" },
      { title: "Wholesale", href: "/sales/wholesale", icon: "salesList", permission: "sales:create" },
      { title: "Sales List", href: "/sales/sales-list", icon: "salesList", permission: "sales:view" },
      { title: "Sold Items", href: "/sales/sold-items", icon: "products", permission: "sales:view" },
      { title: "Delivery Orders", href: "/sales/delivery-orders", icon: "transfers", permission: "sales:view" },
      { title: "Customers", href: "/sales/customers", icon: "customers", permission: "customers:view" },
      { title: "Customer Credit", href: "/sales/customer-credit", icon: "customerCredit", permission: "customers:view" },
      { title: "Payments", href: "/sales/customer-payments", icon: "customerPayments", permission: "customer-payments:create" },
    ],
  },
  {
    type: "group",
    title: "Agents",
    icon: "customers",
    items: [
      { title: "Agents", href: "/sales/agents", icon: "customers", permission: "customers:view" },
      { title: "Agent Credit", href: "/sales/agent-credit", icon: "customerCredit", permission: "customers:view" },
      { title: "Collections", href: "/sales/agent-collections", icon: "customerPayments", permission: "customer-payments:create" },
    ],
  },
  {
    type: "group",
    title: "Purchases",
    icon: "purchases",
    items: [
      { title: "New Purchase", href: "/purchases/new", icon: "newPurchase", permission: "purchases:create" },
      { title: "Purchase List", href: "/purchases/list", icon: "purchaseList", permission: "purchases:view" },
      { title: "Purchased Items", href: "/purchases/purchased-items", icon: "products", permission: "purchases:view" },
    ],
  },
  {
    type: "group",
    title: "Imports",
    icon: "upload",
    items: [
      { title: "New Import", href: "/imports/new", icon: "newPurchase", permission: "purchases:create" },
      { title: "Import List", href: "/imports", icon: "purchaseList", permission: "purchases:view" },
      { title: "USD Payables", href: "/imports/payables", icon: "supplierPayments", permission: "purchases:view" },
    ],
  },
  {
    type: "group",
    title: "Suppliers",
    icon: "suppliers",
    items: [
      { title: "Suppliers", href: "/purchases/suppliers", icon: "suppliers", permission: "suppliers:view" },
      { title: "Supplier Payments", href: "/purchases/supplier-payments", icon: "supplierPayments", permission: "supplier-payments:view" },
    ],
  },
  {
    type: "group",
    title: "Finance",
    icon: "finance",
    items: [
      { title: "Accounts", href: "/finance/accounts", icon: "finance", permission: "accounts:view" },
      { title: "Cash", href: "/finance/cash", icon: "cashTransfers", permission: "cash-transfers:view" },
      { title: "Cheques", href: "/finance/cheques", icon: "customerPayments", permission: "cheques:view" },
      { title: "Transfers", href: "/finance/cash-transfers", icon: "cashTransfers", permission: "cash-transfers:view" },
      { title: "Ledger", href: "/finance/ledger", icon: "ledger", permission: "ledger:view" },
      { title: "Expenses", href: "/finance/expenses", icon: "expenses", permission: "expenses:view" },
      { title: "Expense Categories", href: "/finance/expenses/categories", icon: "products", permission: "settings:manage" },
    ],
  },
  {
    type: "link",
    title: "Reports",
    href: "/reports",
    icon: "reports",
    permission: "reports:view",
  },
  {
    type: "group",
    title: "Setup",
    icon: "admin",
    permission: "users:view",
    items: [
      { title: "System Setup", href: "/setup", icon: "settings", permission: "settings:manage" },
      { title: "Locations", href: "/admin/locations", icon: "warehouse", permission: "settings:manage" },
      { title: "Users", href: "/admin/users", icon: "users", permission: "users:view" },
      { title: "Roles", href: "/admin/roles", icon: "roles", permission: "roles:view" },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: "auditLogs", permission: "audit:view" },
      { title: "Audit Coverage", href: "/admin/audit-coverage", icon: "auditLogs", permission: "audit:view" },
      { title: "Backups", href: "/admin/backups", icon: "backups", permission: "backups:manage" },
      { title: "Settings", href: "/admin/settings", icon: "settings", permission: "settings:manage" },
      { title: "Demo & Quotation", href: "/demo", icon: "demo", permission: "demo:view" },
    ],
  },
];

const hiddenPageTitles: NavigationItem[] = [
  { title: "AI Insights", href: "/assistant", icon: "assistant", permission: "ai:view" },
  { title: "New Import", href: "/imports/new", icon: "newPurchase" },
  { title: "Import List", href: "/imports", icon: "purchaseList" },
  { title: "USD Payables", href: "/imports/payables", icon: "supplierPayments" },
  { title: "Imports", href: "/purchases/imports", icon: "upload" },
  { title: "Agents", href: "/sales/agents", icon: "customers" },
  { title: "Agent Credit", href: "/sales/agent-credit", icon: "customerCredit" },
  { title: "Collections", href: "/sales/agent-collections", icon: "customerPayments" },
  { title: "Alert Records", href: "/inventory/alert-records", icon: "alertRecords" },
  { title: "Stock Movements", href: "/inventory/stock-movements", icon: "stockMovements" },
  { title: "Customer Payments", href: "/sales/customer-payments", icon: "customerPayments" },
  { title: "New Sale", href: "/sales/new", icon: "newSale" },
  { title: "Supplier Payments", href: "/purchases/supplier-payments", icon: "supplierPayments" },
  { title: "Cash", href: "/finance/cash", icon: "cashTransfers" },
  { title: "Cash Transfers", href: "/finance/cash-transfers", icon: "cashTransfers" },
  { title: "Audit Logs", href: "/admin/audit-logs", icon: "auditLogs", permission: "audit:view" },
  { title: "Audit Coverage", href: "/admin/audit-coverage", icon: "auditLogs", permission: "audit:view" },
  { title: "Backups", href: "/admin/backups", icon: "backups", permission: "backups:manage" },
  { title: "Setup Home", href: "/setup", icon: "dashboard", permission: "settings:manage" },
  { title: "Settings", href: "/admin/settings", icon: "settings", permission: "settings:manage" },
  { title: "Demo & Quotation", href: "/demo", icon: "demo", permission: "demo:view" },
];

function itemAllowed(
  itemRoles: AppRole[] | undefined,
  permission: AppPermission | undefined,
  role: AppRole,
  permissions?: readonly string[],
) {
  return (!itemRoles || itemRoles.includes(role)) && (!permission || hasPermission(role, permission, permissions));
}

export function getVisibleNavigation(role: AppRole, permissions?: readonly string[]) {
  return navigationEntries
    .filter((entry) => itemAllowed(entry.roles, entry.permission, role, permissions))
    .map((entry) => {
      if (entry.type === "link") {
        return entry;
      }

      return {
        ...entry,
        items: entry.items.filter((item) => itemAllowed(item.roles, item.permission, role, permissions)),
      };
    })
    .filter((entry) => (entry.type === "link" ? true : entry.items.length > 0));
}

/** True when pathname is this href, or a nested path under it. */
export function navHrefMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Longest matching href wins so `/imports` does not stay active on `/imports/new`. */
export function getBestMatchingHref(pathname: string, hrefs: readonly string[]) {
  let best: string | null = null;
  for (const href of hrefs) {
    if (!navHrefMatches(pathname, href)) continue;
    if (!best || href.length > best.length) best = href;
  }
  return best;
}

export function isNavHrefActive(pathname: string, href: string, competingHrefs: readonly string[]) {
  return getBestMatchingHref(pathname, competingHrefs) === href;
}

export function getNavigationTitle(pathname: string) {
  const items = navigationEntries.flatMap((entry) =>
    entry.type === "link" ? [entry] : entry.items,
  );
  const candidates = [...items, ...hiddenPageTitles];
  const bestHref = getBestMatchingHref(
    pathname,
    candidates.map((item) => item.href),
  );

  return candidates.find((item) => item.href === bestHref)?.title ?? "Operational System";
}

export function getOpenGroupForPath(pathname: string, role: AppRole, permissions?: readonly string[]) {
  const visibleEntries = getVisibleNavigation(role, permissions);
  const match = visibleEntries.find((entry) => {
    return (
      entry.type === "group" &&
      entry.items.some((item) => navHrefMatches(pathname, item.href)),
    );
  });

  if (match?.type === "group") {
    return match.title;
  }

  return null;
}
