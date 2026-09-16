import { endOfDay, parseISO } from "date-fns";

import { formatFinanceAccountLabel } from "@/lib/finance-account-utils";
import { prisma } from "@/lib/prisma";
import type { RowActionConfig, SimpleRow } from "@/lib/table";
import { toNumber, sumRows } from "@/lib/data-runtime-utils";
import { formatCustomerName, parseFilterList } from "@/lib/utils";

type SalesFilters = {
  customerId?: string;
  locationId?: string;
  productId?: string;
  categoryId?: string;
  brandId?: string;
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  search?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
};

function getSoldAtRangeFilter(filters: Pick<SalesFilters, "dateFrom" | "dateTo">) {
  if (!filters.dateFrom && !filters.dateTo) {
    return undefined;
  }

  const soldAt: {
    gte?: Date;
    lte?: Date;
  } = {};

  if (filters.dateFrom) {
    const parsedDate = parseISO(filters.dateFrom);

    if (!Number.isNaN(parsedDate.getTime())) {
      soldAt.gte = parsedDate;
    }
  }

  if (filters.dateTo) {
    const parsedDate = parseISO(filters.dateTo);

    if (!Number.isNaN(parsedDate.getTime())) {
      soldAt.lte = endOfDay(parsedDate);
    }
  }

  return Object.keys(soldAt).length > 0 ? soldAt : undefined;
}

function createRowAction(action: RowActionConfig) {
  return action;
}

function idListWhere(values: string[] | null | undefined) {
  if (!values) return undefined;
  return values.length === 1 ? values[0] : { in: values };
}

function withFilter(path: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}



export async function getCustomerMetrics(customerId: string, locationId?: string) {
  const stats = await prisma.sale.aggregate({
    where: {
      customerId,
      ...(locationId ? { locationId } : {}),
      status: "COMPLETED",
    },
    _sum: {
      total: true,
      amountPaid: true,
      amountDue: true,
    },
    _max: {
      soldAt: true,
    },
  });

  return {
    totalPurchases: toNumber(stats._sum.total),
    totalPaid: toNumber(stats._sum.amountPaid),
    creditBalance: toNumber(stats._sum.amountDue),
    lastPurchaseAt: stats._max.soldAt,
  };
}

