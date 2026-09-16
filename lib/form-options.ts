import { getCurrentUser } from "@/lib/auth/session";
import { formatCustomerName, formatDateForInput } from "@/lib/utils";
import {
  dedupeCashAccountsPerLocation,
  toFinanceAccountOption,
} from "@/lib/finance-account-utils";
import { prisma } from "@/lib/prisma";
import { getAssignableRoleOptions } from "@/lib/rbac-db";

import { PurchaseFormInput } from "@/lib/validation/purchase";
import { SaleFormInput } from "@/lib/validation/sale";
import type {
  CustomerPaymentFormOptions,
  CashTransferAccountOption,
  CashTransferFormOptions,
  ExpenseFormOptions,
  FinanceAccountFormOptions,
  LocationOption,
  OutstandingSaleOption,
  OutstandingPurchaseOption,
  ProductOption,
  PurchaseFormOptions,
  SaleLocationStockOption,
  SaleFormOptions,
  SupplierPaymentFormOptions,
  TransferFormOptions,
  UserFormOptions,
} from "@/lib/types";

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function toCashTransferAccountOption(account: {
  id: string;
  name: string;
  type: "CASH" | "BANK";
  locationId: string | null;
  bankName: string | null;
  accountNumber: string | null;
  location: { name: string } | null;
  ledgerEntries: {
    amount: unknown;
    direction: "DEBIT" | "CREDIT";
  }[];
}): CashTransferAccountOption {
  return {
    ...toFinanceAccountOption(account),
    balance: Number(
      account.ledgerEntries
        .reduce((sum, entry) => {
          const amount = toNumber(entry.amount);
          return entry.direction === "DEBIT" ? sum + amount : sum - amount;
        }, 0)
        .toFixed(2),
    ),
  };
}

async function getCurrentLocationScope() {
  const user = await getCurrentUser();

  return {
    activeLocationId: user?.activeLocationId ?? "",
    locations: user?.locations ?? [],
    role: user?.role ?? "SALES",
  };
}

export async function getFinanceAccountFormOptions(): Promise<FinanceAccountFormOptions> {
  const scope = await getCurrentLocationScope();
  const centralCashAccount = await prisma.financeAccount.findFirst({
    where: {
      isActive: true,
      type: "CASH",
      locationId: null,
    },
    select: {
      id: true,
    },
  });

  return {
    locations: scope.locations,
    branches: scope.locations,
    cashLocationIds: centralCashAccount ? ["CENTRAL"] : [],
    cashBranchIds: centralCashAccount ? ["CENTRAL"] : [],
  };
}

export async function getActiveLocationOptions(): Promise<LocationOption[]> {
  const locations = await prisma.location.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      code: true,
      name: true,
    },
  });

  return locations;
}

async function getActiveProductOptions(): Promise<ProductOption[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      sku: true,
      unitId: true,
      unit: { select: { name: true } },
      buyingPrice: true,
      sellingPrice: true,
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    unitId: product.unitId,
    unitName: product.unit.name,
    buyingPrice: toNumber(product.buyingPrice),
    sellingPrice: toNumber(product.sellingPrice),
    defaultBuyingPrice: toNumber(product.buyingPrice),
    defaultSellingPrice: toNumber(product.sellingPrice),
  }));
}

async function getSaleLocationStockOptions(
  locationIds: string[],
): Promise<SaleLocationStockOption[]> {
  if (locationIds.length === 0) {
    return [];
  }

  // Directly query stock movements grouped by location+product — avoids the
  // expensive Cartesian-product approach in getStockSummaryRows.
  const movementTotals = await prisma.stockMovement.groupBy({
    by: ["locationId", "productId"],
    where: { locationId: { in: locationIds } },
    _sum: { quantity: true },
    having: { quantity: { _sum: { gt: 0 } } },
  });

  if (movementTotals.length === 0) {
    return [];
  }

  const productIdsInStock = [...new Set(movementTotals.map((m) => m.productId))];

  // Fetch product base prices only for products that actually have stock
  const products = await prisma.product.findMany({
    where: { id: { in: productIdsInStock }, isActive: true },
    select: {
      id: true,
      sellingPrice: true,
    },
  });
  const priceByProduct = new Map(
    products.map((p) => [p.id, {
      sellingPrice: toNumber(p.sellingPrice),
    }]),
  );

  // Fetch location-specific price overrides
  const locationPrices = await prisma.productLocationPrice.findMany({
    where: {
      locationId: { in: locationIds },
      productId: { in: productIdsInStock },
    },
    select: {
      productId: true,
      locationId: true,
      sellingPrice: true,
    },
  });
  const priceByLocationProduct = new Map(
    locationPrices.map((price) => [
      `${price.locationId}:${price.productId}`,
      {
        sellingPrice: toNumber(price.sellingPrice),
      },
    ]),
  );

  return movementTotals.map((row) => {
    const locationPrice = priceByLocationProduct.get(`${row.locationId}:${row.productId}`);
    const productPrice = priceByProduct.get(row.productId);
    return {
      locationId: row.locationId,
      productId: row.productId,
      availableQty: Number(row._sum?.quantity ?? 0),
      unitPrice: locationPrice?.sellingPrice ?? productPrice?.sellingPrice ?? 0,
      hasLocationPrice: Boolean(locationPrice),
    } satisfies SaleLocationStockOption;
  });
}

