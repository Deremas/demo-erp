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
import {
  customerCreateSchema,
  type CustomerCreateFormInput,
} from "@/lib/validation/customer";

type CreateCustomerActionResult = {
  success: boolean;
  message: string;
  customer?: {
    id: string;
    name: string;
    businessName?: string | null;
  };
};

type CustomerActionResult = CreateCustomerActionResult;

export async function updateCustomerAction(
  id: string,
  input: CustomerCreateFormInput,
): Promise<CustomerActionResult> {
  const actor = await getActionActorByPermission("customers:edit");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to update customers.",
    };
  }

  const parsed = customerCreateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Customer details are invalid.",
    };
  }

  try {
    const phone = normalizeOptionalString(parsed.data.phone);
    const address = normalizeOptionalString(parsed.data.address);
    const customer = await prisma.$transaction(async (tx) => {
      const before = await tx.customer.findUnique({ where: { id } });
      if (!before) throw new Error("Customer was not found.");

      const after = await tx.customer.update({
        where: { id },
        data: {
          name: parsed.data.name,
          businessName: normalizeOptionalString(parsed.data.businessName) ?? null,
          tinNumber: normalizeOptionalString(parsed.data.tinNumber) ?? null,
          contactPerson: normalizeOptionalString(parsed.data.contactPerson) ?? null,
          contactPhone: normalizeOptionalString(parsed.data.contactPhone) ?? null,
          phone: normalizeOptionalString(parsed.data.phone) ?? null,
          address: normalizeOptionalString(parsed.data.address) ?? null,
          partyType: parsed.data.partyType ?? "CUSTOMER",
          creditLimit: parsed.data.creditLimit ?? 0,
        },
        select: {
          id: true,
          name: true,
          businessName: true,
        },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "CUSTOMER_UPDATE",
        entityType: "Customer",
        entityId: id,
        before,
        after,
      });

      return after;
    });

    revalidatePath("/sales/customers");
    revalidatePath("/sales/agents");
    revalidatePath(`/sales/customers/${id}`);
    revalidatePath("/sales/sales-list");
    revalidatePath("/sales");

    return {
      success: true,
      message: `${customer.name} was updated successfully.`,
      customer,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to update the customer right now.",
      ),
    };
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  const actor = await getActionActorByPermission("customers:delete");

  if (!actor) {
    return {
      success: false,
      message: "Only admins can delete customers.",
    };
  }

  try {
    const usage = await prisma.customer.findUnique({
      where: { id },
      select: {
        name: true,
        _count: {
          select: {
            sales: true,
            payments: true,
          },
        },
      },
    });

    if (!usage) {
      return {
        success: false,
        message: "Customer was not found.",
      };
    }

    if (usage._count.sales > 0 || usage._count.payments > 0) {
      return {
        success: false,
        message:
          "This customer has sales or payments, so it cannot be deleted. Deactivate it instead if you no longer use it.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.customer.delete({ where: { id } });
      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "CUSTOMER_DELETE",
        entityType: "Customer",
        entityId: id,
        before: usage,
      });
    });

    revalidatePath("/sales/customers");
    revalidatePath("/sales/agents");
    revalidatePath("/sales");

    return {
      success: true,
      message: `${usage.name} was deleted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to delete the customer right now.",
      ),
    };
  }
}

export async function createCustomerAction(
  input: CustomerCreateFormInput,
): Promise<CreateCustomerActionResult> {
  const actor = await getActionActorByPermission("customers:create");

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to create customers.",
    };
  }

  const parsed = customerCreateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Customer details are invalid.",
    };
  }

  try {
    const phone = normalizeOptionalString(parsed.data.phone);
    const address = normalizeOptionalString(parsed.data.address);
    const customer = await prisma.$transaction(async (tx) => {
      const created = await tx.customer.create({
        data: {
          name: parsed.data.name,
          businessName: normalizeOptionalString(parsed.data.businessName) ?? null,
          tinNumber: normalizeOptionalString(parsed.data.tinNumber) ?? null,
          contactPerson: normalizeOptionalString(parsed.data.contactPerson) ?? null,
          contactPhone: normalizeOptionalString(parsed.data.contactPhone) ?? null,
          phone: normalizeOptionalString(parsed.data.phone) ?? null,
          address: normalizeOptionalString(parsed.data.address) ?? null,
          partyType: parsed.data.partyType ?? "CUSTOMER",
          creditLimit: parsed.data.creditLimit ?? 0,
        },
        select: {
          id: true,
          name: true,
          businessName: true,
        },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "CUSTOMER_CREATE",
        entityType: "Customer",
        entityId: created.id,
        after: created,
      });

      return created;
    });

    revalidatePath("/sales/customers");
    revalidatePath("/sales/agents");
    revalidatePath("/sales/new");
    revalidatePath("/sales/sales-list");
    revalidatePath("/sales");

    return {
      success: true,
      message: `${customer.name} was added successfully.`,
      customer,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Unable to create the customer right now.",
      ),
    };
  }
}