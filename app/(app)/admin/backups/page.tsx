export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { getActionActorByPermission } from "@/lib/actions/common";
import { getCompanySettings } from "@/lib/actions/company";
import { prisma } from "@/lib/prisma";
import { BackupStatusPanel } from "@/components/setup/backup-status-panel";

export default async function BackupsPage() {
  const actor = await getActionActorByPermission("backups:manage");
  if (!actor) redirect("/dashboard");

  const [backups, settings] = await Promise.all([
    prisma.databaseBackup.findMany({ orderBy: { createdAt: "desc" } }),
    getCompanySettings(),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 xl:p-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Administrative</p>
        <h1 className="text-3xl font-black tracking-tight">Backup Status</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manual backup generation, weekly backup status, and backup file downloads.</p>
      </div>
      <BackupStatusPanel
        initialBackups={backups}
        weeklyEnabled={Boolean((settings as any).weeklyBackupEnabled)}
        lastWeeklyBackupAt={(settings as any).lastWeeklyBackupAt ?? null}
      />
    </div>
  );
}