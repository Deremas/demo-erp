export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PaymentVoucher } from "@/components/print/payment-voucher-view";
import { getCompanySettings } from "@/lib/actions/company";

export default async function SupplierPaymentPrintPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const payment = await prisma.supplierPayment.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      paymentNumber: true,
      paymentDate: true,
      amount: true,
      isUsd: true,
      exchangeRate: true,
      note: true,
      location: {
        select: { id: true, name: true, phone: true, email: true },
      },
      supplier: {
        select: { id: true, name: true, phone: true, address: true },
      },
      financeAccount: {
        select: { id: true, name: true, type: true, bankName: true, accountNumber: true },
      },
      recordedBy: {
        select: { id: true, name: true },
      },
      purchase: {
        select: { id: true, purchaseNumber: true },
      },
    },
  });

  if (!payment) notFound();

  const companySettings = await getCompanySettings();

  return <PaymentVoucher payment={payment} companySettings={companySettings} type="SUPPLIER" />;
}