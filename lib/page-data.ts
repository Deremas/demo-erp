import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import {
  getAlertRecordRows,
  getLowStockRows,
  getOutOfStockRows,
  getProductRows,
  getStockMovementRows,
  getStockOverviewMetrics,
  getStockOverviewRows,
  getTransferRows,
  getExpiryAlertRows,
  getDigitalBinCardRows,
} from "@/lib/page-data-inventory";
import {
  getCustomerCreditRows,
  getCustomerPaymentRows,
  getCustomerRows,
  getSalesProfitRows,
  getSalesRows,
  getSoldItemRows,
  getDiscountedItemRows,
  getDeliveryOrderRows,
} from "@/lib/page-data-sales";
import {
  getLocationRows,
  getCashAccountRows,
  getExpenseCategorySummaryRows,
  getExpenseRows,
  getExpenseKpis,
  getFinanceAccountRows,
  getLedgerRows,
  getPurchaseRows,
  getRoleRows,
  getSupplierPaymentRows,
  getSupplierRows,
  getUserRows,
  getAuditLogRows,
  getCashTransferRows,
  getExpenseCategoryRows,
  getPurchasedItemRows,
  getChequeRows,
} from "@/lib/page-data-purchases-finance-admin";
import { hasPermission } from "@/lib/rbac";
import type { TableFilterField, TableFilterOption, TablePageConfig } from "@/lib/table";
import type { RouteSearchParams } from "@/lib/query-params";
import { getSingleSearchParam } from "@/lib/query-params";
import { prisma } from "@/lib/prisma";
import { formatCustomerName } from "@/lib/utils";

type TablePageFilters = {
  customerId?: string;
  supplierId?: string;
  locationId?: string;
  productId?: string;
  categoryId?: string;
  userId?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  accountType?: string;
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  snapshotDate?: string;
  lowStockOnly?: string;
};

const filterKeys = [
  "customerId",
  "supplierId",
  "locationId",
  "productId",
  "categoryId",
  "userId",
  "status",
  "paymentStatus",
  "paymentMethod",
  "accountType",
  "type",
  "search",
  "dateFrom",
  "dateTo",
  "snapshotDate",
  "lowStockOnly",
] as const;

export function tableFiltersFromSearchParams(
  params: RouteSearchParams | undefined,
): TablePageFilters {
  const filters: TablePageFilters = {};

  for (const key of filterKeys) {
    const value = getSingleSearchParam(params, key);

    if (value) {
      filters[key] = value;
    }
  }

  return filters;
}

function option(label: string, value: string): TableFilterOption {
  return { label, value };
}

const activeStatusOptions = [
  option("Active", "ACTIVE"),
  option("Inactive", "INACTIVE"),
];

const paymentStatusOptions = [
  option("Paid", "PAID"),
  option("Partial", "PARTIAL"),
  option("Unpaid", "UNPAID"),
];

const saleStatusOptions = [
  option("Completed", "COMPLETED"),
  option("Partially Returned", "PARTIALLY_RETURNED"),
  option("Returned", "RETURNED"),
  option("Partially Exchanged", "PARTIALLY_EXCHANGED"),
  option("Exchanged", "EXCHANGED"),
  option("Voided", "VOIDED"),
];

const salePaymentMethodOptions = [
  option("Cash", "CASH"),
  option("Bank", "BANK"),
  option("Credit", "CREDIT"),
];

const movementTypeOptions = [
  option("Purchase", "PURCHASE"),
  option("Sale", "SALE"),
  option("Transfer In", "TRANSFER_IN"),
  option("Transfer Out", "TRANSFER_OUT"),
  option("Adjustment", "ADJUSTMENT"),
  option("Customer Return", "CUSTOMER_RETURN"),
];

async function getBaseFilterOptions(filters: TablePageFilters) {
  const productWhere = {
    isActive: true,
    ...(filters.categoryId
      ? {
          categoryId: Array.isArray(filters.categoryId)
            ? { in: filters.categoryId }
            : filters.categoryId,
        }
      : {}),
  };

  const [
    locations,
    categories,
    products,
    customers,
    suppliers,
    expenseCategories,
    financeAccounts,
    users,
  ] = await Promise.all([
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.product.findMany({
      where: productWhere,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.customer.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, businessName: true, phone: true },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true },
    }),
    prisma.expenseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.financeAccount.findMany({
      where: {
        isActive: true,
        ...(filters.locationId
          ? {
              OR: [
                { locationId: null },
                {
                  locationId: Array.isArray(filters.locationId)
                    ? { in: filters.locationId }
                    : filters.locationId,
                },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, type: true },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, username: true },
    }),
  ]);

  return {
    locationOptions: locations.map((row) =>
      option(`${row.code} - ${row.name}`, row.id),
    ),
    categoryOptions: categories.map((row) => option(row.name, row.id)),
    productOptions: products.map((row) => option(row.name, row.id)),
    customerOptions: customers.map((row) =>
      option(row.phone ? `${formatCustomerName(row)} (${row.phone})` : formatCustomerName(row), row.id),
    ),
    supplierOptions: suppliers.map((row) =>
      option(row.phone ? `${row.name} (${row.phone})` : row.name, row.id),
    ),
    expenseCategoryOptions: expenseCategories.map((row) => option(row.name, row.id)),
    financeAccountOptions: financeAccounts.map((row) =>
      option(`${row.name} (${row.type})`, row.id),
    ),
    userOptions: users.map((row) => option(`${row.name} (${row.username})`, row.id)),
  };
}

function filterField(field: TableFilterField): TableFilterField {
  return field;
}

