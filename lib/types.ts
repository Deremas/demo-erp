import type { AppPermission, AppRole } from "@/lib/rbac";
export type { AppRole };

export type LocationOption = {
  id: string;
  code: string;
  name: string;
};

/** @deprecated Use LocationOption. */
export type BranchOption = LocationOption;

export type NamedOption = {
  id: string;
  name: string;
  businessName?: string | null;
  partyType?: "CUSTOMER" | "AGENT";
  creditLimit?: number;
  creditBalance?: number;
};

export type ProductOption = {
  id: string;
  name: string;
  sku: string;
  unitId: string;
  unitName: string;
  buyingPrice: number;
  sellingPrice: number;
  defaultBuyingPrice?: number;
  defaultSellingPrice?: number;
};

export type PurchaseFormOptions = {
  locations: LocationOption[];
  suppliers: NamedOption[];
  products: ProductOption[];
  accounts: FinanceAccountOption[];
  latestUsdRate?: number;
};



export type SaleFormOptions = {
  locations: LocationOption[];
  customers: NamedOption[];
  products: ProductOption[];
  locationStock: SaleLocationStockOption[];
  accounts: FinanceAccountOption[];
};

export type TransferFormOptions = {
  locations: LocationOption[];
  products: ProductOption[];
  locationStock: SaleLocationStockOption[];
};



export type SaleLocationStockOption = {
  locationId: string;
  productId: string;
  availableQty: number;
  unitPrice: number;
  hasLocationPrice?: boolean;
};

export type UserFormOptions = {
  locations: LocationOption[];
  roles: {
    code: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    permissionKeys: string[];
  }[];
};

export type FinanceAccountOption = {
  id: string;
  name: string;
  type: "CASH" | "BANK";
  locationId: string | null;
  locationName: string | null;
  branchId?: string | null;
  branchName?: string | null;
  bankName: string | null;
  accountNumber: string | null;
};

export type OutstandingSaleOption = {
  id: string;
  saleNumber: string;
  customerId: string;
  customerName: string;
  locationId: string;
  locationName: string;
  branchId?: string;
  branchName?: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  soldAt: string;
};

export type CustomerPaymentFormOptions = {
  customers: NamedOption[];
  accounts: FinanceAccountOption[];
  outstandingSales: OutstandingSaleOption[];
};

export type OutstandingPurchaseOption = {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  locationId: string;
  locationName: string;
  branchId?: string;
  branchName?: string;
  amountDue: number;
  purchasedAt: string;
  trackInUsd: boolean;
  exchangeRate: number;
};

export type SupplierPaymentFormOptions = {
  suppliers: NamedOption[];
  accounts: FinanceAccountOption[];
  outstandingPurchases: OutstandingPurchaseOption[];
};

export type FinanceAccountFormOptions = {
  locations: LocationOption[];
  branches: LocationOption[];
  cashLocationIds: string[];
  cashBranchIds: string[];
};

export type CashTransferAccountOption = FinanceAccountOption & {
  balance: number;
};

export type CashTransferFormOptions = {
  locations: LocationOption[];
  branches: LocationOption[];
  cashAccounts: CashTransferAccountOption[];
  bankAccounts: CashTransferAccountOption[];
};

export type ExpenseFormOptions = {
  locations: LocationOption[];
  branches: LocationOption[];
  accounts: FinanceAccountOption[];
  categoryNames: string[];
};



export type TopProductCardItem = {
  id: string;
  name: string;
  currentStock: number;
  value: number;
};

export type CurrentUser = {
  id: string;
  name: string;
  username: string;
  role: AppRole;
  permissions: AppPermission[];
  activeLocationId: string;
  activeBranchId?: string;
  locations: LocationOption[];
  branches?: LocationOption[];
};

export type MetricTone = "default" | "success" | "warning" | "danger" | "info";

export type MetricCard = {
  title: string;
  value: string;
  icon?: string;
  tone?: MetricTone;
  meta?: string;
  href?: string;
  footerLabel?: string;
  trend?: {
    value: string;
    isUp: boolean;
    label: string;
  };
  subStats?: {
    label: string;
    value: string;
  }[];
  progress?: {
    value: number;
    label: string;
    color?: string;
  };
};

export type TrendPoint = {
  label: string;
  value: number;
};

export type RecentTransaction = {
  id: string;
  type: string;
  reference: string;
  amount: number;
  location: string;
  createdAt: string;
};

