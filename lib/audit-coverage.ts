import { prisma } from "@/lib/prisma";

export const auditCoverageChecks = [
  { area: "Sales", entityTypes: ["Sale"], actions: ["SALE_CREATE", "SALE_UPDATE", "SALE_VOID"], route: "/sales/sales-list" },
  { area: "Customers", entityTypes: ["Customer"], actions: ["CUSTOMER_CREATE", "CUSTOMER_UPDATE", "CUSTOMER_DELETE"], route: "/sales/customers" },
  { area: "Customer Payments", entityTypes: ["CustomerPayment"], actions: ["CUSTOMER_PAYMENT_CREATE"], route: "/sales/customer-payments" },
  { area: "Purchases", entityTypes: ["Purchase"], actions: ["PURCHASE_CREATE", "PURCHASE_UPDATE"], route: "/purchases/list" },
  { area: "Suppliers", entityTypes: ["Supplier"], actions: ["SUPPLIER_CREATE", "SUPPLIER_UPDATE", "SUPPLIER_DELETE"], route: "/purchases/suppliers" },
  { area: "Supplier Payments", entityTypes: ["SupplierPayment"], actions: ["SUPPLIER_PAYMENT_CREATE"], route: "/purchases/supplier-payments" },
  { area: "Stock Transfers", entityTypes: ["Transfer"], actions: ["TRANSFER_CREATE", "TRANSFER_UPDATE", "TRANSFER_SEND", "TRANSFER_RECEIVE"], route: "/inventory/transfers" },
  { area: "Inventory Items", entityTypes: ["Product"], actions: ["PRODUCT_CREATE", "PRODUCT_UPDATE", "PRODUCT_DELETE"], route: "/inventory/products" },
  { area: "Inventory Masters", entityTypes: ["Category", "Brand", "Company", "Unit"], actions: ["PRODUCT_CREATE", "PRODUCT_UPDATE", "PRODUCT_DELETE"], route: "/inventory/categories" },
  { area: "Expenses", entityTypes: ["Expense"], actions: ["EXPENSE_CREATE", "EXPENSE_UPDATE", "EXPENSE_DELETE"], route: "/finance/expenses" },
  { area: "Finance Accounts", entityTypes: ["FinanceAccount"], actions: ["ACCOUNT_CREATE", "ACCOUNT_UPDATE", "ACCOUNT_DELETE"], route: "/finance/accounts" },
  { area: "Cash Transfers", entityTypes: ["CashTransfer"], actions: ["CASH_TRANSFER_CREATE"], route: "/finance/cash-transfers" },
  { area: "Users & Roles", entityTypes: ["User", "Role"], actions: ["USER_CREATE", "USER_UPDATE", "USER_STATUS", "USER_DELETE"], route: "/admin/users" },
  { area: "Settings & Backup", entityTypes: ["CompanySettings", "DatabaseBackup"], actions: ["SETTINGS_UPDATE", "BACKUP_CREATE"], route: "/setup" },
];

export async function getAuditCoverageRows() {
  return Promise.all(
    auditCoverageChecks.map(async (check) => {
      const [entityCount, actionCount, latest] = await Promise.all([
        prisma.auditLog.count({ where: { entityType: { in: check.entityTypes } } }),
        prisma.auditLog.count({ where: { action: { in: check.actions } } }),
        prisma.auditLog.findFirst({
          where: {
            OR: [
              { entityType: { in: check.entityTypes } },
              { action: { in: check.actions } },
            ],
          },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true, action: true },
        }),
      ]);

      return {
        ...check,
        count: Math.max(entityCount, actionCount),
        latestAt: latest?.createdAt ?? null,
        latestAction: latest?.action ?? null,
        status: Math.max(entityCount, actionCount) > 0 ? "Observed" : "Needs live verification",
      };
    }),
  );
}