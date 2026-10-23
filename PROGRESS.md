# PROGRESS.md

## Status

The 2026-10-23 two-day Final Performance Task plan prioritizes three connected demonstrations: inventory, borrowing, and suppliers. The current checkpoint completes the Inventory flow's focused test definition through receipt and issue; runtime verification is pending sufficient memory. See `docs/requirements/final-pt-mvp-gap-analysis.md`.

SISS operational MVP is implemented locally through Phases 0–7. Database, lint, type, and production build checks pass. Representative-user evaluation, private evidence uploads, and hosted Supabase configuration remain follow-up work.

## Completed

- Supabase Auth with pending/active/suspended profiles, six roles, office assignments, protected routes, and admin user/office management.
- Office-scoped categories, locations, items, balances, serialized assets, and append-only movements.
- Transactional receipt, issue, adjustment, and two-location transfer operations.
- Requests with generated references, approval history, distinct requested/approved/issued quantities, and atomic issuance.
- Asset reservations, loans, overdue display, partial returns, return condition, and damaged asset quarantine.
- Damage/missing reporting and staff resolution.
- Supplier directory, purchase requests, purchase orders, partial receiving, discrepancies, and accepted-quantity-only stock receipts.
- User notifications, append-only audit history, live dashboards, and printable reports.
- Least-privilege grants plus fail-closed RLS for all workflow tables.

## Validation on 2026-10-22

- `npm run lint` — pass.
- `npm run typecheck` — pass.
- `npm run build` — pass; all SISS routes compile.
- pgTAP workflow file — 31/31 pass; earlier full suite — 123/123 pass. The complete suite now contains 136 assertions.
- `npx vitest run --pool=threads --maxWorkers=1` — 44/44 pass. The default worker pool remains intermittently unstable on this Windows host.
- Playwright — 3/3 committed smoke tests pass, including authenticated catalog creation and stock receipt.

## Follow-up and external validation

- Run authenticated Playwright journeys using maintained fictional demo accounts.
- Conduct the representative-user usability evaluation; measured improvement cannot be claimed before it occurs.
- Add private incident evidence uploads if the school confirms attachment and retention policy.
- Configure hosted Auth and environment settings before linking a remote project.
- Add a dedicated two-session harness for competing last-unit issues. Row locks and negative-balance constraints are implemented and transactional tests pass.

## Decisions

- Property Custodian and Science Laboratory requirements are interview-based. Hospitality Management Laboratory uses the Science Laboratory's general equipment inventory and borrowing workflow only as a provisional prototype assumption, with separate office records and permissions.
- Science Laboratory student borrowing must not bypass teacher approval. The prototype's single authorized approval step remains a documented limitation until the separate teacher stage is confirmed and implemented.

- One approval step is used until office interviews establish different workflows.
- Public registration remains disabled; administrators provision and activate accounts.
- No service-role key is used by application code.
- PostgreSQL 17 remains the approved local baseline.
- No dependency, provider, authentication model, or architecture change was introduced.
