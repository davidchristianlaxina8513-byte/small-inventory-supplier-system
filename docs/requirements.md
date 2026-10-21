# Requirements

Derived from `SISS_OpenCode_Full_Project_Plan.md`. IDs are stable; status uses
`[ ]` not started, `[~]` partial, `[x]` done. Acceptance criteria are observable behavior.
Defaults below are not established school policy (plan §5.2).

## 1. Authentication and accounts (AUTH)

- **AUTH-01** Users can sign in and sign out via Supabase Auth.
  - _AC:_ Valid credentials grant a session; sign-out clears it; protected routes redirect unauthenticated users to `/login`.
- **AUTH-02** Profiles exist for every authenticated user with `full_name`, optional `school_id`, and account status (`pending` | `active` | `suspended`).
  - _AC:_ Status is stored in the database; passwords are never stored in `profiles`.
- **AUTH-03** `pending` and `suspended` users cannot use protected functionality.
  - _AC:_ Server-side and database-level checks deny access regardless of UI state.
- **AUTH-04** Administrators can create accounts and assign roles; users cannot modify their own roles.
  - _AC:_ A self-promotion attempt fails server-side and in RLS.

## 2. Roles and access control (SEC)

- **SEC-01** Roles: `admin`, `office_head`, `office_staff`, `student`, `teacher`, `non_teaching`; office-scoped roles carry an `office_id`.
  - _AC:_ Role assignments are stored in `user_roles` with uniqueness enforced.
- **SEC-02** All exposed tables have RLS enabled; fail-closed by default.
  - _AC:_ Anonymous and unauthorized reads/writes return no rows/errors.
- **SEC-03** Office staff cannot access another office's data.
  - _AC:_ Cross-office read/write attempts return empty/denied results.
- **SEC-04** Users cannot read other users' private requests.
  - _AC:_ Only the requester and authorized office staff/head can view a request.
- **SEC-05** Inventory balances and stock movements cannot be written directly from the browser.
  - _AC:_ Direct client updates to those tables are denied; only privileged server/database operations can change them.
- **SEC-06** Audit logs are append-only for ordinary users.
  - _AC:_ No update/delete grants for `authenticated` on audit tables.
- **SEC-07** The Supabase service-role key (if used) is server-only and never appears in client bundles or `NEXT_PUBLIC_` variables.

## 3. Offices and setup (OFF)

- **OFF-01** Exactly the three participating offices exist as database records (seeded, not hard-coded in logic).
  - _AC:_ Application logic queries office records; no office UUID literals in code.
- **OFF-02** Administrators can manage office records (activate/deactivate).

## 4. Inventory catalog (INV)

- **INV-01** Items belong to an office and a category; each has a unique `item_code` per office, name, description, unit of measure, tracking type, optional `reorder_level`, and active flag.
  - _AC:_ Duplicate `(office_id, item_code)` is rejected by a constraint.
- **INV-02** Tracking types: `serialized_asset` (individually identified) and `quantity_stock` (consumables).
  - _AC:_ Serialized items have registered asset records with `asset_code`, condition, status, location; consumables are not tracked unit-by-unit.
- **INV-03** Storage locations exist per office; balances are kept per item and location.
  - _AC:_ `inventory_balances` is unique on `(item_id, location_id)`; negative balances are impossible.
- **INV-04** Authorized office staff can search and filter the catalog; users see only permitted offices.

## 5. Stock ledger (STK)

- **STK-01** Every stock change inserts an append-only `stock_movements` record (type, quantity, reference, performer, timestamp).
  - _AC:_ Movement types: receipt, issue, return, transfer_in/out, adjustment_in/out, damage, disposal.
- **STK-02** Stock changes occur only through transactional operations that lock the balance row, verify available quantity, update the balance, and insert the movement atomically.
  - _AC:_ Any failure rolls back all related changes; concurrent issues cannot oversell or go negative.
- **STK-03** Low-stock warnings appear when quantity reaches the item's `reorder_level`.

## 6. Requests and approvals (REQ)

- **REQ-01** Eligible users submit requests with office, type (`borrow` | `consumable` | `reservation` | `purchase` | `other`), purpose, optional needed date, and request items.
  - _AC:_ Each request gets a database-generated unique reference number.
