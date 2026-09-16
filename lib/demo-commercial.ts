export const demoWalkthrough = [
  {
    step: 1,
    title: "Start on the dashboard",
    description: "Select a warehouse, store, or shop and review sales, stock, receivables, and payables.",
    href: "/dashboard",
  },
  {
    step: 2,
    title: "Receive an import or local purchase",
    description: "Post a supplier purchase into the warehouse, including USD import tracking when needed.",
    href: "/purchases/imports",
  },
  {
    step: 3,
    title: "Transfer stock to a shop",
    description: "Move received stock from warehouse or store to the selling location.",
    href: "/inventory/transfers",
  },
  {
    step: 4,
    title: "Complete cash and credit sales",
    description: "Use POS for shop checkout and wholesale for bulk sales, including agent credit sales.",
    href: "/sales/pos",
  },
  {
    step: 5,
    title: "Settle customer and agent balances",
    description: "Record a payment and show the outstanding credit reduction.",
    href: "/sales/customer-payments",
  },
  {
    step: 6,
    title: "Pay suppliers and record expenses",
    description: "Reduce supplier payables and post an operating expense to cash or bank.",
    href: "/purchases/supplier-payments",
  },
  {
    step: 7,
    title: "Review operational and financial reports",
    description: "Open stock value, profit, receivables, payables, expenses, ledger, and cash flow.",
    href: "/reports",
  },
  {
    step: 8,
    title: "Show control and reliability",
    description: "Walk through roles, location access, audit logs, and backup controls.",
    href: "/admin/roles",
  },
  {
    step: 9,
    title: "Demonstrate AI insights",
    description: "Ask live questions about stock, credit risk, anomalies, and reorder suggestions.",
    href: "/assistant",
  },
  {
    step: 10,
    title: "Close with implementation and quotation",
    description: "Cover timeline, training, support, customization, and the commercial breakdown.",
    href: "/demo",
  },
] as const;

export const requirementCoverage = [
  {
    requirement: "Multi-branch inventory",
    capability: "Stores, shops, and warehouses with per-location stock, transfers, and dashboard filters.",
    href: "/inventory/stock",
  },
  {
    requirement: "Warehouse and stock control",
    capability: "Warehouse receiving, current stock, low-stock alerts, movements, bin cards, and transfers.",
    href: "/inventory/transfers",
  },
  {
    requirement: "Agent credit and balances",
    capability: "Agent accounts with credit limits, outstanding balances, credit sales, and collections.",
    href: "/sales/agents",
  },
  {
    requirement: "Sales",
    capability: "POS checkout, wholesale entry, delivery orders, sold-items history, and customer payments.",
    href: "/sales/pos",
  },
  {
    requirement: "Purchasing",
    capability: "Local purchases, purchase lists, purchased items, and supplier records.",
    href: "/purchases/new",
  },
  {
    requirement: "Imports",
    capability: "Import purchases with USD invoice tracking, exchange rate, and warehouse receipt.",
    href: "/purchases/imports",
  },
  {
    requirement: "Supplier balances",
    capability: "Supplier payables, partial settlements, and supplier payment history.",
    href: "/purchases/suppliers",
  },
  {
    requirement: "Accounting",
    capability: "Cash and bank accounts, cheques, cash transfers, and a chronological account ledger.",
    href: "/finance/ledger",
  },
  {
    requirement: "Expenses",
    capability: "Expense categories, location posting, and expense analysis reports.",
    href: "/finance/expenses",
  },
  {
    requirement: "Financial reporting",
    capability: "Profitability, stock valuation, receivables, payables, expenses, cash flow, and ledger reports.",
    href: "/reports",
  },
  {
    requirement: "AI capabilities",
    capability: "Permission-aware Q&A on live stock, credit risk, anomalies, and reorder suggestions.",
    href: "/assistant",
  },
  {
    requirement: "User access controls",
    capability: "Roles, permissions, location restrictions, and user accounts for admin, warehouse, sales, and finance.",
    href: "/admin/roles",
  },
  {
    requirement: "Audit trail",
    capability: "Audit logs and coverage for create, edit, post, transfer, pay, and void actions.",
    href: "/admin/audit-logs",
  },
  {
    requirement: "Data backup",
    capability: "On-demand and scheduled backups that an administrator can download and restore from.",
    href: "/admin/backups",
  },
] as const;

export const aiCapabilities = [
  "Answers operational questions from live ERP data rather than a disconnected chatbot.",
  "Flags low stock and suggests reorder quantities from recent sales and alert levels.",
  "Highlights agent and customer credit risk against configured credit limits.",
  "Surfaces unusual sales, expense, or stock movement patterns for management review.",
  "Respects the signed-in user's permissions and location access.",
];

