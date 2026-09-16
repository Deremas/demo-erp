"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { FormFeedback } from "@/components/forms/form-feedback";
import { useCreateDialog } from "@/components/tables/modal-table-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createBulkProductsAction, createProductAction, updateProductAction, type BulkProductInput } from "@/lib/actions/products";
import { createCategoryAction, createBrandAction, createCompanyAction } from "@/lib/actions/inventory-master";
import { productEditorSchema, type ProductEditorFormInput, type ProductEditorInput } from "@/lib/validation/product";

type CreateMode = "SINGLE" | "BULK" | "EXCEL";

type MasterDataOption = { id: string; name: string };

type ProductFormProps = {
  intent?: "create" | "edit";
  initialValues?: Omit<ProductEditorFormInput, "unitId"> & { unitId?: string | null };
  mode?: "page" | "modal";
  cancelHref?: Route;
  onCancel?: () => void;
  onSuccess?: () => void;
  initialMode?: CreateMode;
  categories?: MasterDataOption[];
  brands?: MasterDataOption[];
  companies?: MasterDataOption[];
  units?: MasterDataOption[];
};

const createDefaultValues: ProductEditorFormInput = {
  id: "",
  sku: "",
  name: "",
  categoryId: "",
  brandId: "",
  unitId: "",
  buyingPrice: 0,
  sellingPrice: 0,
  minimumStockAlert: 0,
  description: "",
  companyId: "",
};

