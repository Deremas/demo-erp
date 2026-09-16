export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PaymentVoucher } from "@/components/print/payment-voucher-view";
import { getCompanySettings } from "@/lib/actions/company";

export default async function CustomerPaymentPrintPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const payment = await prisma.customerPayment.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      paymentNumber: true,
      paymentDate: true,
      amount: true,
      note: true,
      location: {
        select: { id: true, name: true, phone: true, email: true },
      },
      customer: {
        select: { id: true, name: true, phone: true, address: true },
      },
      financeAccount: {
        select: { id: true, name: true, type: true, bankName: true, accountNumber: true },
      },
      recordedBy: {
        select: { id: true, name: true },
      },
      sale: {
        select: { id: true, saleNumber: true },
      },
    },
  });

  if (!payment) notFound();

  const companySettings = await getCompanySettings();

  return <PaymentVoucher payment={payment} companySettings={companySettings} type="CUSTOMER" />;
}