export const accessControlNotes = [
  "Named roles for administrator, manager, warehouse, sales, and finance.",
  "Fine-grained permissions for viewing, creating, editing, transferring, paying, and voiding.",
  "Users can be limited to one or more stores, shops, or warehouses.",
  "Sensitive screens such as backups, roles, settings, and AI insights require explicit permission.",
];

export const auditTrailNotes = [
  "Audit logs record who created, edited, posted, transferred, paid, or voided a record.",
  "Audit coverage shows which operational actions are tracked.",
  "Logs remain available for management review and implementation sign-off.",
];

export const backupNotes = [
  "Administrators can run an on-demand backup and download the file.",
  "A scheduled weekly backup can be configured from the backups screen.",
  "The client owns the data. Hosting credentials and backup files can be handed over at any time.",
];

export const customizationOptions = [
  "Company identity, location names, document labels, and print layouts.",
  "Additional report filters and agreed extra fields on customers, agents, suppliers, and items.",
  "Role definitions and permission packs to match the company's job titles.",
  "Core posting logic stays standard so inventory, credit, and ledger remain consistent.",
];

export const implementationPlan = [
  {
    phase: "1. Discovery",
    duration: "Week 1",
    items: [
      "Confirm branch, warehouse, shop, agent, and supplier processes",
      "Map current documents: purchases, sales, payments, expenses, and reports",
      "Agree opening balances, user roles, and location access",
    ],
  },
  {
    phase: "2. Setup & data",
    duration: "Weeks 2-3",
    items: [
      "Create locations, users, roles, finance accounts, and item masters",
      "Import customers, agents, suppliers, opening stock, and opening balances",
      "Configure credit limits, low-stock alerts, and backup schedule",
    ],
  },
  {
    phase: "3. Configuration",
    duration: "Week 3",
    items: [
      "Match receipts, invoices, and payment vouchers to the live documents",
      "Set customization boundaries: fields, reports, and print layouts",
      "Connect hosting, backups, and optional AI insights",
    ],
  },
  {
    phase: "4. UAT & go-live",
    duration: "Week 4",
    items: [
      "User acceptance tests on the full purchase-to-report path",
      "Role-based training for admin, warehouse, sales, and finance",
      "Go-live support and first-week hypercare",
    ],
  },
] as const;

export const trainingByRole = [
  {
    role: "Administrators",
    sessions: "Users, roles, locations, settings, backups, and audit review.",
  },
  {
    role: "Warehouse",
    sessions: "Receiving, imports, stock counts, transfers, and low-stock alerts.",
  },
  {
    role: "Sales",
    sessions: "POS, wholesale, customers, agents, credit sales, and collections.",
  },
  {
    role: "Finance",
    sessions: "Supplier payments, expenses, ledger, cheques, cash transfers, and reports.",
  },
] as const;

export const quotationLines = [
  { item: "Implementation", detail: "Discovery, setup, data import, UAT, and go-live", amount: "ETB 180,000", kind: "one-time" as const },
  { item: "Training", detail: "Admin, warehouse, sales, and finance sessions", amount: "ETB 45,000", kind: "one-time" as const },
  { item: "Customization", detail: "Document layouts and agreed field/report changes", amount: "ETB 25,000 allowance", kind: "one-time" as const },
  { item: "Licensing / subscription", detail: "Core ERP for inventory, sales, purchases, finance, and reports", amount: "ETB 8,500 / month", kind: "monthly" as const },
  { item: "Hosting", detail: "Managed application hosting and database", amount: "ETB 4,500 / month", kind: "monthly" as const },
  { item: "Support & maintenance", detail: "Business-hours support with 4-hour first-response target", amount: "Included in subscription", kind: "included" as const },
  { item: "Optional AI insights", detail: "Permission-aware Q&A, credit risk, and reorder suggestions", amount: "ETB 2,500 / month", kind: "optional" as const },
] as const;

export const quotationTotals = {
  oneTime: "ETB 250,000",
  monthlyCore: "ETB 13,000 / month",
  monthlyWithAi: "ETB 15,500 / month",
  firstYearCore: "ETB 406,000",
  firstYearWithAi: "ETB 436,000",
} as const;

export const quotationNotes = [
  "Sample figures for the live demo conversation. Final pricing is confirmed after discovery and data-import scope.",
  "The first-year core total is one-time fees plus twelve months of licensing and hosting.",
  "Work beyond the customization allowance is quoted separately after discovery.",
  "Opening-balance cleanup, historical data conversion, and extra sites can change the implementation fee.",
];

export const supportCommitments = [
  "Business-hours technical support with a 4-hour first-response target on critical issues.",
  "First-week hypercare after go-live, then ongoing support included in the subscription.",
  "Remote assistance for users, roles, backups, and day-to-day posting questions.",
  "Data remains owned by the client. Hosting credentials and backup files can be handed over at any time.",
];