export async function getPurchaseFormOptions(): Promise<PurchaseFormOptions> {
  const scope = await getCurrentLocationScope();
  
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  
  const products = await getActiveProductOptions();
  
  const rawAccounts = await prisma.financeAccount.findMany({
    where: {
      isActive: true,
      OR: [{ locationId: null }, { locationId: { in: scope.locations.map(l => l.id) } }],
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      locationId: true,
      bankName: true,
      accountNumber: true,
      location: { select: { name: true } },
    },
  });

  const latestUsdRate = await prisma.exchangeRateHistory.findFirst({
    where: { currency: "USD" },
    orderBy: { recordedAt: "desc" },
    select: { rate: true },
  });

  return {
    locations: scope.locations,
    suppliers,
    products,
    accounts: rawAccounts.map((account) => toFinanceAccountOption(account)),
    latestUsdRate: latestUsdRate ? toNumber(latestUsdRate.rate) : 0,
  };
}

export async function getPurchaseInitialValues(
  purchaseId: string,
): Promise<(PurchaseFormInput & { purchaseNumber?: string }) | null> {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      supplierPayments: {
        include: {
          financeAccount: true,
        }
      },
    },
  });

  if (!purchase) return null;

  const paymentEntries = purchase.supplierPayments;

  return {
    id: purchase.id,
    locationId: purchase.locationId,
    supplierId: purchase.supplierId ?? "",
    purchasedAt: formatDateForInput(purchase.purchasedAt),
    note: purchase.note ?? "",
    isUsd: purchase.trackInUsd,
    exchangeRate: Number(purchase.exchangeRate || 0),
    paymentMethod: purchase.financeAccountId ? "CASH" : (paymentEntries.length > 0 ? "MIXED" : "CREDIT"),
    paymentAccountId: purchase.financeAccountId ?? "",
    settlementMode: purchase.paymentStatus === "PAID" ? "FULL" : (purchase.paymentStatus === "UNPAID" ? "UNPAID" : "PARTIAL"),
    amountPaid: Number(purchase.amountPaid),
    payments: paymentEntries.map(e => ({
      method: e.financeAccount.type as "CASH" | "BANK",
      amount: Number(e.amount),
      financeAccountId: e.financeAccountId!
    })),
    items: purchase.items.map((item) => {
      return {
        productId: item.productId,
        unitId: item.product.unitId,
        quantity: item.quantity,
        unitCost: Number(item.unitCost),
        sellingPrice: Number(item.sellingPrice),
      };
    }),
    purchaseNumber: purchase.purchaseNumber,
  };
}

export async function getSaleInitialValues(
  saleId: string,
): Promise<(SaleFormInput & { saleNumber?: string }) | null> {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      items: {
        include: {
          product: { select: { unitId: true } },
        },
      },
      customerPayments: {
        include: {
          financeAccount: true,
        }
      },
      cheques: true, // Note: Sale to Cheque is 1-to-many in schema but often used as 1-to-1
    },
  });

  if (!sale) return null;

  const cheque = sale.cheques[0]; // Take the first cheque if multiple exist


  // For settlement mode and payment method, we need to look at customer payments
  const paymentEntries = sale.customerPayments;
  
  let paymentMethod = sale.paymentMethod as "CASH" | "BANK" | "CREDIT" | "MIXED" | "CHEQUE";
  const settlementMode = sale.amountDue.eq(0) ? "FULL" : (sale.amountPaid.eq(0) ? "UNPAID" : "PARTIAL");

  return {
    id: sale.id,
    locationId: sale.locationId,
    customerId: sale.customerId ?? "",
    soldAt: formatDateForInput(sale.soldAt),
    note: sale.note ?? "",
    paymentMethod,
    financeAccountId: paymentEntries.length === 1 ? paymentEntries[0]!.financeAccountId! : "",
    settlementMode,
    amountPaid: Number(sale.amountPaid),
    discountType: (sale.discountType as "FIXED" | "PERCENTAGE" | "" | null) ?? "",
    discountRate: Number(sale.discountRate ?? 0),
    chequeNumber: cheque?.chequeNumber ?? "",
    bankName: cheque?.bankName ?? "",
    chequeDate: cheque?.chequeDate ? formatDateForInput(cheque.chequeDate) : "",
    depositableDate: cheque?.depositableDate ? formatDateForInput(cheque.depositableDate) : "",
    expiryDate: cheque?.expiryDate ? formatDateForInput(cheque.expiryDate) : "",
    payments: paymentEntries.map(e => ({
      method: e.financeAccount.type as "CASH" | "BANK",
      amount: Number(e.amount),
      financeAccountId: e.financeAccountId!
    })),
    items: sale.items.map((item) => {
      const totalUnits = Number(item.quantity);

      return {
        productId: item.productId,
        unitId: item.product.unitId,
        quantity: totalUnits,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
        discountRate: Number(item.discountRate ?? 0),
        discountType: (item.discountType as any) ?? "PER_QTY",
      };
    }),
    saleNumber: sale.saleNumber,
  };
}

