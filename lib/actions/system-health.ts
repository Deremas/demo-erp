"use server";

import { getActionActor } from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";

export async function getSystemHealthAction() {
  const actor = await getActionActor(["ADMIN"]);
  if (!actor) return null;

  const [lastBackup, lowStockCount, draftSales, draftTransfers] =
    await Promise.all([
      prisma.databaseBackup.findFirst({
        where: { status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM products p
      INNER JOIN (
        SELECT "productId", SUM(quantity) as available
        FROM stock_movements
        GROUP BY "productId"
      ) s ON p.id = s."productId"
      WHERE s.available <= p."minimumStockAlert" AND p."isActive" = true
    `,
      prisma.sale.count({ where: { status: "DRAFT" } }),
      prisma.transfer.count({ where: { status: "DRAFT" } }),
    ]);

  return {
    lastBackupAt: lastBackup?.createdAt || null,
    lowStockCount: Number(lowStockCount[0]?.count || 0),
    draftSales,
    draftTransfers,
  };
}