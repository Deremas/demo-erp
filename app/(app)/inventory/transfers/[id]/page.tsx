export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  Printer, 
  Truck, 
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowRightLeft
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { requireSession } from "@/lib/auth/session";

export default async function TransferDetailPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const params = await props.params;
  const transfer = await prisma.transfer.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      transferNumber: true,
      status: true,
      note: true,
      sentAt: true,
      createdAt: true,
      sourceLocationId: true,
      destinationLocationId: true,
      sourceLocation: {
        select: { id: true, name: true },
      },
      destinationLocation: {
        select: { id: true, name: true },
      },
      sentBy: {
        select: { id: true, name: true },
      },
      receivedBy: {
        select: { id: true, name: true },
      },
      items: {
        select: {
          id: true,
          quantity: true,
          productId: true,
          product: {
            select: {
              id: true,
              name: true,
              category: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!transfer) {
    notFound();
  }

  // Access Control: User must be assigned to either source or destination location
  const isAuthorized = 
    user.role === "ADMIN" || 
    user.locations.some(l => l.id === transfer.sourceLocationId || l.id === transfer.destinationLocationId);
  
  if (!isAuthorized) {
    redirect("/dashboard");
  }

  const totalQuantity = transfer.items.reduce((sum, item) => sum + item.quantity, 0);


  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      {/* Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="h-9 rounded-xl">
            <Link href="/inventory/transfers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transfers
            </Link>
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <h1 className="text-xl font-black tracking-tight uppercase">Stock Movement</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-slate-200 shadow-sm" asChild>
            <Link href={`/print/transfer/${transfer.id}`} target="_blank">
              <Printer className="mr-2 h-4 w-4" />
              Print Note
            </Link>
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            Edit Transfer
          </Button>
        </div>
      </div>

      {/* Movement Flow Header */}
      <Card className="border-none bg-slate-900 text-white overflow-hidden">
        <CardContent className="p-0">
          <div className="grid sm:grid-cols-[1fr_auto_1fr] items-center">
            <div className="p-8 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Source Location</p>
              <h2 className="text-2xl font-black tracking-tight">{transfer.sourceLocation.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <User className="h-3.5 w-3.5" />
                <span>Sent by {transfer.sentBy?.name ?? "System"}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-slate-800/50 h-full min-w-[80px]">
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              <Badge className="mt-2 bg-primary text-white hover:bg-primary border-none">{transfer.status}</Badge>
            </div>

            <div className="p-8 space-y-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Destination</p>
              <h2 className="text-2xl font-black tracking-tight">{transfer.destinationLocation.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 justify-end">
                {transfer.receivedBy ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Received by {transfer.receivedBy.name}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span>Awaiting Acknowledgment</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none bg-slate-50/50 shadow-none dark:bg-slate-900/40 p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Transfer No.</p>
          <p className="font-black text-lg">{transfer.transferNumber}</p>
        </Card>
        <Card className="border-none bg-slate-50/50 shadow-none dark:bg-slate-900/40 p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Quantity</p>
          <p className="font-black text-lg">{totalQuantity} Units</p>
        </Card>
        <Card className="border-none bg-slate-50/50 shadow-none dark:bg-slate-900/40 p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Created At</p>
          <p className="font-bold">{format(new Date(transfer.createdAt), "dd MMM yyyy")}</p>
        </Card>
        <Card className="border-none bg-slate-50/50 shadow-none dark:bg-slate-900/40 p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sent At</p>
          <p className="font-bold">{transfer.sentAt ? format(new Date(transfer.sentAt), "dd MMM yyyy, HH:mm") : "Not sent yet"}</p>
        </Card>
      </div>

      {/* Items Table */}
      <Card className="overflow-hidden border-slate-200/60 shadow-sm dark:border-slate-800/60">
        <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Inventory Items In Transit</CardTitle>
            <Badge variant="outline" className="bg-white dark:bg-slate-950 font-bold">{transfer.items.length} SKUs</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3 text-center">Transfer Quantity</th>
                <th className="px-6 py-3 text-right">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
              {transfer.items.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-900/20">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Package className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">SKU: {item.productId.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex items-center justify-center min-w-[40px] h-9 px-3 rounded-xl bg-slate-900 text-white font-black text-sm">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Badge variant="secondary" className="rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      {item.product.category?.name ?? "General"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Note Section */}
      {transfer.note && (
        <div className="bg-amber-50/50 border-l-4 border-amber-200 p-6 rounded-r-2xl dark:bg-amber-950/20 dark:border-amber-900">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Internal Movement Note</p>
          <p className="text-sm text-amber-900 dark:text-amber-200 italic">"{transfer.note}"</p>
        </div>
      )}
    </div>
  );
}