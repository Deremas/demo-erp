"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MenuItem } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { Pencil, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  deleteLocationAction,
  updateLocationAction,
} from "@/lib/actions/locations";
import {
  getSimpleColumnSizing,
  materialTableBodyCellSx,
  materialTableBodyRowSx,
  materialTableBottomToolbarSx,
  materialTableContainerSx,
  materialTableHeadCellSx,
  materialTablePaginationProps,
  materialTablePropsSx,
  materialTableSearchTextFieldProps,
  materialTableToolbarSx,
} from "@/lib/material-table";
import type { LocationRow } from "@/lib/types";
import {
  locationSchema,
  type LocationFormInput,
} from "@/lib/validation/location";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableExportMenu } from "@/components/tables/table-export-menu";
import { FormFeedback } from "@/components/forms/form-feedback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SimpleColumn } from "@/lib/table";

function getStatusVariant(value: LocationRow["status"]) {
  return value === "ACTIVE" ? "success" : "outline";
}

export function LocationsManager({ rows }: { rows: LocationRow[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<LocationRow | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<LocationRow | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<LocationFormInput>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      type: "" as any,
      location: "",
    },
  });

  const columns = useMemo<MRT_ColumnDef<LocationRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Store / Shop",
        ...getSimpleColumnSizing({ key: "name", header: "Store / Shop" }),
      },
      {
        accessorKey: "type",
        header: "Type",
        ...getSimpleColumnSizing({ key: "type", header: "Type", type: "status" }),
        Cell: ({ cell }) => (
          <Badge variant={cell.getValue<LocationRow["type"]>() === "STORE" ? "default" : "outline"}>
            {cell.getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        ...getSimpleColumnSizing({ key: "location", header: "Location" }),
      },
      {
        accessorKey: "status",
        header: "Status",
        ...getSimpleColumnSizing({ key: "status", header: "Status", type: "status" }),
        Cell: ({ cell }) => (
          <Badge variant={getStatusVariant(cell.getValue<LocationRow["status"]>())}>
            {cell.getValue<string>()}
          </Badge>
        ),
      },
    ],
    [],
  );
  const exportColumns = useMemo<SimpleColumn[]>(
    () => [
      { key: "name", header: "Store / Shop" },
      { key: "type", header: "Type", type: "status" },
      { key: "location", header: "Location" },
      { key: "status", header: "Status", type: "status" },
    ],
    [],
  );
  const isEditMode = Boolean(locationToEdit);

  const table = useMaterialReactTable({
    columns,
    data: rows,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableColumnFilters: false,
    enableHiding: false,
    enableRowActions: true,
    enableStickyHeader: true,
    layoutMode: "grid-no-grow",
    positionActionsColumn: "last",
    initialState: {
      density: "compact",
      pagination: {
        pageIndex: 0,
        pageSize: 20,
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "1rem",
        backgroundColor: "transparent",
        boxShadow: "none",
      },
    },
    muiTableContainerProps: {
      sx: {
        ...materialTableContainerSx,
      },
    },
    muiTableProps: {
      sx: materialTablePropsSx,
    },
    muiTopToolbarProps: {
      sx: materialTableToolbarSx,
    },
    muiBottomToolbarProps: {
      sx: materialTableBottomToolbarSx,
    },
    muiTableHeadCellProps: {
      sx: materialTableHeadCellSx,
    },
    muiTableBodyCellProps: {
      sx: materialTableBodyCellSx,
    },
    muiTableBodyRowProps: {
      sx: materialTableBodyRowSx,
    },
    muiSearchTextFieldProps: {
      ...materialTableSearchTextFieldProps,
      placeholder: "Search stores and shops",
    },
    muiPaginationProps: materialTablePaginationProps,
    renderTopToolbarCustomActions: ({ table }) => (
      <TableExportMenu
        title="Stores & Shops"
        fileName="stores-and-shops"
        columns={exportColumns}
        rows={table.getPrePaginationRowModel().rows.map((row) => row.original)}
      />
    ),
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        key="edit"
        onClick={() => {
          const location = row.original;
          setLocationToEdit(location);
          setCreateError(null);
          form.reset({
            name: location.name,
            type: location.type,
            location: location.location === "-" ? "" : location.location,
          });
          setCreateOpen(true);
          closeMenu();
        }}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit location
      </MenuItem>,
      <MenuItem
        key="delete"
        onClick={() => {
          setLocationToDelete(row.original);
          closeMenu();
        }}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete location
      </MenuItem>,
    ],
  });

  function resetFormState() {
    setCreateError(null);
    setLocationToEdit(null);
    form.reset();
    setCreateOpen(false);
  }

  function handleSave(values: LocationFormInput) {
    startTransition(async () => {
      setCreateError(null);
      const result = locationToEdit
        ? await updateLocationAction({
            id: locationToEdit.id,
            ...values,
          })
        : { success: false, message: "Creating locations is disabled in the UI." };

      if (!result.success) {
        setCreateError(result.message);
        toast.error(result.message);
        return;
      }

      setCreateError(null);
      toast.success(result.message);
      resetFormState();
      router.refresh();
    });
  }

  function handleDelete() {
    if (!locationToDelete) {
      return;
    }

    startTransition(async () => {
      const result = await deleteLocationAction({ locationId: locationToDelete.id });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setLocationToDelete(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <p className="min-w-0 text-sm text-muted-foreground">
          {rows.length === 0
            ? "No locations available."
            : "Manage stores, shops, and warehouses here."}
        </p>
      </div>
      <MaterialReactTable table={table} />
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreateError(null);
            setLocationToEdit(null);
            form.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit location</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the warehouse, store, or shop details."
                : "Creating locations is disabled in the UI."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onChangeCapture={() => {
              if (createError) {
                setCreateError(null);
              }
            }}
            onSubmit={form.handleSubmit(handleSave)}
          >
            <FormFeedback
              errors={form.formState.errors}
              submitError={createError}
              showValidationSummary={form.formState.submitCount > 0}
            />
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Addis Ababa Main Store" {...form.register("name")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.name?.message}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...form.register("type")}
              >
                <option value="">Select type</option>
                <option value="STORE">Main store</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="SHOP">Shop</option>
              </select>
              <p className="text-xs text-destructive">
                {form.formState.errors.type?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Addis Ababa or Djibouti" {...form.register("location")} />
              <p className="text-xs text-destructive">
                {form.formState.errors.location?.message}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetFormState}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditMode ? "Save changes" : "Save location"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={Boolean(locationToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setLocationToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete location?</AlertDialogTitle>
            <AlertDialogDescription>
              {locationToDelete
                ? `This will permanently remove ${locationToDelete.name}. This only works if it has no stock or transaction history.`
                : "This will permanently remove the selected location."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={handleDelete}>
              {isPending ? "Deleting..." : "Delete location"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}