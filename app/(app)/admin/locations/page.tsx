export const dynamic = "force-dynamic";

import { LocationsManager } from "@/components/admin/branches-manager";
import { getLocationRows } from "@/lib/page-data-purchases-finance-admin";

export default async function BranchesPage() {
  const rows = await getLocationRows();

  return <LocationsManager rows={rows} />;
}