import { prisma } from "@/lib/prisma";
import { permissionsByRole } from "@/lib/rbac";
import { ensureDefaultRolesAndPermissions } from "@/lib/rbac-db";
import { formatFinanceAccountLabel } from "@/lib/finance-account-utils";
import type { RowActionConfig, SimpleRow } from "@/lib/table";
import type { LocationRow, MetricCard } from "@/lib/types";
import { getUserLoginLabel } from "@/lib/user-login";
import { ARCHIVED_USER_USERNAME_PREFIX } from "@/lib/user-archive";
import { sumRows, toNumber } from "@/lib/data-runtime-utils";
import { formatCurrency, parseFilterList } from "@/lib/utils";
import { startOfDay, startOfMonth, startOfWeek } from "date-fns";

type TablePageFilters = {
  locationId?: string;
  supplierId?: string;
  productId?: string;
  financeAccountId?: string;
  categoryId?: string;
  paymentStatus?: string;
  search?: string;
  status?: string;
  type?: string;
  accountType?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
};

function normalizeFilters(filters?: TablePageFilters | string): TablePageFilters {
  return typeof filters === "string" ? { locationId: filters } : filters ?? {};
}

function withFilter(path: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value);
  }
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

function createRowAction(action: RowActionConfig) {
  return action;
}

function idListWhere(values: string | string[] | undefined): any {
  if (!values) return undefined;
  const list = typeof values === "string" ? parseFilterList(values) : values;
  if (!list || list.length === 0) return undefined;
  return list.length === 1 ? list[0] : { in: list };
}

function getDateRangeFilter(filters: TablePageFilters | string) {
  filters = normalizeFilters(filters);
  const { dateFrom, dateTo } = filters;
  if (!dateFrom && !dateTo) return undefined;
  const range: { gte?: Date; lte?: Date } = {};
  if (dateFrom) {
    const d = new Date(dateFrom);
    if (!isNaN(d.getTime())) range.gte = d;
  }
  if (dateTo) {
    const d = new Date(dateTo);
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      range.lte = d;
    }
  }
  return Object.keys(range).length > 0 ? range : undefined;
}

