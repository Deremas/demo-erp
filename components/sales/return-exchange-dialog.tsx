"use client";

import { RefreshCcw, RotateCcw, Shuffle } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSalesReturnAction } from "@/lib/actions/sales-returns";
import { formatCurrency } from "@/lib/utils";

type ReturnType = "FULL_RETURN" | "PARTIAL_RETURN" | "EXCHANGE";
type RefundMethod = "CASH" | "BANK" | "CREDIT" | "EXCHANGE" | "MIXED";

type ReturnableItem = {
  id: string;
  itemCode: string;
  itemName: string;
  soldQuantity: number;
  alreadyReturned: number;
  returnableQuantity: number;
  unitPrice: number;
  discount: number;
  unitName: string;
};

type ExchangeProduct = {
  id: string;
  itemCode: string;
  itemName: string;
  availableStock: number;
  unitPrice: number;
  unitName: string;
};

type FinanceAccountOption = {
  id: string;
  name: string;
  type: "CASH" | "BANK";
};

type ExchangeItemDraft = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
};

type ReturnExchangeDialogProps = {
  saleId: string;
  eligible: boolean;
  returnableItems: ReturnableItem[];
  exchangeProducts: ExchangeProduct[];
  financeAccounts: FinanceAccountOption[];
};

export function ReturnExchangeDialog({
  saleId,
  eligible,
  returnableItems,
  exchangeProducts,
  financeAccounts,
}: ReturnExchangeDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [returnType, setReturnType] = useState<ReturnType>("PARTIAL_RETURN");
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("CASH");
  const [financeAccountId, setFinanceAccountId] = useState("");
  const [reason, setReason] = useState("");
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [exchangeProductId, setExchangeProductId] = useState("");
  const [exchangeQuantity, setExchangeQuantity] = useState(1);
  const [exchangeUnitPrice, setExchangeUnitPrice] = useState(0);
  const [exchangeItems, setExchangeItems] = useState<ExchangeItemDraft[]>([]);

  const selectedExchangeProduct = exchangeProducts.find((product) => product.id === exchangeProductId);
  const effectiveReturnItems = useMemo(() => {
    if (returnType === "FULL_RETURN") {
      return returnableItems
        .filter((item) => item.returnableQuantity > 0)
        .map((item) => ({ originalSaleItemId: item.id, quantity: item.returnableQuantity }));
    }

    return Object.entries(returnQuantities)
      .map(([originalSaleItemId, quantity]) => ({ originalSaleItemId, quantity: Number(quantity) }))
      .filter((item) => item.quantity > 0);
  }, [returnQuantities, returnType, returnableItems]);

  const returnedValue = effectiveReturnItems.reduce((sum, item) => {
    const saleItem = returnableItems.find((row) => row.id === item.originalSaleItemId);
    return sum + (saleItem ? item.quantity * Math.max(0, saleItem.unitPrice - saleItem.discount) : 0);
  }, 0);

  const exchangeValue = exchangeItems.reduce((sum, item) => sum + item.quantity * Math.max(0, item.unitPrice - item.discount), 0);
  const difference = Number((exchangeValue - returnedValue).toFixed(2));
  const settlementTitle = difference > 0 ? "Customer Pays" : difference < 0 ? "Customer Gets" : "Even Exchange";
  const settlementAmount = Math.abs(difference);
  const showFinanceAccount = difference !== 0 && (refundMethod === "CASH" || refundMethod === "BANK");
  const filteredFinanceAccounts = financeAccounts.filter(
    (account) => account.type === refundMethod,
  );
  const financeAccountPlaceholder =
    refundMethod === "CASH"
      ? "Select cash account"
      : refundMethod === "BANK"
        ? "Select bank account"
        : "No account needed for even exchange";
  const settlementMethodLabel =
    difference > 0 ? "Customer Payment Method" : difference < 0 ? "Customer Refund Method" : "Settlement";
  const selectedFinanceAccount = financeAccounts.find((account) => account.id === financeAccountId);
  const settlementIssue =
    difference === 0
      ? null
      : !["CASH", "BANK"].includes(refundMethod)
        ? `Choose cash or bank to ${difference > 0 ? "collect" : "refund"} the settlement amount.`
        : difference > 0 && showFinanceAccount && !financeAccountId
          ? "Select the cash/bank account receiving the customer payment."
          : difference < 0 && showFinanceAccount && !financeAccountId
            ? "Select the cash/bank account used for the customer refund."
            : null;
  const returnQuantityIssue = effectiveReturnItems.find((item) => {
    const saleItem = returnableItems.find((row) => row.id === item.originalSaleItemId);
    return !saleItem || item.quantity <= 0 || item.quantity > saleItem.returnableQuantity;
  });
  const exchangeQuantityIssue = exchangeItems.find((item) => {
    const product = exchangeProducts.find((row) => row.id === item.productId);
    const totalRequested = exchangeItems
      .filter((row) => row.productId === item.productId)
      .reduce((sum, row) => sum + row.quantity, 0);
    return !product || item.quantity <= 0 || totalRequested > product.availableStock || item.unitPrice < 0 || item.discount < 0 || item.discount > item.unitPrice;
  });
  const validationIssue = returnQuantityIssue
    ? "Return quantity must be greater than zero and cannot exceed the returnable quantity."
    : exchangeQuantityIssue
      ? "Exchange item quantity, unit selling price, and discount must be valid before confirming."
      : reason.trim().length < 3
        ? "Enter a short reason for this return or exchange."
        : settlementIssue;

  useEffect(() => {
    if (difference === 0) {
      setRefundMethod("EXCHANGE");
      setFinanceAccountId("");
    } else if (refundMethod !== "CASH" && refundMethod !== "BANK") {
      setRefundMethod("CASH");
      setFinanceAccountId("");
    }
  }, [difference, refundMethod]);

  function clampReturnQuantity(item: ReturnableItem, value: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(Math.trunc(value), item.returnableQuantity));
  }

  function addExchangeItem() {
    if (!selectedExchangeProduct) return;
    const safeQuantity = Math.max(1, Math.trunc(Number(exchangeQuantity) || 1));
    if (safeQuantity > selectedExchangeProduct.availableStock) {
      toast.error("Exchange quantity is higher than available stock.");
      return;
    }
    const safeUnitPrice = Math.max(0, Number(exchangeUnitPrice) || selectedExchangeProduct.unitPrice);

    setExchangeItems((current) => {
      const existingIndex = current.findIndex((item) => item.productId === selectedExchangeProduct.id);
      if (existingIndex < 0) {
        return [
          ...current,
          {
            productId: selectedExchangeProduct.id,
            quantity: safeQuantity,
            unitPrice: safeUnitPrice,
            discount: 0,
          },
        ];
      }

      const existingItem = current[existingIndex];
      if (!existingItem) return current;
      const combinedQuantity = existingItem.quantity + safeQuantity;
      if (combinedQuantity > selectedExchangeProduct.availableStock) {
        toast.error(`Only ${selectedExchangeProduct.availableStock} units are available for this exchange item.`);
        return current;
      }

      return current.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: combinedQuantity, unitPrice: safeUnitPrice }
          : item,
      );
    });
    setExchangeProductId("");
    setExchangeQuantity(1);
    setExchangeUnitPrice(0);
  }

  function updateExchangeItem(index: number, patch: Partial<ExchangeItemDraft>) {
    setExchangeItems((current) =>
      current.map((item, rowIndex) => {
        if (rowIndex !== index) return item;
        const next = { ...item, ...patch };
        const product = exchangeProducts.find((row) => row.id === next.productId);
        const requestedQuantity = Number(next.quantity) || 1;
        const maxQuantity = product?.availableStock ?? requestedQuantity;
        return {
          ...next,
          quantity: Math.max(1, Math.min(requestedQuantity, maxQuantity)),
          unitPrice: Math.max(0, Number(next.unitPrice) || 0),
          discount: Math.min(Math.max(0, Number(next.discount) || 0), Math.max(0, Number(next.unitPrice) || 0)),
        };
      }),
    );
  }

  function submit() {
    startTransition(async () => {
      const result = await createSalesReturnAction({
        saleId,
        returnType,
        refundMethod,
        financeAccountId,
        reason,
        returnItems: effectiveReturnItems,
        exchangeItems: returnType === "EXCHANGE" ? exchangeItems : [],
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!eligible} className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50">
          <RefreshCcw className="h-4 w-4" />
          Return / Exchange Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Return / Exchange Sale</DialogTitle>
          <DialogDescription>Process a full return, partial return, or item exchange for this completed sale.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label>Return Type</Label>
              <Select value={returnType} onChange={(event) => setReturnType(event.target.value as ReturnType)} disabled={isPending}>
                <option value="FULL_RETURN">Full Return</option>
                <option value="PARTIAL_RETURN">Partial Return</option>
                <option value="EXCHANGE">Item Exchange</option>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>{settlementMethodLabel}</Label>
              <Select
                value={refundMethod}
                onChange={(event) => {
                  setRefundMethod(event.target.value as RefundMethod);
                  setFinanceAccountId("");
                }}
                disabled={isPending}
              >
                {difference === 0 ? (
                  <option value="EXCHANGE">Even exchange - no money movement</option>
                ) : (
                  <>
                    <option value="CASH">{difference > 0 ? "Customer pays cash" : "Refund customer in cash"}</option>
                    <option value="BANK">{difference > 0 ? "Customer pays by bank" : "Refund customer by bank"}</option>
                  </>
                )}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Finance Account</Label>
              <Select value={financeAccountId} onChange={(event) => setFinanceAccountId(event.target.value)} disabled={isPending || !showFinanceAccount}>
                <option value="">{financeAccountPlaceholder}</option>
                {filteredFinanceAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-[1080px] w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Item Code</th>
                  <th className="px-3 py-2 text-left">Item Name</th>
                  <th className="px-3 py-2 text-right">Sold Qty</th>
                  <th className="px-3 py-2 text-right">Already Returned</th>
                  <th className="px-3 py-2 text-right">Available to Return</th>
                  <th className="px-3 py-2 text-right">Qty to Return</th>
                  <th className="px-3 py-2 text-right">Unit Value</th>
                  <th className="px-3 py-2 text-right">Return Total</th>
                </tr>
              </thead>
              <tbody>
                {returnableItems.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2 font-semibold">{item.itemCode}</td>
                    <td className="px-3 py-2">{item.itemName}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-semibold">{item.soldQuantity} {item.unitName}</span>
                    </td>
                    <td className="px-3 py-2 text-right">{item.alreadyReturned} {item.unitName}</td>
                    <td className="px-3 py-2 text-right font-semibold">{item.returnableQuantity} {item.unitName}</td>
                    <td className="px-3 py-2 text-right">
                      {returnType === "FULL_RETURN" ? (
                        <span className="font-semibold">{item.returnableQuantity}</span>
                      ) : (
                        <Input
                          type="number"
                          min={0}
                          max={item.returnableQuantity}
                          step={1}
                          value={returnQuantities[item.id] ?? 0}
                          onChange={(event) => setReturnQuantities((current) => ({ ...current, [item.id]: clampReturnQuantity(item, Number(event.target.value)) }))}
                          onBlur={(event) => setReturnQuantities((current) => ({ ...current, [item.id]: clampReturnQuantity(item, Number(event.target.value)) }))}
                          className="ml-auto h-9 w-24 text-right"
                          disabled={isPending || item.returnableQuantity <= 0}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(Math.max(0, item.unitPrice - item.discount))}</td>
                    <td className="px-3 py-2 text-right font-black">
                      {formatCurrency(
                        (returnType === "FULL_RETURN" ? item.returnableQuantity : returnQuantities[item.id] ?? 0) *
                          Math.max(0, item.unitPrice - item.discount),
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {returnType === "EXCHANGE" ? (
            <div className="grid gap-3 rounded-md border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Shuffle className="h-4 w-4" />
                  New Exchange Items
                </div>
                <p className="text-xs text-muted-foreground">
                  Add replacement items, then adjust quantity and selling price below before confirming.
                </p>
              </div>
              <div className="grid items-end gap-3 sm:grid-cols-[1fr_130px_180px_auto]">
                <div className="grid gap-1.5">
                  <Label>Replacement Item</Label>
                  <Select
                    value={exchangeProductId}
                    onChange={(event) => {
                      const product = exchangeProducts.find((row) => row.id === event.target.value);
                      setExchangeProductId(event.target.value);
                      setExchangeUnitPrice(product?.unitPrice ?? 0);
                    }}
                    disabled={isPending}
                  >
                    <option value="">Select item</option>
                    {exchangeProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.itemCode} - {product.itemName} | Stock {product.availableStock} {product.unitName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Quantity</Label>
                  <Input type="number" min={1} step={1} value={exchangeQuantity} onChange={(event) => setExchangeQuantity(Number(event.target.value))} disabled={isPending} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Unit Selling Price</Label>
                  <Input type="number" min={0} step="0.01" value={exchangeUnitPrice} onChange={(event) => setExchangeUnitPrice(Number(event.target.value))} disabled={isPending} />
                </div>
                <Button type="button" variant="outline" onClick={addExchangeItem} disabled={isPending || !selectedExchangeProduct} className="h-10">
                  Add
                </Button>
              </div>
              {exchangeItems.length ? (
                <div className="overflow-x-auto rounded-md border">
                  <table className="min-w-[920px] w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">Item Code</th>
                        <th className="px-3 py-2 text-left">Item Name</th>
                        <th className="px-3 py-2 text-right">Available</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Unit Selling Price</th>
                        <th className="px-3 py-2 text-right">Discount / Unit</th>
                        <th className="px-3 py-2 text-right">Net / Unit</th>
                        <th className="px-3 py-2 text-right">Total Price</th>
                        <th className="px-3 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                  {exchangeItems.map((item, index) => {
                    const product = exchangeProducts.find((row) => row.id === item.productId);
                        const lineTotal = item.quantity * Math.max(0, item.unitPrice - item.discount);
                    return (
                          <tr key={`${item.productId}-${index}`} className="border-t">
                            <td className="px-3 py-2 font-semibold">{product?.itemCode ?? "-"}</td>
                            <td className="px-3 py-2">{product?.itemName ?? "Unknown item"}</td>
                            <td className="px-3 py-2 text-right">
                              {product?.availableStock ?? 0} {product?.unitName ?? ""}
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min={1}
                                max={product?.availableStock ?? undefined}
                                step={1}
                                value={item.quantity}
                                onChange={(event) => updateExchangeItem(index, { quantity: Number(event.target.value) })}
                                className="ml-auto h-9 w-24 text-right"
                                disabled={isPending}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(event) => updateExchangeItem(index, { unitPrice: Number(event.target.value) })}
                                className="ml-auto h-9 w-32 text-right"
                                disabled={isPending}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={item.discount}
                                onChange={(event) => updateExchangeItem(index, { discount: Number(event.target.value) })}
                                className="ml-auto h-9 w-28 text-right"
                                disabled={isPending}
                              />
                            </td>
                            <td className="px-3 py-2 text-right font-semibold">
                              {formatCurrency(Math.max(0, item.unitPrice - item.discount))}
                            </td>
                            <td className="px-3 py-2 text-right font-black">{formatCurrency(lineTotal)}</td>
                            <td className="px-3 py-2 text-right">
                              <Button type="button" variant="ghost" size="sm" onClick={() => setExchangeItems((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
                                Remove
                              </Button>
                            </td>
                          </tr>
                    );
                  })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-bold uppercase text-muted-foreground">Returned Value</p>
              <p className="text-lg font-black">{formatCurrency(returnedValue)}</p>
            </div>
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-bold uppercase text-muted-foreground">Exchange Value</p>
              <p className="text-lg font-black">{formatCurrency(exchangeValue)}</p>
            </div>
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-bold uppercase text-muted-foreground">{settlementTitle}</p>
              <p className="text-lg font-black">
                {difference === 0 ? "No cash movement" : formatCurrency(settlementAmount)}
              </p>
              {returnType === "EXCHANGE" && difference !== 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {difference > 0
                    ? "New items cost more. Collect this offset from the customer."
                    : "Returned items cost more. Refund this amount to the customer."}
                </p>
              ) : null}
            </div>
          </div>
          <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
            <p className="font-black">Settlement record</p>
            <p className="mt-1">
              {formatCurrency(exchangeValue)} exchange value - {formatCurrency(returnedValue)} returned value ={" "}
              <strong>
                {difference > 0
                  ? `${formatCurrency(settlementAmount)} collected from customer`
                  : difference < 0
                    ? `${formatCurrency(settlementAmount)} refunded to customer`
                    : "ETB 0 even exchange"}
              </strong>
            </p>
            <p className="mt-1 text-xs text-sky-800">
              {difference === 0
                ? "No finance ledger entry will be created."
                : `${refundMethod === "BANK" ? "Bank" : "Cash"} ledger entry: ${selectedFinanceAccount?.name ?? "select an account"} (${difference > 0 ? "money in" : "money out"}).`}
            </p>
          </div>
          {settlementIssue ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
              {settlementIssue}
            </div>
          ) : null}
          {validationIssue && validationIssue !== settlementIssue ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
              {validationIssue}
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <Label>Reason <span className="text-destructive">*</span></Label>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              disabled={isPending}
              placeholder="Why is this return or exchange being processed?"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={isPending || effectiveReturnItems.length === 0 || Boolean(validationIssue)} onClick={submit}>
            <RotateCcw className="h-4 w-4" />
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}