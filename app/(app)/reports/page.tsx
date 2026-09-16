export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/app-shell/page-header";
import { ReportsHub } from "@/components/reports/reports-hub";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ReportsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Reports"
        title="Reports"
        description="Use one simple page to choose the report you want to open."
      />
      <ReportsHub locations={user?.locations ?? []} />
    </div>
  );
}