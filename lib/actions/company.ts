"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActionActorByPermission } from "./common";
import { z } from "zod";

const companySettingsSchema = z.object({
  name: z.string().min(2, "Company name is too short"),
  tin: z.string().min(10, "TIN must be at least 10 digits"),
  address: z.string().min(5, "Address is too short"),
  phone: z.string().min(10, "Phone number is invalid"),
  email: z.string().email().optional().or(z.literal("")),
  currencySymbol: z.string().min(1),
  weeklyBackupEnabled: z.boolean().optional(),
});

export async function getCompanySettings() {
  try {
    const settings = await prisma.companySettings.findFirst();
    if (settings) return settings;

    // Initialize if not exists
    return await prisma.companySettings.create({
      data: {
        name: "Demo ERP",
        tin: "0012345678",
        address: "Addis Ababa, Ethiopia",
        phone: "+251 911 000 000",
      },
    });
  } catch {
    // Table may not exist yet — return safe defaults so print pages don't crash
    return {
      id: "default",
      name: "Demo ERP",
      tin: "0012345678",
      address: "Addis Ababa, Ethiopia",
      phone: "+251 911 000 000",
      email: null,
      currencySymbol: "ETB",
      logoUrl: null,
      updatedAt: new Date(),
    };
  }
}

export async function updateCompanySettingsAction(data: z.infer<typeof companySettingsSchema>) {
  const actor = await getActionActorByPermission("settings:manage");
  if (!actor) return { success: false, message: "Unauthorized" };

  const parsed = companySettingsSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Invalid data" };

  try {
    const existing = await prisma.companySettings.findFirst();
    const updateData = {
      ...parsed.data,
      email: parsed.data.email || null,
      weeklyBackupEnabled: parsed.data.weeklyBackupEnabled ?? false,
    };

    if (existing) {
      await prisma.$transaction(async (tx) => {
        await tx.companySettings.update({
          where: { id: existing.id },
          data: updateData,
        });
        
        await import("@/lib/services/inventory-ledger").then(m => m.createAuditLog(tx, {
          actorUserId: actor.id,
          action: "SETTINGS_UPDATE",
          entityType: "CompanySettings",
          entityId: existing.id,
          before: existing as any,
          after: updateData as any,
        }));
      });
    } else {
      await prisma.companySettings.create({
        data: updateData,
      });
    }

    revalidatePath("/setup");
    return { success: true, message: "Company profile updated successfully" };
  } catch (error) {
    return { success: false, message: "Failed to update company profile" };
  }
}

export async function checkAndPerformAutoBackupAction() {
  try {
    let settings;
    try {
      settings = await prisma.companySettings.findFirst({
        select: {
          id: true,
          weeklyBackupEnabled: true,
          lastWeeklyBackupAt: true,
        },
      });
    } catch (dbError) {
      // Database might not be ready or connection failed - skip auto-backup for this request
      return;
    }

    if (!settings || !settings.weeklyBackupEnabled) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // If no backup yet or last was more than 7 days ago
    if (!settings.lastWeeklyBackupAt || settings.lastWeeklyBackupAt < sevenDaysAgo) {
      console.log("[Auto-Backup] Triggering weekly backup...");
      
      const { generateSystemBackup } = await import("@/lib/services/backup");
      await generateSystemBackup();

      await prisma.companySettings.update({
        where: { id: settings.id },
        data: { lastWeeklyBackupAt: new Date() },
      });
      
      console.log("[Auto-Backup] Weekly backup completed successfully.");
    }
  } catch (error) {
    console.error("[Auto-Backup] Failed:", error);
  }
}