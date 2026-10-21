# SMALL INVENTORY AND SUPPLIER SYSTEM (SISS)
## Full Project Plan for OpenCode

> **Purpose of this document:** Use this plan as the main implementation brief for OpenCode. Build the project incrementally, follow the requirements below, and do not pretend that unfinished features are complete.
>
> **Project type:** Academic project / prototype  
> **Technology stack:** Next.js App Router, TypeScript, Supabase (PostgreSQL + Auth + Storage as needed), Tailwind CSS  
> **Target offices:** Property Custodian Office, Hospitality Management Lab Office, Science Laboratory Office  
> **Target users:** Students, teachers, non-teaching personnel, office staff, office heads/approvers, and system administrators

---

# 1. Instructions for OpenCode

Act as a senior full-stack developer and technical mentor. Help implement a maintainable, secure, responsive academic prototype named **Small Inventory and Supplier System (SISS)**.

Follow these rules throughout development:

1. **Inspect the existing repository before changing anything.** Identify the framework version, installed dependencies, current routes, database setup, conventions, and unfinished work.
2. **Do not overwrite existing work blindly.** Preserve useful files and explain important changes.
3. **Use the current project conventions** unless they are insecure or clearly unsuitable. If the repository is empty, scaffold the project with the stack specified below.
4. **Work in small, verifiable phases.** Finish one phase, run relevant checks, summarize results, then continue.
5. **Do not claim a feature is implemented unless it works.** Mark placeholders and incomplete integrations clearly.
6. **Never invent real school data, users, supplier records, or operational policies.** Use clearly labeled fictional seed data for development only.
7. **Ask before destructive actions** such as deleting user data, dropping tables, resetting a database, replacing major files, or rewriting the project's architecture.
8. **Do not put secrets in source code.** Never expose the Supabase service-role key in client-side code or any `NEXT_PUBLIC_` variable.
9. **Enforce security server-side and in PostgreSQL RLS.** Hiding buttons in the interface is not access control.
10. **Use TypeScript strictly** and avoid `any` unless there is a documented reason.
11. **Validate inputs** on the server and use database constraints for important invariants.
12. **Use database migrations** for schema changes. Do not rely on manually changing production tables.
13. **Use accessible, responsive UI patterns.** Forms need labels, validation feedback, loading states, empty states, and error messages.
14. **Do not add unnecessary dependencies.** Explain why a new dependency is needed.
15. After each phase, report:
    - What changed
    - Files created or modified
    - Commands/checks run and their results
    - Known limitations
    - Next recommended step

If a requirement is ambiguous, inspect the code first. For business rules that cannot safely be assumed, document the assumption and ask for clarification rather than silently inventing a policy.

---

# 2. Project Overview

## 2.1 Background

Initial data gathering indicates that some participating offices manually maintain operational records and use paper-based forms. The current environment may also include spreadsheets or other tools. The exact workflow and pain points of each office still need validation.

The proposed system centralizes inventory and request workflows while allowing each office to have its own records, permissions, and operational rules.

## 2.2 Confirmed project decisions

- This is an academic prototype.
- The three participating offices are:
  1. Property Custodian Office
  2. Hospitality Management Lab Office
  3. Science Laboratory Office
- The stack is Next.js, Supabase, and Tailwind CSS.
- Planned request and inventory processes include:
  - Borrowing and returns
  - Consumable supplies
  - Equipment reservations
  - Purchasing and supplier deliveries
  - Damaged or missing items
- Supplier management is in scope, but core inventory and request workflows should be implemented first.
- Intended users include students, teachers, non-teaching personnel, office staff, office heads/approvers, and administrators.

## 2.3 Assumptions to validate

Do not present these assumptions as confirmed findings:

- Some records may be duplicated, incomplete, or difficult to retrieve.
- Staff may need a quicker way to check stock and equipment availability.
- Offices may have different approval workflows.
- The school may require overdue-loan reminders and low-stock alerts.
- Purchasing may involve external suppliers and designated approvers.
- Users may have access to suitable internet-connected devices.
- The school may require school-email registration or manual account approval.

Keep a `docs/assumptions-and-decisions.md` file and update it as office interviews clarify the requirements.

---

# 3. Objectives

## 3.1 General objective

Design and develop a centralized web-based system that helps selected school offices manage inventory, requests, borrowing and returns, reservations, damage/loss reports, and supplier-related transactions through organized digital records and controlled access.

## 3.2 Specific objectives

