export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { getTablePageConfig } from "@/lib/page-data";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { UnitForm } from "@/components/forms/unit-form";
import { InventoryMasterDeleteDialog } from "@/components/inventory/inventory-master-delete-dialog";
import { prisma } from "@/lib/prisma";

export default async function Page(props: { searchParams: Promise<{ id?: string, open?: string, delete?: string }> }) {
  const params = await props.searchParams;
  const initialOpen = params.open === "1" && !params.delete;
  const unitId = params.id;
  const deletingId = params.delete;
  
  const [config, user, unit, unitToDelete] = await Promise.all([
    getTablePageConfig("inventoryUnits"),
    getCurrentUser(),
    unitId ? prisma.unit.findUnique({ where: { id: unitId } }) : null,
    deletingId ? prisma.unit.findUnique({ where: { id: deletingId }, select: { id: true, name: true } }) : null,
  ]);

  if (!user || !hasPermission(user.role, "inventory:edit", user.permissions)) {
    return <TablePage config={config} />;
  }

  return (
    <>
      <ModalTablePage
        config={config}
        actionLabel="New unit"
        dialogTitle={unit ? "Edit Unit" : "New Unit"}
        dialogDescription="Manage measurement units for items."
        initialOpen={initialOpen}
      >
        <UnitForm 
          intent={unit ? "edit" : "create"}
          {...(unit ? { initialValues: { id: unit.id, name: unit.name, isActive: unit.isActive } } : {})}
          closeCreateDialogOnSuccess
        />
      </ModalTablePage>
      {unitToDelete && (
        <InventoryMasterDeleteDialog id={unitToDelete.id} name={unitToDelete.name} type="unit" returnTo="/inventory/units" />
      )}
    </>
  );
}