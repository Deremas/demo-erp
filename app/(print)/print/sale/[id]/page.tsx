export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReceiptView } from "@/components/print/receipt-view";
import { getCompanySettings } from "@/lib/actions/company";

export default async function SalePrintPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const sale = await prisma.sale.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      saleNumber: true,
      soldAt: true,
      paymentMethod: true,
      note: true,
      subtotal: true,
      total: true,
      discountTotal: true,
      amountPaid: true,
      amountDue: true,
      status: true,
      location: {
        select: { id: true, name: true, phone: true, email: true, location: true },
      },
      customer: {
        select: { id: true, name: true, address: true, phone: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          discount: true,
          discountType: true,
          discountRate: true,
          lineTotal: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: { select: { name: true } },
              category: { select: { name: true } },
            },
          },
        },
      },
      cheques: {
        select: {
          chequeNumber: true,
          bankName: true,
          chequeDate: true,
          amount: true,
        },
      },
    },
  });

  if (!sale) notFound();

  const companySettings = await getCompanySettings();

  const stockMovements = await prisma.stockMovement.findMany({
    where: { sourceType: "Sale", sourceId: params.id },
    select: {
      sourceLineId: true,
      quantity: true,
    },
  });

  const movementMap = new Map(stockMovements.map((m) => [m.sourceLineId, m]));

  const enrichedSale = {
    ...sale,
    items: sale.items.map((item) => {
      const movement = movementMap.get(item.id);
      const transactionQty = movement ? Number(movement.quantity) : item.quantity;
      
      return {
        ...item,
        quantity: transactionQty,
        unitPrice: Number(item.unitPrice),
        discountAmount: Number(item.discount) * item.quantity,
        lineTotal: Number(item.lineTotal),
      };
    }),
  };

  return <ReceiptView sale={JSON.parse(JSON.stringify(enrichedSale))} companySettings={companySettings} />;
}