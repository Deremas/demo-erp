import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { buildItemsListExcelBuffer, buildItemsListFileName, type ItemsListRow } from "@/lib/items-list-export";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(user.role, "inventory:view", user.permissions) && !hasPermission(user.role, "reports:view", user.permissions)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      sku: true,
      name: true,
      category: { select: { name: true } },
      brand: { select: { name: true } },
      company: { select: { name: true } },
      unit: { select: { name: true } },
      buyingPrice: true,
      sellingPrice: true,
      minimumStockAlert: true,
      isActive: true,
      createdAt: true,
    },
  });

  const rows: ItemsListRow[] = products.map((product) => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category?.name ?? "-",
    brand: product.brand?.name ?? "-",
    company: product.company?.name ?? "-",
    unit: product.unit.name,
    buyingPrice: Number(product.buyingPrice),
    sellingPrice: Number(product.sellingPrice),
    minimumStockAlert: product.minimumStockAlert,
    status: product.isActive ? "ACTIVE" : "INACTIVE",
    createdAt: product.createdAt.toISOString(),
  }));

  const buffer = buildItemsListExcelBuffer(rows);

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "ITEMS_LIST_EXCEL_EXPORTED",
      entityType: "Report",
      entityId: "items-list",
      locationId: user.activeLocationId ?? null,
      after: { rowCount: rows.length },
    },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${buildItemsListFileName("xlsx")}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}