1. Digitize inventory records for the three offices.
2. Allow authorized school users to submit requests and track request status.
3. Support request review, approval, issuance, borrowing, reservations, and returns.
4. Maintain a traceable history of inventory movements.
5. Record damaged, missing, and unusable items and their resolution.
6. Maintain supplier, purchase request, purchase order, and delivery records.
7. Provide dashboards and searchable reports.
8. Apply role-based permissions and audit important actions.
9. Evaluate functional correctness, usability, and inventory-record accuracy.

---

# 4. Scope

## 4.1 In scope

- Authentication and account status management
- Role-based access control
- Three office workspaces in one application
- Item categories and item catalog
- Individual asset tracking for serialized equipment
- Quantity-based inventory for consumables
- Stock receipt, issue, return, transfer, and authorized adjustment records
- Requests and approval history
- Equipment reservations
- Borrowing and returns
- Damage and missing-item reports
- Supplier directory
- Purchase requests and purchase orders
- Delivery receiving and discrepancy records
- Low-stock and overdue alerts
- Notifications or in-app status updates
- Dashboards, filters, and printable reports
- Audit logs
- Responsive layout for desktop and mobile web

## 4.2 Out of scope unless later approved

- Accounting, payroll, and financial statement preparation
- Supplier payment processing
- Automated payment or automatic purchasing
- Integration with existing school information systems
- Native mobile application
- Advanced predictive analytics
- Barcode hardware integrations
- Automated chemical safety or regulatory decisions

## 4.3 MVP priority

Implement in this order:

1. Authentication, profiles, roles, and RLS
2. Offices, item catalog, locations, and inventory
3. Stock movement ledger and safe stock update operations
4. Requests and approvals
5. Issuance, borrowing, and returns
6. Damage/loss reports
7. Reports and dashboard
8. Suppliers, purchasing, and receiving
9. Notifications and optional enhancements

---

# 5. User Roles and Permissions

Use server-validated role assignments. A user may have more than one role if the application needs it, but each role assignment must be authorized.

## 5.1 Roles

- `admin`: manages application configuration, user roles, office setup, and authorized oversight.
- `office_head`: reviews and approves transactions for an assigned office according to school policy.
- `office_staff`: manages inventory and processes requests for an assigned office.
- `student`: submits eligible requests and views their own requests and transactions.
- `teacher`: submits requests, reservations, and laboratory requirements; views their own records.
- `non_teaching`: submits eligible requests and views their own records.

## 5.2 Default permission model

| Action | School requester | Office staff | Office head | Admin |
|---|---|---|---|---|
| Submit a request | Own requests | If enabled | If enabled | If enabled |
| View own requests | Yes | Yes | Yes | Yes |
| View all requests for an office | No | Assigned office | Assigned office | Authorized oversight |
| Create/edit inventory items | No | Assigned office | Assigned office | Authorized oversight |
| Approve requests | No | Only if delegated | If authorized | Only if explicitly authorized |
| Record release/return | No | Assigned office | If operationally authorized | If explicitly authorized |
| Manage suppliers/purchasing | No | If delegated | If authorized | If authorized |
| Assign roles | No | No | No | Yes |
| View audit records | No | Limited if authorized | Limited if authorized | Authorized oversight |

These are defaults, not established school policy. Keep role and office authorization logic centralized and testable.

## 5.3 Security rules

- Never trust a role, user ID, or office ID supplied by the browser.
- Do not permit users to promote themselves.
- Check access in server-side actions/route handlers and through RLS.
- Enable RLS on every exposed table, including child tables.
- Prevent users from reading other people's private requests.
- Prevent staff from accessing other offices unless explicitly authorized.
- Do not allow direct client-side updates to inventory balances or stock movement history.
- Keep the Supabase service-role key server-only and never use a `NEXT_PUBLIC_` prefix for it.
- Treat audit logs as append-only for ordinary application users.
- Store files privately when they contain sensitive information and authorize downloads.
- Use Supabase Auth's supported session and cookie patterns for the selected Next.js version.

---

# 6. Main Modules

## 6.1 Authentication and account management

Features:
- Sign in and sign out
- Account status (`pending`, `active`, `suspended`)
- Profile page
- Authorized role and office assignment
- Protected routes
- User administration for authorized administrators

For an academic prototype, account creation can be invite-only or require admin approval. Confirm the school's preferred account policy before enabling public registration.

## 6.2 Office management

Seed or configure these three offices:
- Property Custodian Office
- Hospitality Management Lab Office
- Science Laboratory Office

Do not hard-code office IDs in application logic. Query office records or use configuration derived from the database.

## 6.3 Inventory catalog

Each item should support:
- Office
- Category
- Item code
- Name and description
- Unit of measure
- Tracking type
- Reorder level where relevant
- Active/inactive status
- Created/updated timestamps

