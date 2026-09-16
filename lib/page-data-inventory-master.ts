import { prisma } from "@/lib/prisma";
import type { SimpleRow } from "@/lib/table";
import { formatDateTime } from "@/lib/utils";

export async function getCategoryRows() {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    productCount: row._count.products,
    status: row.isActive ? "ACTIVE" : "INACTIVE",
    updatedAt: formatDateTime(row.updatedAt),
    __actions: [
      { key: "edit", label: "Edit", href: `/inventory/categories?id=${row.id}&mode=edit&open=1`, icon: "edit" },
      {
        key: "delete",
        label: "Delete",
        href: `/inventory/categories?delete=${row.id}`,
        icon: "trash",
        variant: "destructive",
        confirmMessage: `Delete category "${row.name}"? This cannot be undone.`,
      },
    ],
  })) satisfies SimpleRow[];
}

export async function getBrandRows() {
  const rows = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    productCount: row._count.products,
    status: row.isActive ? "ACTIVE" : "INACTIVE",
    updatedAt: formatDateTime(row.updatedAt),
    __actions: [
      { key: "edit", label: "Edit", href: `/inventory/brands?id=${row.id}&mode=edit&open=1`, icon: "edit" },
      {
        key: "delete",
        label: "Delete",
        href: `/inventory/brands?delete=${row.id}`,
        icon: "trash",
        variant: "destructive",
        confirmMessage: `Delete brand "${row.name}"? This cannot be undone.`,
      },
    ],
  })) satisfies SimpleRow[];
}

export async function getUnitRows() {
  const rows = await prisma.unit.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          products: true,
        }
      }
    }
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    productCount: row._count.products,
    status: row.isActive ? "ACTIVE" : "INACTIVE",
    updatedAt: formatDateTime(row.updatedAt),
    __actions: [
      { key: "edit", label: "Edit", href: `/inventory/units?id=${row.id}&mode=edit&open=1`, icon: "edit" },
      {
        key: "delete",
        label: "Delete",
        href: `/inventory/units?delete=${row.id}`,
        icon: "trash",
        variant: "destructive",
        confirmMessage: `Delete unit "${row.name}"? This cannot be undone.`,
      },
    ],
  })) satisfies SimpleRow[];
}

export async function getCompanyRows() {
  const rows = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    productCount: row._count.products,
    status: row.isActive ? "ACTIVE" : "INACTIVE",
    updatedAt: formatDateTime(row.updatedAt),
    __actions: [
      { key: "edit", label: "Edit", href: `/inventory/companies?id=${row.id}&mode=edit&open=1`, icon: "edit" },
      {
        key: "delete",
        label: "Delete",
        href: `/inventory/companies?delete=${row.id}`,
        icon: "trash",
        variant: "destructive",
        confirmMessage: `Delete company "${row.name}"? This cannot be undone.`,
      },
    ],
  })) satisfies SimpleRow[];
}