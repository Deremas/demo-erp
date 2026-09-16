"use server";

import { revalidatePath } from "next/cache";

import {
  type ActionResult,
  getActionActorByPermission,
  getActionErrorMessage,
  normalizeOptionalString,
} from "@/lib/actions/common";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/services/inventory-ledger";
import { supplierCreateSchema, type SupplierCreateFormInput } from "@/lib/validation/supplier";

type CreateSupplierActionResult = {
  success: boolean;
  message: string;
  supplier?: {
    id: string;
    name: string;
  };
};

type SupplierActionResult = CreateSupplierActionResult;

export async function updateSupplierAction(
  id: string,
  input: SupplierCreateFormInput,
): Promise<SupplierActionResult> {
  const actor = await getActionActorByPermission("suppliers:create");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to update suppliers.",
    };
  }

  const parsed = supplierCreateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Supplier details are invalid.",
    };
  }

  try {
    const normalizedPhone = normalizeOptionalString(parsed.data.phone);
    const address = normalizeOptionalString(parsed.data.address);
    const supplier = await prisma.$transaction(async (tx) => {
      const before = await tx.supplier.findUnique({ where: { id } });
      if (!before) throw new Error("Supplier was not found.");

      const after = await tx.supplier.update({
        where: { id },
        data: {
          name: parsed.data.name,
          phone: normalizedPhone ?? null,
          address: address ?? null,
        },
        select: {
          id: true,
          name: true,
        },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "SUPPLIER_UPDATE",
        entityType: "Supplier",
        entityId: id,
        before,
        after,
      });

      return after;
    });

    revalidatePath("/purchases/suppliers");
    revalidatePath(`/purchases/suppliers/${id}`);
    revalidatePath("/purchases/list");
    revalidatePath("/purchases");

    return {
      success: true,
      message: `${supplier.name} was updated successfully.`,
      supplier,
    };
  } catch (error) {
    const message = getActionErrorMessage(
      error,
      "Unable to update the supplier right now.",
    );

    if (message.toLowerCase().includes("unique")) {
      return {
        success: false,
        message: "A supplier with that name already exists.",
      };
    }

    return {
      success: false,
      message,
    };
  }
}

export async function deleteSupplierAction(id: string): Promise<ActionResult> {
  const actor = await getActionActorByPermission("suppliers:edit");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to delete suppliers.",
    };
  }

  try {
    const usage = await prisma.supplier.findUnique({
      where: { id },
      select: {
        name: true,
        _count: {
          select: {
            purchases: true,
            payments: true,
          },
        },
      },
    });

    if (!usage) {
      return {
        success: false,
        message: "Supplier was not found.",
      };
    }

    if (usage._count.purchases > 0 || usage._count.payments > 0) {
      return {
        success: false,
        message:
          "This supplier has purchases or payments, so it cannot be deleted. Keep it for transaction history.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.supplier.delete({ where: { id } });
      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "SUPPLIER_DELETE",
        entityType: "Supplier",
        entityId: id,
        before: usage,
      });
    });

    revalidatePath("/purchases/suppliers");
    revalidatePath("/purchases");

    return {
      success: true,
      message: `${usage.name} was deleted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to delete the supplier right now.",
      ),
    };
  }
}

export async function createSupplierAction(
  input: SupplierCreateFormInput,
): Promise<CreateSupplierActionResult> {
  const actor = await getActionActorByPermission("suppliers:delete");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to create suppliers.",
    };
  }

  const parsed = supplierCreateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Supplier details are invalid.",
    };
  }

  try {
    const normalizedPhone = normalizeOptionalString(parsed.data.phone);
    const address = normalizeOptionalString(parsed.data.address);
    const supplier = await prisma.$transaction(async (tx) => {
      const created = await tx.supplier.create({
        data: {
          name: parsed.data.name,
          ...(normalizedPhone
            ? { phone: normalizedPhone }
            : {}),
          ...(address ? { address } : {}),
        },
        select: {
          id: true,
          name: true,
        },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "SUPPLIER_CREATE",
        entityType: "Supplier",
        entityId: created.id,
        after: created,
      });

      return created;
    });

    revalidatePath("/purchases/suppliers");
    revalidatePath("/purchases/list");
    revalidatePath("/purchases/new");
    revalidatePath("/purchases");

    return {
      success: true,
      message: `${supplier.name} was added successfully.`,
      supplier,
    };
  } catch (error) {
    const message = getActionErrorMessage(
      error,
      "Unable to create the supplier right now.",
    );

    if (message.toLowerCase().includes("unique")) {
      return {
        success: false,
        message: "A supplier with that name already exists.",
      };
    }
    return {
      success: false,
      message,
    };
  }
}