export async function getPurchaseRows(filters: TablePageFilters | string = {}) {
  filters = normalizeFilters(filters);
  const { locationId, supplierId, productId, categoryId, search, status, paymentStatus, type } = filters;
  const purchasedAt = getDateRangeFilter(filters);

  const locationIds = parseFilterList(locationId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const where: any = {
    ...(supplierId ? { supplierId: idListWhere(supplierId) } : {}),
    ...locWhere,
    ...((status ?? paymentStatus) === "DUE"
      ? { paymentStatus: { in: ["UNPAID", "PARTIAL"] } }
      : status ?? paymentStatus
        ? { paymentStatus: status ?? paymentStatus }
        : {}),
    status: "POSTED",
    ...(type === "IMPORT" ? { trackInUsd: true } : {}),
    ...(productId || categoryId
      ? {
          items: {
            some: {
              product: {
                ...(productId ? { id: idListWhere(productId) } : {}),
                ...(categoryId ? { categoryId: idListWhere(categoryId) } : {}),
              },
            },
          },
        }
      : {}),
    ...(purchasedAt ? { purchasedAt } : {}),
    ...(search
      ? {
          OR: [
            { purchaseNumber: { contains: search, mode: "insensitive" } },
            { invoiceNumber: { contains: search, mode: "insensitive" } },
            { supplier: { name: { contains: search, mode: "insensitive" } } },
            { items: { some: { product: { name: { contains: search, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };

  const purchases = await prisma.purchase.findMany({
    where,
    orderBy: { purchasedAt: "desc" },
    include: {
      location: { select: { name: true } },
      supplier: { select: { name: true } },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          quantity: true,
          unitCost: true,
          lineTotal: true,
          product: { select: { name: true } },
        },
      },
    },
  });

  return purchases.map((purchase) => {
    const totalQuantity = sumRows(purchase.items.map((i) => Number(i.quantity)));
    return {
      id: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      location: purchase.location.name,
      supplier: purchase.supplier?.name ?? "No supplier",
      itemCount: purchase.items.length,
      totalQuantity,
      total: toNumber(purchase.total),
      amountDue: toNumber(purchase.amountDue),
      usdTotal: toNumber(purchase.usdTotal),
      usdAmountDue: Math.max(0, toNumber(purchase.usdTotal) - toNumber(purchase.usdAmountPaid)),
      trackInUsd: purchase.trackInUsd,
      paymentStatus: purchase.paymentStatus,
      purchasedAt: purchase.purchasedAt.toISOString(),
      __actions: [
        createRowAction({
          key: "view",
          label: "View",
          href: `/purchases/list/${purchase.id}`,
          icon: "view",
        }),
        ...(toNumber(purchase.amountDue) > 0
          ? [
              createRowAction({
                key: "settle",
                label: "Settle Payment",
                href: `/purchases/supplier-payments?supplierId=${purchase.supplierId}&purchaseId=${purchase.id}&open=1`,
                icon: "supplierPayments",
              }),
            ]
          : []),
        createRowAction({
          key: "edit",
          label: "Edit",
          href: `/purchases/new?purchaseId=${purchase.id}&mode=edit&open=1`,
          icon: "edit",
        }),
        createRowAction({
          key: "print",
          label: "Print",
          href: `/print/purchase/${purchase.id}`,
          icon: "print",
        }),
      ],
    } satisfies SimpleRow;
  });
}

export async function getSupplierRows(filters: TablePageFilters | string = {}) {
  filters = normalizeFilters(filters);
  const { locationId, search, status } = filters;

  const locationIds = parseFilterList(locationId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const where: any = {
    ...(status ? { isActive: status === "ACTIVE" } : { isActive: true }),
    ...(locationIds
      ? { purchases: { some: { ...locWhere, status: "POSTED" } } }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const suppliers = await prisma.supplier.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      isActive: true,
      purchases: {
        where: { 
          ...locWhere,
          status: "POSTED"
        },
        select: { 
          amountDue: true,
          usdTotal: true,
          usdAmountPaid: true,
          trackInUsd: true,
        },
      },
    },
  });

  return suppliers.map((supplier) => {
    const payableBalance = sumRows(supplier.purchases.map((p) => toNumber(p.amountDue)));
    const usdPayableBalance = sumRows(
      supplier.purchases
        .filter((p) => p.trackInUsd)
        .map((p) => toNumber(p.usdTotal) - toNumber(p.usdAmountPaid))
    );
    return {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone ?? "-",
      location: supplier.address ?? "-",
      payableBalance,
      usdPayableBalance,
      purchasesCount: supplier.purchases.length,
      status: supplier.isActive ? "ACTIVE" : "INACTIVE",
      __actions: [
        createRowAction({
          key: "settle",
          label: "Settle Payment",
          href: `/purchases/supplier-payments?supplierId=${supplier.id}&open=1`,
          icon: "supplierPayments",
        }),
        createRowAction({
          key: "view",
          label: "View Detail",
          href: `/purchases/suppliers/${supplier.id}`,
          icon: "view",
        }),
        createRowAction({
          key: "edit",
          label: "Edit",
          href: `/purchases/suppliers?supplierId=${supplier.id}&mode=edit&open=1`,
          icon: "edit",
        }),
        createRowAction({
          key: "delete",
          label: "Delete",
          href: `/purchases/suppliers?deleteSupplierId=${supplier.id}&delete=1`,
          icon: "trash",
          variant: "destructive",
          confirmMessage: `Are you sure you want to delete supplier "${supplier.name}"? This action cannot be undone.`,
        }),
      ],
    } satisfies SimpleRow;
  });
}

export async function getSupplierMetrics(supplierId: string, locationId?: string) {
  const locationIds = parseFilterList(locationId);
  const locationWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};
  const [purchaseStats, paymentStats, itemStats] = await Promise.all([
    prisma.purchase.aggregate({
      where: {
        supplierId,
        ...locationWhere,
        status: "POSTED",
      } as any,
      _sum: {
        total: true,
        amountPaid: true,
        amountDue: true,
        usdTotal: true,
        usdAmountPaid: true,
      },
      _count: {
        id: true,
      },
      _max: {
        purchasedAt: true,
      },
    }),
    prisma.supplierPayment.aggregate({
      where: {
        supplierId,
        ...locationWhere,
      } as any,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      _max: {
        paymentDate: true,
      },
    }),
    prisma.purchaseItem.aggregate({
      where: {
        purchase: {
          supplierId,
          ...locationWhere,
          status: "POSTED",
        },
      } as any,
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  return {
    totalPurchases: toNumber((purchaseStats as any)._sum?.total),
    totalPaid: toNumber((purchaseStats as any)._sum?.amountPaid),
    payableBalance: toNumber((purchaseStats as any)._sum?.amountDue),
    usdTotal: toNumber((purchaseStats as any)._sum?.usdTotal),
    usdPaid: toNumber((purchaseStats as any)._sum?.usdAmountPaid),
    usdPayable: Math.max(0, toNumber((purchaseStats as any)._sum?.usdTotal) - toNumber((purchaseStats as any)._sum?.usdAmountPaid)),
    purchaseCount: (purchaseStats as any)._count?.id ?? 0,
    paymentCount: (paymentStats as any)._count?.id ?? 0,
    totalPayments: toNumber((paymentStats as any)._sum?.amount),
    itemLines: (itemStats as any)._count?.id ?? 0,
    totalQuantity: toNumber((itemStats as any)._sum?.quantity),
    lastPurchaseAt: (purchaseStats as any)._max?.purchasedAt,
    lastPaymentAt: (paymentStats as any)._max?.paymentDate,
  };
}

export async function getSupplierPaymentRows(filters: TablePageFilters | string = {}) {
  filters = normalizeFilters(filters);
  const { locationId, supplierId, search, paymentMethod } = filters;
  const paymentDate = getDateRangeFilter(filters);

  const locationIds = parseFilterList(locationId);

  const where: any = {
    ...(supplierId ? { supplierId: idListWhere(supplierId) } : {}),
    ...(locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {}),
    ...(paymentMethod ? { financeAccountId: paymentMethod } : {}),
    ...(paymentDate ? { paymentDate } : {}),
    ...(search
      ? {
          OR: [
            { paymentNumber: { contains: search, mode: "insensitive" } },
            { supplier: { name: { contains: search, mode: "insensitive" } } },
            { purchase: { purchaseNumber: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const rows = await prisma.supplierPayment.findMany({
    where,
    orderBy: { paymentDate: "desc" },
    include: {
      supplier: { select: { name: true } },
      purchase: { select: { purchaseNumber: true } },
      location: { select: { name: true } },
      financeAccount: {
        select: {
          name: true,
          type: true,
          bankName: true,
          accountNumber: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    paymentNumber: row.paymentNumber,
    supplier: row.supplier.name,
    location: row.location.name,
    account: formatFinanceAccountLabel(row.financeAccount),
    amount: toNumber(row.amount),
    appliedTo: row.purchase?.purchaseNumber ?? "-",
    paidAt: row.paymentDate.toISOString(),
    status: "POSTED",
    __actions: [
      createRowAction({
        key: "view",
        label: "View Details",
        href: `/print/supplier-payment/${row.id}`,
        icon: "view",
      }),
      createRowAction({
        key: "print",
        label: "Print Voucher",
        href: `/print/supplier-payment/${row.id}`,
        icon: "print",
      }),
    ],
  })) satisfies SimpleRow[];
}

export async function getFinanceAccountRows(filters: TablePageFilters | string = {}) {
  filters = normalizeFilters(filters);
  const { locationId, search, type } = filters;

  const locationIds = parseFilterList(locationId);

  const where: any = {
    isActive: true,
    ...(locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {}),
    ...(type ? { type } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
            { bankName: { contains: search, mode: "insensitive" } },
            { accountNumber: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const rows = (await prisma.financeAccount.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      location: { select: { name: true } },
      ledgerEntries: {
        where: (locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {}) as any,
        select: { amount: true, direction: true },
      },
    },
  })) as any[];

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type,
    bankName: row.bankName ?? "-",
    accountNumber: row.accountNumber ?? "-",
    location: row.location?.name ?? "Central",
    balance: row.ledgerEntries.reduce((sum: number, entry: any) => {
      const amount = toNumber(entry.amount);
      return entry.direction === "DEBIT" ? sum + amount : sum - amount;
    }, 0),
    status: row.isActive ? "ACTIVE" : "INACTIVE",
    __actions: [
      createRowAction({
        key: "view",
        label: "View",
        href: `/finance/accounts/${row.id}`,
        icon: "view",
      }),
      createRowAction({
        key: "edit",
        label: "Edit",
        href: `/finance/accounts?editAccountId=${row.id}`,
        icon: "edit",
      }),
      createRowAction({
        key: "ledger",
        label: "Ledger",
        href: `/finance/ledger?financeAccountId=${row.id}`,
        icon: "ledger",
      }),
      createRowAction({
        key: "delete",
        label: "Delete",
        href: `/finance/accounts?deleteAccountId=${row.id}`,
        icon: "trash",
        variant: "destructive",
        confirmMessage: `Are you sure you want to delete account "${row.name}"? This cannot be undone.`,
      }),
    ],
  })) satisfies SimpleRow[];
}

export async function getCashAccountRows(filters?: TablePageFilters | string) {
  const { locationId } = normalizeFilters(filters);
  return getFinanceAccountRows(locationId ? { locationId, type: "CASH" } : { type: "CASH" });
}

export async function getCashTransferRows(filters: TablePageFilters | string = {}) {
  filters = normalizeFilters(filters);
  const { locationId, search, paymentMethod } = filters;
  const entryDate = getDateRangeFilter(filters);

  const locationIds = parseFilterList(locationId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const rows = await prisma.ledgerEntry.findMany({
    where: {
      entryType: "CASH_TRANSFER",
      ...(locationIds ? { OR: [locWhere, { locationId: null }] } : {}),
      ...(entryDate ? { entryDate } : {}),
      ...(paymentMethod ? { financeAccountId: paymentMethod } : {}),
      ...(search
        ? {
            OR: [
              { referenceId: { contains: search, mode: "insensitive" } },
              { location: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { entryDate: "desc" },
    include: {
      location: { select: { name: true } },
      financeAccount: {
        select: {
          name: true,
          type: true,
          bankName: true,
          accountNumber: true,
        },
      },
    },
  });

  // Group by referenceId to show one row per transfer
  const groupedRows: Record<string, typeof rows> = {};
  for (const row of rows) {
    if (!row.referenceId) continue;
    const group = groupedRows[row.referenceId] ?? [];
    group.push(row);
    groupedRows[row.referenceId] = group;
  }

  return Object.values(groupedRows).flatMap((entries) => {
    const debitEntry = entries.find((e) => e.direction === "DEBIT");
    const creditEntry = entries.find((e) => e.direction === "CREDIT");
    const mainEntry = debitEntry || creditEntry || entries[0];
    if (!mainEntry) return [];

    return [{
      id: mainEntry.referenceId ?? mainEntry.id,
      transferNumber: mainEntry.referenceId,
      fromAccount: creditEntry?.financeAccount ? formatFinanceAccountLabel(creditEntry.financeAccount) : "-",
      toAccount: debitEntry?.financeAccount ? formatFinanceAccountLabel(debitEntry.financeAccount) : "-",
      location: mainEntry.location?.name ?? "Global",
      amount: toNumber(mainEntry.amount),
      transferDate: mainEntry.entryDate.toISOString(),
      status: "POSTED",
    }];
  }) satisfies SimpleRow[];
}

export async function getExpenseRows(filters: TablePageFilters | string = {}) {
  filters = normalizeFilters(filters);
  const { locationId, categoryId, search, paymentMethod } = filters;
  const expenseDate = getDateRangeFilter(filters);

  const locationIds = parseFilterList(locationId);

  const where: any = {
    ...(locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {}),
    ...(categoryId ? { expenseCategoryId: categoryId } : {}),
    ...(paymentMethod ? { financeAccountId: paymentMethod } : {}),
    ...(expenseDate ? { expenseDate } : {}),
    status: "POSTED",
    ...(search
      ? {
          OR: [
            { expenseNumber: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { expenseCategory: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const rows = await prisma.expense.findMany({
    where,
    orderBy: { expenseDate: "desc" },
    include: {
      location: { select: { name: true } },
      financeAccount: {
        select: {
          name: true,
          type: true,
          bankName: true,
          accountNumber: true,
        },
      },
      expenseCategory: { select: { name: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    expenseNumber: row.expenseNumber,
    location: row.location.name,
    category: row.expenseCategory.name,
    name: row.name,
    account: formatFinanceAccountLabel(row.financeAccount),
    amount: toNumber(row.amount),
    expenseDate: row.expenseDate.toISOString(),
    __actions: [
      {
        key: "view",
        label: "View",
        href: `/finance/expenses/${row.id}`,
        icon: "view",
      },
    ],
  })) satisfies SimpleRow[];
}

export async function getExpenseCategorySummaryRows(filters: TablePageFilters | string = {}) {
  filters = normalizeFilters(filters);
  const expenseDate = getDateRangeFilter(filters);
  const { locationId } = filters;
  const locationIds = parseFilterList(locationId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const rows = await prisma.expense.findMany({
    where: {
      ...(locationIds ? locWhere : {}),
      ...(expenseDate ? { expenseDate } : {}),
      status: "POSTED",
    },
    include: {
      expenseCategory: { select: { name: true } },
      location: { select: { name: true } },
    },
  });

  const summary = new Map<string, any>();

  for (const row of rows) {
    const key = `${row.locationId}:${row.expenseCategoryId}`;
    const existing = summary.get(key) ?? {
      id: key,
      category: row.expenseCategory.name,
      location: row.location.name,
      entries: 0,
      totalAmount: 0,
      lastExpenseAt: row.expenseDate.toISOString(),
    };
    existing.entries += 1;
    existing.totalAmount = Number((existing.totalAmount + toNumber(row.amount)).toFixed(2));
    if (row.expenseDate.toISOString() > existing.lastExpenseAt) {
      existing.lastExpenseAt = row.expenseDate.toISOString();
    }
    summary.set(key, existing);
  }

  return [...summary.values()].sort((a, b) => b.totalAmount - a.totalAmount);
}

export async function getExpenseKpis(locationId?: string): Promise<MetricCard[]> {
  const locationIds = parseFilterList(locationId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const rows = await prisma.expense.findMany({
    where: { 
      ...(locationIds ? locWhere : {}),
      status: "POSTED",
    },
    select: {
      amount: true,
      expenseDate: true,
      expenseCategory: { select: { name: true } },
    },
  });

  const now = new Date();
  const dayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const totalToday = sumRows(rows.filter((r) => r.expenseDate >= dayStart).map((r) => toNumber(r.amount)));
  const totalWeek = sumRows(rows.filter((r) => r.expenseDate >= weekStart).map((r) => toNumber(r.amount)));
  const totalMonth = sumRows(rows.filter((r) => r.expenseDate >= monthStart).map((r) => toNumber(r.amount)));

  const categoryTotals = new Map<string, number>();
  for (const row of rows) {
    const current = categoryTotals.get(row.expenseCategory.name) ?? 0;
    categoryTotals.set(row.expenseCategory.name, Number((current + toNumber(row.amount)).toFixed(2)));
  }

  const topCategory = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;

  return [
    { title: "Today", value: formatCurrency(totalToday) },
    { title: "This Week", value: formatCurrency(totalWeek) },
    { title: "This Month", value: formatCurrency(totalMonth) },
    {
      title: "Top Category",
      value: topCategory?.[0] ?? "No expenses",
      ...(topCategory ? { meta: formatCurrency(topCategory[1]) } : {}),
    },
  ];
}

export async function getLedgerRows(filters: TablePageFilters | string = {}) {
  filters = normalizeFilters(filters);
  const { locationId, search, type, paymentMethod, financeAccountId, accountType } = filters;
  const entryDate = getDateRangeFilter(filters);

  const locationIds = parseFilterList(locationId);

  const where: any = {
    ...(locationIds ? { OR: [{ locationId: null }, { locationId: { in: locationIds } }] } : {}),
    ...(paymentMethod || financeAccountId ? { financeAccountId: paymentMethod ?? financeAccountId } : {}),
    ...(accountType ? { financeAccount: { type: accountType } } : {}),
    ...(type ? { entryType: type as never } : {}),
    ...(entryDate ? { entryDate } : {}),
    ...(search
      ? {
          OR: [
            { referenceId: { contains: search, mode: "insensitive" } },
            { financeAccount: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const rows = await prisma.ledgerEntry.findMany({
    where,
    orderBy: { entryDate: "desc" },
    include: {
      location: { select: { name: true } },
      financeAccount: {
        select: {
          name: true,
          type: true,
          bankName: true,
          accountNumber: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    entryDate: row.entryDate.toISOString(),
    location: row.location?.name ?? "Global",
    account: row.financeAccount ? formatFinanceAccountLabel(row.financeAccount) : "-",
    type: row.entryType,
    direction: row.direction,
    amount: toNumber(row.amount),
    reference: row.referenceId,
  })) satisfies SimpleRow[];
}

export async function getUserRows(filters: TablePageFilters | string = {}) {
  filters = normalizeFilters(filters);
  const { search, status } = filters;

  const where: any = {
    NOT: { username: { startsWith: ARCHIVED_USER_USERNAME_PREFIX } },
    ...(status ? { isActive: status === "ACTIVE" } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const rows = await prisma.user.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      roleRecord: { select: { name: true } },
      isActive: true,
      email: true,
      phone: true,
      defaultLocation: { select: { name: true } },
      locationAssignments: {
        where: { isActive: true },
        select: { location: { select: { name: true } } },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    username: getUserLoginLabel(row),
    role: row.roleRecord?.name ?? row.role,
    defaultLocation: row.defaultLocation?.name ?? "-",
    locations: row.locationAssignments
      .map((a) => a.location.name)
      .sort((a, b) => a.localeCompare(b))
      .join(", ") || "-",
    status: row.isActive ? "ACTIVE" : "INACTIVE",
  })) satisfies SimpleRow[];
}

export async function getRoleRows() {
  const hasRoleTables = await ensureDefaultRolesAndPermissions();

  const users = await prisma.user.groupBy({
    by: ["role"],
    where: {
      NOT: { username: { startsWith: ARCHIVED_USER_USERNAME_PREFIX } },
    },
    _count: {
      _all: true,
    },
  });

  const counts = new Map(users.map((row) => [row.role, row._count._all]));

  if (!hasRoleTables) {
    return Object.entries(permissionsByRole).map(([code, permissionKeys]) => ({
      id: code,
      role: code
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1).toLowerCase()}`)
        .join(" "),
      code,
      userCount: counts.get(code) ?? 0,
      scope: `${permissionKeys.length} permission${permissionKeys.length === 1 ? "" : "s"}`,
      isSystem: true,
      permissions: permissionKeys.join(", "),
      status: "ACTIVE",
    })) satisfies SimpleRow[];
  }

  const roles = await prisma.role.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      isActive: true,
      isSystem: true,
      permissions: {
        select: {
          permission: { select: { label: true } },
        },
      },
    },
  });

  return roles.map((role) => ({
    id: role.id,
    role: role.name,
    code: role.code,
    isSystem: role.isSystem,
    userCount: counts.get(role.code) ?? 0,
    scope: role.description || `${role.permissions.length} permission${role.permissions.length === 1 ? "" : "s"}`,
    permissions: role.permissions.map((row) => row.permission.label).join(", ") || "-",
    status: role.isActive ? "ACTIVE" : "INACTIVE",
  })) satisfies SimpleRow[];
}

export async function getLocationRows(): Promise<LocationRow[]> {
  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
      location: true,
      isActive: true,
    },
  });

  return locations.map((location) => ({
    id: location.id,
    code: location.code,
    name: location.name,
    type: location.type,
    location: location.location ?? "-",
    stockValue: 0,
    status: location.isActive ? "ACTIVE" : "INACTIVE",
  }));
}

export async function getAuditLogRows(filters: TablePageFilters | string = {}) {
  filters = normalizeFilters(filters);
  const { locationId, search } = filters;
  const createdAt = getDateRangeFilter(filters);
  const locationIds = parseFilterList(locationId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const where: any = {
    ...(locationIds ? locWhere : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(search
      ? {
          OR: [
            { action: { contains: search, mode: "insensitive" } },
            { entityType: { contains: search, mode: "insensitive" } },
            { entityId: { contains: search, mode: "insensitive" } },
            { actor: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { name: true, displayName: true } },
      location: { select: { name: true } },
    },
  });

  return rows.map((row) => {
    const before = row.before && typeof row.before === "object" && !Array.isArray(row.before) ? row.before as Record<string, unknown> : {};
    const after = row.after && typeof row.after === "object" && !Array.isArray(row.after) ? row.after as Record<string, unknown> : {};

    return {
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      actor: row.actor?.displayName ?? row.actor?.name ?? "System",
      location: row.location?.name ?? "-",
      beforeQuantity: typeof before.quantity === "number" ? before.quantity : undefined,
      afterQuantity: typeof after.quantity === "number" ? after.quantity : undefined,
      adjustmentQuantity: typeof after.adjustmentQuantity === "number" ? after.adjustmentQuantity : undefined,
      reason: typeof after.reason === "string" ? after.reason : undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }) satisfies SimpleRow[];
}

export async function getExpenseCategoryRows(): Promise<SimpleRow[]> {
  const categories = await prisma.expenseCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { expenses: true } } },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    expenseCount: cat._count.expenses,
    status: cat.isActive ? 'ACTIVE' : 'INACTIVE',
    __actions: [
      createRowAction({
        key: 'edit',
        label: 'Edit',
        icon: 'edit',
        href: '?' + new URLSearchParams({ open: '1', id: cat.id }).toString(),
      }),
    ],
  }));
}
export async function getPurchasedItemRows(filters: any): Promise<SimpleRow[]> {
  const { locationId, supplierId, productId, categoryId, search, dateFrom, dateTo } = filters;
  const locationIds = parseFilterList(locationId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const where: any = {
    purchase: {
      status: "POSTED",
      ...(locationIds ? locWhere : {}),
      ...(supplierId ? { supplierId: idListWhere(supplierId) } : {}),
      ...(dateFrom || dateTo
        ? {
            purchasedAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    },
    ...(productId || categoryId || search
      ? {
            product: {
              ...(productId ? { id: idListWhere(productId) } : {}),
              ...(categoryId ? { categoryId: idListWhere(categoryId) } : {}),
            ...(search
              ? {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { category: { name: { contains: search, mode: "insensitive" } } },
                  ],
                }
              : {}),
          },
        }
      : {}),
  };

  const purchaseItems = await prisma.purchaseItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { 
        select: { 
          name: true,
          unit: { select: { name: true } },
        } 
      },
      purchase: {
        select: {
          purchaseNumber: true,
          purchasedAt: true,
          supplier: { select: { name: true } },
          location: { select: { name: true } },
          trackInUsd: true,
          exchangeRate: true,
        },
      },
    },
  });

  return purchaseItems.map((item) => {
    const qty = Number(item.quantity);
    const trackInUsd = item.purchase.trackInUsd;
    const rate = Number(item.purchase.exchangeRate || 1);
    const unitCost = toNumber(item.unitCost);
    const lineTotal = toNumber(item.lineTotal);

    const unitPriceValue = unitCost;
    const unitName = item.product.unit.name;

    return {
      id: item.id,
      purchaseNumber: item.purchase.purchaseNumber,
      location: item.purchase.location.name,
      product: item.product.name,
      quantity: qty,
      supplier: item.purchase.supplier?.name ?? "No supplier",
      unitPrice: `ETB ${unitPriceValue.toLocaleString()} / ${unitName}`,
      total: lineTotal,
      unitCostUsd: trackInUsd ? unitCost / rate : 0,
      totalUsd: trackInUsd ? lineTotal / rate : 0,
      trackInUsd,
      purchasedAt: item.purchase.purchasedAt.toISOString(),
    };
  });
}
export async function getChequeRows(filters: TablePageFilters | string = {}) {
  filters = normalizeFilters(filters);
  const { locationId, search, status } = filters;
  const chequeDate = getDateRangeFilter(filters);

  const locationIds = parseFilterList(locationId);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(todayStart);
  sevenDaysLater.setDate(todayStart.getDate() + 7);

  const where: any = {
    ...(locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {}),
    ...(status === "DUE_SOON" 
      ? { status: "PENDING", depositableDate: { gte: todayStart, lte: sevenDaysLater } }
      : status === "OVERDUE"
      ? { status: "PENDING", depositableDate: { lt: todayStart } }
      : status 
      ? { status: status as any } 
      : {}),
    ...(chequeDate ? { depositableDate: chequeDate } : {}),
    ...(search
      ? {
          OR: [
            { chequeNumber: { contains: search, mode: "insensitive" } },
            { bankName: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const cheques = await prisma.cheque.findMany({
    where,
    orderBy: { depositableDate: "asc" },
    include: {
      customer: { select: { name: true } },
      location: { select: { name: true } },
      financeAccount: { select: { name: true } },
      sale: {
        include: {
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  return cheques.map((cheque) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const depDate = new Date(cheque.depositableDate);
    depDate.setHours(0, 0, 0, 0);
    const diffTime = depDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let displayStatus = cheque.status;
    if (cheque.status === "PENDING") {
      if (daysLeft < 0) displayStatus = "OVERDUE" as any;
      else if (daysLeft <= 7) displayStatus = "DUE_SOON" as any;
    }

    const saleItemSummary = cheque.sale?.items
      .map((item) => `${item.product.name} (${item.quantity})`)
      .join(", ") || "No items";

    return {
      id: cheque.id,
      chequeNumber: cheque.chequeNumber,
      bankName: cheque.bankName,
      amount: toNumber(cheque.amount),
      customer: cheque.customer.name,
      location: cheque.location.name,
      chequeDate: cheque.chequeDate.toISOString(),
      depositableDate: cheque.depositableDate.toISOString(),
      expiryDate: cheque.expiryDate?.toISOString() ?? "-",
      clearedDate: cheque.clearedDate?.toISOString() ?? "-",
      daysLeft: displayStatus === "CLEARED" || displayStatus === "CANCELLED" || displayStatus === "BOUNCED" ? "-" : daysLeft.toString(),
      saleItemSummary,
      status: displayStatus,
      account: cheque.financeAccount?.name ?? "-",
    __actions: [
      ...(cheque.status === "PENDING"
        ? [
            createRowAction({
              key: "clear",
              label: "Clear Cheque",
              href: `/finance/cheques?clearChequeId=${cheque.id}&open=1`,
              icon: "finance",
              showLabel: true,
            }),
            createRowAction({
              key: "bounce",
              label: "Reject",
              href: `/finance/cheques?bounceChequeId=${cheque.id}&open=1`,
              icon: "alertRecords",
              showLabel: true,
              confirmMessage: `Mark cheque ${cheque.chequeNumber} as bounced/rejected? This records a returned cheque and cannot be undone.`,
            }),
          ]
        : []),
      createRowAction({
        key: "cancel",
        label: "Cancel",
        href: `/finance/cheques?cancelChequeId=${cheque.id}&open=1`,
        icon: "trash",
        variant: "destructive",
        showLabel: true,
        confirmMessage: `Cancel cheque ${cheque.chequeNumber}? This marks the cheque as cancelled and cannot be undone.`,
      }),
    ],
    };
  }) satisfies SimpleRow[];
}