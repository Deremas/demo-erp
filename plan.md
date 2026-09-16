# Demo ERP Stock App Plan

## Branding

- Use the Rungo logo from `public/rungo-logo.png`.
- Match the app colors to the logo and reference image:
  - Blue and light blue accents.
  - Black text and dark controls.
  - White or off-white backgrounds.
  - Clean liquor retail feel instead of generic stock app styling.
- Rename visible app identity to **Demo ERP** or **Demo ERP** where appropriate.

## Locations

- Support two main stores:
  - Addis Ababa
  - Djibouti
- Support five shops.
- Track inventory per location.

## Inventory

- Register items with:
  - Item name.
  - Category or liquor brand grouping.
  - Buying price.
  - Selling price.
  - Discount support for sales.
  - Stock quantity per store or shop.
- Use liquor brands as item categories or grouping labels.

## Sales

- Sales records should support two entry modes:
  - Bulk sales entry: fast table-style entry for many items at once.
  - POS window: real checkout screen for shop sales.
- Sales should support:
  - Customer selection.
  - Discounts.
  - Cash and credit sale handling.
  - Sales user tracking.
  - Shop or store location tracking.
  - sale is done at shops or stores

## Customers And Credit

- Customer list and customer detail pages.
- Customer credit balance per customer.
- Credit sales should increase customer debt.
- Settlements and payments should reduce debt.
- Easy customer payment and settling workflow.

## Suppliers

- Supplier list.
- Supplier detail and management.
- Purchase records linked to suppliers.
- Supplier payment and credit tracking if needed.

## Transfers

- Transfer stock between:
  - Shop to shop.
  - Store to shop.
  - Store to store.
- Transfers should record:
  - Source location.
  - Destination location.
  - Items and quantities.
  - Transfer date.
  - User responsible.
  - Status and history.

## Reports

- Reports need filtering options by:
  - Date range.
  - Store or shop.
  - Item, category, or brand.
  - Customer.
  - Supplier.
  - Salesperson or user.
- Important reports:
  - Sales report.
  - Inventory report.
  - Purchase report.
  - Transfer report.
  - Customer credit report.
  - Supplier report.
  - Profit and value report.
- Inventory value should show:
  - Total inventory value by buying price.
  - Total potential sales value by selling price.
  - Difference or margin estimate.

## Roles

- Admin:
  - Full access.
  - Manage users, stores, shops, items, suppliers, reports, and settings.
- Sales:
  - POS and sales access.
  - Customer sales and payments.
  - Limited inventory visibility depending on assigned location.

## Clean-Up Direction

- The current project already has foundations for sales, customers, suppliers, purchases, transfers, reports, branches, users, roles, and finance.
- The clean-up should focus on reshaping terminology and UI around Demo ERP:
  - Stores and shops.
  - Liquor categories.
  - POS plus bulk sales.
  - Customer credit.
  - Supplier management.
  - Transfer flows.
  - Branded reporting.

## Current Refinement Status

- App identity has been changed to **Demo ERP** with the logo from `public/rungo-logo.png`.
- Main navigation is simplified around:
  - Dashboard.
  - Inventory items, current stock, transfers, and low stock.
  - POS sale, bulk sale, sales history, customers, customer credit, and payments.
  - Purchases, suppliers, and supplier payments.
  - Expenses, reports, stores and shops, users, and accounts.
- Item schema is simplified to liquor stock needs:
  - Name, SKU, category, brand, buying price, selling price, discount, unit, low stock alert, and description.
  - Old generic product fields were removed from schema.
- Reports now use real available data for:
  - Sales and profit.
  - Inventory value.
  - Purchase report.
  - Expense summary.
  - Customer credit and supplier activity through their existing pages.
- Daily dashboard shortcuts now focus on POS sale, bulk sale, stock purchase, transfers, customers, suppliers, and expenses.
- Visible terminology is moving from generic branch language toward stores, shops, and locations.

## Client Demo Scope

The demo must tell a complete business story for a multi-branch trading company. The demo data and walkthrough should cover:

### Core operations

- Multiple stores, shops, and warehouses with location-level stock balances.
- Receiving purchases into a warehouse or store.
- Stock transfers between warehouse, store, and shop locations.
- Single-unit inventory quantities with one buying price and one selling price per item.
- Low-stock alerts and stock movement history.
- POS sales and fast bulk sales entry.
- Customer sales, cash sales, credit sales, returns, and customer payments.
- Agent/customer balance tracking, including outstanding credit and settlement history.
- Supplier purchases, supplier balances, supplier payments, and purchase history.
- Expenses linked to locations and finance accounts.

### Accounting and financial reporting

- Cash, bank, credit, and cheque transactions.
- Customer receivables and supplier payables.
- Expense records and account movements.
- Sales, purchases, stock value, profit, expense, receivable, payable, and cash-flow reports.
- Filters by date, location, item, category, customer, supplier, and user.
- Printable and exportable reports.

### Control, security, and reliability

- Role-based access for administrators, managers, sales users, warehouse users, and finance users.
- Location-based access restrictions.
- Audit trail showing who created, edited, posted, transferred, paid, or voided a transaction.
- Scheduled and on-demand database backups.
- Clear transaction statuses and reversal/void workflows.

### AI and intelligence demo

The demo should explain practical AI capabilities rather than present AI as a separate module:

- Natural-language sales, stock, and finance summaries.
- Low-stock and slow-moving item recommendations.
- Credit-risk and overdue-balance review.
- Anomaly detection for unusual discounts, prices, stock adjustments, and transactions.
- Suggested purchase quantities based on sales history and stock levels.
- Question-and-answer access to reports with permission-aware results.

### Implementation and commercial discussion

The client presentation must also cover:

- Discovery and business-process confirmation.
- Data import and cleanup from existing systems.
- Branch, warehouse, user, role, and opening-balance setup.
- Configuration and customization boundaries.
- User acceptance testing and go-live preparation.
- User training by role.
- Technical support, maintenance, and response expectations.
- Backup, security, hosting, and data ownership.
- Implementation timeline, milestones, assumptions, exclusions, and risks.
- Full quotation with implementation, licensing/subscription, hosting, training, support, customization, and optional AI costs separated.

### Recommended demo sequence

1. Start on the dashboard and select a branch/location.
2. Receive a supplier purchase into the warehouse.
3. Transfer stock to a shop.
4. Complete a cash sale and a credit sale.
5. Record a customer settlement and show the balance reduction.
6. Record a supplier payment and an operating expense.
7. Review stock, profit, receivable, payable, and expense reports.
8. Show the audit trail, user permissions, and backup controls.
9. Demonstrate AI-assisted questions and recommendations.
10. Finish with implementation phases, training/support, and the quotation structure.
