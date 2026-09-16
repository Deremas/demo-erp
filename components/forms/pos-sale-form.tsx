"use client";

import { useRouter } from "next/navigation";
import { History, Minus, Plus, Search, ShoppingCart, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CustomerForm } from "@/components/forms/customer-form";
import { CreditLimitNotice } from "@/components/sales/credit-limit-notice";
import { createSaleAction, getRecentSalesAction } from "@/lib/actions/sales";
import { evaluateCreditLimit, salePartyLabel } from "@/lib/credit-limit";
import { formatFinanceAccountLabel } from "@/lib/finance-account-utils";
import { CurrencyInput } from "@/components/ui/currency-input";
import type { NamedOption, SaleFormOptions } from "@/lib/types";
import { cn, formatCurrency, formatCustomerName, formatDateForInput } from "@/lib/utils";
import { PrintButton } from "@/components/shared/print-button";
import type { SaleFormInput } from "@/lib/validation/sale";

type SaleLineDiscountType = "PER_QTY" | "FIXED" | "PERCENTAGE" | "";

type PosCartLine = {
  productId: string;
  unitId: string;
  unitName: string;
  name: string;
  availableQty: number;
  unitPrice: number;
  quantity: number;
  discount: number;
  discountType: SaleLineDiscountType;
  discountRate: number;
};

