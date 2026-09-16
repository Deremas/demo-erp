export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { getTablePageConfig } from "@/lib/page-data";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { BrandForm } from "@/components/forms/brand-form";
import { InventoryMasterDeleteDialog } from "@/components/inventory/inventory-master-delete-dialog";
import { prisma } from "@/lib/prisma";

export default async function Page(props: { searchParams: Promise<{ id?: string, open?: string, delete?: string }> }) {
  const params = await props.searchParams;
  const initialOpen = params.open === "1" && !params.delete;
  const brandId = params.id;
  const deletingId = params.delete;
  
  const [config, user, brand, brandToDelete] = await Promise.all([
    getTablePageConfig("inventoryBrands"),
    getCurrentUser(),
    brandId ? prisma.brand.findUnique({ where: { id: brandId } }) : null,
    deletingId ? prisma.brand.findUnique({ where: { id: deletingId }, select: { id: true, name: true } }) : null,
  ]);

  if (!user || !hasPermission(user.role, "inventory:edit", user.permissions)) {
    return <TablePage config={config} />;
  }

  return (
    <>
      <ModalTablePage
        config={config}
        actionLabel="New brand"
        dialogTitle={brand ? "Edit Brand" : "New Brand"}
        dialogDescription="Manage liquor brands for item grouping."
        initialOpen={initialOpen}
      >
        <BrandForm 
          intent={brand ? "edit" : "create"}
          {...(brand ? { initialValues: { id: brand.id, name: brand.name, isActive: brand.isActive } } : {})}
          closeCreateDialogOnSuccess
        />
      </ModalTablePage>
      {brandToDelete && (
        <InventoryMasterDeleteDialog id={brandToDelete.id} name={brandToDelete.name} type="brand" returnTo="/inventory/brands" />
      )}
    </>
  );
}