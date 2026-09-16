import type { IconName } from "@/lib/icons";
import type { MetricCard } from "@/lib/types";

export type SimpleColumnType =
  | "text"
  | "multiline"
  | "number"
  | "currency"
  | "usd"
  | "dateTime"
  | "status";

export type SimpleColumn = {
  key: string;
  header: string;
  type?: SimpleColumnType;
  hideOnMobile?: boolean;
  defaultHidden?: boolean;
  align?: "left" | "center" | "right";
  size?: number;
  showTotal?: boolean;
};

export type RowActionConfig = {
  key: string;
  label: string;
  href: string;
  icon: IconName;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  showLabel?: boolean;
  /** If set, a confirmation dialog is shown before navigating to `href`. */
  confirmMessage?: string;
};

export type SimpleRow = {
  id: string;
  __actions?: RowActionConfig[];
} & Record<
  string,
  string | number | boolean | null | undefined | RowActionConfig[]
>;

export type TableTab = {
  key: string;
  label: string;
  count?: number;
};

export type TableFilterOption = {
  label: string;
  value: string;
};

export type TableFilterField = {
  key: string;
  label: string;
  type: "search" | "select" | "multiselect" | "date";
  placeholder?: string;
  options?: TableFilterOption[];
  defaultValue?: string;
  advanced?: boolean;
};

export type TablePageConfig = {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  secondaryActionParam?: string;
  secondaryActionValue?: string;
  exportFileName?: string;
  kpis?: MetricCard[];
  tabs?: TableTab[];
  activeTab?: string;
  tabParam?: string;
  filters?: TableFilterField[];
  columns: SimpleColumn[];
  rows: SimpleRow[];
};