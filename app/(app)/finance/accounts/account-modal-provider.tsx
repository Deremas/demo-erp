"use client";

import { createContext, useContext, ReactNode, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { FinanceAccountForm } from "@/components/forms/finance-account-form";

const ModalContext = createContext({ open: false, setOpen: (v: boolean) => {} });

export function AccountModalProvider({ children, initialOpen }: { children: ReactNode, initialOpen: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

export function AccountModalTrigger() {
  return (
    <Button 
      type="button" 
      size="sm" 
      className="rounded-xl px-6 shadow-lg shadow-primary/20 font-bold" 
      asChild
    >
      <a href="?open=1">
        <Plus className="mr-2 h-4 w-4" />
        New Account
      </a>
    </Button>
  );
}

export function AccountCreationModal({ options }: { options: any }) {
  return (
    <Suspense fallback={null}>
      <AccountCreationModalInner options={options} />
    </Suspense>
  );
}

function AccountCreationModalInner({ options }: { options: any }) {
  const searchParams = useSearchParams();
  const open = searchParams.get("open") === "1";
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && router.push("?")}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0">
          <DialogHeader>
            <DialogTitle>New Finance Account</DialogTitle>
            <DialogDescription>Create a new cash or bank account to track funds.</DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6 overflow-y-auto min-h-0 flex-1">
          <FinanceAccountForm options={options} />
        </div>
      </DialogContent>
    </Dialog>
  );
}