Tracking types:
- `serialized_asset`: an individually identified item such as a projector, laptop, microscope, or appliance.
- `quantity_stock`: a quantity-based item such as paper, gloves, or other consumables.

Do not track every consumable unit as a separate asset.

## 6.4 Locations and inventory balances

- Support storage locations within an office.
- Keep balances by item and location.
- Use database constraints to prevent negative stock.
- Ensure the item, location, and office relationships are valid.
- Show available, reserved, and on-hand quantities clearly.
- Do not count reserved stock as freely available stock.

## 6.5 Requests

A request has:
- Reference number
- Requester
- Office
- Request type
- Purpose
- Needed date/time if relevant
- Status
- Created/submitted timestamps
- Request items
- Approval history
- Optional supporting attachments

Request types:
- `borrow`
- `consumable`
- `reservation`
- `purchase`
- `other`

Each request item should distinguish:
- Requested quantity
- Approved quantity
- Issued/fulfilled quantity

Do not assume an approved request has already been fulfilled.

## 6.6 Approvals

- Record each decision with the approver, decision, reason, and timestamp.
- Support approved, partially approved, rejected, and needs-clarification decisions where appropriate.
- Verify that the approver is authorized for the office and transaction.
- Define valid state transitions in trusted business logic.
- Avoid overwriting decision history.

## 6.7 Borrowing and returns

- Link a loan to its request.
- Track the borrower, due date, actual return date, and responsible staff.
- Track specific asset codes for serialized equipment.
- Record condition at release and return.
- Support partial returns when a request has multiple items.
- Flag overdue loans.
- Do not make damaged, missing, disposed, or under-repair assets available automatically.

## 6.8 Equipment reservations

- Store reservation start and end timestamps.
- Validate that the end is after the start.
- Check asset availability for the entire period.
- Prevent overlapping active reservations for the same asset at the database level or through a transaction-safe operation.
- Define which statuses block a reservation.
- Keep reservations separate from actual loan/issuance records.
- Release reservations on cancellation or expiry according to explicit rules.

## 6.9 Consumable issuance

- Deduct stock only when staff confirms the actual quantity issued.
- Record the location, quantity, recipient, staff member, date, and request reference.
- Support partial fulfillment.
- Do not allow concurrent issues to overspend available stock.
- Trigger a low-stock warning when the balance reaches the configured reorder level.

## 6.10 Damage and missing-item reports

Record:
- Item and asset code where applicable
- Office and location
- Reporter
- Report type
- Description
- Date reported
- Optional private evidence attachment
- Review status
- Investigation outcome
- Resolution
- Authorized inventory adjustment reference

Do not delete the asset or original transaction history to hide a loss or damage incident.

## 6.11 Supplier management

Supplier fields may include:
- Supplier name
- Contact person
- Business contact details
- Address
- Notes
- Active/inactive status

Only collect personal/contact information needed for the academic prototype. Do not invent actual supplier information.

## 6.12 Purchasing and receiving

Support:
- Purchase request
- Purchase request items
- Approval history
- Supplier selection
- Purchase order and order items
- Goods receipt and received items
- Ordered quantity, received quantity, accepted quantity, and rejected/damaged quantity
- Delivery discrepancy notes
- Inventory receipt movement for accepted quantities only

Payment processing is out of scope.

## 6.13 Reports and dashboards

Suggested reports:
- Current inventory by office, category, and location
- Low-stock items
- Stock movement history
- Pending requests
- Request outcomes and processing times
- Active and overdue loans
- Reservation schedule
- Damage/loss incidents
- Purchase order status
- Goods received and delivery discrepancies
- Supplier order history

All reports must enforce the same access boundaries as their underlying records.

## 6.14 Notifications

Start with in-app notifications for:
- Request submitted
- Approval/rejection/clarification
- Request ready for release
- Upcoming due date
- Overdue loan
- Low stock
- Delivery discrepancy

Email and real-time push behavior can be added later if needed. Avoid sending duplicate notifications when a retry occurs.

---

# 7. Core Workflows

## 7.1 General request workflow

1. User signs in.
2. User selects the office and request type.
3. User enters purpose, required date, and requested items.
4. Server validates fields and user eligibility.
5. System saves the request with a reference number.
6. Authorized office staff reviews it.
7. Staff approves, partially approves, rejects, or requests clarification.
8. The system records the decision and notifies the requester.
9. The request moves to the correct fulfillment workflow.
10. The request is completed only when its required fulfillment steps are complete.

Possible states:
- `draft`
- `submitted`
- `under_review`
- `needs_clarification`
- `approved`
- `partially_approved`
- `rejected`
- `cancelled`
- `completed`