function formatInputNumber(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

function parseInputNumber(value: string): number {
  return Number(value.replace(/,/g, ""));
}

function getLineBaseQuantity(item: PosCartLine) {
  return item.quantity;
}

function getStockForProduct(options: SaleFormOptions, locationId: string, productId: string) {
  return options.locationStock.find(
    (item) => item.locationId === locationId && item.productId === productId,
  );
}

function getAvailableAccounts(
  options: SaleFormOptions,
  locationId: string,
  paymentMethod: "CASH" | "BANK" | "CHEQUE" | "CREDIT",
) {
  if (paymentMethod === "CREDIT" || paymentMethod === "CHEQUE") return [];
  return options.accounts.filter(
    (account) =>
      account.type === paymentMethod &&
      (!account.locationId || account.locationId === locationId),
  );
}

export function PosSaleForm({
  options,
  initialLocationId,
  initialProductId,
  userRole,
}: {
  options: SaleFormOptions;
  initialLocationId?: string | undefined;
  initialProductId?: string | undefined;
  userRole?: string | undefined;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [addedCustomers, setAddedCustomers] = useState<NamedOption[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [locationId, setLocationId] = useState(initialLocationId ?? "");


  const fetchRecentSales = async () => {
    const sales = await getRecentSalesAction(locationId);
    setRecentSales(sales);
  };

  useEffect(() => {
    fetchRecentSales();
  }, [locationId]);

  const allCustomers = useMemo(
    () => [...options.customers, ...addedCustomers],
    [options.customers, addedCustomers],
  );

  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK" | "CHEQUE" | "CREDIT" | "MIXED">("CASH");
  const [financeAccountId, setFinanceAccountId] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [depositableDate, setDepositableDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [payments, setPayments] = useState<{ 
    method: "CASH" | "BANK" | "CHEQUE" | "CREDIT"; 
    financeAccountId: string; 
    amount: number;
    chequeNumber?: string;
    bankName?: string;
    chequeDate?: string;
    depositableDate?: string;
    expiryDate?: string;
  }[]>([]);
  const [soldAt, setSoldAt] = useState(formatDateForInput());
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<PosCartLine[]>([]);
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [globalDiscountType, setGlobalDiscountType] = useState<"FIXED" | "PERCENTAGE" | "">("");
  const [globalDiscountRate, setGlobalDiscountRate] = useState(0);
  const initialProductAdded = useRef(false);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return options.products
      .map((product) => {
        const stock = getStockForProduct(options, locationId, product.id);
        return stock
          ? {
              ...product,
              availableQty: stock.availableQty,
              sellingPrice: stock.unitPrice,
              defaultUnitPrice: stock.unitPrice,
            }
          : null;
      })
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .filter((p) => p.availableQty > 0)
      .filter((p) => (normalizedQuery ? (p.name.toLowerCase().includes(normalizedQuery) || p.sku.toLowerCase().includes(normalizedQuery)) : true));
  }, [locationId, options, query]);

  const availableAccounts = getAvailableAccounts(options, locationId, paymentMethod === "MIXED" ? "CASH" : paymentMethod as any);
  const grossTotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const lineDiscountTotal = cart.reduce((sum, item) => sum + getLineBaseQuantity(item) * item.discount, 0);
  
  const globalDiscountTotal = useMemo(() => {
    if (globalDiscountType === "PERCENTAGE") {
      return (grossTotal - lineDiscountTotal) * (globalDiscountRate / 100);
    }
    if (globalDiscountType === "FIXED") {
      return globalDiscountRate;
    }
    return 0;
  }, [globalDiscountType, globalDiscountRate, grossTotal, lineDiscountTotal]);

  const discountTotal = lineDiscountTotal + globalDiscountTotal;
  const total = grossTotal - discountTotal;

  const totalAllocated = paymentMethod === "MIXED"
    ? payments.reduce((sum, p) => sum + p.amount, 0)
    : (paymentMethod === "CREDIT" ? 0 : total);
  const totalPaid = paymentMethod === "MIXED"
    ? payments.reduce((sum, p) => (p.method === "CASH" || p.method === "BANK" ? sum + p.amount : sum), 0)
    : (paymentMethod === "CASH" || paymentMethod === "BANK" ? total : 0);

  const amountDue = total - totalPaid;
  const isOverpaid = totalAllocated > total + 0.01; // Allow for tiny float differences

  const canUseAccount = paymentMethod === "MIXED"
    ? payments.length > 0 && payments.every((p) => p.amount > 0 && (!["CASH", "BANK"].includes(p.method) || p.financeAccountId))
    : (paymentMethod === "CREDIT" || paymentMethod === "CHEQUE" || availableAccounts.some((a) => a.id === financeAccountId));

  const hasRequiredChequeInfo = paymentMethod !== "CHEQUE" || (
    chequeNumber.trim() !== "" &&
    bankName.trim() !== "" &&
    chequeDate.trim() !== "" &&
    depositableDate.trim() !== ""
  );
  const mixedHasRequiredChequeInfo = paymentMethod !== "MIXED" || payments.every((p) => (
    p.method !== "CHEQUE" || (
      (p.chequeNumber ?? "").trim() !== "" &&
      (p.bankName ?? "").trim() !== "" &&
      (p.chequeDate ?? "").trim() !== "" &&
      (p.depositableDate ?? "").trim() !== ""
    )
  ));
  const usesCheque = paymentMethod === "CHEQUE" || (paymentMethod === "MIXED" && payments.some((p) => p.method === "CHEQUE"));

  const selectedParty = allCustomers.find((customer) => customer.id === customerId);
  const creditStatus = evaluateCreditLimit({
    creditLimit: Number(selectedParty?.creditLimit || 0),
    outstanding: Number(selectedParty?.creditBalance || 0),
    additionalDue: amountDue,
  });
  const canSubmit = locationId && cart.length > 0 && total > 0 && canUseAccount && hasRequiredChequeInfo && mixedHasRequiredChequeInfo && !isOverpaid && (amountDue <= 0.01 || customerId) && (!usesCheque || customerId) && (amountDue <= 0.01 || creditStatus.allowed);

  useEffect(() => {
    if (paymentMethod === "CREDIT") {
      setFinanceAccountId("");
      return;
    }

    if (availableAccounts.length === 1 && availableAccounts[0] && financeAccountId !== availableAccounts[0].id) {
      setFinanceAccountId(availableAccounts[0].id);
    } else if (
      financeAccountId &&
      !availableAccounts.some((a) => a.id === financeAccountId)
    ) {
      setFinanceAccountId("");
    }
  }, [availableAccounts, financeAccountId, paymentMethod]);

  useEffect(() => {
    if (initialProductAdded.current || !initialProductId) return;
    if (visibleProducts.some((p) => p.id === initialProductId)) {
      addToCart(initialProductId);
      initialProductAdded.current = true;
    }
  }, [initialProductId, visibleProducts]);

  function addToCart(productId: string) {
    const product = visibleProducts.find((p) => p.id === productId);
    if (!product) return;
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        const canAddMore = (getLineBaseQuantity(existing) + 1) <= existing.availableQty;
        if (!canAddMore) return current;
        return current.map((item) => {
          if (item.productId !== product.id) return item;
          return { ...item, quantity: item.quantity + 1 };
        });
      }
      return [...current, {
        productId: product.id,
        unitId: product.unitId,
        unitName: product.unitName,
        unitPrice: product.sellingPrice,
        name: product.name,
        availableQty: product.availableQty,
        discount: 0,
        discountType: "",
        discountRate: 0,
        quantity: 1,
      }];
    });
  }

  function updateItemQuantity(productId: string, remainderQty: number) {
    setCart((current) =>
      current.map((item) => {
        if (item.productId !== productId) return item;
        const newTotalBase = Math.max(0, Math.min(item.availableQty, remainderQty));
        const newDiscount = item.discountType === "PERCENTAGE"
          ? (item.unitPrice * item.discountRate) / 100
          : item.discountType === "FIXED"
            ? (newTotalBase > 0 ? item.discountRate / newTotalBase : 0)
            : item.discountType === "PER_QTY"
              ? item.discountRate
              : 0;

        return { ...item, quantity: newTotalBase, discount: newDiscount };
      }),
    );
  }

  function updateItemPrice(productId: string, unitType: "PACKAGE" | "BASE", newPrice: number) {
    setCart((current) =>
      current.map((item) => {
        if (item.productId !== productId) return item;
        const safePrice = Math.max(0, isNaN(newPrice) ? 0 : newPrice);
        const updated = { ...item, unitPrice: safePrice };

        // Recalculate discount amount based on updated price
        const totalBase = getLineBaseQuantity(updated);
        const discount = updated.discountType === "PERCENTAGE"
          ? (updated.unitPrice * updated.discountRate) / 100
          : updated.discountType === "FIXED"
            ? (totalBase > 0 ? updated.discountRate / totalBase : 0)
            : updated.discountType === "PER_QTY"
              ? updated.discountRate
              : 0;

        return { ...updated, discount };
      }),
    );
  }

  function updateItemDiscount(productId: string, type: SaleLineDiscountType, rate: number) {
    setCart((current) =>
      current.map((item) => {
        if (item.productId !== productId) return item;
        const totalBase = getLineBaseQuantity(item);
        const discount = type === "PERCENTAGE"
          ? (item.unitPrice * rate) / 100
          : type === "FIXED"
            ? (totalBase > 0 ? rate / totalBase : 0)
            : type === "PER_QTY"
              ? rate
              : 0;
        return { ...item, discountType: type, discountRate: rate, discount };
      }),
    );
  }

  function removeFromCart(productId: string) {
    setCart((current) => current.filter((item) => item.productId !== productId));
  }

  function handleLocationChange(nextLocationId: string) {
    setLocationId(nextLocationId);
    setCart([]);
    setFinanceAccountId("");
  }

  function handlePaymentMethodChange(nextMethod: "CASH" | "BANK" | "CHEQUE" | "CREDIT" | "MIXED") {
    setPaymentMethod(nextMethod);
    setFinanceAccountId("");
    if (nextMethod === "MIXED" && payments.length === 0) {
      setPayments([{ method: "CASH", financeAccountId: "", amount: total }]);
    }
  }

  function addPaymentRow() {
    const remaining = Math.max(0, total - payments.reduce((sum, p) => sum + p.amount, 0));
    setPayments([...payments, { method: "CASH", financeAccountId: "", amount: remaining }]);
  }

  function removePaymentRow(index: number) {
    setPayments(payments.filter((_, i) => i !== index));
  }

  function updatePaymentRow(index: number, updates: Partial<(typeof payments)[0]>) {
    setPayments(payments.map((p, i) => i === index ? { ...p, ...updates } : p));
  }

  function submitSale() {
    const payload: SaleFormInput = {
      locationId,
      customerId,
      paymentMethod,
      settlementMode: paymentMethod === "CREDIT" ? "UNPAID" : "FULL",
      amountPaid: (paymentMethod === "CREDIT") ? 0 : total,
      financeAccountId: paymentMethod === "MIXED" ? "" : financeAccountId,
      chequeNumber: paymentMethod === "CHEQUE" ? chequeNumber : undefined,
      bankName: paymentMethod === "CHEQUE" ? bankName : undefined,
      chequeDate: paymentMethod === "CHEQUE" ? chequeDate : undefined,
      depositableDate: paymentMethod === "CHEQUE" ? depositableDate : undefined,
      expiryDate: paymentMethod === "CHEQUE" ? expiryDate : undefined,
      payments: paymentMethod === "MIXED" ? payments : undefined,
      soldAt,
      note: "",
      items: cart.map((item) => {
        const baseQuantity = getLineBaseQuantity(item);
        const exactLineGross = baseQuantity * item.unitPrice;
        const exactLineTotal = exactLineGross - (baseQuantity * item.discount);
        
        const backendGross = baseQuantity * item.unitPrice;
        const requiredTotalDiscount = backendGross - exactLineTotal;
        const adjustedDiscount = baseQuantity > 0 ? requiredTotalDiscount / baseQuantity : 0;

        return {
          productId: item.productId,
          unitId: item.unitId,
          quantity: baseQuantity,
          unitPrice: item.unitPrice,
          discount: adjustedDiscount,
          discountType: item.discountType || undefined,
          discountRate: item.discountRate || undefined,
        };
      }),
      discountType: globalDiscountType || undefined,
      discountRate: globalDiscountType ? globalDiscountRate : undefined,
    };
    startTransition(async () => {
      const result = await createSaleAction(payload);
      if (!result.success) { toast.error(result.message); return; }
      const saleNumber = result.message.match(/Sale\s+([A-Z0-9-]+)/)?.[1];
      toast.success("Sale posted successfully", {
        description: saleNumber ? `Reference: ${saleNumber}` : result.message,
      });
      setCart([]);
      setCustomerId("");
      setSoldAt(formatDateForInput());
      setPaymentMethod("CASH");
      setPayments([]);
      setFinanceAccountId("");
      setChequeNumber("");
      setBankName("");
      setChequeDate("");
      fetchRecentSales();
      router.refresh();
    });
  }

  if (options.locations.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Create stores and shops before posting POS sales.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_32rem] xl:grid-cols-[minmax(0,1fr)_36rem] 2xl:grid-cols-[minmax(0,1fr)_40rem] 3xl:grid-cols-[minmax(0,1fr)_48rem] 4xl:grid-cols-[minmax(0,1fr)_60rem]">

      {/* ── LEFT: Product Browser ───────────────────────────────────── */}
      <div className="flex flex-col gap-5 min-w-0">

        {/* Sale Header */}
        <Card className="rounded-2xl border-slate-200/70 shadow-sm overflow-hidden">
          <CardContent className="flex flex-wrap gap-6 p-6">
            <div className="flex-1 min-w-[240px] space-y-2">
              <Label htmlFor="pos-location" className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">Selling Location</Label>
              <Select
                id="pos-location"
                value={locationId}
                disabled={userRole !== "ADMIN" && options.locations.length <= 1 && Boolean(locationId)}
                onChange={(e) => handleLocationChange(e.target.value)}
              >
                <option value="">Select shop / store</option>
                {options.locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </Select>
            </div>

            <div className="flex-1 min-w-[240px] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="pos-customer" className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">Customer / Agent</Label>
                <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/50 px-2.5 py-1 text-[10px] font-black text-blue-600 transition-all hover:bg-blue-600 hover:text-white">
                      <UserPlus className="h-3 w-3" /> Quick Add
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Quick add customer or agent</DialogTitle>
                      <DialogDescription>Choose Customer or Agent and set a credit limit if they will buy on credit.</DialogDescription>
                    </DialogHeader>
                    <CustomerForm
                      refreshAfterSuccess={false}
                      onSuccess={(customer) => {
                        setAddedCustomers((prev) => [...prev, {
                          ...customer,
                          partyType: customer.partyType ?? "CUSTOMER",
                          creditLimit: Number(customer.creditLimit || 0),
                          creditBalance: 0,
                        }]);
                        setCustomerId(customer.id);
                        setQuickAddOpen(false);
                      }}
                      onCancel={() => setQuickAddOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <Select id="pos-customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Walk-in customer</option>
                {allCustomers.map((c) => <option key={c.id} value={c.id}>{salePartyLabel(c)}</option>)}
              </Select>
            </div>

            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="pos-sold-at" className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">Sale Date</Label>
              <Input id="pos-sold-at" type="datetime-local" value={soldAt} onChange={(e) => setSoldAt(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Product Browser */}
        <Card className="rounded-2xl border-slate-200/70 shadow-sm flex-1">
          <CardHeader className="p-5 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-[15px] font-bold text-slate-900">Products</CardTitle>
              <div className="relative flex-1 max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9 h-9 text-sm rounded-xl border-slate-200"
                  placeholder="Search product..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {!locationId ? (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
                Select a location to view available products
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
                No available stock in the selected location
              </div>
            ) : (
              <div className="overflow-auto max-h-[calc(100vh-260px)] min-h-[400px] rounded-2xl border border-slate-200 bg-white [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="min-w-[920px] w-full text-left text-sm relative">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-sm outline outline-1 outline-slate-100">
                    <tr>
                      <th className="px-4 py-3 bg-slate-50">Product</th>
                      <th className="px-4 py-3 bg-slate-50">Available Stock</th>
                      <th className="px-4 py-3 bg-slate-50">Qty</th>
                      <th className="px-4 py-3 bg-slate-50">Unit Price</th>
                      <th className="px-4 py-3 bg-slate-50">Base Price</th>
                      <th className="px-4 py-3 bg-slate-50">In Cart</th>
                      <th className="sticky right-0 bg-slate-50 px-4 py-3 text-right shadow-[-10px_0_16px_rgba(15,23,42,0.05)] z-20 w-[110px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleProducts.map((product) => {
                      const cartLine = cart.find((c) => c.productId === product.id);
                      return (
                        <tr
                          key={product.id}
                          onClick={() => addToCart(product.id)}
                          className={cn(
                            "cursor-pointer transition-colors hover:bg-[hsl(var(--accent)/0.45)]",
                            cartLine && "bg-[hsl(var(--accent)/0.55)]",
                          )}
                        >
                          <td className="px-4 py-3">
                            <p className="max-w-[17rem] truncate font-semibold text-slate-900">{product.name}</p>
                            <p className="mt-1 text-[11px] font-medium text-slate-400">
                              Stock {product.availableQty} {product.unitName}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700">
                            {product.availableQty} {product.unitName}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {product.availableQty} {product.unitName}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {formatCurrency(product.sellingPrice)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatCurrency(product.sellingPrice)}
                          </td>
                          <td className="px-4 py-3">
                            {cartLine ? (
                              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary whitespace-nowrap inline-block">
                                {getLineBaseQuantity(cartLine)} {cartLine.unitName}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="sticky right-0 bg-inherit px-4 py-3 text-right shadow-[-10px_0_16px_rgba(15,23,42,0.05)] w-[110px]">
                            <Button
                              type="button"
                              size="sm"
                              variant={cartLine ? "secondary" : "default"}
                              className={cn(
                                "h-6 rounded-lg px-2 text-[10px] font-bold shadow-sm transition-all",
                                !cartLine && "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                              )}
                              onClick={(event) => {
                                event.stopPropagation();
                                addToCart(product.id);
                              }}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Add
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── RIGHT: Cart + Checkout ──────────────────────────────────── */}
      <div className="flex min-w-0 flex-col">
        <Card className="rounded-2xl border-slate-200/70 shadow-sm">
          {/* Cart Header */}
          <CardHeader className="border-b border-border p-4 pb-0">
            <CardTitle className="flex items-center justify-between text-lg font-black tracking-tight text-slate-900">
              <div className="flex items-center gap-6">
                <button 
                  type="button" 
                  onClick={() => setShowHistory(false)}
                  className={cn("flex items-center gap-2 pb-1 border-b-2 transition-all", !showHistory ? "border-primary text-primary" : "border-transparent text-slate-400")}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowHistory(true)}
                  className={cn("flex items-center gap-2 pb-1 border-b-2 transition-all", showHistory ? "border-primary text-primary" : "border-transparent text-slate-400")}
                >
                  <History className="h-4 w-4" />
                  History
                </button>
                {!showHistory && (
                  <div className="flex items-center gap-2 border-l border-border pl-6">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer" onClick={() => {
                        const next = !showDiscounts;
                        setShowDiscounts(next);
                        if (!next) {
                          setGlobalDiscountType("");
                          setGlobalDiscountRate(0);
                          setCart(c => c.map(i => ({ ...i, discount: 0 })));
                        }
                    }}>Discount</Label>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !showDiscounts;
                        setShowDiscounts(next);
                        if (!next) {
                          setGlobalDiscountType("");
                          setGlobalDiscountRate(0);
                          setCart(c => c.map(i => ({ ...i, discount: 0 })));
                        }
                      }}
                      className={cn(
                        "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        showDiscounts ? "bg-primary" : "bg-slate-200"
                      )}
                    >
                      <span className={cn(
                        "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        showDiscounts ? "translate-x-3" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {!showHistory && cart.length > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                    {cart.length}
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          {/* Body Section */}
          <div className="p-0 overflow-x-auto">
            {showHistory ? (
              <div className="p-5 space-y-3">
                {recentSales.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400 text-center">
                    No recent sales found for this location.
                  </div>
                ) : (
                  recentSales.map((sale) => (
                    <div key={sale.id} className="rounded-xl border border-border bg-card p-3 shadow-sm hover:border-primary/50 transition-colors group">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="text-[12px] font-black text-slate-950 uppercase">{sale.saleNumber}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">{sale.customer?.name ?? "Walk-in"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-black text-slate-900">{formatCurrency(sale.total)}</p>
                          <p className="text-[9px] font-bold text-slate-400">{new Date(sale.soldAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                         <PrintButton 
                           url={`/print/sale/${sale.id}`} 
                           variant="outline"
                           className="h-7 px-3 text-[10px] font-black uppercase border-border text-muted-foreground hover:bg-accent hover:text-primary mt-2"
                           label="Re-print Receipt"
                         />
                    </div>
                  ))
                )}
              </div>
            ) : cart.length === 0 ? (
              <div className="p-5">
                <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 text-sm text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 text-slate-200" />
                  <span>Select items to start the sale</span>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap min-w-[500px]">
                <thead className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Price (ETB)</th>
                    {showDiscounts && <th className="px-4 py-3">Discount</th>}
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {cart.map((item) => {
                    const baseQuantity = getLineBaseQuantity(item);
                    const lineDiscount = baseQuantity * item.discount;
                    const lineTotal = (baseQuantity * item.unitPrice) - lineDiscount;

                    return (
                      <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-1.5 align-middle border-b border-slate-100">
                          <div className="min-w-[140px]">
                            <p className="text-[12px] font-bold text-slate-950 leading-tight whitespace-nowrap">{item.name}</p>
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 mt-0.5">
                              <span>
                                Stock: {item.availableQty} {item.unitName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-1.5 align-middle border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest w-8 truncate" title={item.unitName}>
                              Qty
                            </span>
                            <div className="flex h-7 w-[84px] shrink-0 items-center rounded-lg border border-border bg-card overflow-hidden">
                              <button
                                type="button"
                                className="h-full w-7 flex items-center justify-center font-black text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors"
                                disabled={baseQuantity <= 0}
                                onClick={() => updateItemQuantity(item.productId, baseQuantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <input
                                type="number"
                                className="h-full w-full min-w-0 border-0 bg-transparent text-center text-[12px] font-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={baseQuantity}
                                onChange={(e) => updateItemQuantity(item.productId, Number(e.target.value || 0))}
                              />
                              <button
                                type="button"
                                className="h-full w-7 flex items-center justify-center font-black text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors"
                                onClick={() => updateItemQuantity(item.productId, baseQuantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-1.5 align-middle border-b border-slate-100">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-medium text-slate-400 shrink-0">ETB</span>
                            <input 
                              type="text" 
                              inputMode="decimal"
                              className="h-7 w-[80px] border border-border rounded-lg text-right text-[11px] font-bold px-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                              value={item.unitPrice || item.unitPrice === 0 ? formatInputNumber(item.unitPrice) : ""}
                              onChange={(e) => updateItemPrice(item.productId, "BASE", parseInputNumber(e.target.value))}
                              placeholder="Price"
                            />
                          </div>
                        </td>
                        
                        {showDiscounts && (
                          <td className="px-4 py-1.5 align-middle border-b border-slate-100">
                            <div className="flex items-center gap-1.5 w-[170px]">
                              <div className="flex gap-0.5 shrink-0 bg-slate-100 p-0.5 rounded-md">
                                <button
                                  type="button"
                                  onClick={() => updateItemDiscount(item.productId, "PER_QTY", item.discountRate)}
                                  className={cn(
                                    "text-[8px] font-black uppercase px-1.5 py-0.5 rounded transition-colors",
                                    item.discountType === "PER_QTY" || !item.discountType ? "bg-white text-destructive shadow-sm" : "text-slate-400 hover:text-slate-600"
                                  )}
                                >QTY</button>
                                <button
                                  type="button"
                                  onClick={() => updateItemDiscount(item.productId, "FIXED", item.discountRate)}
                                  className={cn(
                                    "text-[8px] font-black uppercase px-1.5 py-0.5 rounded transition-colors",
                                    item.discountType === "FIXED" ? "bg-white text-destructive shadow-sm" : "text-slate-400 hover:text-slate-600"
                                  )}
                                >FIX</button>
                                <button
                                  type="button"
                                  onClick={() => updateItemDiscount(item.productId, "PERCENTAGE", item.discountRate)}
                                  className={cn(
                                    "text-[8px] font-black uppercase px-1.5 py-0.5 rounded transition-colors",
                                    item.discountType === "PERCENTAGE" ? "bg-white text-destructive shadow-sm" : "text-slate-400 hover:text-slate-600"
                                  )}
                                >%</button>
                              </div>
                              <input
                                type="text"
                                inputMode="decimal"
                                className="h-7 w-full border border-destructive/20 bg-destructive/5 rounded-lg text-right text-[11px] font-black px-2 focus:outline-none focus:border-destructive text-destructive placeholder:text-destructive/30"
                                value={item.discountRate || item.discountRate === 0 ? formatInputNumber(item.discountRate) : ""}
                                onChange={(e) => {
                                  const v = parseInputNumber(e.target.value);
                                  updateItemDiscount(item.productId, item.discountType || "PER_QTY", v);
                                }}
                                placeholder="0.00"
                              />
                            </div>
                          </td>
                        )}
                        
                        <td className="px-4 py-1.5 text-right align-middle border-b border-slate-100">
                          <p className="text-[13px] font-black text-slate-950 mt-1">{formatCurrency(lineTotal)}</p>
                          {lineDiscount > 0 && <p className="text-[10px] font-bold text-destructive">-{formatCurrency(lineDiscount)}</p>}
                        </td>
                        <td className="px-4 py-1.5 align-middle border-b border-slate-100">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="border-t border-border p-4 space-y-4 bg-card rounded-b-2xl">
            {/* Payment Method Grid */}
            <div className="grid grid-cols-5 gap-1.5">
              {(["CASH", "BANK", "CHEQUE", "CREDIT", "MIXED"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => handlePaymentMethodChange(method)}
                  className={`h-8 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all ${
                      paymentMethod === method
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            <CreditLimitNotice party={selectedParty} additionalDue={amountDue} />

            {/* Mixed Payment Interface */}
            {paymentMethod === "MIXED" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Breakdown</Label>
                  <button type="button" onClick={addPaymentRow} className="text-[10px] font-black text-primary uppercase hover:underline">+ Add Method</button>
                </div>
                <div className="space-y-1.5">
                  {payments.map((p, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-2">
                      <div className="flex items-center gap-2">
                        <select
                          className="h-7 w-20 shrink-0 rounded-md border border-border bg-card text-[11px] font-bold px-1.5 outline-none"
                          value={p.method}
                          onChange={(e) => updatePaymentRow(idx, { method: e.target.value as any, financeAccountId: "" })}
                        >
                          <option value="CASH">Cash</option>
                          <option value="BANK">Bank</option>
                          <option value="CHEQUE">Cheque</option>
                          <option value="CREDIT">Credit</option>
                        </select>
                        
                        {["CASH", "BANK"].includes(p.method) ? (
                          <select
                            className="h-7 flex-1 rounded-md border border-border bg-card text-[11px] font-medium px-1.5 outline-none truncate"
                            value={p.financeAccountId}
                            onChange={(e) => updatePaymentRow(idx, { financeAccountId: e.target.value })}
                          >
                            <option value="">Select account</option>
                            {options.accounts
                              .filter(acc => acc.type === p.method && (!acc.locationId || acc.locationId === locationId))
                              .map(acc => (
                                <option key={acc.id} value={acc.id}>{formatFinanceAccountLabel(acc)}</option>
                              ))}
                          </select>
                        ) : (
                          <div className="flex-1 text-[10px] font-bold text-slate-400 italic flex items-center">
                            {p.method === "CHEQUE" ? "Enter cheque details below" : "No account needed"}
                          </div>
                        )}

                        <CurrencyInput
                          className="h-7 w-20 shrink-0 text-[11px] font-black text-right rounded-md border border-border bg-transparent outline-none focus:ring-1 focus:ring-primary px-1"
                          value={p.amount || ""}
                          onValueChange={(values) => updatePaymentRow(idx, { amount: values.floatValue ?? 0 })}
                          placeholder="0.00"
                        />
                        <button type="button" onClick={() => removePaymentRow(idx)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-3 w-3" /></button>
                      </div>

                      {p.method === "CHEQUE" && (
                        <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-2">
                          <Input 
                            placeholder="Cheque #" 
                            value={p.chequeNumber || ""} 
                            onChange={(e) => updatePaymentRow(idx, { chequeNumber: e.target.value })}
                            className="h-9 text-xs font-bold"
                          />
                          <Input 
                            placeholder="Bank Name" 
                            value={p.bankName || ""} 
                            onChange={(e) => updatePaymentRow(idx, { bankName: e.target.value })}
                            className="h-9 text-xs font-bold"
                          />
                          <div className="col-span-2 text-[10px] font-bold text-blue-600/80 bg-blue-50/50 dark:bg-blue-900/20 px-2 py-1.5 rounded">
                            Cheque Date: Written on. Depositable: Maturation date.
                          </div>
                          <div className="col-span-1 space-y-1">
                            <Label className="text-[9px] font-bold uppercase text-slate-500">Cheque Date</Label>
                            <Input 
                              type="date" 
                              value={p.chequeDate || ""} 
                              onChange={(e) => updatePaymentRow(idx, { chequeDate: e.target.value })}
                              className="h-9 text-xs font-bold"
                            />
                          </div>
                          <div className="col-span-1 space-y-1">
                            <Label className="text-[9px] font-bold uppercase text-slate-500">Depositable</Label>
                            <Input 
                              type="date" 
                              value={p.depositableDate || ""} 
                              onChange={(e) => updatePaymentRow(idx, { depositableDate: e.target.value })}
                              className="h-9 text-xs font-bold"
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] font-bold uppercase text-slate-500">Expiry (Optional)</Label>
                            <Input 
                              type="date" 
                              value={p.expiryDate || ""} 
                              onChange={(e) => updatePaymentRow(idx, { expiryDate: e.target.value })}
                              className="h-9 text-xs font-bold"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Single Account Selector or Cheque Details */}
            {paymentMethod === "CHEQUE" && (
              <div className="space-y-2 rounded-xl border border-blue-200 p-3 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-900/30">
                <Label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest pl-1">Cheque Info</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Cheque Number" value={chequeNumber} onChange={(e) => setChequeNumber(e.target.value)} className="h-9 text-xs font-bold col-span-1" />
                  <Input placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="h-9 text-xs font-bold col-span-1" />
                  <div className="col-span-2 text-xs font-bold text-blue-600/80 bg-blue-100/50 dark:bg-blue-900/20 px-2.5 py-2 rounded flex items-start gap-1">
                    <span>Note: Cheque Date is when it was written. Depositable Date is when it matures.</span>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold text-slate-500 uppercase pl-1">Cheque Date</Label>
                    <Input type="date" value={chequeDate} onChange={(e) => setChequeDate(e.target.value)} className="h-9 text-xs font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold text-slate-500 uppercase pl-1">Depositable Date</Label>
                    <Input type="date" value={depositableDate} onChange={(e) => setDepositableDate(e.target.value)} className="h-9 text-xs font-bold" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-[9px] font-bold text-slate-500 uppercase pl-1">Expiry Date (Optional)</Label>
                    <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="h-9 text-xs font-bold" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod !== "CREDIT" && paymentMethod !== "MIXED" && paymentMethod !== "CHEQUE" && (
              <div className="space-y-1">
                <Label htmlFor="pos-account" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  {paymentMethod === "BANK" ? "Bank Account" : "Cash Account"}
                </Label>
                <Select id="pos-account" value={financeAccountId} onChange={(e) => setFinanceAccountId(e.target.value)}>
                  <option value="">Select account</option>
                  {availableAccounts.map((a) => (
                    <option key={a.id} value={a.id}>{formatFinanceAccountLabel(a)}</option>
                  ))}
                </Select>
              </div>
            )}


            {/* Totals Section */}
            <div className="rounded-xl bg-muted/50 p-3 space-y-1.5 border border-border">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground font-bold uppercase tracking-tighter">Gross Total</span>
                <span className="font-bold text-foreground">{formatCurrency(grossTotal)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-destructive font-bold uppercase tracking-tighter">Total Discount</span>
                  <span className="font-bold text-destructive">- {formatCurrency(discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border/60 pt-2 mt-0.5">
                <span className="text-[13px] font-black text-foreground uppercase">Payable Amount</span>
                <span className="text-[16px] font-black text-foreground">{formatCurrency(total)}</span>
              </div>
              {paymentMethod === "MIXED" && (
                <>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-border/40 mt-1">
                    <span className="text-muted-foreground font-bold uppercase tracking-tighter">Total Allocated</span>
                    <span className={cn("font-bold", isOverpaid ? "text-destructive" : "text-emerald-600")}>
                      {formatCurrency(totalAllocated)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground font-bold uppercase tracking-tighter">Unallocated / Credit</span>
                    <span className={cn("font-bold", totalAllocated < total ? "text-amber-500" : "text-slate-500")}>
                      {formatCurrency(Math.max(0, total - totalAllocated))}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Main Submit Button */}
            <Button
              type="button"
              className="h-11 w-full rounded-xl text-[13px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:opacity-90"
              disabled={isPending || !canSubmit}
              onClick={submitSale}
            >
              {isPending ? "..." : `Complete ${formatCurrency(total)}`}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}