export async function getSaleFormOptions(): Promise<SaleFormOptions> {
  const scope = await getCurrentLocationScope();
  const locationIds = scope.locations.map((loc) => loc.id);

  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    orderBy: [{ partyType: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      businessName: true,
      partyType: true,
      creditLimit: true,
      sales: {
        where: { status: "COMPLETED" },
        select: { amountDue: true },
      },
    },
  });

  const products = await getActiveProductOptions();
  const locationStock = await getSaleLocationStockOptions(locationIds);

  const rawAccounts = await prisma.financeAccount.findMany({
    where: {
      isActive: true,
      ...(locationIds.length > 0
        ? { OR: [{ locationId: null }, { locationId: { in: locationIds } }] }
        : { locationId: null }),
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      locationId: true,
      bankName: true,
      accountNumber: true,
      location: { select: { name: true } },
    },
  });

  const inStockProductIds = new Set(locationStock.map((item) => item.productId));
  const accounts = dedupeCashAccountsPerLocation(rawAccounts).sort((a, b) => {
    const locA = a.location?.name ?? "";
    const locB = b.location?.name ?? "";
    if (locA !== locB) return locA.localeCompare(locB);
    return a.name.localeCompare(b.name);
  });

  return {
    locations: scope.locations,
    customers: customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      businessName: customer.businessName,
      partyType: customer.partyType === "AGENT" ? "AGENT" : "CUSTOMER",
      creditLimit: toNumber(customer.creditLimit),
      creditBalance: customer.sales.reduce((sum, sale) => sum + toNumber(sale.amountDue), 0),
    })),
    products: products.filter((product) => inStockProductIds.has(product.id)),
    locationStock,
    accounts: rawAccounts.map((account) => toFinanceAccountOption(account)),
  };
}

export async function getUserFormOptions(): Promise<UserFormOptions> {
  const [locations, roles] = await Promise.all([
    getActiveLocationOptions(),
    getAssignableRoleOptions(),
  ]);

  return { locations, roles };
}

export async function getTransferFormOptions(): Promise<TransferFormOptions> {
  const scope = await getCurrentLocationScope();
  const locationIds = scope.locations.map((loc) => loc.id);
  const products = await getActiveProductOptions();
  const locationStock = await getSaleLocationStockOptions(locationIds);

  const inStockProductIds = new Set(locationStock.map((stock) => stock.productId));

  return {
    locations: scope.locations,
    products: products.filter((product) => inStockProductIds.has(product.id)),
    locationStock,
  };
}