- **REQ-02** Request items track requested, approved, and issued quantities separately.
  - _AC:_ Approval never implies fulfillment.
- **REQ-03** Request statuses: draft, submitted, under_review, needs_clarification, approved, partially_approved, rejected, cancelled, completed; transitions validated in shared business logic.
  - _AC:_ Invalid transitions are rejected; history is preserved.
- **REQ-04** Authorized staff record decisions (approve / partially approve / reject / needs clarification) with approver, reason, and timestamp.
  - _AC:_ Unauthorized approvers are denied; decisions are never overwritten.
- **REQ-05** Stock is deducted only when staff confirm the actual issued quantity — never at submission or approval.
  - _AC:_ Actual issued quantity drives the ledger; partial fulfillment supported.

## 7. Borrowing and returns (LOAN)

- **LOAN-01** Loans link to their request and record borrower, releasing staff, release time, due time, and conditions at release and return.
- **LOAN-02** Serialized loans track specific asset codes; partial returns are supported.
- **LOAN-03** Overdue loans are flagged; damaged/missing/under-repair/disposed assets are never automatically available.
  - _AC:_ Return of a damaged asset puts it into unavailable/review state.

## 8. Reservations (RESV)

- **RESV-01** Reservations store start/end timestamps; end must be after start.
- **RESV-02** Overlapping active reservations for the same asset are prevented at the database or transaction-safe level.
  - _AC:_ Concurrent conflicting reservation attempts: exactly one succeeds.
- **RESV-03** Cancellation/expiry releases the reservation per explicit rules; reservations remain distinct from actual loans.

## 9. Incidents (INC)

- **INC-01** Users/staff report damage or missing items with item, asset (if applicable), description, date, reporter, and optional private evidence attachment.
- **INC-02** Authorized staff review, record investigation outcome and resolution; any inventory adjustment goes through the normal traceable ledger.
  - _AC:_ Asset or transaction history is never deleted to hide an incident.

## 10. Suppliers and procurement (SUP/PUR)

- **SUP-01** Authorized users maintain a supplier directory (name, contact person, email, phone, address, notes, active flag); fictional data only.
- **PUR-01** Purchase requests with items and estimated costs can be created and approved by authorized roles.
- **PUR-02** Purchase orders reference a purchase request and supplier; order items store ordered quantity and unit cost (numeric, not float).
- **PUR-03** Goods receipts record received, accepted, and rejected/damaged quantities with discrepancy notes.
  - _AC:_ Accepted quantity can never exceed received quantity.
- **PUR-04** Only accepted quantities increase inventory, via the transactional receipt operation.
  - _AC:_ A partial delivery changes stock only by the accepted amount.

## 11. Reports and dashboards (RPT)

- **RPT-01** Role-appropriate dashboards (admin, office, requester) show real database queries — no hard-coded counts.
- **RPT-02** Reports: inventory by office/category/location, low stock, stock movements, pending requests, request outcomes, active/overdue loans, reservation schedule, incidents, PO status, deliveries/discrepancies, supplier order history.
  - _AC:_ Every report enforces the same access boundaries as its underlying records.

## 12. Notifications (NTF)

- **NTF-01** In-app notifications for: request submitted, decision made, ready for release, upcoming due date, overdue loan, low stock, delivery discrepancy.
  - _AC:_ Retries do not create duplicate notifications; email/push deferred.

## 13. Audit (AUD)

- **AUD-01** Significant actions (auth events, approvals, stock operations, role changes, incident resolutions) write `audit_logs` entries with actor, action, entity, metadata, timestamp.

## 14. Non-functional

- **NF-01** Strict TypeScript; no `any` without documented reason.
- **NF-02** Server-side validation of all mutations plus PostgreSQL constraints for invariants.
- **NF-03** Accessible, responsive UI: labeled forms, validation feedback, loading/empty/error states, keyboard navigation, mobile + desktop.
- **NF-04** User-facing errors never leak SQL, stack traces, secrets, or other users' data.
- **NF-05** No secrets in source; browser-visible env vars are treated as public.

## Out of scope (unless later approved)

Accounting/payroll, supplier payment processing, automated purchasing, SIS integration, native mobile app, predictive analytics, barcode hardware, automated chemical safety decisions.
