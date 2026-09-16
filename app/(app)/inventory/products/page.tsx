export const dynamic = "force-dynamic";

import type { RowActionConfig, SimpleRow } from "@/lib/table";

import { ProductForm } from "@/components/forms/product-form";
import { ProductDeleteDialog } from "@/components/inventory/product-delete-dialog";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { TablePage } from "@/components/tables/table-page";
import { getCurrentUser } from "@/lib/auth/session";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { prisma } from "@/lib/prisma";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";
import { hasPermission } from "@/lib/rbac";

type ProductsPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

function createDeleteItemHref(productId: string) {
  const params = new URLSearchParams({
    deleteProductId: productId,
    delete: "1",
  });

  return `/inventory/products?${params.toString()}`;
}

async function safeLoadOptions<T>(label: string, promise: Promise<T[]>): Promise<T[]> {
  try {
    return await promise;
  } catch (error) {
    console.error(`Failed to load ${label} for products page.`, error);
    return [];
  }
}

export default async function Page({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const initialDeleteOpen = getSingleSearchParam(params, "delete") === "1";
  const initialOpen = getSingleSearchParam(params, "open") === "1" && !initialDeleteOpen;
  const productId = getSingleSearchParam(params, "productId");
  const deleteProductId = getSingleSearchParam(params, "deleteProductId");
  const isEdit = getSingleSearchParam(params, "mode") === "edit" && Boolean(productId);
  const importMode = getSingleSearchParam(params, "import");
  const initialMode = importMode === "excel" ? "EXCEL" : importMode === "bulk" ? "BULK" : "SINGLE";
  const filters = tableFiltersFromSearchParams(params);

  const [config, user] = await Promise.all([
    getTablePageConfig("inventoryProducts", filters),
    getCurrentUser(),
  ]);
  const canDelete = Boolean(user && hasPermission(user.role, "inventory:delete", user.permissions));
  const results = await Promise.all([
    isEdit && productId
        ? prisma.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            sku: true,
            name: true,
            buyingPrice: true,
            sellingPrice: true,
            minimumStockAlert: true,
            unitId: true,
            description: true,
            categoryId: true,
          },
        })
      : null,
    canDelete && deleteProductId
      ? prisma.product.findUnique({
          where: { id: deleteProductId },
          select: { id: true, name: true },
        })
      : null,
    safeLoadOptions("categories", prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } })),
    safeLoadOptions("units", prisma.unit.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } })),
  ]);
  const [product, deleteProduct, categories, units] = results;

  const configWithDelete =
    canDelete
      ? {
          ...config,
          rows: config.rows.map(
            (row) =>
              ({
                ...row,
                __actions: [
                  ...((row.__actions ?? []) as RowActionConfig[]),
                  {
                    key: "delete",
                    label: "Delete",
                    href: createDeleteItemHref(row.id),
                    icon: "trash",
                    variant: "destructive",
                  },
                ],
              }) satisfies SimpleRow,
          ),
        }
      : config;

  if (!user || !hasPermission(user.role, "inventory:edit", user.permissions)) {
    return <TablePage config={configWithDelete} />;
  }

  return (
    <>
      <ModalTablePage
        config={configWithDelete}
        actionLabel="New item"
        dialogTitle={product ? "Edit item" : "New item"}
        dialogDescription={
          product ? "Update item details without leaving the list." : "Create an item record."
        }
        initialOpen={initialOpen}
        maxWidth="max-w-6xl"
      >
        <ProductForm
          mode="modal"
          intent={product ? "edit" : "create"}
          initialMode={initialMode}
          categories={categories}
          units={units}
          {...(product
            ? {
                initialValues: {
                  id: product.id,
                  sku: product.sku,
                  name: product.name,
                  categoryId: product.categoryId ?? "",
                  unitId: product.unitId,
                  buyingPrice: Number(product.buyingPrice),
                  sellingPrice: Number(product.sellingPrice),
                  minimumStockAlert: product.minimumStockAlert,
                  description: product.description ?? "",
                },
              }
            : {})}
        />
      </ModalTablePage>
      <ProductDeleteDialog product={deleteProduct} open={initialDeleteOpen && canDelete} />
    </>
  );
}