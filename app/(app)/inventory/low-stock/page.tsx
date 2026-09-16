export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import type { RouteSearchParams } from "@/lib/query-params";

type LowStockPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: LowStockPageProps) {
  const params = await searchParams;
  return (
    <TablePage
      config={await getTablePageConfig(
        "inventoryLowStock",
        tableFiltersFromSearchParams(params),
      )}
    />
  );
}