export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoiceView } from "@/components/print/invoice-view";
import { getCompanySettings } from "@/lib/actions/company";

export default async function PurchasePrintPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const purchase = await prisma.purchase.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      purchaseNumber: true,
      purchasedAt: true,
      note: true,
      subtotal: true,
      total: true,
      discount: true,
      amountPaid: true,
      amountDue: true,
      status: true,
      paymentStatus: true,
      location: {
        select: { id: true, name: true, phone: true, email: true, location: true },
      },
      supplier: {
        select: { id: true, name: true, phone: true, address: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      items: {
        select: {
          id: true,
          quantity: true,
          unitCost: true,
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
    },
  });

  if (!purchase) {
    notFound();
  }

  const companySettings = await getCompanySettings();

  return <InvoiceView purchase={JSON.parse(JSON.stringify(purchase))} companySettings={companySettings} />;
}