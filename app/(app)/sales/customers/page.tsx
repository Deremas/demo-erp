export const dynamic = "force-dynamic";

import { CustomerDeleteDialog } from "@/components/sales/customer-delete-dialog";
import { CustomerForm } from "@/components/forms/customer-form";
import { ModalTablePage } from "@/components/tables/modal-table-page";
import { getTablePageConfig, tableFiltersFromSearchParams } from "@/lib/page-data";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";
import { prisma } from "@/lib/prisma";

type CustomersPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function Page({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const customerId = getSingleSearchParam(params, "customerId");
  const deleteCustomerId = getSingleSearchParam(params, "deleteCustomerId");
  const initialDeleteOpen = getSingleSearchParam(params, "delete") === "1";
  const isEdit = getSingleSearchParam(params, "mode") === "edit" && Boolean(customerId);
  const filters = tableFiltersFromSearchParams(params);
  const [config, customer, deleteCustomer] = await Promise.all([
    getTablePageConfig("salesCustomers", filters),
    isEdit && customerId
      ? prisma.customer.findUnique({
          where: { id: customerId },
          select: {
            id: true,
            name: true,
            businessName: true,
            tinNumber: true,
            contactPerson: true,
            contactPhone: true,
            phone: true,
            address: true,
            partyType: true,
            creditLimit: true,
          },
        })
      : null,
    deleteCustomerId
      ? prisma.customer.findUnique({
          where: { id: deleteCustomerId },
          select: { id: true, name: true },
        })
      : null,
  ]);

  return (
    <>
      <ModalTablePage
        config={config}
        actionLabel="New customer"
        dialogTitle={customer ? "Edit customer" : "New customer"}
        dialogDescription={
          customer
            ? "Update this customer without leaving the list."
            : "Create a customer and capture details that distinguish them from walk-in sales."
        }
        initialOpen={Boolean(customer)}
      >
        <CustomerForm
          closeCreateDialogOnSuccess
          submitLabel={customer ? "Update customer" : "Save customer"}
          {...(customer
            ? {
                initialValues: {
                  id: customer.id,
                  name: customer.name,
                  businessName: customer.businessName ?? "",
                  tinNumber: customer.tinNumber ?? "",
                  contactPerson: customer.contactPerson ?? "",
                  contactPhone: customer.contactPhone ?? "",
                  phone: customer.phone ?? "",
                  address: customer.address ?? "",
                  partyType: (customer.partyType === "AGENT" ? "AGENT" : "CUSTOMER") as "CUSTOMER" | "AGENT",
                  creditLimit: Number(customer.creditLimit),
                },
              }
            : {})}
        />
      </ModalTablePage>
      <CustomerDeleteDialog customer={deleteCustomer} open={initialDeleteOpen} />
    </>
  );
}