Define permitted transitions in one shared business-logic layer and enforce critical transitions in database functions where appropriate.

## 7.2 Equipment borrowing workflow

1. User requests an asset or eligible equipment.
2. System validates availability and required information.
3. Authorized staff reviews the request.
4. Approval is recorded separately from actual release.
5. Staff records the specific asset code released, condition, recipient, and release time.
6. Loan becomes active with a due date.
7. System flags upcoming or overdue returns.
8. Staff records return date and condition.
9. If damaged, the asset becomes unavailable pending review.
10. Loan is closed when return checks and required follow-up are complete.

## 7.3 Consumable request workflow

1. User requests an item and quantity.
2. System checks stock availability.
3. Staff reviews and approves all or part of the request.
4. Staff confirms the actual quantity issued.
5. A transaction-safe database operation deducts that quantity and inserts a stock movement.
6. The system records who issued and received the stock.
7. Low-stock warnings are generated when applicable.
8. Insufficient stock may lead to partial fulfillment or a replenishment request.

Never deduct stock at submission or approval time.

## 7.4 Reservation workflow

1. User selects an item and time range.
2. Server validates the time range and user permission.
3. System checks conflicts against active reservations and loans.
4. Authorized staff approves when required.
5. Reservation blocks the relevant asset/time range.
6. On release, staff creates the actual loan record.
7. Cancellation or expiry releases the reservation according to defined rules.

## 7.5 Damage/missing workflow

1. User or staff reports the incident.
2. System records item, asset code if relevant, description, date, and reporter.
3. Authorized staff reviews it.
4. Asset/stock is marked unavailable or adjusted only according to the correct inventory process.
5. Staff records investigation and resolution.
6. Authorized adjustments create traceable movement records.
7. Incident is closed without deleting its history.

## 7.6 Purchasing and receiving workflow

1. Staff identifies a supply/equipment need.
2. Purchase request is created with items, quantities, and estimated costs.
3. Authorized approver reviews it.
4. Staff records the supplier and purchase order.
5. Delivery is received and inspected.
6. Actual quantities and discrepancies are recorded.
7. Accepted quantities are added to stock through a transaction-safe receipt operation.
8. Order and receipt status are updated.
9. Supplier history and reports are available to authorized users.

---

# 8. Proposed Database Model

Use PostgreSQL migrations stored in `supabase/migrations/`. Generate TypeScript database types after schema changes.

## 8.1 Core tables

### Identity and office access

`offices`
- `id uuid primary key`
- `name text unique not null`
- `is_active boolean not null default true`
- `created_at timestamptz`

`profiles`
- `id uuid primary key references auth.users(id)`
- `full_name text not null`
- `school_id text unique null`
- `account_status text` with controlled values
- `created_at timestamptz`

`user_roles`
- `id uuid primary key`
- `user_id uuid references profiles(id)`
- `role app_role`
- `office_id uuid null references offices(id)`
- `created_at timestamptz`
- Unique combination to avoid duplicate assignments

Office-specific roles should require an office ID. Global roles should follow a clearly defined rule. Never accept role changes directly from an untrusted browser request.

### Catalog and inventory

`categories`
- `id`
- `office_id`
- `name`
- Unique `(office_id, name)`

`items`
- `id`
- `office_id`
- `category_id`
- `item_code`
- `name`
- `description`
- `unit_of_measure`
- `tracking_type`
- `reorder_level`
- `is_active`
- timestamps
- Unique `(office_id, item_code)`

`locations`
- `id`
- `office_id`
- `name`
- `is_active`
- Unique `(office_id, name)`

`inventory_balances`
- `id`
- `item_id`
- `location_id`
- `quantity_on_hand`
- `updated_at`
- Unique `(item_id, location_id)`

`assets`
- `id`
- `item_id`
- `asset_code unique`
- `condition`
- `status`
- `location_id`
- timestamps

`stock_movements`
- `id`
- `office_id`
- `item_id`
- `location_id`
- `movement_type`
- `quantity`
- `reference_type`
- `reference_id`
- `performed_by`
- `created_at`

Movement types can include:
- `receipt`
- `issue`
- `return`
- `transfer_in`
- `transfer_out`
- `adjustment_in`
- `adjustment_out`
- `damage`
- `disposal`

Choose one documented quantity convention. A straightforward convention is positive `quantity` plus a movement type that determines the effect on the balance. Do not allow arbitrary users to insert movements directly.

### Requests

