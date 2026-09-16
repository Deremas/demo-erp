import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { getCompanySettings } from "@/lib/actions/company";
import { buildReceiptFileName, buildReceiptPdfBuffer } from "@/lib/sales-receipt-export";
import { loadSaleReceiptById } from "@/lib/sales-receipt-service";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ saleId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(user.role, "sales:view", user.permissions)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { saleId } = await context.params;
  const sale = await loadSaleReceiptById(saleId);
  if (!sale) {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }

  if (user.role !== "ADMIN" && !user.locations.some((location) => location.id === sale.locationId)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const companySettings = await getCompanySettings();
  const printedAt = new Date();
  const pdf = buildReceiptPdfBuffer(sale, companySettings, printedAt);

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "SALE_RECEIPT_PDF_EXPORTED",
      entityType: "Sale",
      entityId: sale.id,
      locationId: sale.locationId,
      after: {
        saleNumber: sale.saleNumber,
        soldAt: sale.soldAt.toISOString(),
        printedAt: printedAt.toISOString(),
      },
    },
  });

  const fileName = buildReceiptFileName(sale.saleNumber, sale.soldAt, "pdf");
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}