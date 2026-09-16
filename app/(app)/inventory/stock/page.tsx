export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { StockAdjustmentDialog } from "@/components/inventory/stock-adjustment-dialog";
import { getCurrentUser } from "@/lib/auth/session";
import { getStockSummaryRows } from "@/lib/stock-runtime-data";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";
import { hasPermission } from "@/lib/rbac";
import type { RowActionConfig, SimpleRow } from "@/lib/table";

type StockOverviewPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: StockOverviewPageProps) {
  const params = await searchParams;
  const adjustOpen = getSingleSearchParam(params, "adjust") === "1";
  const adjustLocationId = getSingleSearchParam(params, "locationId");
  const adjustProductId = getSingleSearchParam(params, "productId");
  const filters = tableFiltersFromSearchParams(params);
  const [config, user] = await Promise.all([
    getTablePageConfig("inventoryStock", filters),
    getCurrentUser(),
  ]);
  const canAdjustStock = Boolean(user && user.role === "ADMIN" && hasPermission(user.role, "admin:manage", user.permissions));
  const configWithAdjustment = canAdjustStock
    ? {
        ...config,
        rows: config.rows.map(
          (row) =>
            ({
              ...row,
              __actions: [
                ...((row.__actions ?? []) as RowActionConfig[]),
                {
                  key: "adjust",
                  label: "Adjust",
                  href: `/inventory/stock?adjust=1&locationId=${row.locationId}&productId=${row.productId}`,
                  icon: "edit",
                  showLabel: true,
                },
              ],
            }) satisfies SimpleRow,
        ),
      }
    : config;
  const adjustStock =
    canAdjustStock && adjustOpen && adjustLocationId && adjustProductId
      ? (await getStockSummaryRows(adjustLocationId)).find(
          (row) => row.locationId === adjustLocationId && row.productId === adjustProductId,
        )
      : null;

  return (
    <>
      <TablePage config={configWithAdjustment} />
      <StockAdjustmentDialog
        open={canAdjustStock && adjustOpen}
        stock={
          adjustStock
            ? {
                locationId: adjustStock.locationId,
                locationName: adjustStock.location,
                productId: adjustStock.productId,
                productName: adjustStock.product,
                currentQuantity: adjustStock.quantity,
                unitName: adjustStock.unit,
              }
            : null
        }
      />
    </>
  );
}