async function getFilterFields(
  key: TablePageKey,
  filters: TablePageFilters,
): Promise<TableFilterField[]> {
  const options = await getBaseFilterOptions(filters);
  const search = (placeholder: string) =>
    filterField({ key: "search", label: "Search", type: "search", placeholder });
  const location = filterField({
    key: "locationId",
    label: "Location",
    type: "multiselect",
    placeholder: "All locations",
    options: options.locationOptions,
    defaultValue: (filters as any).activeLocationId,
  });
  const category = filterField({
    key: "categoryId",
    label: "Category",
    type: "multiselect",
    placeholder: "All categories",
    options: options.categoryOptions,
    advanced: true,
  });
  const product = filterField({
    key: "productId",
    label: "Item",
    type: "multiselect",
    placeholder: "All items",
    options: options.productOptions,
    advanced: true,
  });
  const customer = filterField({
    key: "customerId",
    label: "Customer",
    type: "multiselect",
    placeholder: "All customers",
    options: options.customerOptions,
    advanced: true,
  });
  const supplier = filterField({
    key: "supplierId",
    label: "Supplier",
    type: "multiselect",
    placeholder: "All suppliers",
    options: options.supplierOptions,
  });
  const paymentStatus = filterField({
    key: "paymentStatus",
    label: "Payment Status",
    type: "select",
    placeholder: "All statuses",
    options: paymentStatusOptions,
  });
  const dateFrom = filterField({ key: "dateFrom", label: "Date From", type: "date" });
  const dateTo = filterField({ key: "dateTo", label: "Date To", type: "date" });

  switch (key) {
    case "inventoryProducts":
      return [
        search("Search item, SKU, or category"),
        category,
        filterField({
          key: "status",
          label: "Status",
          type: "select",
          placeholder: "All statuses",
          options: activeStatusOptions,
        }),
      ];
    case "inventoryStock":
    case "inventoryLowStock":
    case "inventoryOutOfStock":
      return [search("Search item, category, or SKU"), location, category, product];
    case "inventoryStockMovements":
      return [
        search("Search item or reference"),
        location,
        category,
        product,
        filterField({
          key: "type",
          label: "Movement Type",
          type: "multiselect",
          placeholder: "All movement types",
          options: movementTypeOptions,
          advanced: true,
        }),
        dateFrom,
        dateTo,
      ];
    case "inventoryTransfers":
      return [search("Search transfer, item, or location"), location, product, dateFrom, dateTo];
    case "salesList":
      return [
        search("Search customer, voucher, sale no., or note"),
        location,
        customer,
        category,
        product,
        filterField({
          key: "status",
          label: "Sale Status",
          type: "select",
          placeholder: "All statuses",
          options: saleStatusOptions,
          advanced: true,
        }),
        filterField({
          key: "paymentMethod",
          label: "Payment Method",
          type: "select",
          placeholder: "All methods",
          options: salePaymentMethodOptions,
          advanced: true,
        }),
        paymentStatus,
        dateFrom,
        dateTo,
      ];
    case "salesSoldItems":
      return [
        search("Search item, customer, category, or voucher"),
        location,
        customer,
        category,
        product,
        dateFrom,
        dateTo,
      ];
    case "salesDeliveryOrders":
      return [
        search("Search order, person, or customer"),
        location,
        customer,
        filterField({
          key: "status",
          label: "Status",
          type: "select",
          placeholder: "All statuses",
          options: [
            option("Draft", "DRAFT"),
            option("Sent", "SENT"),
            option("Delivered", "DELIVERED"),
            option("Cancelled", "CANCELLED"),
          ],
        }),
        dateFrom,
        dateTo,
      ];
    case "discountedItemsReport":
      return [
        search("Search item, category, or SKU"),
        location,
        category,
        product,
        dateFrom,
        dateTo,
      ];
    case "salesCustomers":
    case "salesAgents":
    case "salesCustomerCredit":
    case "salesAgentCredit":
      return [
        search("Search customer, business, TIN, contact, phone, or address"),
        location,
        filterField({
          key: "type",
          label: "Account type",
          type: "select",
          placeholder: "All types",
          options: [option("Customer", "CUSTOMER"), option("Agent", "AGENT")],
          advanced: true,
        }),
        filterField({
          key: "status",
          label: "Status",
          type: "select",
          placeholder: "All statuses",
          options: activeStatusOptions,
        }),
      ];
    case "salesCustomerPayments":
    case "salesAgentPayments":
      return [
        search("Search customer, receipt, or sale no."),
        location,
        customer,
        filterField({
          key: "paymentMethod",
          label: "Account",
          type: "select",
          placeholder: "All accounts",
          options: options.financeAccountOptions,
          advanced: true,
        }),
        dateFrom,
        dateTo,
      ];
    case "purchasesList":
    case "purchasesImports":
    case "purchasesImportPayables":
      return [
        search("Search supplier, invoice, purchase no., or item"),
        location,
        supplier,
        category,
        product,
        paymentStatus,
        dateFrom,
        dateTo,
      ];
    case "purchasesPurchasedItems":
      return [
        search("Search item, supplier, category, or invoice"),
        location,
        supplier,
        category,
        product,
        dateFrom,
        dateTo,
      ];
    case "purchasesSuppliers":
      return [
        search("Search supplier, phone, or address"),
        location,
        filterField({
          key: "status",
          label: "Status",
          type: "select",
          placeholder: "All statuses",
          options: activeStatusOptions,
        }),
      ];
    case "purchasesSupplierPayments":
      return [
        search("Search supplier, payment no., or purchase no."),
        location,
        supplier,
        filterField({
          key: "paymentMethod",
          label: "Account",
          type: "select",
          placeholder: "All accounts",
          options: options.financeAccountOptions,
          advanced: true,
        }),
        dateFrom,
        dateTo,
      ];
    case "financeExpenses":
      return [
        search("Search expense, category, account, or note"),
        location,
        filterField({
          key: "categoryId",
          label: "Expense Category",
          type: "select",
          placeholder: "All categories",
          options: options.expenseCategoryOptions,
          advanced: true,
        }),
        filterField({
          key: "paymentMethod",
          label: "Account",
          type: "select",
          placeholder: "All accounts",
          options: options.financeAccountOptions,
          advanced: true,
        }),
        dateFrom,
        dateTo,
      ];
    case "financeLedger":
      return [
        search("Search description or reference"),
        location,
        filterField({
          key: "accountType",
          label: "Account Type",
          type: "select",
          placeholder: "All types",
          options: [
            option("Bank Accounts", "BANK"),
            option("Cash Accounts", "CASH"),
          ],
          advanced: true,
        }),
        filterField({
          key: "paymentMethod",
          label: "Specific Account",
          type: "select",
          placeholder: "All accounts",
          options: options.financeAccountOptions,
          advanced: true,
        }),
        filterField({
          key: "type",
          label: "Entry Type",
          type: "select",
          placeholder: "All types",
          options: [
            option("Sale", "SALE"),
            option("Purchase", "PURCHASE"),
            option("Expense", "EXPENSE"),
            option("Customer Payment", "CUSTOMER_PAYMENT"),
            option("Supplier Payment", "SUPPLIER_PAYMENT"),
            option("Cash Transfer", "CASH_TRANSFER"),
          ],
          advanced: true,
        }),
        dateFrom,
        dateTo,
      ];
    case "financeAccounts":
      return [
        search("Search account, bank, or number"),
        filterField({
          key: "type",
          label: "Account Type",
          type: "select",
          placeholder: "All types",
          options: [
            option("Cash", "CASH"),
            option("Bank", "BANK"),
          ],
        }),
      ];
    case "financeCheques":
      return [
        search("Search cheque no, bank, or customer"),
        location,
        filterField({
          key: "status",
          label: "Status",
          type: "select",
          placeholder: "All statuses",
          options: [
            option("Pending", "PENDING"),
            option("Due Soon", "DUE_SOON"),
            option("Overdue", "OVERDUE"),
            option("Cleared", "CLEARED"),
            option("Bounced", "BOUNCED"),
            option("Cancelled", "CANCELLED"),
          ],
        }),
        dateFrom,
        dateTo,
      ];
    case "financeCash":
      return [search("Search account, bank, or number")];
    case "financeCashTransfers":
      return [
        search("Search transfer no. or location"),
        location,
        filterField({
          key: "paymentMethod",
          label: "Account",
          type: "select",
          placeholder: "All accounts",
          options: options.financeAccountOptions,
        }),
        dateFrom,
        dateTo,
      ];
    case "adminUsers":
    case "adminAuditLogs":
      return [
        search("Search records"),
        location,
        filterField({
          key: "userId",
          label: "User",
          type: "select",
          placeholder: "All users",
          options: options.userOptions,
        }),
      ];
    case "inventoryDigitalBinCard":
      return [
        search("Search item, SKU, category, or reference"),
        location,
        product,
        category,
        filterField({
          key: "type",
          label: "Movement Type",
          type: "multiselect",
          placeholder: "All movement types",
          options: movementTypeOptions,
          advanced: true,
        }),
        dateFrom,
        dateTo,
      ];
    default:
      return [];
  }
}

