"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getActionActor, getActionErrorMessage } from "@/lib/actions/common";
import type { ActionResult } from "@/lib/actions/common";

import { getBackupsDir } from "@/lib/services/backup-paths";

function backupFilePath(fileName: string) {
  const normalizedDir = getBackupsDir().replace(/\\/g, "/").replace(/\/+$/g, "");
  return `${normalizedDir}/${fileName}`;
}

export async function createDatabaseBackupAction(filters?: { dateFrom?: Date; dateTo?: Date }): Promise<ActionResult> {
  const actor = await getActionActor(["ADMIN"]);

  if (!actor) {
    return {
      success: false,
      message: "You are not authorized to perform backups.",
    };
  }

  try {
    const { generateSystemBackup } = await import("@/lib/services/backup");
    const backup = await generateSystemBackup(filters);
    await prisma.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: "BACKUP_CREATE",
        entityType: "DatabaseBackup",
        entityId: backup.id,
        after: {
          fileName: backup.fileName,
          fileSize: backup.fileSize,
          dateFrom: backup.dateFrom,
          dateTo: backup.dateTo,
        },
      },
    });
    revalidatePath("/setup");
    revalidatePath("/admin/backups");
    revalidatePath("/admin/audit-coverage");

    return {
      success: true,
      message: `Database ${backup.dateFrom ? "export" : "backup"} ${backup.fileName} generated successfully.`,
    };
  } catch (error) {
    console.error("Backup Error:", error);
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to generate database backup."),
    };
  }
}

export async function deleteBackupAction(id: string): Promise<ActionResult> {
  const actor = await getActionActor(["ADMIN"]);
  if (!actor) return { success: false, message: "Unauthorized" };

  try {
    const fs = await import("fs");
    const backup = await prisma.databaseBackup.findUnique({ where: { id } });
    if (!backup) return { success: false, message: "Backup not found" };

    const filePath = backupFilePath(backup.fileName);
    const baseName = backup.fileName.replace(/\.json$/i, "");
    const relatedFiles = [
      filePath,
      backupFilePath(`${baseName}.xlsx`),
      backupFilePath(`${baseName}_report.html`),
    ];

    for (const relatedFile of relatedFiles) {
      if (fs.existsSync(relatedFile)) {
        fs.unlinkSync(relatedFile);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.databaseBackup.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          actorUserId: actor.id,
          action: "BACKUP_DELETE",
          entityType: "DatabaseBackup",
          entityId: id,
          before: backup,
        },
      });
    });
    
    revalidatePath("/setup");
    revalidatePath("/admin/backups");
    revalidatePath("/admin/audit-coverage");
    return { success: true, message: "Backup deleted successfully." };
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Unable to delete the backup.") };
  }
}

export async function getSystemHealthAction() {
  const actor = await getActionActor(["ADMIN"]);
  if (!actor) return null;

  const [lastBackup, lowStockCount, draftSales, draftTransfers] = await Promise.all([
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

export async function checkAndTriggerWeeklyBackupAction() {
  const actor = await getActionActor(["ADMIN"]);
  if (!actor) return { success: false };

  const settings = await prisma.companySettings.findFirst();
  if (!settings?.weeklyBackupEnabled) return { success: false };

  const lastWeekly = settings.lastWeeklyBackupAt;
  const now = new Date();
  
  // If never backed up or more than 7 days ago
  if (!lastWeekly || (now.getTime() - lastWeekly.getTime() > 7 * 24 * 60 * 60 * 1000)) {
    try {
      const { generateSystemBackup } = await import("@/lib/services/backup");
      const backup = await generateSystemBackup();
      await prisma.companySettings.update({
        where: { id: settings.id },
        data: { lastWeeklyBackupAt: now }
      });
      revalidatePath("/setup");
      return { success: true, backupId: backup.id, fileName: backup.fileName };
    } catch (error) {
      console.error("Weekly Backup Error:", error);
    }
  }

  return { success: false };
}

export async function toggleWeeklyBackupAction(): Promise<ActionResult> {
  const actor = await getActionActor(["ADMIN"]);
  if (!actor) {
    return {
      success: false,
      message: "You are not authorized to toggle settings.",
    };
  }

  try {
    const settings = await prisma.companySettings.findFirst();
    let updated;
    if (settings) {
      updated = await prisma.companySettings.update({
        where: { id: settings.id },
        data: {
          weeklyBackupEnabled: !settings.weeklyBackupEnabled,
        },
      });
    } else {
      updated = await prisma.companySettings.create({
        data: {
          weeklyBackupEnabled: true,
        },
      });
    }

    revalidatePath("/setup");
    revalidatePath("/admin/backups");

    return {
      success: true,
      message: `Weekly backups have been ${updated.weeklyBackupEnabled ? "enabled" : "disabled"}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to toggle weekly backups setting."),
    };
  }
}