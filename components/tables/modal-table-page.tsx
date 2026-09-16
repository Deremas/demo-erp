"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState, Suspense } from "react";
import { Plus, Upload } from "lucide-react";

import { PageHeader } from "@/components/app-shell/page-header";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { DataTable } from "@/components/tables/data-table";
import { TableFilters } from "@/components/tables/table-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { TablePageConfig } from "@/lib/table";

type CreateDialogControls = {
  close: () => void;
};

const CreateDialogContext = createContext<CreateDialogControls | null>(null);

export function useCreateDialog() {
  return useContext(CreateDialogContext);
}

type ModalTablePageProps = {
  config: TablePageConfig;
  actionLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  actionHref?: string;
  initialOpen?: boolean;
  children?: React.ReactNode;
  maxWidth?: string;
  dialogClassName?: string;
};

export function ModalTablePage(props: ModalTablePageProps) {
  return (
    <Suspense fallback={null}>
      <ModalTablePageInner {...props} />
    </Suspense>
  );
}

function ModalTablePageInner({
  config,
  actionLabel,
  dialogTitle,
  dialogDescription,
  actionHref,
  initialOpen = false,
  children,
  maxWidth = "max-w-7xl",
  dialogClassName,
}: ModalTablePageProps) {
  const [open, setOpen] = useState(initialOpen);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);


  const handleTabChange = (tabKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const tabParam = config.tabParam || "flow";
    
    if (tabKey === "ALL") {
      params.delete(tabParam);
    } else {
      params.set(tabParam, tabKey);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <PageHeader title={config.title} description={config.description} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {config.secondaryActionLabel ? (
            config.secondaryActionHref ? (
              <Button asChild type="button" variant="outline" size="sm" className="hidden rounded-full px-5 shadow-sm sm:flex">
                <Link href={config.secondaryActionHref}>
                  <Upload className="mr-2 h-4 w-4" />
                  {config.secondaryActionLabel}
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden rounded-full px-5 shadow-sm sm:flex"
                onClick={() => {
                  setOpen(true);
                  // If the app still needs to know which secondary action was clicked,
                  // we'd need a more robust way to handle this, but for now we'll
                  // prioritize opening the modal as requested.
                }}
              >
                {config.secondaryActionLabel.toLowerCase().includes("import") || config.secondaryActionLabel.toLowerCase().includes("excel") ? (
                  <Upload className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {config.secondaryActionLabel}
              </Button>
            )
          ) : null}
          {actionHref ? (
            <Button asChild type="button" size="sm" className="rounded-full px-5 shadow-lg">
              <Link href={actionHref}>
                <Plus className="h-4 w-4" />
                {actionLabel}
              </Link>
            </Button>
          ) : (
            <Button type="button" size="sm" className="rounded-full px-5 shadow-lg" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
      {config.kpis?.length ? <MetricGrid metrics={config.kpis} /> : null}
      <TableFilters {...(config.filters ? { fields: config.filters } : {})} />
      
      {config.tabs?.length ? (
        <Tabs className="mb-6">
          <TabsList>
            {config.tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                active={config.activeTab === tab.key}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
                {tab.count !== undefined ? (
                  <span className={cn(
                    "ml-2 rounded-full px-1.5 py-0.5 text-[10px]",
                    config.activeTab === tab.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"
                  )}>
                    {tab.count}
                  </span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}

      <Card className="border-none bg-transparent shadow-none sm:bg-card sm:border sm:shadow-sm">
        <CardContent className="p-4">
          <DataTable
            columns={config.columns}
            data={config.rows}
            exportTitle={config.title}
            {...(config.exportFileName
              ? { exportFileName: config.exportFileName }
              : {})}
          />
        </CardContent>
      </Card>
      {children ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className={cn("max-h-[calc(100svh-2rem)] overflow-y-auto p-0", maxWidth, dialogClassName)}>
            <div className="border-b border-border/70 px-4 py-4 sm:px-6">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>{dialogDescription}</DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-4 sm:p-6">
              <CreateDialogContext.Provider value={{ close: () => setOpen(false) }}>
                {children}
              </CreateDialogContext.Provider>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}