export function ProductForm({
  intent = "create",
  initialValues,
  mode = "page",
  cancelHref,
  onCancel,
  onSuccess,
  initialMode,
  categories = [],
  brands = [],
  companies = [],
  units = [],
}: ProductFormProps) {
  const createDialog = useCreateDialog();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<CreateMode>(initialMode || "SINGLE");
  const [bulkContent, setBulkContent] = useState("");
  
  const [localCategories, setLocalCategories] = useState(categories);
  const [localBrands, setLocalBrands] = useState(brands);
  const [localCompanies, setLocalCompanies] = useState(companies);
  
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");

  const isEdit = intent === "edit";
  const defaultValues = useMemo(
    () => ({
      ...createDefaultValues,
      ...(initialValues ?? {}),
      unitId: initialValues?.unitId ?? "",
    }),
    [initialValues],
  );
  
  const form = useForm<ProductEditorFormInput, undefined, ProductEditorInput>({
    resolver: zodResolver(productEditorSchema),
    defaultValues,
  });
  const unitId = "";

  function handleCancel() {
    setSubmitError(null);
    form.reset(defaultValues);
    setBulkContent("");

    if (mode === "page") {
      onCancel?.();
      if (cancelHref) {
        router.push(cancelHref);
      } else {
        router.back();
      }
      return;
    }

    onCancel?.();
    createDialog?.close();
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const result = await createCategoryAction({ name: newCategoryName.trim(), isActive: true });
    if (result.success) {
      toast.success(result.message);
      // We know it created one, let's just refresh to get ID from server, or if action returns ID we'd use it.
      // Since our action doesn't return the ID cleanly in ActionResult, we just router.refresh() 
      // but we lose immediate selection unless we wait for refresh.
      router.refresh();
      setCategoryModalOpen(false);
      setNewCategoryName("");
    } else {
      toast.error(result.message);
    }
  }

  async function handleAddBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const result = await createBrandAction({ name: newBrandName.trim(), isActive: true });
    if (result.success) {
      toast.success(result.message);
      router.refresh();
      setBrandModalOpen(false);
      setNewBrandName("");
    } else {
      toast.error(result.message);
    }
  }

  async function handleAddCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    const result = await createCompanyAction({ name: newCompanyName.trim(), isActive: true });
    if (result.success) {
      toast.success(result.message);
      router.refresh();
      setCompanyModalOpen(false);
      setNewCompanyName("");
    } else {
      toast.error(result.message);
    }
  }

  function onSubmit(values: ProductEditorInput) {
    startTransition(async () => {
      setSubmitError(null);

      if (!isEdit && createMode === "BULK") {
        const itemsToCreate: BulkProductInput[] = bulkContent
          .split("\n")
          .map((name) => name.trim())
          .filter((name) => name.length >= 2)
          .map((name) => ({ name, unit: "bottle" })); // Default for bulk

        if (itemsToCreate.length === 0) {
          setSubmitError("Please provide at least one valid item to create.");
          return;
        }

        const result = await createBulkProductsAction(itemsToCreate);
        if (!result.success) {
          setSubmitError(result.message);
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
        onSuccess?.();
        createDialog?.close();
        return;
      }

      const payload = {
        id: values.id ?? "",
        sku: values.sku,
        name: values.name,
        minimumStockAlert: values.minimumStockAlert,
        categoryId: values.categoryId,
        brandId: values.brandId,
        unitId: values.unitId,
        buyingPrice: values.buyingPrice,
        sellingPrice: values.sellingPrice,
        companyId: values.companyId,
        description: values.description,
      };
      const result = isEdit
        ? await updateProductAction(payload)
        : await createProductAction(payload);

      if (!result.success) {
        setSubmitError(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      form.reset(defaultValues);
      router.refresh();
      onSuccess?.();
      createDialog?.close();
    });
  }

  return (
    <form
      className="min-w-0 space-y-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="flex items-center justify-between gap-4 px-1">
        <FormFeedback
          errors={form.formState.errors}
          submitError={submitError}
          showValidationSummary={form.formState.submitCount > 0}
        />
        {!isEdit && (
          <div className="flex rounded-lg border bg-muted/50 p-1">
            {(["SINGLE", "BULK"] as const).map((modeKey) => (
              <button
                key={modeKey}
                type="button"
                className={`rounded-md px-4 py-1 text-[10px] font-black uppercase tracking-wider ${
                  createMode === modeKey
                    ? "bg-white text-primary shadow-sm dark:bg-slate-900"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setCreateMode(modeKey)}
              >
                {modeKey === "SINGLE" ? "Single Entry" : "Bulk Entry"}
              </button>
            ))}
          </div>
        )}
      </div>

      {createMode === "BULK" && !isEdit ? (
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Bulk Item Import
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-items" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Item List</Label>
              <Textarea
                id="bulk-items"
                rows={12}
                placeholder={"Enter one item per line...\nExample:\nJohnnie Walker Blue Label 750ml\nHennessy XO Cognac 700ml"}
                value={bulkContent}
                onChange={(event) => setBulkContent(event.target.value)}
                className="font-mono text-xs leading-relaxed focus-visible:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Importing..." : "Start Bulk Creation"}</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="border-none shadow-sm ring-1 ring-border">
              <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 p-6 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Item Full Name</Label>
                  <Input placeholder="Johnnie Walker Blue Label 750ml" {...form.register("name")} className="h-10 text-sm font-semibold" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SKU / Item Code</Label>
                  <Input placeholder="Auto-generated if empty" {...form.register("sku")} className="h-10 text-xs font-mono" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Brand Owner Reference</Label>
                  <div className="flex gap-2">
                    <Select 
                      onChange={(e) => form.setValue("companyId", e.target.value)} 
                      value={form.watch("companyId") || ""}
                      className="h-10 text-xs"
                    >
                      <option value="">No Brand Owner</option>
                      {localCompanies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 shrink-0 border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                      onClick={() => setCompanyModalOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description / Notes</Label>
                  <textarea
                    {...form.register("description")}
                    rows={2}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs shadow-sm transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Physical characteristics, alcohol content, etc..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-border">
              <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Units
                  </CardTitle>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded">One unit per item</span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 p-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unit (pcs)</Label>
                  <Select 
                    onChange={(e) => form.setValue("unitId", e.target.value)} 
                    value={form.watch("unitId") || ""}
                    className="h-9 text-xs"
                  >
                    <option value="" disabled>Select unit</option>
                    {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Buying Price</Label>
                  <Input type="number" step="0.01" {...form.register("buyingPrice")} className="h-9 text-right font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Selling Price</Label>
                  <Input type="number" step="0.01" {...form.register("sellingPrice")} className="h-9 text-right font-bold" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm ring-1 ring-border">
              <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Categorization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                  <div className="flex gap-2">
                    <Select 
                      onChange={(e) => form.setValue("categoryId", e.target.value)} 
                      value={form.watch("categoryId") || ""}
                      className="h-9 text-xs"
                    >
                      <option value="" disabled>Select category</option>
                      {localCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 shrink-0 border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                      onClick={() => setCategoryModalOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Brand</Label>
                  <div className="flex gap-2">
                    <Select 
                      onChange={(e) => form.setValue("brandId", e.target.value)} 
                      value={form.watch("brandId") || ""}
                      className="h-9 text-xs"
                    >
                      <option value="">No Brand</option>
                      {localBrands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </Select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 shrink-0 border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                      onClick={() => setBrandModalOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-border">
              <CardHeader className="border-b border-border/50 bg-muted/20 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Inventory Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Low Stock Alert Level</Label>
                  <Input type="number" min={0} {...form.register("minimumStockAlert")} className="h-9 font-bold" />
                  <p className="text-[9px] text-muted-foreground italic">Triggers dashboard alerts when stock drops below this quantity.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending} className="h-10 rounded-xl font-bold uppercase tracking-wider text-[10px]">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} className="h-10 rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20">
                    {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Item"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Legacy Dialogs for Quick Add — kept functional */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Quick Add Category</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Input placeholder="Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
            <Button onClick={handleAddCategory} type="button" className="w-full">Save Category</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={brandModalOpen} onOpenChange={setBrandModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Quick Add Brand</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Input placeholder="Brand Name" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} />
            <Button onClick={handleAddBrand} type="button" className="w-full">Save Brand</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={companyModalOpen} onOpenChange={setCompanyModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Quick Add Brand Owner</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Input placeholder="Brand Owner Name" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} />
            <Button onClick={handleAddCompany} type="button" className="w-full">Save Brand Owner</Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}