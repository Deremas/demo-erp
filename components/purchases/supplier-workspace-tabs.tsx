"use client";

import * as React from "react";
import { CreditCard, Receipt, Truck } from "lucide-react";

import { DailyCheckTableCard } from "@/components/sales/daily-check-table-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SimpleColumn, SimpleRow } from "@/lib/table";

type TableConfig = {
  title: string;
  columns: SimpleColumn[];
  rows: SimpleRow[];
};

type SupplierWorkspaceTabsProps = {
  supplierId: string;
  purchasesConfig: TableConfig;
  payablesConfig: TableConfig;
  paymentsConfig: TableConfig;
};

export function SupplierWorkspaceTabs({
  supplierId,
  purchasesConfig,
  payablesConfig,
  paymentsConfig,
}: SupplierWorkspaceTabsProps) {
  const [activeTab, setActiveTab] = React.useState("purchases");

  return (
    <Tabs className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="w-full overflow-x-auto sm:w-auto">
          <TabsTrigger active={activeTab === "purchases"} onClick={() => setActiveTab("purchases")}>
            <Truck className="h-4 w-4" />
            Purchase List
          </TabsTrigger>
          <TabsTrigger active={activeTab === "payables"} onClick={() => setActiveTab("payables")}>
            <CreditCard className="h-4 w-4" />
            Open Payables
          </TabsTrigger>
          <TabsTrigger active={activeTab === "payments"} onClick={() => setActiveTab("payments")}>
            <Receipt className="h-4 w-4" />
            Payment Logs
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent active={activeTab === "purchases"}>
        <DailyCheckTableCard
          {...purchasesConfig}
          description="Posted purchase records for this supplier, including paid and outstanding purchases."
          exportFileName={`supplier-${supplierId}-purchases`}
          emptyStateMessage="No purchase records found for this supplier."
        />
      </TabsContent>

      <TabsContent active={activeTab === "payables"}>
        <DailyCheckTableCard
          {...payablesConfig}
          description="Supplier purchases with remaining payable balances."
          exportFileName={`supplier-${supplierId}-payables`}
          emptyStateMessage="No outstanding payable found for this supplier."
        />
      </TabsContent>

      <TabsContent active={activeTab === "payments"}>
        <DailyCheckTableCard
          {...paymentsConfig}
          description="History of payments made to this supplier."
          exportFileName={`supplier-${supplierId}-payments`}
          emptyStateMessage="No supplier payment records found."
        />
      </TabsContent>
    </Tabs>
  );
}