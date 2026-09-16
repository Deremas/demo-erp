import type { Prisma } from "@/generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

type SnapshotInput = {
  locationId: string;
  productId: string;
  ownershipType: "OWNED";
  snapshotDate: Date;
  sourceKey?: string;
};

type AlertInput = {
  locationId: string;
  productId: string;
  threshold: number;
  evaluatedAt: Date;
};

type AuditInput = {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId: string;
  locationId?: string;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
};

export async function createStockSnapshot(
  tx: TransactionClient,
  input: SnapshotInput,
) {
  const aggregate = await tx.stockMovement.aggregate({
    where: {
      locationId: input.locationId,
      productId: input.productId,
    },
    _sum: {
      quantity: true,
    },
  });

  const quantity = aggregate._sum.quantity ?? 0;
  return quantity;
}

export async function syncLowStockAlert(
  tx: TransactionClient,
  input: AlertInput,
) {
  const aggregate = await tx.stockMovement.aggregate({
    where: {
      locationId: input.locationId,
      productId: input.productId,
    },
    _sum: {
      quantity: true,
    },
  });

  const totalQuantity = aggregate._sum.quantity ?? 0;
  const existingAlert = await tx.alertRecord.findFirst({
    where: {
      locationId: input.locationId,
      productId: input.productId,
    },
    orderBy: { evaluatedAt: "desc" },
    select: {
      id: true,
    },
  });

  if (totalQuantity <= input.threshold) {
    if (existingAlert) {
      await tx.alertRecord.update({
        where: {
          id: existingAlert.id,
        },
        data: {
          threshold: input.threshold,
          currentQty: totalQuantity,
          evaluatedAt: input.evaluatedAt,
        },
      });
    } else {
      await tx.alertRecord.create({
        data: {
          locationId: input.locationId,
          productId: input.productId,
          threshold: input.threshold,
          currentQty: totalQuantity,
          evaluatedAt: input.evaluatedAt,
        },
      });
    }
  }

  return totalQuantity;
}

export async function recordStockMovement(
  tx: TransactionClient,
  data: any,
) {
  const aggregate = await tx.stockMovement.aggregate({
    where: {
      locationId: data.locationId,
      productId: data.productId,
    },
    _sum: {
      quantity: true,
    },
  });

  const currentBalance = aggregate._sum.quantity ?? 0;
  const balanceAfter = currentBalance + data.quantity;

  return tx.stockMovement.create({
    data: {
      ...data,
      balanceAfter,
    },
  });
}

export async function createAuditLog(tx: TransactionClient, input: AuditInput) {
  await tx.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      ...(input.actorUserId ? { actorUserId: input.actorUserId } : {}),
      ...(input.locationId ? { locationId: input.locationId } : {}),
      ...(input.before ? { before: input.before } : {}),
      ...(input.after ? { after: input.after } : {}),
    },
  });
}