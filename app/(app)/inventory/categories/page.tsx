export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { getTablePageConfig } from "@/lib/page-data";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { CategoryForm } from "@/components/forms/category-form";
import { InventoryMasterDeleteDialog } from "@/components/inventory/inventory-master-delete-dialog";
import { prisma } from "@/lib/prisma";

export default async function Page(props: { searchParams: Promise<{ id?: string, open?: string, delete?: string }> }) {
  const params = await props.searchParams;
  const initialOpen = params.open === "1" && !params.delete;
  const categoryId = params.id;
  const deletingId = params.delete;
  
  const [config, user, category, categoryToDelete] = await Promise.all([
    getTablePageConfig("inventoryCategories"),
    getCurrentUser(),
    categoryId ? prisma.category.findUnique({ where: { id: categoryId } }) : null,
    deletingId ? prisma.category.findUnique({ where: { id: deletingId }, select: { id: true, name: true } }) : null,
  ]);

  if (!user || !hasPermission(user.role, "inventory:edit", user.permissions)) {
    return <TablePage config={config} />;
  }

  return (
    <>
      <ModalTablePage
        config={config}
        actionLabel="New category"
        dialogTitle={category ? "Edit Category" : "New Category"}
        dialogDescription="Manage category details for item grouping."
        initialOpen={initialOpen}
      >
        <CategoryForm 
          intent={category ? "edit" : "create"}
          {...(category ? { initialValues: { id: category.id, name: category.name, isActive: category.isActive } } : {})}
          closeCreateDialogOnSuccess
        />
      </ModalTablePage>
      {categoryToDelete && (
        <InventoryMasterDeleteDialog id={categoryToDelete.id} name={categoryToDelete.name} type="category" returnTo="/inventory/categories" />
      )}
    </>
  );
}