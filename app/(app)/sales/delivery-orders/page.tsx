export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";
import { prisma } from "@/lib/prisma";
import { DeliveryOrderActionDialog } from "@/components/sales/delivery-order-action-dialog";
import { DeliveryOrderManager } from "./delivery-order-manager";

type DeliveryOrdersPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: DeliveryOrdersPageProps) {
  const params = await searchParams;
  const filters = tableFiltersFromSearchParams(params);
  
  const dispatchId = getSingleSearchParam(params, "dispatchId");
  const status = getSingleSearchParam(params, "status");

  const [config, order] = await Promise.all([
    getTablePageConfig("salesDeliveryOrders", filters),
    dispatchId
      ? prisma.deliveryOrder.findUnique({
          where: { id: dispatchId },
          select: { id: true, orderNumber: true },
        })
      : null,
  ]);

  return (
    <>
      <TablePage config={config} />
      
      <DeliveryOrderManager
        order={order ? { id: order.id, orderNumber: order.orderNumber } : null}
        status={status ?? null}
        initialOpen={Boolean(dispatchId && order)}
      />
    </>
  );
}