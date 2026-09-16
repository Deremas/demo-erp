export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCompanySettings } from "@/lib/actions/company";
import { TransferView } from "@/components/print/transfer-view";

export default async function TransferPrintPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const transfer = await prisma.transfer.findUnique({
    where: { id: params.id },
    include: {
      sourceLocation: true,
      destinationLocation: true,
      sentBy: true,
      receivedBy: true,
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!transfer) {
    notFound();
  }

  const companySettings = await getCompanySettings();

  return <TransferView transfer={JSON.parse(JSON.stringify(transfer))} companySettings={companySettings} />;
}