`requests`
- `id`
- `reference_no unique`
- `requester_id`
- `office_id`
- `request_type`
- `purpose`
- `needed_at`
- `status`
- `submitted_at`
- timestamps

`request_items`
- `id`
- `request_id`
- `item_id`
- `requested_quantity`
- `approved_quantity`
- `issued_quantity`

`approvals`
- `id`
- `request_id`
- `approver_id`
- `decision`
- `reason`
- `decided_at`

### Reservations, loans, and incidents

`reservations`
- `id`
- `request_id`
- `asset_id` or the appropriate reservation resource
- `starts_at`
- `ends_at`
- `status`
- `created_by`
- timestamps

`loans`
- `id`
- `request_id`
- `borrower_id`
- `released_by`
- `released_at`
- `due_at`
- `status`
- timestamps

`loan_items`
- `id`
- `loan_id`
- `asset_id`
- `issued_condition`
- `returned_condition`
- `returned_at`

`incident_reports`
- `id`
- `office_id`
- `item_id`
- `asset_id nullable`
- `reporter_id`
- `incident_type`
- `description`
- `status`
- `resolution`
- timestamps

### Supplier and procurement

`suppliers`
- `id`
- `name`
- `contact_person`
- `email`
- `phone`
- `address`
- `notes`
- `is_active`
- timestamps

`purchase_requests`
- `id`
- `reference_no`
- `office_id`
- `requested_by`
- `purpose`
- `status`
- timestamps

`purchase_request_items`
- `id`
- `purchase_request_id`
- `item_id`
- `quantity`
- `estimated_unit_cost`

`purchase_orders`
- `id`
- `purchase_request_id`
- `supplier_id`
- `office_id`
- `order_number`
- `order_date`
- `status`
- timestamps

`purchase_order_items`
- `id`
- `purchase_order_id`
- `item_id`
- `ordered_quantity`
- `unit_cost`

`goods_receipts`
- `id`
- `purchase_order_id`
- `received_by`
- `received_at`
- `status`
- `notes`

`goods_receipt_items`
- `id`
- `goods_receipt_id`
- `purchase_order_item_id`
- `received_quantity`
- `accepted_quantity`
- `rejected_quantity`
- `discrepancy_notes`

### System records

`notifications`
- `id`
- `user_id`
- `type`
- `title`
- `message`
- `read_at`
- `created_at`

`audit_logs`
- `id`
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `metadata jsonb`
- `created_at`

Do not store passwords in `profiles`; Supabase Auth manages credentials.

## 8.2 Database integrity rules

- Use UUID primary keys.
- Use foreign keys and check constraints.
- Use `numeric`, not floating point, for monetary values.
- Use `timestamptz` for dates and times.
- Use database-generated request/order reference numbers.
- Ensure item, category, location, and office relationships cannot cross offices accidentally.
- Use transactions for balance updates and corresponding movement records.
- Use row locking or another concurrency-safe approach for stock issues.
- Prevent negative inventory unless a documented business rule explicitly permits it.
- Ensure accepted delivery quantity does not exceed the received quantity.
- Ensure approved and issued quantities are valid.
- Prevent overlapping reservations for the same asset.
- Preserve transaction history.
- Use soft deactivation for catalog records with history where appropriate.
- Add indexes for frequently queried columns such as request owner/status/date, office/status/date, item code, and movement item/date.

## 8.3 Important implementation note

The schema above is a logical specification, not permission to create every table in one unreviewed migration. Implement it in small migrations, validate foreign keys and policies, and test each workflow before proceeding.

---

# 9. Stock and Transaction Integrity

Inventory accuracy is one of the most important system requirements.

## 9.1 Required approach

Treat the stock movement ledger as the history of what happened and `inventory_balances` as the current balance used for fast display.

For each stock-changing operation:
1. Authenticate the user.
2. Validate the role and office.
3. Validate the request/reference and its state.
4. Lock or otherwise safely serialize the affected balance row.
5. Verify sufficient available quantity.
6. Update the balance.
7. Insert the stock movement.
8. Update related request/loan/receipt status.
9. Commit all related changes atomically.

If any step fails, the complete transaction must roll back.

## 9.2 Do not implement these unsafe shortcuts

- Do not update stock directly from a React component.
- Do not deduct stock just because a request was approved.
- Do not use a client-side availability check as the only stock protection.
- Do not allow duplicate issue operations to run for the same request item.
- Do not delete movement records to fix an incorrect balance.
- Do not automatically return damaged equipment to available status.
- Do not let an order receipt increase stock by the ordered amount when fewer items were accepted.

Create controlled PostgreSQL functions or other carefully designed transactional operations for stock receipt, issue, return, transfer, and adjustment. Restrict direct write permissions on balances and movement records.

