# Core Workflows

Source: `SISS_OpenCode_Full_Project_Plan.md` §7. State machines and critical rules are enforced in shared server-side business logic and PostgreSQL functions — not in UI components.

## 1. General request workflow

1. User signs in and selects office + request type.
2. User enters purpose, needed date/time, and requested items.
3. Server validates fields, eligibility, and office scope.
4. System saves the request with a database-generated reference number.
5. Authorized office staff reviews (status `under_review`).
6. Staff decides: approve, partially approve, reject, or needs clarification — each recorded with approver, reason, timestamp.
7. Requester is notified.
8. Request enters the matching fulfillment workflow (loan, consumable issue, reservation, purchase).
9. Request completes only when all required fulfillment steps are done.

States: `draft → submitted → under_review → (needs_clarification | approved | partially_approved | rejected)` ; `approved/partially_approved → completed`; `cancelled` possible from pre-approval states. Approval ≠ fulfillment.

## 2. Equipment borrowing workflow

1. User requests eligible equipment (request type `borrow`).
2. System validates availability and required information.
3. Authorized staff reviews; approval recorded separately from release.
4. Staff records the specific asset code released, condition, recipient, and release time; loan becomes active with a due date.
5. System flags upcoming/overdue returns.
6. Staff records return date and condition.
7. Damaged asset becomes unavailable pending review — never auto-available.
8. Loan closes only after return checks and required follow-up.

## 3. Consumable request workflow

1. User requests item + quantity (type `consumable`).
2. System checks stock availability (display only).
3. Staff approves all or part.
4. Staff confirms the **actual** quantity issued.
5. A transaction-safe database operation: locks balance row → verifies available → deducts → inserts `stock_movements` (issue) → updates request item — atomically.
6. Issuer, recipient, location, date, and request reference are recorded.
7. Low-stock warning triggers at `reorder_level`.
8. Insufficient stock leads to partial fulfillment or a replenishment purchase request.

Never deduct stock at submission or approval time.

## 4. Reservation workflow

1. User selects an asset and time range (type `reservation`).
2. Server validates range (end after start) and permission.
3. System checks conflicts against active reservations and loans for the entire period.
4. Authorized staff approves when required.
5. Reservation blocks the asset/time range; overlaps prevented at the database or transaction-safe level.
6. On release, staff creates the actual loan record (reservations never substitute for loans).
7. Cancellation or expiry releases the slot per explicit rules.

## 5. Damage / missing-item workflow

1. User or staff reports the incident (item, asset code if applicable, description, date, reporter; optional private attachment).
2. Authorized staff reviews.
3. Asset/stock is marked unavailable or adjusted only via the correct inventory process.
4. Staff records investigation outcome and resolution.
5. Any inventory change is a traceable ledger movement (damage / adjustment_out / disposal).
6. Incident closes without deleting asset or transaction history.

## 6. Purchasing and receiving workflow

1. Staff identifies a need and creates a purchase request (items, quantities, estimated costs).
2. Authorized approver reviews and decides.
3. Staff records supplier selection and creates a purchase order with order items.
4. Delivery is received and inspected: received, accepted, and rejected/damaged quantities plus discrepancy notes are recorded per line.
5. Accepted quantities are added to stock via the transactional receipt operation (increase = accepted only).
6. Order and receipt statuses update.
7. Supplier history and reports become available to authorized roles.

Payment processing is out of scope.

## 7. Notification events

| Event                                     | Recipients                   |
| ----------------------------------------- | ---------------------------- |
| Request submitted                         | Office staff/head            |
| Approved / rejected / needs clarification | Requester                    |
| Request ready for release                 | Requester                    |
| Upcoming due date / overdue loan          | Borrower, office staff       |
| Low stock reached                         | Office staff                 |
| Delivery discrepancy                      | Receiving staff, office head |

In-app only for the prototype; deduplicate on retries.