export type TablePageKey =
  | "inventoryProducts"
  | "inventoryStock"
  | "inventoryLowStock"
  | "inventoryOutOfStock"
  | "inventoryAlertRecords"
  | "inventoryStockMovements"
  | "inventoryDigitalBinCard"
  | "inventoryTransfers"
  | "inventoryCategories"
  | "inventoryUnits"
  | "inventoryExpiryAlert"
  | "salesSoldItems"
  | "salesList"
  | "salesCustomers"
  | "salesAgents"
  | "salesCustomerCredit"
  | "salesAgentCredit"
  | "salesCustomerPayments"
  | "salesAgentPayments"
  | "purchasesList"
  | "purchasesImports"
  | "purchasesImportPayables"
  | "purchasesPurchasedItems"
  | "purchasesSuppliers"
  | "purchasesSupplierPayments"
  | "financeAccounts"
  | "financeCash"
  | "financeCashTransfers"
  | "financeExpenses"
  | "financeExpenseCategories"
  | "financeLedger"
  | "financeCheques"
  | "reportsInventory"
  | "reportsSales"
  | "reportsPurchases"
  | "reportsFinance"
  | "adminUsers"
  | "adminRoles"
  | "adminLocations"
  | "adminAuditLogs"
  | "adminSettings"
  | "discountedItemsReport"
  | "salesDeliveryOrders";

function emptyReportConfig(
  title: string,
  description: string,
): TablePageConfig {
  return {
    eyebrow: "Reports",
    title,
    description,
    actionLabel: "Run report",
    exportFileName: title.toLowerCase().replaceAll(" ", "-"),
    columns: [
      { key: "name", header: "Report" },
      { key: "description", header: "Description" },
      { key: "updatedAt", header: "Updated", type: "dateTime" },
    ],
    rows: [],
  };
}

async function normalizeFilters(filters: TablePageFilters): Promise<TablePageFilters & { activeLocationId?: string }> {
  const currentUser = await getCurrentUser();
  const canViewAll = currentUser && hasPermission(currentUser.role, "location:view-all", currentUser.permissions);
  const activeLocationId = canViewAll ? filters.locationId : currentUser?.activeLocationId;
  const locationId = filters.locationId || activeLocationId;
  
  return {
    ...filters,
    ...(locationId ? { locationId } : {}),
    ...(activeLocationId ? { activeLocationId } : {}),
  };
}

