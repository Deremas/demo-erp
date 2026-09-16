import { NextResponse } from "next/server";

import { createSalesReturnAction } from "@/lib/actions/sales-returns";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ saleId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(user.role, "sales:view", user.permissions)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const sale = await prisma.sale.findUnique({
    where: { id: (await context.params).saleId },
    select: { id: true, locationId: true },
  });

  if (!sale) {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }

  if (user.role !== "ADMIN" && !user.locations.some((location) => location.id === sale.locationId)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const returns = await prisma.salesReturn.findMany({
    where: { saleId: sale.id },
    orderBy: { returnedAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      returnItems: {
        include: { product: { select: { sku: true, name: true } } },
      },
      exchangeItems: {
        include: { product: { select: { sku: true, name: true } } },
      },
    },
  });

  return NextResponse.json({
    rows: returns.map((row) => ({
      id: row.id,
      returnNumber: row.returnNumber,
      returnType: row.returnType,
      status: row.status,
      returnedAmount: Number(row.returnedAmount),
      exchangeAmount: Number(row.exchangeAmount),
      differenceAmount: Number(row.differenceAmount),
      amountRefunded: Number(row.amountRefunded),
      amountCollected: Number(row.amountCollected),
      reason: row.reason,
      processedBy: row.createdBy.name,
      returnedAt: row.returnedAt.toISOString(),
      returnedItems: row.returnItems.map((item) => ({
        sku: item.product.sku,
        name: item.product.name,
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
      })),
      exchangeItems: row.exchangeItems.map((item) => ({
        sku: item.product.sku,
        name: item.product.name,
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
      })),
    })),
  });
}

export async function POST(request: Request, context: { params: Promise<{ saleId: string }> }) {
  const body = await request.json();
  const { saleId } = await context.params;
  const result = await createSalesReturnAction({
    ...body,
    saleId,
  });

  return NextResponse.json(result, { status: result.success ? 201 : 400 });
}