export async function getSalesRows(filters: SalesFilters = {}) {
  const {
    locationId,
    customerId,
    productId,
    categoryId,
    brandId,
    companyId,
    type,
    search,
    status,
    paymentStatus,
    paymentMethod,
  } = filters;
  const soldAt = getSoldAtRangeFilter(filters);

  const locationIds = parseFilterList(locationId);
  const customerIds = parseFilterList(customerId);
  const productIds = parseFilterList(productId);
  const categoryIds = parseFilterList(categoryId);
  const brandIds = parseFilterList(brandId);
  const companyIds = parseFilterList(companyId);

  const where: any = {
    ...(customerIds ? { customerId: idListWhere(customerIds) } : {}),
    ...(locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {}),
    ...(soldAt ? { soldAt } : {}),
    ...(status
      ? { status: status as any }
      : { status: { in: ["COMPLETED", "PARTIALLY_RETURNED", "RETURNED", "PARTIALLY_EXCHANGED", "EXCHANGED", "VOIDED"] } }),
    ...(type === "WALK_IN" ? { customerId: null } : {}),
    ...(paymentStatus ? { paymentStatus: paymentStatus as any } : {}),
    ...(paymentMethod ? { paymentMethod: paymentMethod as any } : {}),
    ...(productIds || categoryIds || brandIds || companyIds
      ? {
          items: {
            some: {
              product: {
                ...(productIds ? { id: idListWhere(productIds) } : {}),
                ...(categoryIds ? { categoryId: idListWhere(categoryIds) } : {}),
                ...(brandIds ? { brandId: idListWhere(brandIds) } : {}),
                ...(companyIds ? { companyId: idListWhere(companyIds) } : {}),
              },
            },
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { saleNumber: { contains: search, mode: "insensitive" } },
            { voucherCode: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { customer: { businessName: { contains: search, mode: "insensitive" } } },
            { customer: { phone: { contains: search, mode: "insensitive" } } },
            { items: { some: { product: { name: { contains: search, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };

  const sales = await prisma.sale.findMany({
    where,
    orderBy: { soldAt: "desc" },
    include: {
      location: { select: { name: true } },
      customer: { select: { name: true, businessName: true } },
      _count: {
        select: { deliveryOrders: true }
      }
    },
  });

  return sales.map((sale) => ({
    id: sale.id,
    saleNumber: sale.saleNumber,
    status: sale.status,
    location: sale.location.name,
    customer: sale.customer ? formatCustomerName(sale.customer) : "Walk-in",
    paymentMethod: sale.paymentMethod,
    discountTotal: toNumber(sale.discountTotal),
    total: toNumber(sale.total),
    amountDue: toNumber(sale.amountDue),
    soldAt: sale.soldAt.toISOString(),
    __actions: [
      createRowAction({
        key: "view",
        label: "View",
        href: `/sales/sales-list/${sale.id}`,
        icon: "view",
      }),
      ...(toNumber(sale.amountDue) > 0 && sale.customerId
        ? [
            createRowAction({
              key: "settle",
              label: "Settle Credit",
              href: `/sales/customer-payments?customerId=${sale.customerId}&saleId=${sale.id}&open=1`,
              icon: "customerPayments",
            }),
          ]
        : []),
      ...(sale._count.deliveryOrders > 0
        ? [
            createRowAction({
              key: "do-created",
              label: "D.O Created",
              href: "#",
              icon: "truck",
              variant: "outline",
              showLabel: true,
            })
          ]
        : [
            createRowAction({
              key: "do",
              label: "Create D.O",
              href: `/sales/sales-list?saleId=${sale.id}&saleNumber=${sale.saleNumber}&do=1`,
              icon: "truck",
            })
          ]),
      createRowAction({
        key: "print",
        label: "Print",
        href: `/print/sale/${sale.id}`,  
        icon: "print",
      }),
    ],
  })) satisfies SimpleRow[];
}

export async function getSoldItemRows(filters: SalesFilters & { categoryId?: string; brandId?: string; companyId?: string } = {}) {
  const { locationId, customerId, productId, categoryId, brandId, companyId, search } = filters;
  const soldAt = getSoldAtRangeFilter(filters);

  const locationIds = parseFilterList(locationId);
  const customerIds = parseFilterList(customerId);
  const productIds = parseFilterList(productId);
  const categoryIds = parseFilterList(categoryId);
  const brandIds = parseFilterList(brandId);
  const companyIds = parseFilterList(companyId);

  const where: any = {
    ...(locationIds || customerIds || soldAt
      ? {
          sale: {
            ...(locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {}),
            ...(customerIds ? { customerId: idListWhere(customerIds) } : {}),
            ...(soldAt ? { soldAt } : {}),
            status: "COMPLETED",
          },
        }
      : { sale: { status: "COMPLETED" } }),
    ...(productIds || categoryIds || brandIds || companyIds || search
      ? {
          product: {
            ...(productIds ? { id: idListWhere(productIds) } : {}),
            ...(categoryIds ? { categoryId: idListWhere(categoryIds) } : {}),
            ...(brandIds ? { brandId: idListWhere(brandIds) } : {}),
            ...(companyIds ? { companyId: idListWhere(companyIds) } : {}),
            ...(search
              ? {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { category: { name: { contains: search, mode: "insensitive" } } },
                    { brand: { name: { contains: search, mode: "insensitive" } } },
                  ],
                }
              : {}),
          },
        }
      : {}),
  };

  const saleItems = await prisma.saleItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { 
        select: { 
          name: true, 
          unit: { select: { name: true } },
          company: { select: { name: true } },
        } 
      },
      sale: {
        select: {
          saleNumber: true,
          soldAt: true,
          customer: { select: { name: true, businessName: true } },
          location: { select: { name: true } },
        },
      },
    },
  });

  return saleItems.map((saleItem) => {
    const qty = saleItem.quantity;
    const unitPriceValue = toNumber(saleItem.unitPrice);
    const unitName = saleItem.product.unit.name;
    const discountRate = toNumber(saleItem.discountRate ?? 0);
    const discountType = saleItem.discountType === "PER_QTY"
      ? `${discountRate.toLocaleString()} / qty`
      : saleItem.discountType === "FIXED"
        ? `Fixed ${discountRate.toLocaleString()}`
        : saleItem.discountType === "PERCENTAGE"
          ? `${discountRate.toLocaleString()}%`
          : "-";

    return {
      id: saleItem.id,
      saleNumber: saleItem.sale.saleNumber,
      location: saleItem.sale.location.name,
      product: saleItem.product.name,
      company: saleItem.product.company?.name ?? "-",
      quantity: toNumber(saleItem.quantity),
      customer: saleItem.sale.customer ? formatCustomerName(saleItem.sale.customer) : "Walk-in",
      unitPrice: `ETB ${unitPriceValue.toLocaleString()} / ${unitName}`,
      discountType,
      discountTotal: toNumber(saleItem.discount) * toNumber(saleItem.quantity),
      total: toNumber(saleItem.lineTotal),
      soldAt: saleItem.sale.soldAt.toISOString(),
    } satisfies SimpleRow;
  });
}

export async function getSalesProfitRows(filters: SalesFilters = {}) {
  const { locationId, productId, categoryId, brandId, companyId, search } = filters;
  const soldAt = getSoldAtRangeFilter(filters);

  const locationIds = parseFilterList(locationId);
  const productIds = parseFilterList(productId);
  const categoryIds = parseFilterList(categoryId);
  const brandIds = parseFilterList(brandId);
  const companyIds = parseFilterList(companyId);

  const where: any = {
    sale: {
      ...(locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {}),
      ...(soldAt ? { soldAt } : {}),
      status: "COMPLETED",
      ...(search
        ? {
            OR: [
              { saleNumber: { contains: search, mode: "insensitive" } },
              { customer: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    ...(productIds || categoryIds || brandIds || companyIds || search
      ? {
          product: {
            ...(productIds ? { id: idListWhere(productIds) } : {}),
            ...(categoryIds ? { categoryId: idListWhere(categoryIds) } : {}),
            ...(brandIds ? { brandId: idListWhere(brandIds) } : {}),
            ...(companyIds ? { companyId: idListWhere(companyIds) } : {}),
            ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
          },
        }
      : {}),
  };

  const saleItems = await prisma.saleItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, buyingPrice: true, company: { select: { name: true } } } },
      sale: {
        select: {
          saleNumber: true,
          soldAt: true,
          location: { select: { name: true } },
        },
      },
    },
  });

  return saleItems.map((saleItem) => {
    const costTotal = Number((toNumber(saleItem.product.buyingPrice) * saleItem.quantity).toFixed(2));
    const saleTotal = toNumber(saleItem.lineTotal);
    const grossProfit = Number((saleTotal - costTotal).toFixed(2));

    return {
      id: saleItem.id,
      soldAt: saleItem.sale.soldAt.toISOString(),
      saleNumber: saleItem.sale.saleNumber,
      location: saleItem.sale.location.name,
      product: saleItem.product.name,
      company: saleItem.product.company?.name ?? "-",
      quantity: saleItem.quantity,
      saleTotal,
      costTotal,
      grossProfit,
    } satisfies SimpleRow;
  });
}

export async function getCustomerRows(filters: SalesFilters = {}) {
  const { locationId, customerId, search, status, type } = filters;

  const locationIds = parseFilterList(locationId);
  const locWhere: any = locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {};

  const where: any = {
    ...(status ? { isActive: status === "ACTIVE" } : { isActive: true }),
    ...(type === "AGENT" || type === "CUSTOMER" ? { partyType: type } : {}),
    ...(customerId ? { id: idListWhere(parseFilterList(customerId)) } : {}),
    ...(locationIds && !customerId
      ? { sales: { some: { ...locWhere, status: "COMPLETED" } } }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { businessName: { contains: search, mode: "insensitive" } },
            { tinNumber: { contains: search, mode: "insensitive" } },
            { contactPerson: { contains: search, mode: "insensitive" } },
            { contactPhone: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      businessName: true,
      tinNumber: true,
      contactPerson: true,
      contactPhone: true,
      phone: true,
      address: true,
      partyType: true,
      creditLimit: true,
      isActive: true,
      sales: {
        where: { 
          ...locWhere,
          status: "COMPLETED"
        },
        select: {
          total: true,
          amountDue: true,
          soldAt: true,
        },
      },
    },
  });

  return customers.map((customer) => {
    const totalPurchases = sumRows(customer.sales.map((sale) => toNumber(sale.total)));
    const creditBalance = sumRows(customer.sales.map((sale) => toNumber(sale.amountDue)));
    const lastSale = customer.sales
      .map((sale) => sale.soldAt)
      .sort((left, right) => right.getTime() - left.getTime())[0];

    const creditLimit = toNumber(customer.creditLimit);
    const availableCredit = Number((creditLimit - creditBalance).toFixed(2));

    return {
      id: customer.id,
      name: formatCustomerName(customer),
      partyType: customer.partyType === "AGENT" ? "AGENT" : "CUSTOMER",
      businessName: customer.businessName ?? "-",
      tinNumber: customer.tinNumber ?? "-",
      contactPerson: customer.contactPerson ?? "-",
      contactPhone: customer.contactPhone ?? "-",
      phone: customer.phone ?? "-",
      location: customer.address ?? "-",
      totalPurchases,
      creditBalance,
      creditLimit,
      availableCredit,
      lastPurchaseAt: lastSale?.toISOString() ?? "",
      status: customer.isActive ? "ACTIVE" : "INACTIVE",
      __actions: [
        createRowAction({
          key: "settle",
          label: "Settle Credit",
          href: `/sales/customer-payments?customerId=${customer.id}&open=1`,
          icon: "customerPayments",
          showLabel: true,
        }),
        createRowAction({
          key: "view",
          label: "View Detail",
          href: `/sales/customers/${customer.id}`,
          icon: "view",
        }),
        createRowAction({
          key: "edit",
          label: "Edit",
          href: `/sales/customers?customerId=${customer.id}&mode=edit&open=1`,
          icon: "edit",
        }),
        createRowAction({
          key: "delete",
          label: "Delete",
          href: `/sales/customers?deleteCustomerId=${customer.id}&delete=1`,
          icon: "trash",
          variant: "destructive",
          confirmMessage: `Delete customer "${customer.name}"? This cannot be undone and may affect related records.`,
        }),
      ],
    } satisfies SimpleRow;
  });
}

export async function getCustomerCreditRows(filters: SalesFilters = {}) {
  const customers = await getCustomerRows(filters);

  return customers
    .filter((customer) => toNumber(customer.creditBalance) > 0)
    .map((customer) => ({
      id: customer.id,
      customer: String(customer.name),
      partyType: String(customer.partyType ?? "CUSTOMER"),
      phone: String(customer.phone),
      outstanding: toNumber(customer.creditBalance),
      creditLimit: toNumber(customer.creditLimit),
      availableCredit: toNumber(customer.availableCredit),
      agingBucket: customer.lastPurchaseAt ? "OUTSTANDING" : "CURRENT",
      lastPurchaseAt: String(customer.lastPurchaseAt),
      status: String(customer.status),
      __actions: customer.__actions,
    })) satisfies SimpleRow[];
}

export async function getCustomerPaymentRows(filters: SalesFilters = {}) {
  const { locationId, customerId, search, paymentMethod, dateFrom, dateTo } = filters;

  const locationIds = parseFilterList(locationId);

  const where: any = {
    ...(customerId ? { customerId: idListWhere(parseFilterList(customerId)) } : {}),
    ...(locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {}),
    ...(paymentMethod ? { financeAccountId: paymentMethod } : {}),
    ...(dateFrom || dateTo
      ? {
          paymentDate: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { paymentNumber: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { sale: { saleNumber: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const rows = await prisma.customerPayment.findMany({
    where,
    orderBy: { paymentDate: "desc" },
    include: {
      customer: { select: { name: true, businessName: true } },
      sale: { select: { saleNumber: true } },
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
    receiptNumber: row.paymentNumber,
    customer: formatCustomerName(row.customer),
    location: row.location.name,
    paymentMethod: formatFinanceAccountLabel(row.financeAccount),
    amount: toNumber(row.amount),
    appliedTo: row.sale?.saleNumber ?? "-",
    paidAt: row.paymentDate.toISOString(),
    status: "POSTED",
    __actions: [
      createRowAction({
        key: "view",
        label: "View Details",
        href: `/print/customer-payment/${row.id}`,
        icon: "view",
      }),
      createRowAction({
        key: "print",
        label: "Print Voucher",
        href: `/print/customer-payment/${row.id}`,
        icon: "print",
      }),
    ],
  })) satisfies SimpleRow[];
}

export async function getDiscountedItemRows(filters: SalesFilters = {}) {
  const { locationId, customerId, productId, categoryId, brandId, companyId, search } = filters;
  const soldAt = getSoldAtRangeFilter(filters);

  const locationIds = parseFilterList(locationId);

  const where: any = {
    sale: {
      status: "COMPLETED",
      ...(locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {}),
      ...(customerId ? { customerId: idListWhere(parseFilterList(customerId)) } : {}),
      ...(soldAt ? { soldAt } : {}),
    },
    discount: { gt: 0 },
    ...(productId ? { productId: idListWhere(parseFilterList(productId)) } : {}),
    ...(categoryId ? { product: { categoryId: idListWhere(parseFilterList(categoryId)) } } : {}),
    ...(brandId ? { product: { brandId: idListWhere(parseFilterList(brandId)) } } : {}),
    ...(companyId ? { product: { companyId: idListWhere(parseFilterList(companyId)) } } : {}),
    ...(search
      ? {
          OR: [
            { product: { name: { contains: search, mode: "insensitive" } } },
            { sale: { saleNumber: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const items = await prisma.saleItem.findMany({
    where,
    orderBy: { sale: { soldAt: "desc" } },
    include: {
      product: {
        include: {
          category: { select: { name: true } },
          company: { select: { name: true } },
        },
      },
      sale: {
        include: {
          customer: { select: { name: true, businessName: true } },
          location: { select: { name: true } },
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    date: item.sale.soldAt.toISOString(),
    saleNumber: item.sale.saleNumber,
    product: item.product.name,
    category: item.product.category?.name ?? "General",
    company: item.product.company?.name ?? "Unknown",
    customer: item.sale.customer ? formatCustomerName(item.sale.customer) : "Walk-in",
    quantity: item.quantity,
    unitPrice: toNumber(item.unitPrice),
    discountPerUnit: toNumber(item.discount) / item.quantity,
    discountType: item.discountType === "PER_QTY"
      ? `${toNumber(item.discountRate ?? item.discount).toLocaleString()} / qty`
      : item.discountType === "FIXED"
        ? `Fixed ${toNumber(item.discountRate ?? 0).toLocaleString()}`
        : item.discountType === "PERCENTAGE"
          ? `${toNumber(item.discountRate ?? 0).toLocaleString()}%`
          : "-",
    totalDiscount: toNumber(item.discount) * item.quantity,
    netTotal: toNumber(item.lineTotal),
  })) satisfies SimpleRow[];
}


export async function getDeliveryOrderRows(filters: SalesFilters = {}) {
  const { locationId, customerId, search, status } = filters;
  const deliveryAt = getSoldAtRangeFilter(filters); // Re-use date range helper

  const locationIds = parseFilterList(locationId);
  const customerIds = parseFilterList(customerId);

  const where: any = {
    ...(customerIds ? { customerId: idListWhere(customerIds) } : {}),
    ...(locationIds ? (locationIds.length === 1 ? { locationId: locationIds[0] } : { locationId: { in: locationIds } }) : {}),
    ...(deliveryAt ? { deliveryDate: deliveryAt } : {}),
    ...(status ? { status: status as any } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" } },
            { deliveryPerson: { contains: search, mode: "insensitive" } },
            { deliveryAddress: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { sale: { saleNumber: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const rows = await prisma.deliveryOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, businessName: true } },
      location: { select: { name: true } },
      sale: { select: { saleNumber: true } },
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.orderNumber,
    saleNumber: row.sale.saleNumber,
    customer: formatCustomerName(row.customer),
    location: row.location.name,
    deliveryPerson: row.deliveryPerson || "-",
    deliveryAddress: row.deliveryAddress || "-",
    phone: row.phone || "-",
    deliveryDate: row.deliveryDate?.toISOString() || "-",
    itemSummary: row.items.map((i) => `${i.product.name} (${i.quantity})`).join(", "),
    status: row.status,
    __actions: [
      ...(row.status === "DRAFT"
        ? [
            createRowAction({
              key: "dispatch",
              label: "Mark Sent",
              href: `/sales/delivery-orders?dispatchId=${row.id}&status=SENT`,
              icon: "truck",
              showLabel: true,
            }),
            createRowAction({
              key: "cancel",
              label: "Cancel",
              href: `/sales/delivery-orders?dispatchId=${row.id}&status=CANCELLED`,
              icon: "trash",
              variant: "destructive",
              showLabel: true,
              confirmMessage: `Cancel delivery order ${row.orderNumber ?? ""}? This cannot be undone.`,
            }),
          ]
        : row.status === "SENT"
        ? [
            createRowAction({
              key: "delivered",
              label: "Mark Delivered",
              href: `/sales/delivery-orders?dispatchId=${row.id}&status=DELIVERED`,
              icon: "userCheck",
              showLabel: true,
            }),
          ]
        : []),
      createRowAction({
        key: "view",
        label: "View Detail",
        href: `/print/delivery-order/${row.id}`,
        icon: "view",
      }),
      createRowAction({
        key: "print",
        label: "Print D.O",
        href: `/print/delivery-order/${row.id}`,
        icon: "print",
      }),
    ],
  })) satisfies SimpleRow[];
}