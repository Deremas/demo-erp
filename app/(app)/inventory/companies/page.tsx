export const dynamic = "force-dynamic";

import { TablePage } from "@/components/tables/table-page";
import { getTablePageConfig } from "@/lib/page-data";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { CompanyForm } from "@/components/forms/company-form";
import { InventoryMasterDeleteDialog } from "@/components/inventory/inventory-master-delete-dialog";
import { prisma } from "@/lib/prisma";

export default async function Page(props: { searchParams: Promise<{ id?: string; open?: string; delete?: string }> }) {
  const params = await props.searchParams;
  const initialOpen = params.open === "1" && !params.delete;
  const companyId = params.id;
  const deletingId = params.delete;

  const [config, user, company, companyToDelete] = await Promise.all([
    getTablePageConfig("inventoryCompanies"),
    getCurrentUser(),
    companyId ? prisma.company.findUnique({ where: { id: companyId } }) : null,
    deletingId ? prisma.company.findUnique({ where: { id: deletingId }, select: { id: true, name: true } }) : null,
  ]);

  if (!user || !hasPermission(user.role, "inventory:edit", user.permissions)) {
    return <TablePage config={config} />;
  }

  return (
    <>
      <ModalTablePage
        config={config}
        actionLabel="New brand owner"
        dialogTitle={company ? "Edit Brand Owner" : "New Brand Owner"}
        dialogDescription="Manage brand owners whose items are stocked and sold by Rungo."
        initialOpen={initialOpen}
      >
        <CompanyForm
          intent={company ? "edit" : "create"}
          {...(company ? { initialValues: { id: company.id, name: company.name, isActive: company.isActive } } : {})}
          closeCreateDialogOnSuccess
        />
      </ModalTablePage>
      {companyToDelete && (
        <InventoryMasterDeleteDialog id={companyToDelete.id} name={companyToDelete.name} type="company" returnTo="/inventory/companies" />
      )}
    </>
  );
}