---

# 10. Next.js Architecture

Use the Next.js App Router and TypeScript.

## 10.1 Suggested file structure

Adapt to the repository if it already has a structure:

```text
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    (dashboard)/
      dashboard/page.tsx
      requests/page.tsx
      requests/new/page.tsx
      requests/[id]/page.tsx
      inventory/page.tsx
      inventory/[id]/page.tsx
      reservations/page.tsx
      borrowings/page.tsx
      incidents/page.tsx
      suppliers/page.tsx
      purchasing/page.tsx
      reports/page.tsx
      admin/users/page.tsx
      admin/offices/page.tsx
    api/
      notifications/route.ts

  components/
    layout/
    inventory/
    requests/
    reservations/
    borrowings/
    incidents/
    suppliers/
    purchasing/
    reports/
    ui/

  lib/
    supabase/
      client.ts
      server.ts
    auth/
      permissions.ts
    validations/
      inventory.ts
      request.ts
      reservation.ts
      purchasing.ts
    services/
      inventory.ts
      requests.ts
      reservations.ts
      loans.ts
      procurement.ts

  types/
    database.types.ts
    app.ts

supabase/
  migrations/
  seed.sql

docs/
  assumptions-and-decisions.md
  architecture.md
  workflows.md
  testing-plan.md
```

## 10.2 Architectural principles

- Use server components for protected page data where practical.
- Use client components only when interaction requires them.
- Use server actions or route handlers for controlled mutations.
- Keep validation schemas separate from UI components.
- Centralize permission checks.
- Use generated Supabase database types.
- Use pagination for potentially large lists.
- Provide loading, empty, success, and error states.
- Keep database queries out of unrelated presentation components.
- Do not expose secrets to the browser.
- Avoid overengineering the academic prototype with unnecessary layers.

## 10.3 UI requirements

Use a clean, professional, responsive admin interface:
- Sidebar navigation on desktop
- Accessible mobile navigation
- Clear page titles and breadcrumbs where helpful
- Tables with search, filters, and pagination
- Consistent status badges
- Forms with labels and validation messages
- Confirmation dialogs for important actions
- Clear success and failure feedback
- Empty states that explain the next action
- Consistent spacing and typography
- Accessible contrast and keyboard navigation

Use Tailwind CSS with reusable UI components. Do not prioritize visual decoration over clarity, usability, and correctness.

---

# 11. Suggested Routes and Page Behavior

| Route | Purpose | Access |
|---|---|---|
| `/login` | Sign in | Public |
| `/dashboard` | Role-appropriate dashboard | Authenticated active users |
| `/requests` | View permitted requests | All users, scoped by role |
| `/requests/new` | Submit a request | Eligible users |
| `/requests/[id]` | View request and permitted actions | Owner or authorized staff |
| `/inventory` | Browse inventory permitted to the user | Staff/admin; limited read access if approved |
| `/inventory/[id]` | Item detail and history | Authorized users |
| `/reservations` | Manage permitted reservations | Requesters and authorized office staff |
| `/borrowings` | Active/overdue loans and returns | Authorized office staff and permitted borrowers |
| `/incidents` | Damage/loss reporting and review | Authorized users |
| `/suppliers` | Supplier directory | Authorized procurement roles |
| `/purchasing` | Purchase requests, orders, receiving | Authorized roles |
| `/reports` | Reports | Role and office scoped |
| `/admin/users` | Account and role administration | Admin only |
| `/admin/offices` | Office configuration | Admin only |

Do not rely on route visibility alone. Enforce the same permissions in the data access layer and database.

---

# 12. Dashboard Requirements

## 12.1 Administrator dashboard

Possible metrics:
- Active offices
- Pending requests
- Low-stock items
- Active/overdue loans
- Recent inventory movements
- Purchase orders awaiting receipt

Show only authorized aggregated information. Do not expose sensitive details just because the viewer is an administrator.

## 12.2 Office dashboard

- Inventory item count
- Low-stock items
- Requests awaiting review
- Items currently on loan
- Overdue returns
- Recent stock movements
- Open incidents
- Pending deliveries

All values must come from real database queries. Do not hard-code example counts in the finished dashboard.

## 12.3 School requester dashboard

- My requests and their statuses
- Upcoming reservations
- My active loans and due dates
- Relevant notifications
- Request history

---

# 13. Validation and Error Handling

Validate data at multiple layers:
- Browser form validation for user feedback
- Server-side validation for all mutations
- PostgreSQL constraints for data integrity
- RLS and authorization checks for access control
- Transactional operations for multi-step inventory changes

