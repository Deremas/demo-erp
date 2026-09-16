export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { AssistantPanel } from "@/components/dashboard/assistant-panel";
import { getAiInsightsSnapshot } from "@/lib/ai-insights";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type AssistantPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function AssistantPage({ searchParams }: AssistantPageProps) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "ai:view", user.permissions)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const locationId = getSingleSearchParam(params, "locationId") ?? (hasPermission(user.role, "location:view-all", user.permissions) ? undefined : user.activeLocationId);
  const snapshot = await getAiInsightsSnapshot(locationId);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600">AI insights</p>
        <h1 className="text-3xl font-black tracking-tight">Operational recommendations</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          These insights sit inside the same sales, stock, credit, and finance records used by the rest of the demo. They are not a separate AI module.
        </p>
      </div>
      <AssistantPanel snapshot={snapshot} locationId={locationId} />
    </div>
  );
}
