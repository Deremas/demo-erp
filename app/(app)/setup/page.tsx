export const dynamic = "force-dynamic";

import { getActionActorByPermission } from "@/lib/actions/common";
import { getSystemHealthAction } from "@/lib/actions/system-health";
import { prisma } from "@/lib/prisma";
import { SetupDashboard } from "@/components/setup/setup-dashboard";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  const actor = await getActionActorByPermission("settings:manage");
  
  if (!actor) {
    redirect("/dashboard");
  }

  const [backups, companySettings, health] = await Promise.all([
    prisma.databaseBackup.findMany({
      orderBy: { createdAt: "desc" },
    }),
    import("@/lib/actions/company").then(m => m.getCompanySettings()),
    getSystemHealthAction(),
  ]);

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-8 xl:p-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">System Setup</h1>
        <p className="text-slate-500 font-medium">Manage system branding, data backups, and operational configurations.</p>
      </div>

      <SetupDashboard initialBackups={backups} companySettings={companySettings as any} health={health} />
    </div>
  );
}