Examples:
- Requested quantity must be greater than zero.
- End time must be after start time.
- A request cannot be approved by an unauthorized user.
- A completed loan cannot be returned twice.
- A rejected request cannot be issued without a valid new workflow.
- A receipt cannot accept more units than were actually received.
- A user cannot change the office ID to access another office's data.
- Stock issues cannot create negative balances.
- A reservation cannot overlap an active reservation for the same asset.

Use user-friendly error messages without leaking internal secrets, SQL, stack traces, or sensitive records.

---

# 14. Testing Plan

Write automated tests where practical and document manual acceptance tests.

## 14.1 Functional tests

1. Active user can sign in.
2. Suspended or unapproved user cannot access protected functionality.
3. Eligible user can submit a valid request.
4. Invalid or incomplete request is rejected with useful feedback.
5. Authorized office staff can review requests for their office.
6. Unauthorized user cannot approve a request.
7. Actual issued quantity, not requested quantity, is deducted.
8. Return is recorded with the correct asset and condition.
9. Damaged asset does not become available automatically.
10. Low-stock alert appears at the configured threshold.
11. Supplier and purchase order records can be created by authorized users.
12. Accepted delivery quantity is recorded correctly.
13. Reports respect office and user permissions.
14. Audit history records significant actions.

## 14.2 Security tests

1. Student cannot edit inventory.
2. User cannot read another user's private request.
3. Office A staff cannot modify Office B data.
4. User cannot grant themselves a privileged role.
5. Browser cannot write directly to stock balances or ledger records.
6. Service-role credentials are not present in client bundles.
7. Private file attachments cannot be downloaded by unauthorized users.
8. Audit records cannot be silently changed by ordinary users.

## 14.3 Concurrency and integrity tests

1. Two requests competing for the last units cannot over-issue stock.
2. Concurrent requests cannot produce a negative balance.
3. Duplicate submission/retry does not issue stock twice.
4. Two users cannot reserve the same asset for overlapping periods.
5. Failed transaction rolls back all related changes.
6. A partial delivery changes inventory only by accepted quantity.
7. Transfers update both locations consistently.

## 14.4 Usability evaluation

Ask representative users to:
- Find an item.
- Submit a request.
- Check request status.
- Approve a request if authorized.
- Record a release and return.
- Report a damaged item.
- Locate a stock or transaction report.

Collect task completion, observed difficulties, and user feedback. Compare the system with the current process where possible. Do not claim measured improvement before conducting the evaluation.

---

# 15. Academic Deliverables

Maintain the following project documents as development progresses:

1. `docs/assumptions-and-decisions.md`
   - Confirmed facts, assumptions, decisions, and unresolved questions.

2. `docs/requirements.md`
   - Functional and non-functional requirements with IDs and acceptance criteria.

3. `docs/workflows.md`
   - Request, borrowing, return, reservation, incident, and procurement workflows.

4. `docs/architecture.md`
   - Application architecture, Supabase usage, security model, and module boundaries.

5. `docs/database-design.md`
   - Tables, relationships, constraints, indexes, and key transaction rules.

6. `docs/testing-plan.md`
   - Test scenarios, results, and known limitations.

7. `README.md`
   - Project setup, environment variables, migration instructions, seed data, and development commands.

Use fictional seed data for demos. If actual office records are later provided, obtain permission and anonymize personal or sensitive details where appropriate.

---

# 16. Development Phases and Definition of Done

## Phase 0 — Repository inspection and plan

Tasks:
- Inspect files and existing code.
- Confirm Next.js and Tailwind versions.
- Inspect package scripts and installed dependencies.
- Identify existing Supabase setup.
- Create or update the documentation listed above.
- Produce an implementation checklist.

Definition of done:
- Existing project state is understood.
- No destructive changes have been made without approval.
- Unresolved decisions are documented.

## Phase 1 — Project foundation and authentication

Tasks:
- Configure Supabase browser and server clients.
- Implement sign-in/sign-out and protected routes.
- Add profile and role handling.
- Add account status checks.
- Create offices and seed the three office records.
- Enable RLS and add initial policies.

Definition of done:
- Authenticated users can access permitted routes.
- Unauthenticated, suspended, or unauthorized users are denied.
- Role assignment cannot be self-modified.

## Phase 2 — Inventory catalog

Tasks:
- Categories, items, locations, and asset registration.
- Separate serialized assets from quantity stock.
- Search and filters.
- Inventory display.
- Safe initial stock receipt and adjustment operations.

Definition of done:
- Authorized staff can manage permitted catalog records.
- Users cannot write unauthorized records.
- Office boundaries and inventory constraints are tested.