export type SimpleRow = {
  id: string;
  label: string;
  value: string;
  name: string;
  location: string;
  currentStock: number;
  minimumStockAlert: number;
  status: "LOW" | "CRITICAL" | "NORMAL";
};

export type DashboardSnapshot = {
  metrics: MetricCard[];
  summary: MetricCard[];
  alerts: MetricCard[];
  salesTrend: TrendPoint[];
  monthlySalesTrend: TrendPoint[];
  topProducts: TopDashboardProduct[];
  recentTransactions: RecentTransaction[];
  lowStock: SimpleRow[];
  inventoryValue: {
    buyingValue: number;
    retailValue: number;
    totalItems: number;
  };
  charts: {
    paymentMethods: TrendPoint[];
    customerDist: TrendPoint[];
    locationStock: TrendPoint[];
  };
  usdExposure?: {
    totalPayable: number;
    totalReceivable: number;
  };
  vatSummary?: {
    todayCollected: number;
    weekCollected: number;
    monthCollected: number;
  };
};

export type TopDashboardProduct = {
  id: string;
  name: string;
  quantity: number;
  totalRevenue: number;
  totalSales: number;
};

export type ProductRow = {
  id: string;
  name: string;
  minimumStockAlert: number;
  currentStock: number;
  status: "ACTIVE" | "INACTIVE";
};

export type StockBreakdown = {
  packages: number;
  units: number;
  unit: string;
};

export type StockOverviewRow = {
  id: string;
  location: string;
  product: string;
  category: string;
  stockBreakdown: string;
  baseQuantity: number;
  preferredPackage: string;
  buyingPrice: number;
  sellingPrice: number;
  status: "HEALTHY" | "LOW_STOCK" | "OUT_OF_STOCK";
};

export type AlertRecordRow = {
  id: string;
  location: string;
  product: string;
  threshold: number;
  currentQty: number;
  evaluatedAt: string;
};

export type StockMovementRow = {
  id: string;
  location: string;
  product: string;
  type: string;
  baseQuantity: number; // e.g. 120
  reference: string;
  movementDate: string;
};

export type PurchaseRow = {
  id: string;
  purchaseNumber: string;
  location: string;
  supplier: string;
  total: number;
  amountDue: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  purchasedAt: string;
};

export type SaleRow = {
  id: string;
  saleNumber: string;
  location: string;
  customer: string;
  paymentMethod: "CASH" | "BANK" | "MIXED" | "CREDIT";
  discountTotal: number;
  total: number;
  amountDue: number;
  soldAt: string;
};

export type SoldItemRow = {
  id: string;
  saleNumber: string;
  location: string;
  product: string;
  quantity: number;
  customer: string;
  unitPrice: number;
  total: number;
  soldAt: string;
};

export type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  totalPurchases: number;
  creditBalance: number;
  lastPurchaseAt: string;
  status: "ACTIVE" | "INACTIVE";
};

export type SupplierRow = {
  id: string;
  name: string;
  phone: string;
  payableBalance: number;
  purchasesCount: number;
  status: "ACTIVE" | "INACTIVE";
};

export type UserRow = {
  id: string;
  name: string;
  username: string;
  role: AppRole;
  defaultLocation: string;
  locations: string;
  status: "ACTIVE" | "INACTIVE";
};

export type LocationRow = {
  id: string;
  code: string;
  name: string;
  type: "STORE" | "SHOP" | "WAREHOUSE";
  location: string;
  stockValue: number;
  status: "ACTIVE" | "INACTIVE";
};

export type FinanceAccountRow = {
  id: string;
  code: string;
  name: string;
  type: "CASH" | "BANK";
  bankName: string;
  accountNumber: string;
  location: string;
  balance: number;
  status: "ACTIVE" | "INACTIVE";
};

export type CashAccountRow = {
  id: string;
  code: string;
  name: string;
  location: string;
  balance: number;
  status: "ACTIVE" | "INACTIVE";
};

export type ExpenseRow = {
  id: string;
  expenseNumber: string;
  location: string;
  category: string;
  name: string;
  amount: number;
  account: string;
  expenseDate: string;
};

export type LedgerRow = {
  id: string;
  entryDate: string;
  location: string;
  account: string;
  type: string;
  direction: "DEBIT" | "CREDIT";
  amount: number;
  reference: string;
};

export type AuditLogRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: string;
  location: string;
  createdAt: string;
};

export type ReportRow = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
};