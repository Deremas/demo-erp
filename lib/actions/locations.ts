"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import type { ActionResult } from "@/lib/actions/common";
import {
  getActionActor,
  getActionErrorMessage,
  normalizeOptionalString,
} from "@/lib/actions/common";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/services/inventory-ledger";
import {
  locationSchema,
  locationUpdateSchema,
  type LocationFormInput,
  type LocationUpdateFormInput,
} from "@/lib/validation/location";

const deleteLocationSchema = z.object({
  locationId: z.string().trim().min(1, "Location id is required."),
});

const setActiveLocationSchema = z.object({
  locationId: z.string().trim().min(1, "Select a location."),
});

function buildLocationCodeSeed(name: string) {
  const seed = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return seed || "LOCATION";
}

async function generateUniqueLocationCode(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  name: string,
  ignoreLocationId?: string,
) {
  const base = buildLocationCodeSeed(name);
  let candidate = base;
  let suffix = 1;

  while (
    await tx.location.findFirst({
      where: {
        code: candidate,
        ...(ignoreLocationId ? { id: { not: ignoreLocationId } } : {}),
      },
      select: { id: true },
    })
  ) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

export async function createLocationAction(
  input: LocationFormInput,
): Promise<ActionResult> {
  const actor = await getActionActor(["ADMIN"]);

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to create stores or shops.",
    };
  }

  const parsed = locationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Location details are invalid.",
    };
  }

  const name = parsed.data.name.trim();
  const type = parsed.data.type;
  const location = normalizeOptionalString(parsed.data.location);

  try {
    const locationName = await prisma.$transaction(async (tx) => {
      const existingByName = await tx.location.findUnique({
        where: { name },
        select: { id: true },
      });

      if (existingByName) {
        throw new Error("A store or shop with that name already exists.");
      }

      const code = await generateUniqueLocationCode(tx, name);

      const newLocation = await tx.location.create({
        data: {
          code,
          name,
          type,
          ...(location ? { location } : {}),
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      });

      await tx.userBranch.upsert({
        where: {
          userId_locationId: {
            userId: actor.id,
            locationId: newLocation.id,
          },
        },
        update: {
          isActive: true,
        },
        create: {
          userId: actor.id,
          locationId: newLocation.id,
          isActive: true,
          isDefault: !actor.activeLocationId,
        },
      });

      const currentUser = await tx.user.findUnique({
        where: { id: actor.id },
        select: { defaultLocationId: true },
      });

      if (!currentUser?.defaultLocationId) {
        await tx.user.update({
          where: { id: actor.id },
          data: {
            defaultLocationId: newLocation.id,
          },
        });
      }

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "LOCATION_CREATE",
        entityType: "Location",
        entityId: newLocation.id,
        after: {
          code,
          name,
          type,
          location: location ?? null,
        },
      });

      return newLocation.name;
    });

      revalidatePath("/admin/locations");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `${locationName} created successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to create the location right now."),
    };
  }
}

export async function deleteLocationAction(input: {
  locationId: string;
}): Promise<ActionResult> {
  const actor = await getActionActor(["ADMIN"]);

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to delete locations.",
    };
  }

  const parsed = deleteLocationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Location deletion request is invalid.",
    };
  }

  try {
    const deletedLocationName = await prisma.$transaction(async (tx) => {
      const location = await tx.location.findUnique({
        where: { id: parsed.data.locationId },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              purchases: true,
              sales: true,
              financeAccounts: true,
              expenses: true,
              customerPayments: true,
              supplierPayments: true,
              stockMovements: true,
              alertRecords: true,
              transfersFrom: true,
              transfersTo: true,
              ledgerEntries: true,
            },
          },
        },
      });

      if (!location) {
        throw new Error("Location not found.");
      }

      const hasActivity = Object.values(location._count).some((count) => count > 0);

      if (hasActivity) {
        throw new Error(
          "This location already has stock or transaction history and cannot be deleted.",
        );
      }

      await tx.auditLog.updateMany({
        where: { locationId: location.id },
        data: { locationId: null },
      });

      await tx.session.updateMany({
        where: { activeLocationId: location.id },
        data: { activeLocationId: null },
      });

      await tx.user.updateMany({
        where: { defaultLocationId: location.id },
        data: { defaultLocationId: null },
      });

      await tx.userBranch.deleteMany({
        where: { locationId: location.id },
      });

      await tx.location.delete({
        where: { id: location.id },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "LOCATION_DELETE",
        entityType: "Location",
        entityId: location.id,
        after: {
          name: location.name,
        },
      });

      return location.name;
    });

    revalidatePath("/admin/locations");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `${deletedLocationName} deleted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to delete the location right now."),
    };
  }
}

