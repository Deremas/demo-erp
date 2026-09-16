export const dynamic = "force-dynamic";

import { ModalTablePage } from "@/components/tables/modal-table-page";
import { ExpenseCategoryForm } from "@/components/forms/expense-category-form";
import { ExpenseCategoryDelete } from "@/components/finance/expense-category-delete";
import { getTablePageConfig } from "@/lib/page-data";
import { prisma } from "@/lib/prisma";
import { getSingleSearchParam, type RouteSearchParams } from "@/lib/query-params";

type CategoriesPageProps = {
  searchParams?: Promise<RouteSearchParams>;
};

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const config = await getTablePageConfig("financeExpenseCategories");

  const editingId = getSingleSearchParam(params, "id");
  const deletingId = getSingleSearchParam(params, "delete");
  
  let initialData = undefined;
  let categoryToDelete = null;

  if (editingId) {
    const category = await prisma.expenseCategory.findUnique({
      where: { id: editingId },
    });
    if (category) {
      initialData = {
        id: category.id,
        name: category.name,
        isActive: category.isActive,
      };
    }
  }

  if (deletingId) {
    categoryToDelete = await prisma.expenseCategory.findUnique({
      where: { id: deletingId },
      select: { id: true, name: true },
    });
  }

  return (
    <>
      <ModalTablePage
        config={config}
        actionLabel="New category"
        dialogTitle={editingId ? "Edit Category" : "New Category"}
        dialogDescription={
          editingId
            ? "Update the details of this expense category."
            : "Add a new category to organize your business expenses."
        }
      >
        <ExpenseCategoryForm initialData={initialData} />
      </ModalTablePage>

      {categoryToDelete && (
        <ExpenseCategoryDelete 
          id={categoryToDelete.id} 
          name={categoryToDelete.name} 
        />
      )}
    </>
  );
}