export const dynamic = "force-dynamic";

import { SupplierDeleteDialog } from "@/components/purchases/supplier-delete-dialog";
import { SupplierForm } from "@/components/forms/supplier-form";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";
import { prisma } from "@/lib/prisma";

type SuppliersPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: SuppliersPageProps) {
  const params = await searchParams;
  const supplierId = getSingleSearchParam(params, "supplierId");
  const deleteSupplierId = getSingleSearchParam(params, "deleteSupplierId");
  const initialDeleteOpen = getSingleSearchParam(params, "delete") === "1";
  const isEdit = getSingleSearchParam(params, "mode") === "edit" && Boolean(supplierId);
  const filters = tableFiltersFromSearchParams(params);
  const [config, supplier, deleteSupplier] = await Promise.all([
    getTablePageConfig("purchasesSuppliers", filters),
    isEdit && supplierId
      ? prisma.supplier.findUnique({
          where: { id: supplierId },
          select: { id: true, name: true, phone: true, address: true },
        })
      : null,
    deleteSupplierId
      ? prisma.supplier.findUnique({
          where: { id: deleteSupplierId },
          select: { id: true, name: true },
        })
      : null,
  ]);

  return (
    <>
      <ModalTablePage
        config={config}
        actionLabel="New supplier"
        dialogTitle={supplier ? "Edit supplier" : "New supplier"}
        dialogDescription={
          supplier
            ? "Update this supplier without leaving the list."
            : "Create a supplier with the details needed to distinguish them clearly."
        }
        initialOpen={Boolean(supplier)}
      >
        <SupplierForm
          closeCreateDialogOnSuccess
          submitLabel={supplier ? "Update supplier" : "Save supplier"}
          {...(supplier
            ? {
                initialValues: {
                  id: supplier.id,
                  name: supplier.name,
                  phone: supplier.phone ?? "",
                  address: supplier.address ?? "",
                },
              }
            : {})}
        />
      </ModalTablePage>
      <SupplierDeleteDialog supplier={deleteSupplier} open={initialDeleteOpen} />
    </>
  );
}