"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActionActorByPermission, getActionErrorMessage } from "./common";
import { DeliveryOrderStatus } from "@/generated/prisma/enums";
import { createAuditLog } from "@/lib/services/inventory-ledger";

/**
 * Creates a Delivery Order from an existing Sale.
 * Note: This does NOT affect inventory.
 */
export async function createDeliveryOrderAction(
  saleId: string,
  input: {
    deliveryPerson?: string;
    deliveryAddress?: string;
    phone?: string;
    deliveryDate?: Date;
    notes?: string;
  }
) {
  try {
    const actor = await getActionActorByPermission("sales:deliveries");
    if (!actor) throw new Error("Unauthorized.");
    
    const deliveryOrder = await prisma.$transaction(async (tx) => {
      // 1. Fetch sale with items
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { items: true },
      });

      if (!sale) throw new Error("Sale not found.");
      if (sale.status !== "COMPLETED") throw new Error("Only completed sales can be dispatched via D.O.");
      if (!sale.customerId) throw new Error("A Delivery Order requires a registered customer on the sale.");

      // 2. Check if a D.O already exists for this sale
      const existingDo = await tx.deliveryOrder.findFirst({
        where: { saleId },
      });
      if (existingDo) throw new Error("A delivery order already exists for this sale.");

      // 3. Generate Order Number (D.O-XXXXX)
      const count = await tx.deliveryOrder.count();
      const orderNumber = `D.O-${(count + 1).toString().padStart(5, "0")}`;

      // 4. Create Delivery Order with items
      const newDo = await tx.deliveryOrder.create({
        data: {
          orderNumber,
          saleId,
          customerId: sale.customerId,
          locationId: sale.locationId,
          deliveryPerson: input.deliveryPerson || null,
          deliveryAddress: input.deliveryAddress || null,
          phone: input.phone || null,
          deliveryDate: input.deliveryDate || null,
          notes: input.notes || null,
          status: "DRAFT",
          items: {
            create: sale.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
      });

      // 5. Audit Log
      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "DELIVERY_ORDER_CREATE",
        entityType: "DeliveryOrder",
        entityId: newDo.id,
        locationId: sale.locationId,
        after: { orderNumber, saleId, customerId: sale.customerId }
      });

      return newDo;
    });

    revalidatePath("/sales/delivery-orders");
    return { success: true, data: deliveryOrder };
  } catch (error) {
    return { success: false, error: getActionErrorMessage(error, "Failed to create delivery order.") };
  }
}

/**
 * Updates the status of a Delivery Order.
 */
export async function updateDeliveryOrderStatusAction(
  id: string,
  status: DeliveryOrderStatus
) {
  try {
    const actor = await getActionActorByPermission("sales:deliveries");
    if (!actor) throw new Error("Unauthorized.");

    const deliveryOrder = await prisma.$transaction(async (tx) => {
      const existing = await tx.deliveryOrder.findUnique({ where: { id } });
      if (!existing) throw new Error("Delivery Order not found.");

      const updated = await tx.deliveryOrder.update({
        where: { id },
        data: { status },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "DELIVERY_ORDER_STATUS_UPDATE",
        entityType: "DeliveryOrder",
        entityId: id,
        locationId: existing.locationId,
        before: { status: existing.status },
        after: { status }
      });

      return updated;
    });

    revalidatePath("/sales/delivery-orders");
    return { success: true, data: deliveryOrder };
  } catch (error) {
    return { success: false, error: getActionErrorMessage(error, "Failed to update delivery order status.") };
  }
}