export async function getTablePageConfig(
  key: TablePageKey,
  filters: TablePageFilters = {},
): Promise<TablePageConfig> {
  const normalizedFilters = await normalizeFilters(filters);
  const { activeLocationId } = normalizedFilters;
  const filterFields = await getFilterFields(key, normalizedFilters);

  switch (key) {
    case "inventoryProducts":
      return {
        eyebrow: "Inventory",
        title: "Items",
        description: "Master product registry with category and unit configuration.",
        actionLabel: "New item",
        exportFileName: "items",
        filters: filterFields,
        columns: [
          { key: "sku", header: "Item Code / SKU" },
          { key: "name", header: "Item" },
          { key: "category", header: "Category" },
          { key: "currentStock", header: "Stock", type: "number" },
          {
            key: "minimumStockAlert",
            header: "Low Stock Alert",
            type: "number",
          },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getProductRows(normalizedFilters),
      };
    case "inventoryStock":
      return {
        eyebrow: "Inventory",
        title: "Current Stock",
        description:
          "Live stock by location with breakdown and value tracking.",
        exportFileName: "current-stock",
        filters: filterFields,
        columns: [
          { key: "location", header: "Location", defaultHidden: true },
          { key: "product", header: "Item" },
          { key: "category", header: "Category" },
          { key: "stockBreakdown", header: "Stock Breakdown" },
          { key: "baseQuantity", header: "Qty", type: "number", showTotal: true },
          { key: "buyingPrice", header: "Buying Price", type: "currency" },
          { key: "sellingPrice", header: "Selling Price", type: "currency" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getStockOverviewRows(normalizedFilters),
        kpis: await getStockOverviewMetrics(activeLocationId),
      };
    case "inventoryLowStock":
      return {
        eyebrow: "Inventory",
        title: "Low Stock",
        description:
          "Items that have reached or fallen below the configured minimum stock level.",
        exportFileName: "low-stock",
        filters: filterFields,
        columns: [
          { key: "location", header: "Location", defaultHidden: true },
          { key: "name", header: "Item" },
          { key: "currentStock", header: "Current", type: "number" },
          { key: "minimumStockAlert", header: "Threshold", type: "number" },
          { key: "status", header: "Severity", type: "status" },
        ],
        rows: await getLowStockRows(normalizedFilters),
      };
    case "inventoryOutOfStock":
      return {
        eyebrow: "Inventory",
        title: "Out Of Stock",
        description:
          "Finished items by location that are currently unavailable and ready for replenishment.",
        exportFileName: "out-of-stock",
        filters: filterFields,
        columns: [
          { key: "location", header: "Location", defaultHidden: true },
          { key: "name", header: "Item" },
          { key: "currentStock", header: "Current", type: "number" },
          { key: "minimumStockAlert", header: "Threshold", type: "number" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getOutOfStockRows(normalizedFilters),
      };
    case "inventoryAlertRecords":
      return {
        eyebrow: "Inventory",
        title: "Alert Records",
        description: "Low-stock alert history raised by the inventory ledger.",
        exportFileName: "alert-records",
        columns: [
          { key: "location", header: "Location", defaultHidden: true },
          { key: "product", header: "Product" },
          { key: "threshold", header: "Threshold", type: "number" },
          { key: "quantityAtAlert", header: "Qty At Alert", type: "number" },
          { key: "status", header: "Status", type: "status" },
          { key: "createdAt", header: "Created", type: "dateTime" },
        ],
        rows: await getAlertRecordRows(normalizedFilters),
      };
    case "inventoryExpiryAlert":
      return {
        eyebrow: "Inventory",
        title: "Expiry Alerts",
        description: "Items that are expired or expiring within 90 days.",
        exportFileName: "expiry-alerts",
        filters: filterFields,
        columns: [
          { key: "location", header: "Location" },
          { key: "product", header: "Product" },
          { key: "batchNumber", header: "Batch No." },
          { key: "expiryDate", header: "Expiry Date", type: "dateTime" },
          { key: "daysUntilExpiry", header: "Days Left", type: "number" },
          { key: "stockBreakdown", header: "Current Stock" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getExpiryAlertRows(normalizedFilters),
      };
    case "inventoryStockMovements":
      return {
        eyebrow: "Inventory",
        title: "Stock Movements",
        description:
          "Ledger-style item movement history with source traceability across stock flows.",
        exportFileName: "stock-movements",
        filters: filterFields,
        columns: [
          { key: "movementDate", header: "Date", type: "dateTime" },
          { key: "location", header: "Location" },
          { key: "product", header: "Item" },
          { key: "type", header: "Movement Type" },
          { key: "quantity", header: "Qty (Base)", type: "number" },
          { key: "reference", header: "Reference" },
          { key: "reason", header: "Reason", defaultHidden: true },
        ],
        rows: await getStockMovementRows(normalizedFilters),
      };
    case "inventoryDigitalBinCard":
      return {
        eyebrow: "Inventory",
        title: "Digital Bin Card",
        description: "Sequential stock ledger with running balance per item and location.",
        exportFileName: "digital-bin-card",
        filters: filterFields,
        columns: [
          { key: "movementDate", header: "Date", type: "dateTime" },
          { key: "location", header: "Location" },
          { key: "product", header: "Item" },
          { key: "sku", header: "Item Code / SKU" },
          { key: "category", header: "Category" },
          { key: "type", header: "Type" },
          { key: "reference", header: "Reference" },
          { key: "inQty", header: "In", type: "number" },
          { key: "outQty", header: "Out", type: "number" },
          { key: "balance", header: "Balance", type: "number" },
          { key: "reason", header: "Reason" },
        ],
        rows: await getDigitalBinCardRows(normalizedFilters),
      };
    case "inventoryTransfers":
      return {
        eyebrow: "Inventory",
        title: "Transfers",
        description:
          "Move items between shops, stores, or store-to-shop locations.",
        actionLabel: "New transfer",
        exportFileName: "transfers",
        filters: filterFields,
        columns: [
          { key: "transferNumber", header: "Transfer No.", defaultHidden: true },
          { key: "sourceLocation", header: "From Location" },
          { key: "destinationLocation", header: "To Location" },
          { key: "itemCount", header: "Line Items", type: "number" },
          { key: "totalQuantity", header: "Total Qty", type: "number", showTotal: true },
          { key: "status", header: "Status", type: "status" },
          { key: "transferDate", header: "Transfer Date", type: "dateTime" },
        ],
        rows: await getTransferRows(normalizedFilters),
      };
    case "inventoryCategories":
      const { getCategoryRows } = await import("@/lib/page-data-inventory-master");
      return {
        eyebrow: "Inventory",
        title: "Categories",
        description: "Manage product categories for inventory classification.",
        actionLabel: "New category",
        exportFileName: "categories",
        columns: [
          { key: "name", header: "Category" },
          { key: "productCount", header: "Products", type: "number" },
          { key: "updatedAt", header: "Last Updated", type: "dateTime" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getCategoryRows(),
      };
    case "inventoryUnits":
      const { getUnitRows } = await import("@/lib/page-data-inventory-master");
      return {
        eyebrow: "Inventory",
        title: "Units",
        description: "Manage measurement units for products.",
        actionLabel: "New unit",
        exportFileName: "units",
        columns: [
          { key: "name", header: "Unit" },
          { key: "productCount", header: "Products", type: "number" },
          { key: "updatedAt", header: "Last Updated", type: "dateTime" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getUnitRows(),
      };
    case "salesSoldItems":
      return {
        eyebrow: "Sales",
        title: "Sold Items",
        description:
          "Line-level sold item history for item and category review.",
        exportFileName: "sold-items",
        filters: filterFields,
        columns: [
          { key: "saleNumber", header: "Sale No." },
          { key: "location", header: "Location" },
          { key: "product", header: "Item" },
          { key: "quantity", header: "Qty Sold", type: "number", showTotal: true },
          { key: "customer", header: "Customer", hideOnMobile: true },
          { key: "unitPrice", header: "Unit Price" },
          { key: "discountType", header: "Discount" },
          { key: "discountTotal", header: "Disc Total", type: "currency", showTotal: true },
          { key: "total", header: "Line Total", type: "currency", showTotal: true },
          { key: "soldAt", header: "Sold At", type: "dateTime", hideOnMobile: true },
        ],
        rows: await getSoldItemRows(normalizedFilters),
      };
    case "salesList":
      return {
        eyebrow: "Sales",
        title: "Sales List",
        description:
          "Sales history with payment method, customer, location, and outstanding balance.",
        actionLabel: "POS sale",
        actionHref: "/sales/pos",
        exportFileName: "sales-list",
        filters: filterFields,
        tabs: [
          { key: "ALL", label: "All Sales" },
          { key: "WALK_IN", label: "Walk-in" },
        ],
        activeTab: filters.type || "ALL",
        tabParam: "type",
        columns: [
          { key: "saleNumber", header: "Sale No.", defaultHidden: true },
          { key: "status", header: "Status", type: "status" },
          { key: "location", header: "Location" },
          { key: "customer", header: "Customer" },
          { key: "paymentMethod", header: "Payment Method", type: "status" },
          { key: "discountTotal", header: "Discount Total", type: "currency", showTotal: true },
          { key: "total", header: "Sale Total", type: "currency", showTotal: true },
          { key: "amountDue", header: "Credit Balance", type: "currency", showTotal: true },
          { key: "soldAt", header: "Sold At", type: "dateTime" },
        ],
        rows: await getSalesRows(normalizedFilters),
      };
    case "salesDeliveryOrders":
      return {
        eyebrow: "Sales",
        title: "Delivery Orders",
        description: "Track and manage item dispatch for completed sales.",
        exportFileName: "delivery-orders",
        filters: filterFields,
        columns: [
          { key: "orderNumber", header: "Order No." },
          { key: "saleNumber", header: "Sale No." },
          { key: "customer", header: "Customer" },
          { key: "location", header: "Location" },
          { key: "deliveryPerson", header: "Delivery Person" },
          { key: "deliveryAddress", header: "Address" },
          { key: "deliveryDate", header: "Delivery Date", type: "dateTime" },
          { key: "itemSummary", header: "Items" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getDeliveryOrderRows(normalizedFilters),
      };
    case "salesCustomers":
      return {
        eyebrow: "Sales",
        title: "Customers",
        description:
          "Customer directory with total purchases and credit balance.",
        actionLabel: "New customer",
        exportFileName: "customers",
        filters: filterFields,
        columns: [
          { key: "name", header: "Customer" },
          { key: "partyType", header: "Type", type: "status" },
          { key: "businessName", header: "Business Name" },
          { key: "tinNumber", header: "TIN Number" },
          { key: "contactPerson", header: "Contact Person" },
          { key: "contactPhone", header: "Contact Phone" },
          { key: "phone", header: "Phone" },
          { key: "location", header: "Location" },
          {
            key: "totalPurchases",
            header: "Total Purchases",
            type: "currency",
            showTotal: true,
          },
          { key: "creditBalance", header: "Credit Balance", type: "currency", showTotal: true },
          { key: "creditLimit", header: "Credit Limit", type: "currency", showTotal: true },
          { key: "lastPurchaseAt", header: "Last Purchase", type: "dateTime" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getCustomerRows(normalizedFilters),
      };
    case "salesAgents":
      return {
        eyebrow: "Sales",
        title: "Agents",
        description:
          "Agent accounts with credit limits, outstanding balances, and settlement actions.",
        actionLabel: "New agent",
        exportFileName: "agents",
        filters: filterFields,
        columns: [
          { key: "name", header: "Agent" },
          { key: "businessName", header: "Business Name" },
          { key: "phone", header: "Phone" },
          { key: "totalPurchases", header: "Total Sales", type: "currency", showTotal: true },
          { key: "creditBalance", header: "Outstanding", type: "currency", showTotal: true },
          { key: "creditLimit", header: "Credit Limit", type: "currency", showTotal: true },
          { key: "availableCredit", header: "Available Credit", type: "currency", showTotal: true },
          { key: "lastPurchaseAt", header: "Last Sale", type: "dateTime" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getCustomerRows({ ...normalizedFilters, type: "AGENT" }),
      };
    case "salesCustomerCredit":
      return {
        eyebrow: "Sales",
        title: "Customer Credit",
        description: "Outstanding customer balances with quick settlement actions.",
        exportFileName: "customer-credit",
        filters: filterFields,
        columns: [
          { key: "customer", header: "Customer" },
          { key: "partyType", header: "Type", type: "status" },
          { key: "phone", header: "Phone" },
          { key: "outstanding", header: "Outstanding", type: "currency", showTotal: true },
          { key: "creditLimit", header: "Credit Limit", type: "currency", showTotal: true },
          { key: "availableCredit", header: "Available", type: "currency", showTotal: true },
          { key: "agingBucket", header: "Aging", type: "status" },
          { key: "lastPurchaseAt", header: "Last Purchase", type: "dateTime" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getCustomerCreditRows(normalizedFilters),
      };
    case "salesAgentCredit":
      return {
        eyebrow: "Sales",
        title: "Agent Credit",
        description: "Outstanding agent balances, credit limits, and settlement actions.",
        exportFileName: "agent-credit",
        filters: filterFields,
        columns: [
          { key: "customer", header: "Agent" },
          { key: "phone", header: "Phone" },
          { key: "outstanding", header: "Outstanding", type: "currency", showTotal: true },
          { key: "creditLimit", header: "Credit Limit", type: "currency", showTotal: true },
          { key: "availableCredit", header: "Available", type: "currency", showTotal: true },
          { key: "agingBucket", header: "Aging", type: "status" },
          { key: "lastPurchaseAt", header: "Last Sale", type: "dateTime" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getCustomerCreditRows({ ...normalizedFilters, type: "AGENT" }),
      };
    case "salesCustomerPayments":
      return {
        eyebrow: "Sales",
        title: "Customer Payments",
        description: "Customer settlements posted against credit sales.",
        actionLabel: "Record payment",
        exportFileName: "customer-payments",
        filters: filterFields,
        columns: [
          { key: "receiptNumber", header: "Receipt No.", defaultHidden: true },
          { key: "customer", header: "Customer" },
          { key: "location", header: "Location" },
          { key: "paymentMethod", header: "Method" },
          { key: "amount", header: "Amount", type: "currency", showTotal: true },
          { key: "appliedTo", header: "Applied To" },
          { key: "paidAt", header: "Paid At", type: "dateTime" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getCustomerPaymentRows(normalizedFilters),
      };
    case "salesAgentPayments":
      return {
        eyebrow: "Agents",
        title: "Collections",
        description: "Payments collected against outstanding agent credit.",
        actionLabel: "Record collection",
        exportFileName: "agent-collections",
        filters: filterFields,
        columns: [
          { key: "receiptNumber", header: "Receipt No.", defaultHidden: true },
          { key: "customer", header: "Agent" },
          { key: "location", header: "Location" },
          { key: "paymentMethod", header: "Method" },
          { key: "amount", header: "Amount", type: "currency", showTotal: true },
          { key: "appliedTo", header: "Applied To" },
          { key: "paidAt", header: "Paid At", type: "dateTime" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getCustomerPaymentRows({ ...normalizedFilters, type: "AGENT" }),
      };
    case "purchasesList":
      return {
        eyebrow: "Purchases",
        title: "Purchase List",
        description:
          "Local ETB supplier purchases. USD imports are listed under Imports.",
        actionLabel: "New purchase",
        actionHref: "/purchases/new",
        exportFileName: "purchase-list",
        filters: filterFields,
        columns: [
          { key: "purchaseNumber", header: "Purchase No.", defaultHidden: true },
          { key: "location", header: "Location" },
          { key: "supplier", header: "Supplier" },
          { key: "total", header: "Invoice Total", type: "currency", showTotal: true },
          { key: "amountDue", header: "Balance Due", type: "currency", showTotal: true },
          { key: "paymentStatus", header: "Payment Status", type: "status" },
          { key: "purchasedAt", header: "Purchased At", type: "dateTime" },
        ],
        rows: await getPurchaseRows({ ...normalizedFilters, type: "LOCAL" }),
      };
    case "purchasesImports":
      return {
        eyebrow: "Imports",
        title: "Import List",
        description:
          "USD import invoices received into warehouses and stores.",
        actionLabel: "New import",
        actionHref: "/imports/new",
        exportFileName: "imports",
        filters: filterFields,
        columns: [
          { key: "purchaseNumber", header: "Purchase No.", defaultHidden: true },
          { key: "location", header: "Received at" },
          { key: "supplier", header: "Supplier" },
          { key: "total", header: "Invoice Total", type: "currency", showTotal: true },
          { key: "amountDue", header: "Balance Due", type: "currency", showTotal: true },
          { key: "usdTotal", header: "Total (USD)", type: "usd", showTotal: true },
          { key: "usdAmountDue", header: "Balance (USD)", type: "usd", showTotal: true },
          { key: "paymentStatus", header: "Payment Status", type: "status" },
          { key: "purchasedAt", header: "Purchased At", type: "dateTime" },
        ],
        rows: await getPurchaseRows({ ...normalizedFilters, type: "IMPORT" }),
      };
    case "purchasesImportPayables":
      return {
        eyebrow: "Imports",
        title: "USD Payables",
        description: "Unpaid and partially paid import invoices still due to foreign suppliers.",
        actionLabel: "Pay supplier",
        actionHref: "/purchases/supplier-payments",
        exportFileName: "import-payables",
        filters: filterFields,
        columns: [
          { key: "purchaseNumber", header: "Purchase No.", defaultHidden: true },
          { key: "location", header: "Received at" },
          { key: "supplier", header: "Supplier" },
          { key: "total", header: "Invoice Total", type: "currency", showTotal: true },
          { key: "amountDue", header: "Balance Due", type: "currency", showTotal: true },
          { key: "usdTotal", header: "Total (USD)", type: "usd", showTotal: true },
          { key: "usdAmountDue", header: "Balance (USD)", type: "usd", showTotal: true },
          { key: "paymentStatus", header: "Payment Status", type: "status" },
          { key: "purchasedAt", header: "Purchased At", type: "dateTime" },
        ],
        rows: await getPurchaseRows({ ...normalizedFilters, type: "IMPORT", paymentStatus: "DUE" }),
      };
    case "purchasesPurchasedItems":
      return {
        eyebrow: "Purchases",
        title: "Purchased Items",
        description:
          "Line-level local purchase history. Import lines are on USD import invoices.",
        exportFileName: "purchased-items",
        filters: filterFields,
        columns: [
          { key: "purchaseNumber", header: "Purchase No." },
          { key: "location", header: "Location" },
          { key: "product", header: "Item" },
          { key: "quantity", header: "Qty Purchased", type: "number", showTotal: true },
          { key: "supplier", header: "Supplier", hideOnMobile: true },
          { key: "unitPrice", header: "Unit Price" },
          { key: "total", header: "Total (ETB)", type: "currency", showTotal: true },
          { key: "purchasedAt", header: "Purchased At", type: "dateTime", hideOnMobile: true },
        ],
        rows: await getPurchasedItemRows({ ...normalizedFilters, type: "LOCAL" }),
      };
    case "purchasesSuppliers":
      return {
        eyebrow: "Purchases",
        title: "Suppliers",
        description:
          "Supplier list with payable balance and purchase count.",
        actionLabel: "New supplier",
        exportFileName: "suppliers",
        filters: filterFields,
        columns: [
          { key: "name", header: "Supplier" },
          { key: "phone", header: "Phone" },
          { key: "location", header: "Location" },
          { key: "payableBalance", header: "Payable (ETB)", type: "currency", showTotal: true },
          { key: "usdPayableBalance", header: "Payable (USD)", type: "usd", showTotal: true },
          { key: "purchasesCount", header: "Purchases", type: "number", showTotal: true },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getSupplierRows(normalizedFilters),
      };
    case "purchasesSupplierPayments":
      return {
        eyebrow: "Purchases",
        title: "Supplier Payments",
        description:
          "Supplier settlements posted against purchase credit.",
        actionLabel: "Record payment",
        exportFileName: "supplier-payments",
        filters: filterFields,
        columns: [
          { key: "paymentNumber", header: "Payment No.", defaultHidden: true },
          { key: "supplier", header: "Supplier" },
          { key: "location", header: "Location" },
          { key: "account", header: "Account" },
          { key: "amount", header: "Amount", type: "currency", showTotal: true },
          { key: "appliedTo", header: "Applied To" },
          { key: "paidAt", header: "Paid At", type: "dateTime" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getSupplierPaymentRows(normalizedFilters),
      };
    case "financeAccounts":
      return {
        eyebrow: "Finance",
        title: "Accounts",
        description:
          "Central cash and bank accounts with ledger-derived balances and posting controls.",
        actionLabel: "New account",
        exportFileName: "finance-accounts",
        filters: filterFields,
        columns: [
          { key: "name", header: "Account / Person" },

          { key: "bankName", header: "Bank" },
          { key: "accountNumber", header: "Account No." },
          { key: "location", header: "Scope" },
          { key: "balance", header: "Balance", type: "currency", showTotal: true },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getFinanceAccountRows(normalizedFilters),
      };
    case "financeCash":
      return {
        eyebrow: "Finance",
        title: "Cash",
        description:
          "Cash account balances by location with quick bank deposit actions.",
        actionLabel: "Deposit cash",
        exportFileName: "cash-accounts",
        filters: filterFields,
        columns: [
          { key: "name", header: "Cash Account" },
          { key: "location", header: "Location" },
          { key: "balance", header: "Balance", type: "currency" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getCashAccountRows(normalizedFilters),
      };
    case "financeCashTransfers":
      return {
        eyebrow: "Finance",
        title: "Cash Transfers",
        description: "Cash transfer entries posted to the ledger.",
        actionLabel: "New transfer",
        exportFileName: "cash-transfers",
        filters: filterFields,
        columns: [
          { key: "transferNumber", header: "Transfer No.", defaultHidden: true },
          { key: "fromAccount", header: "From Account" },
          { key: "toAccount", header: "To Account" },
          { key: "location", header: "Location" },
          { key: "amount", header: "Amount", type: "currency", showTotal: true },
          { key: "transferDate", header: "Transfer Date", type: "dateTime" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getCashTransferRows(normalizedFilters),
      };
    case "financeExpenses":
      return {
        eyebrow: "Finance",
        title: "Expenses",
        description:
          "Expense records tied to payment accounts, categories, and locations.",
        actionLabel: "New expense",
        exportFileName: "expenses",
        filters: filterFields,
        kpis: await getExpenseKpis(activeLocationId),
        columns: [
          { key: "expenseNumber", header: "Expense No.", defaultHidden: true },
          { key: "location", header: "Location" },
          { key: "category", header: "Category" },
          { key: "name", header: "Expense" },
          { key: "account", header: "Account" },
          { key: "amount", header: "Amount", type: "currency", showTotal: true },
          { key: "expenseDate", header: "Expense Date", type: "dateTime" },
        ],
        rows: await getExpenseRows(normalizedFilters),
      };
    case "financeExpenseCategories":
      return {
        eyebrow: "Finance",
        title: "Expense Categories",
        description: "Manage categories for organizing business expenses.",
        actionLabel: "New category",
        exportFileName: "expense-categories",
        columns: [
          { key: "name", header: "Category" },
          { key: "expenseCount", header: "Total Entries", type: "number" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getExpenseCategoryRows(),
      };
    case "discountedItemsReport":
      return {
        eyebrow: "Finance",
        title: "Discounted Items",
        description: "List of all sold items where a discount was applied.",
        exportFileName: "discounted-items",
        filters: filterFields,
        columns: [
          { key: "date", header: "Date", type: "dateTime" },
          { key: "saleNumber", header: "Sale No." },
          { key: "product", header: "Product" },
          { key: "category", header: "Category" },
          { key: "customer", header: "Customer" },
          { key: "quantity", header: "Qty", type: "number" },
          { key: "unitPrice", header: "Unit Price", type: "currency" },
          { key: "discountType", header: "Discount Type" },
          { key: "discountPerUnit", header: "Disc/Unit", type: "currency" },
          { key: "totalDiscount", header: "Total Disc", type: "currency", showTotal: true },
          { key: "netTotal", header: "Net Total", type: "currency", showTotal: true },
        ],
        rows: await getDiscountedItemRows(normalizedFilters),
      };
    case "financeLedger":
      return {
        eyebrow: "Finance",
        title: "Ledger",
        description:
          "Combined account transaction feed for sales, purchases, and finance flows.",
        exportFileName: "ledger",
        filters: filterFields,
        columns: [
          { key: "entryDate", header: "Entry Date", type: "dateTime" },
          { key: "location", header: "Location" },
          { key: "account", header: "Account" },
          { key: "type", header: "Type", type: "status" },
          { key: "direction", header: "Direction", type: "status" },
          { key: "amount", header: "Amount", type: "currency", showTotal: true },
          { key: "reference", header: "Reference" },
        ],
        rows: await getLedgerRows(normalizedFilters),
      };
    case "financeCheques":
      return {
        eyebrow: "Finance",
        title: "Cheque Management",
        description: "Customer cheques with clearing, bouncing, and cancellation controls.",
        exportFileName: "cheques",
        filters: filterFields,
        columns: [
          { key: "chequeNumber", header: "Cheque No." },
          { key: "saleItemSummary", header: "Sale Items" },
          { key: "bankName", header: "Bank" },
          { key: "amount", header: "Amount", type: "currency", showTotal: true },
          { key: "customer", header: "Customer" },
          { key: "depositableDate", header: "Depositable", type: "dateTime" },
          { key: "daysLeft", header: "Days Left" },
          { key: "status", header: "Status", type: "status" },
          { key: "chequeDate", header: "Cheque Date", type: "dateTime", defaultHidden: true },
          { key: "expiryDate", header: "Expiry", type: "dateTime", defaultHidden: true },
          { key: "clearedDate", header: "Cleared At", type: "dateTime", defaultHidden: true },
          { key: "account", header: "Bank Account", defaultHidden: true },
          { key: "location", header: "Location" },
        ],
        rows: await getChequeRows(normalizedFilters),
      };
    case "reportsInventory":
      return {
        eyebrow: "Reports",
        title: "Inventory Value",
        description:
          "Current inventory quantities with buying value by store or shop.",
        exportFileName: "inventory-value",
        columns: [
          { key: "location", header: "Location", defaultHidden: true },
          { key: "product", header: "Item" },
          { key: "quantity", header: "Quantity", type: "number", showTotal: true },
          { key: "stockValue", header: "Buying Value", type: "currency", showTotal: true },
        ],
        rows: await getStockOverviewRows(normalizedFilters),
        kpis: await getStockOverviewMetrics(activeLocationId),
      };
    case "reportsSales":
      return {
        eyebrow: "Reports",
        title: "Sales Profit",
        description:
          "Daily sale lines with revenue, cost, and gross profit.",
        exportFileName: "sales-profit",
        columns: [
          { key: "soldAt", header: "Sold At", type: "dateTime" },
          { key: "saleNumber", header: "Sale No." },
          { key: "location", header: "Location" },
          { key: "product", header: "Product" },
          { key: "quantity", header: "Qty", type: "number", showTotal: true },
          { key: "saleTotal", header: "Sales", type: "currency", showTotal: true },
          { key: "costTotal", header: "Cost", type: "currency", showTotal: true },
          { key: "grossProfit", header: "Gross Profit", type: "currency", showTotal: true },
        ],
        rows: await getSalesProfitRows(normalizedFilters),
      };
    case "reportsPurchases":
      return {
        eyebrow: "Reports",
        title: "Purchase Report",
        description:
          "Local ETB supplier purchases with item details and unpaid balances.",
        exportFileName: "purchase-report",
        columns: [
          { key: "purchaseNumber", header: "Purchase No.", defaultHidden: true },
          { key: "location", header: "Location" },
          { key: "supplier", header: "Supplier" },
          { key: "itemsPurchased", header: "Items", type: "multiline" },
          { key: "total", header: "Total (ETB)", type: "currency", showTotal: true },
          { key: "amountDue", header: "Due (ETB)", type: "currency", showTotal: true },
          { key: "paymentStatus", header: "Status", type: "status" },
          { key: "purchasedAt", header: "Purchased At", type: "dateTime" },
        ],
        rows: await getPurchaseRows({ ...normalizedFilters, type: "LOCAL" }),
      };
    case "reportsFinance":
      return {
        eyebrow: "Reports",
        title: "Expense Summary",
        description:
          "Expense totals by category and location for the selected reporting window.",
        exportFileName: "expense-summary",
        columns: [
          { key: "category", header: "Category" },
          { key: "location", header: "Location" },
          { key: "entries", header: "Entries", type: "number", showTotal: true },
          { key: "totalAmount", header: "Total Amount", type: "currency", showTotal: true },
          { key: "lastExpenseAt", header: "Last Expense", type: "dateTime" },
        ],
        rows: await getExpenseCategorySummaryRows(normalizedFilters),
      };
    case "adminUsers":
      return {
        eyebrow: "Administration",
        title: "Users",
        description:
          "User accounts with location assignment, role, and active state visibility.",
        actionLabel: "New user",
        exportFileName: "users",
        filters: filterFields,
        columns: [
          { key: "name", header: "Name" },
          { key: "username", header: "Login ID" },
          { key: "role", header: "Role", type: "status" },
          { key: "defaultLocation", header: "Default Location" },
          { key: "locations", header: "Assigned Locations" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getUserRows(normalizedFilters),
      };
    case "adminRoles":
      return {
        eyebrow: "Administration",
        title: "Roles",
        description: "Create roles from permission checklists and see assigned user counts.",
        exportFileName: "roles",
        columns: [
          { key: "role", header: "Role", type: "status" },
          { key: "code", header: "Code" },
          { key: "userCount", header: "Users", type: "number" },
          { key: "scope", header: "Summary" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getRoleRows(),
      };
    case "adminLocations":
      return {
        eyebrow: "Setup",
        title: "Stores, Shops & Warehouses",
        description: "Locations used for warehouse receiving, store holding, and shop sales.",
        exportFileName: "stores-and-shops",
        columns: [
          { key: "name", header: "Location" },
          { key: "type", header: "Type", type: "status" },
          { key: "location", header: "Location" },
          { key: "stockValue", header: "Stock Value", type: "currency" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getLocationRows(),
      };
    case "adminAuditLogs":
      return {
        eyebrow: "Administration",
        title: "Audit Logs",
        description:
          "High-level audit events for stock, finance, and admin activity.",
        exportFileName: "audit-logs",
        filters: filterFields,
        columns: [
          { key: "action", header: "Action", type: "status" },
          { key: "entityType", header: "Entity" },
          { key: "actor", header: "Actor" },
          { key: "location", header: "Location" },
          { key: "beforeQuantity", header: "Before Qty", type: "number", defaultHidden: true },
          { key: "afterQuantity", header: "After Qty", type: "number", defaultHidden: true },
          { key: "adjustmentQuantity", header: "Adjustment", type: "number", defaultHidden: true },
          { key: "reason", header: "Reason", defaultHidden: true },
          { key: "createdAt", header: "Created At", type: "dateTime" },
        ],
        rows: await getAuditLogRows(normalizedFilters),
      };
    case "adminSettings":
      return {
        eyebrow: "Administration",
        title: "Settings",
        description:
          "Settings will appear here once persisted system configuration is implemented.",
        exportFileName: "settings",
        columns: [
          { key: "category", header: "Category", type: "status" },
          { key: "setting", header: "Setting" },
          { key: "value", header: "Value" },
          { key: "updatedAt", header: "Updated", type: "dateTime" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: [],
      };
    case "salesDeliveryOrders":
      return {
        eyebrow: "Sales",
        title: "Delivery Orders",
        description: "Track dispatch, transit, and delivery status for customer orders.",
        exportFileName: "delivery-orders",
        filters: filterFields,
        columns: [
          { key: "orderNumber", header: "Order #" },
          { key: "saleNumber", header: "Sale #" },
          { key: "customer", header: "Customer" },
          { key: "location", header: "Location" },
          { key: "deliveryPerson", header: "Driver / Person" },
          { key: "phone", header: "Contact" },
          { key: "deliveryDate", header: "Est. Date" },
          { key: "itemSummary", header: "Items" },
          { key: "status", header: "Status", type: "status" },
        ],
        rows: await getDeliveryOrderRows(normalizedFilters),
      };
    default:
      return {
        title: "Records",
        description: "No data configuration found for this page.",
        columns: [],
        rows: [],
      };
  }
}

export { getDashboardSnapshot };