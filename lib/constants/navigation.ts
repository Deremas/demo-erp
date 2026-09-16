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
      {
        title: "Items",
        href: "/inventory/products",
        icon: "products",
        permission: "inventory:edit",
      },
      {
        title: "Current Stock",
        href: "/inventory/stock",
        icon: "stockOverview",
        permission: "inventory:view",
      },
      {
        title: "Transfers",
        href: "/inventory/transfers",
        icon: "transfers",
        permission: "inventory:transfer",
      },
      {
        title: "Price Adjustment",
        href: "/inventory/price-adjustments",
        icon: "finance",
        permission: "inventory:adjust-prices",
      },
      {
        title: "Low Stock",
        href: "/inventory/low-stock",
        icon: "lowStock",
        permission: "inventory:view",
      },
      {
        title: "Categories",
        href: "/inventory/categories",
        icon: "products",
        permission: "inventory:edit",
      },
      {
        title: "Brands",
        href: "/inventory/brands",
        icon: "suppliers",
        permission: "inventory:edit",
      },
      {
        title: "Brand Owners",
        href: "/inventory/companies",
        icon: "suppliers",
        permission: "inventory:edit",
      },
      {
        title: "Units",
        href: "/inventory/units",
        icon: "alertRecords",
        permission: "inventory:edit",
      },
    ],
  },
  {
    type: "group",
    title: "Sales",
    icon: "sales",
    items: [
      {
        title: "POS Sale",
        href: "/sales/pos",
        icon: "newSale",
        permission: "sales:create",
      },
      {
        title: "Wholesale",
        href: "/sales/wholesale",
        icon: "salesList",
        permission: "sales:create",
      },
      {
        title: "Sales List",
        href: "/sales/sales-list",
        icon: "salesList",
        permission: "sales:view",
      },
      {
        title: "Sold Items",
        href: "/sales/sold-items",
        icon: "products",
        permission: "sales:view",
      },
      {
        title: "Delivery Orders",
        href: "/sales/delivery-orders",
        icon: "transfers",
        permission: "sales:view",
      },
      {
        title: "Customers",
        href: "/sales/customers",
        icon: "customers",
        permission: "customers:view",
      },
      {
        title: "Agents",
        href: "/sales/agents",
        icon: "customers",
        permission: "customers:view",
      },
      {
        title: "Customer Credit",
        href: "/sales/customer-credit",
        icon: "customerCredit",
        permission: "customers:view",
      },
      {
        title: "Payments",
        href: "/sales/customer-payments",
        icon: "customerPayments",
        permission: "customer-payments:create",
      },
    ],
  },
  {
    type: "group",
    title: "Purchases",
    icon: "purchases",
    items: [
      {
        title: "New Purchase",
        href: "/purchases/new",
        icon: "newPurchase",
        permission: "purchases:create",
      },
      {
        title: "Imports",
        href: "/purchases/imports",
        icon: "upload",
        permission: "purchases:view",
      },
      {
        title: "Purchase List",
        href: "/purchases/list",
        icon: "purchaseList",
        permission: "purchases:view",
      },
      {
        title: "Purchased Items",
        href: "/purchases/purchased-items",
        icon: "products",
        permission: "purchases:view",
      },
      {
        title: "Suppliers",
        href: "/purchases/suppliers",
        icon: "suppliers",
        permission: "suppliers:view",
      },
      {
        title: "Supplier Payments",
        href: "/purchases/supplier-payments",
        icon: "supplierPayments",
        permission: "supplier-payments:view",
      },
    ],
  },
  {
    type: "group",
    title: "Finance",
    icon: "finance",
    items: [
      {
        title: "Finance Accounts",
        href: "/finance/accounts",
        icon: "finance",
        permission: "accounts:view",
      },
      {
        title: "Cheques",
        href: "/finance/cheques",
        icon: "customerPayments",
        permission: "cheques:view",
      },
      {
        title: "Expense List",
        href: "/finance/expenses",
        icon: "expenses",
        permission: "expenses:view",
      },
      {
        title: "Expense Categories",
        href: "/finance/expenses/categories",
        icon: "products",
        permission: "settings:manage",
      },
      {
        title: "Cash Transfers",
        href: "/finance/cash-transfers",
        icon: "cashTransfers",
        permission: "cash-transfers:view",
      },
      {
        title: "Ledger",
        href: "/finance/ledger",
        icon: "ledger",
        permission: "ledger:view",
      },
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
    type: "link",
    title: "AI Insights",
    href: "/assistant",
    icon: "assistant",
    permission: "ai:view",
  },
  {
    type: "link",
    title: "Demo & Quotation",
    href: "/demo",
    icon: "demo",
    permission: "demo:view",
  },
  {
    type: "group",
    title: "Setup",
    icon: "admin",
    permission: "users:view",
    items: [
      {
        title: "Locations",
        href: "/admin/locations",
        icon: "branches",
        permission: "settings:manage",
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: "users",
        permission: "users:view",
      },
      {
        title: "Roles",
        href: "/admin/roles",
        icon: "roles",
        permission: "roles:view",
      },
      {
        title: "Backups",
        href: "/admin/backups",
        icon: "backups",
        permission: "backups:manage",
      },
      {
        title: "Audit Logs",
        href: "/admin/audit-logs",
        icon: "auditLogs",
        permission: "audit:view",
      },
      {
        title: "Audit Coverage",
        href: "/admin/audit-coverage",
        icon: "auditLogs",
        permission: "audit:view",
      },
      {
        title: "Settings",
        href: "/admin/settings",
        icon: "settings",
        permission: "settings:manage",
      },
    ],
  },
];

const hiddenPageTitles: NavigationItem[] = [
  { title: "Agents", href: "/sales/agents", icon: "customers" },
  { title: "Imports", href: "/purchases/imports", icon: "upload" },
  { title: "AI Insights", href: "/assistant", icon: "assistant", permission: "ai:view" },
  { title: "Demo & Quotation", href: "/demo", icon: "demo", permission: "demo:view" },
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
];

const hiddenGroupPrefixes: ReadonlyArray<{ groupTitle: string; href: string }> = [];

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

export function getNavigationTitle(pathname: string) {
  const items = navigationEntries.flatMap((entry) =>
    entry.type === "link" ? [entry] : entry.items,
  );
  const candidates = [...items, ...hiddenPageTitles]
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((left, right) => right.href.length - left.href.length);

  return candidates[0]?.title ?? "Operational System";
}

export function getOpenGroupForPath(pathname: string, role: AppRole, permissions?: readonly string[]) {
  const visibleEntries = getVisibleNavigation(role, permissions);
  const match = visibleEntries.find((entry) => {
    return (
      entry.type === "group" &&
      entry.items.some(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
      )
    );
  });

  if (match?.type === "group") {
    return match.title;
  }

  const hiddenMatch = hiddenGroupPrefixes.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return hiddenMatch?.groupTitle ?? null;
}