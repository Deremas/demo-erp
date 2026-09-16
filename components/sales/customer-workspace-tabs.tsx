"use client";

import * as React from "react";
import { 
  ShoppingBag, 
  CreditCard, 
  Receipt,
  PackageCheck
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DailyCheckTableCard } from "@/components/sales/daily-check-table-card";
import type { SimpleRow, SimpleColumn } from "@/lib/table";

type TableConfig = {
  title: string;
  columns: SimpleColumn[];
  rows: SimpleRow[];
};

type CustomerWorkspaceTabsProps = {
  customerId: string;
  salesConfig: TableConfig;
  creditConfig: TableConfig;
  paymentsConfig: TableConfig;
  itemsConfig: TableConfig;
};

export function CustomerWorkspaceTabs({
  customerId,
  salesConfig,
  creditConfig,
  paymentsConfig,
  itemsConfig,
}: CustomerWorkspaceTabsProps) {
  const [activeTab, setActiveTab] = React.useState("sales");

  return (
    <Tabs className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="w-full sm:w-auto overflow-x-auto no-scrollbar">
          <TabsTrigger 
            active={activeTab === "sales"} 
            onClick={() => setActiveTab("sales")}
          >
            <ShoppingBag className="h-4 w-4" />
            Sales History
          </TabsTrigger>
          <TabsTrigger 
            active={activeTab === "credit"} 
            onClick={() => setActiveTab("credit")}
          >
            <CreditCard className="h-4 w-4" />
            Open Credit
          </TabsTrigger>
          <TabsTrigger 
            active={activeTab === "payments"} 
            onClick={() => setActiveTab("payments")}
          >
            <Receipt className="h-4 w-4" />
            Payment Logs
          </TabsTrigger>
          <TabsTrigger 
            active={activeTab === "items"} 
            onClick={() => setActiveTab("items")}
          >
            <PackageCheck className="h-4 w-4" />
            Purchased Items
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent active={activeTab === "sales"}>
        <DailyCheckTableCard
          {...salesConfig}
          description="Complete sales ledger for this customer, including fully settled and outstanding transactions."
          exportFileName={`customer-${customerId}-sales`}
          emptyStateMessage="No sales records found for this customer."
        />
      </TabsContent>

      <TabsContent active={activeTab === "credit"}>
        <DailyCheckTableCard
          {...creditConfig}
          description="Active outstanding credit balances that require settlement."
          exportFileName={`customer-${customerId}-credit`}
          emptyStateMessage="No outstanding credit found for this customer."
        />
      </TabsContent>

      <TabsContent active={activeTab === "payments"}>
        <div className="space-y-4">
          <DailyCheckTableCard
            {...paymentsConfig}
            description="History of all payments received from this customer."
            exportFileName={`customer-${customerId}-payments`}
            emptyStateMessage="No payment records found."
          />
        </div>
      </TabsContent>

      <TabsContent active={activeTab === "items"}>
        <div className="space-y-4">
          <DailyCheckTableCard
            {...itemsConfig}
            description="Granular view of all individual items purchased by this customer."
            exportFileName={`customer-${customerId}-items`}
            emptyStateMessage="No purchased items found."
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}