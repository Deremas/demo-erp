import { prisma } from "@/lib/prisma";

export type SaleReceiptRecord = {
  id: string;
  saleNumber: string;
  voucherCode: string | null;
  soldAt: Date;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: unknown;
  discountTotal: unknown;
  total: unknown;
  amountPaid: unknown;
  amountDue: unknown;
  note: string | null;
  locationId: string;
  location: { name: string; phone: string | null; location: string | null };
  customer: { name: string; phone: string | null; tinNumber: string | null; address: string | null } | null;
  createdBy: { name: string };
  items: {
    id: string;
    quantity: number;
    unitPrice: unknown;
    discount: unknown;
    lineTotal: unknown;
    product: { sku: string; name: string };
  }[];
};

export async function loadSaleReceiptById(saleId: string): Promise<SaleReceiptRecord | null> {
  return prisma.sale.findUnique({
    where: { id: saleId },
    select: {
      id: true,
      saleNumber: true,
      voucherCode: true,
      soldAt: true,
      paymentMethod: true,
      paymentStatus: true,
      subtotal: true,
      discountTotal: true,
      total: true,
      amountPaid: true,
      amountDue: true,
      note: true,
      locationId: true,
      location: {
        select: { name: true, phone: true, location: true },
      },
      customer: {
        select: { name: true, phone: true, tinNumber: true, address: true },
      },
      createdBy: {
        select: { name: true },
      },
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          discount: true,
          lineTotal: true,
          product: {
            select: {
              sku: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  }) as Promise<SaleReceiptRecord | null>;
}