export async function getCustomerPaymentFormOptions(
  customerId?: string,
  partyType?: "CUSTOMER" | "AGENT",
): Promise<CustomerPaymentFormOptions> {
  const scope = await getCurrentLocationScope();
  const activeLocationId = scope.activeLocationId;

  const customers = await prisma.customer.findMany({
    where: {
      isActive: true,
      ...(partyType ? { partyType } : {}),
      sales: {
        some: {
          amountDue: { gt: 0 },
          status: "COMPLETED",
        },
      },
      ...(customerId ? { id: customerId } : {}),
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const rawAccounts = await prisma.financeAccount.findMany({
    where: {
      isActive: true,
      OR: [{ locationId: null }, ...(activeLocationId ? [{ locationId: activeLocationId }] : [])],
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      locationId: true,
      bankName: true,
      accountNumber: true,
      location: { select: { name: true } },
    },
  });

  const outstandingSales = await prisma.sale.findMany({
    where: {
      status: "COMPLETED",
      amountDue: { gt: 0 },
      customerId: { not: null },
      ...(customerId ? { customerId } : {}),
      ...(partyType ? { customer: { partyType } } : {}),
    },
    orderBy: [{ soldAt: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      saleNumber: true,
      customerId: true,
      soldAt: true,
      total: true,
      amountPaid: true,
      amountDue: true,
      locationId: true,
      location: { select: { name: true } },
      customer: { select: { name: true, businessName: true } },
    },
  });
  return {
    customers,
    accounts: rawAccounts.map((account) => toFinanceAccountOption(account)),
    outstandingSales: outstandingSales
      .filter(
        (sale): sale is typeof sale & { customerId: string } => Boolean(sale.customerId),
      )
      .map(
        (sale) =>
          ({
            id: sale.id,
            saleNumber: sale.saleNumber,
            customerId: sale.customerId,
            customerName: sale.customer ? formatCustomerName(sale.customer) : "Unknown Customer",
            locationId: sale.locationId,
            locationName: sale.location.name,
            branchId: sale.locationId,
            branchName: sale.location.name,
            total: toNumber(sale.total),
            amountPaid: toNumber(sale.amountPaid),
            amountDue: toNumber(sale.amountDue),
            soldAt: sale.soldAt.toISOString(),
          }) satisfies OutstandingSaleOption,
      ),
  };
}

export async function getSupplierPaymentFormOptions(
  supplierId?: string,
): Promise<SupplierPaymentFormOptions> {
  const scope = await getCurrentLocationScope();
  const activeLocationId = scope.activeLocationId;

  const suppliers = await prisma.supplier.findMany({
    where: {
      isActive: true,
      purchases: {
        some: {
          amountDue: { gt: 0 },
          status: "POSTED",
        },
      },
      ...(supplierId ? { id: supplierId } : {}),
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const rawAccounts = await prisma.financeAccount.findMany({
    where: {
      isActive: true,
      OR: [{ locationId: null }, ...(activeLocationId ? [{ locationId: activeLocationId }] : [])],
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      locationId: true,
      bankName: true,
      accountNumber: true,
      location: { select: { name: true } },
    },
  });

  const outstandingPurchases = await prisma.purchase.findMany({
    where: {
      status: "POSTED",
      amountDue: { gt: 0 },
      ...(supplierId ? { supplierId } : { supplierId: { not: null } }),
    },
    orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        purchaseNumber: true,
        supplierId: true,
        amountDue: true,
        purchasedAt: true,
        locationId: true,
        trackInUsd: true,
        exchangeRate: true,
        location: { select: { name: true } },
        supplier: { select: { name: true } },
      },
    });
    return {
      suppliers,
      accounts: rawAccounts.map((account) => toFinanceAccountOption(account)),
      outstandingPurchases: outstandingPurchases.map(
        (purchase) =>
          ({
            id: purchase.id,
            purchaseNumber: purchase.purchaseNumber,
            supplierId: purchase.supplierId ?? "",
            supplierName: purchase.supplier?.name ?? "No supplier",
            locationId: purchase.locationId,
            locationName: purchase.location.name,
            branchId: purchase.locationId,
            branchName: purchase.location.name,
            amountDue: toNumber(purchase.amountDue),
            purchasedAt: purchase.purchasedAt.toISOString(),
            trackInUsd: purchase.trackInUsd,
            exchangeRate: toNumber(purchase.exchangeRate),
          }) satisfies OutstandingPurchaseOption,
      ),
    };
}

export async function getCashTransferFormOptions(): Promise<CashTransferFormOptions> {
  const scope = await getCurrentLocationScope();
  const locationIds = scope.locations.map((loc) => loc.id);

  if (locationIds.length === 0) {
    return { locations: scope.locations, branches: scope.locations, cashAccounts: [], bankAccounts: [] };
  }

  const accounts = await prisma.financeAccount.findMany({
    where: {
      isActive: true,
      OR: [{ locationId: null }, { locationId: { in: locationIds } }],
      type: { in: ["CASH", "BANK"] },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      locationId: true,
      bankName: true,
      accountNumber: true,
      location: { select: { name: true } },
      ledgerEntries: {
        select: { amount: true, direction: true },
      },
    },
  });

  const mappedAccounts = accounts.map((account) => toCashTransferAccountOption(account));

  return {
    locations: scope.locations,
    branches: scope.locations,
    cashAccounts: mappedAccounts.filter((account) => account.type === "CASH"),
    bankAccounts: mappedAccounts.filter((account) => account.type === "BANK"),
  };
}

export async function getExpenseFormOptions(): Promise<ExpenseFormOptions> {
  const scope = await getCurrentLocationScope();
  const locationIds = scope.locations.map((loc) => loc.id);

  if (locationIds.length === 0) {
    return { locations: scope.locations, branches: scope.locations, accounts: [], categoryNames: [] };
  }

  const rawAccounts = await prisma.financeAccount.findMany({
    where: {
      isActive: true,
      OR: [{ locationId: null }, { locationId: { in: locationIds } }],
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      locationId: true,
      bankName: true,
      accountNumber: true,
      location: { select: { name: true } },
    },
  });

  const categories = await prisma.expenseCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return {
    locations: scope.locations,
    branches: scope.locations,
    accounts: rawAccounts.map((account) => toFinanceAccountOption(account)),
    categoryNames: categories.map((category) => category.name),
  };
}