## Phase 3 — Stock ledger and requests

Tasks:
- Implement stock movement operations.
- Implement request creation and reference numbers.
- Add request items and approval history.
- Implement state transitions.
- Add request detail and status pages.

Definition of done:
- Request states are validated.
- Every stock-changing operation is traceable.
- Failed operations do not leave partial updates.

## Phase 4 — Borrowing, returns, reservations, and incidents

Tasks:
- Implement loan release and return.
- Implement due dates and overdue status.
- Implement reservation conflict protection.
- Implement damage/loss reporting and resolution.
- Add appropriate notifications.

Definition of done:
- Loans and reservations are distinct.
- Double return/issue is prevented.
- Damaged/missing assets are handled correctly.
- Concurrent reservation tests pass.

## Phase 5 — Suppliers and procurement

Tasks:
- Supplier directory.
- Purchase requests and approvals.
- Purchase orders and items.
- Goods receipts and receipt items.
- Discrepancy handling.
- Stock receipt from accepted delivery quantities.

Definition of done:
- Procurement records are linked.
- Stock is increased only by accepted quantities.
- Supplier and office permissions are enforced.

## Phase 6 — Reports and usability

Tasks:
- Role-appropriate dashboards.
- Inventory and transaction reports.
- Low-stock and overdue views.
- Responsive styling and accessibility checks.
- Print-friendly reports where useful.

Definition of done:
- Reports use real data and respect permissions.
- Common user tasks are tested on desktop and mobile widths.
- Loading, empty, error, and success states are handled.

## Phase 7 — Final validation and documentation

Tasks:
- Run lint, type checks, tests, and production build.
- Test RLS policies and key database functions.
- Verify environment variable safety.
- Review known limitations.
- Update the README and academic documentation.
- Prepare a demonstration script.

Definition of done:
- No known critical failures remain unreported.
- The project can be set up from documented instructions.
- Incomplete features are clearly listed.
- Demo data is fictional or appropriately anonymized.

---

# 17. Environment and Setup Expectations

Create `.env.example` with placeholders only, such as:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

If the chosen Supabase/Next.js setup requires a publishable key, use the appropriate current key name. Never commit real credentials.

If privileged server-side operations truly require a service-role/secret key, use a server-only variable and ensure it is never imported by client components or exposed to the browser. Prefer user-scoped server clients and RLS whenever possible.

Document:
- Required Node.js version
- Package manager
- Install command
- Development command
- Lint/typecheck/test commands
- Supabase migration workflow
- Seed procedure
- Production build command

Do not assume that a particular Supabase API key naming convention or Next.js authentication helper is available without checking the installed versions and current project setup.

---

# 18. Suggested Acceptance Criteria for the MVP

The MVP is ready for an academic demonstration when:

- [ ] Users can authenticate and access permitted features.
- [ ] The three offices are represented in the database.
- [ ] Authorized staff can create and update item records.
- [ ] Serialized assets and consumables are handled differently.
- [ ] Inventory balances and stock movements remain consistent.
- [ ] School users can submit requests and track statuses.
- [ ] Authorized staff can review requests and record decisions.
- [ ] Consumable issuance deducts the actual issued quantity atomically.
- [ ] Equipment loans and returns are traceable.
- [ ] Damage/missing reports can be submitted and reviewed.
- [ ] Role and office boundaries are enforced by RLS and server logic.
- [ ] Key actions are recorded in audit history.
- [ ] Basic dashboards and reports show real data.
- [ ] Critical functional, authorization, and concurrency tests have been run.
- [ ] Setup and limitations are documented.

Supplier purchasing and receiving can follow as the next major milestone if time is limited, but keep the schema design ready for those modules.

---

# 19. First Task for OpenCode

**Start here. Do not attempt to build the whole application in one response.**

1. Inspect the current repository and report the existing stack, file structure, dependencies, and current implementation state.
2. Identify any existing work that should be preserved.
3. Compare the repository against this plan.
4. Create or update `docs/assumptions-and-decisions.md`, `docs/requirements.md`, `docs/workflows.md`, `docs/architecture.md`, and `docs/testing-plan.md`.
5. Propose the smallest safe implementation plan for Phase 1.
6. List any blocking questions. Do not ask questions whose answers can be established by inspecting the repository.
7. Wait for approval before destructive changes or major architecture rewrites.
8. Once approved, implement Phase 1, test it, and report the results before moving on.

**Final engineering principle:** Prioritize correctness, security, and traceable inventory transactions over visual polish. The system must be able to explain what item changed, what changed, why it changed, who authorized it, and when it happened.