export async function updateLocationAction(
  input: LocationUpdateFormInput,
): Promise<ActionResult> {
  const actor = await getActionActor(["ADMIN"]);

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to update locations.",
    };
  }

  const parsed = locationUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Location details are invalid.",
    };
  }

  const name = parsed.data.name.trim();
  const type = parsed.data.type;
  const locationText = normalizeOptionalString(parsed.data.location);

  try {
    const locationName = await prisma.$transaction(async (tx) => {
      const existingLocation = await tx.location.findUnique({
        where: {
          id: parsed.data.id,
        },
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          location: true,
        },
      });

      if (!existingLocation) {
        throw new Error("Selected location was not found.");
      }

      const existingByName = await tx.location.findFirst({
        where: {
          name,
          id: {
            not: existingLocation.id,
          },
        },
        select: { id: true },
      });

      if (existingByName) {
        throw new Error("A location with that name already exists.");
      }

      const code = await generateUniqueLocationCode(tx, name, existingLocation.id);

      await tx.location.update({
        where: {
          id: existingLocation.id,
        },
        data: {
          code,
          name,
          type,
          ...(locationText ? { location: locationText } : { location: null }),
        },
      });

      await createAuditLog(tx, {
        actorUserId: actor.id,
        action: "LOCATION_UPDATE",
        entityType: "Location",
        entityId: existingLocation.id,
        locationId: existingLocation.id,
        before: {
          code: existingLocation.code,
          name: existingLocation.name,
          type: existingLocation.type,
          location: existingLocation.location ?? null,
        },
        after: {
          code,
          name,
          type,
          location: locationText ?? null,
        },
      });

      return name;
    });

    revalidatePath("/admin/locations");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `${locationName} updated successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to update the location right now."),
    };
  }
}

export async function setActiveLocationAction(input: {
  locationId: string;
}): Promise<ActionResult> {
  const actor = await getActionActor(["ADMIN", "SALES"]);

  if (!actor) {
    return {
      success: false,
      message: "You are not allowed to switch locations.",
    };
  }

  const parsed = setActiveLocationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Location selection is invalid.",
    };
  }

    try {
      const [assignments, requestHeaders] = await Promise.all([
        prisma.$queryRaw<
          { locationId: string; locationName: string; locationIsActive: boolean }[]
        >`
          SELECT 
            ub."locationId",
            l.name as "locationName",
            l."isActive" as "locationIsActive"
          FROM user_branches ub
          JOIN branches l ON ub."locationId" = l.id
          WHERE ub."userId" = ${actor.id}
          AND ub."locationId" = ${parsed.data.locationId}
          AND ub."isActive" = true
          LIMIT 1
        `,
        headers(),
      ]);

      const assignment = assignments[0];

      if (!assignment || !assignment.locationIsActive) {
        return {
          success: false,
          message: "You do not have access to that location.",
        };
      }

    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    const currentSession = session?.session as
      | { id?: string; token?: string }
      | undefined;

    if (!currentSession?.id && !currentSession?.token) {
      return {
        success: false,
        message: "Your session could not be updated. Sign in again and retry.",
      };
    }

    if (currentSession.id) {
      await prisma.session.update({
        where: {
          id: currentSession.id,
        },
        data: {
          activeLocationId: assignment.locationId,
        },
      });
    } else if (currentSession.token) {
      await prisma.session.update({
        where: {
          token: currentSession.token,
        },
        data: {
          activeLocationId: assignment.locationId,
        },
      });
    }

    return {
      success: true,
      message: `Switched to ${assignment.locationName}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Unable to switch the location right now."),
    };
  }
}