# CONTEXT.md

## Project

**Name:** smallinventoryandsuppliersystem
**Description:** Small Inventory and Supplier System (SISS) — centralized web system for three school offices to manage inventory, requests, borrowing/returns, reservations, damage/loss reports, and supplier/purchasing records.
**Stack:** nextjs-supabase
**Styling:** TAILWIND
**Compatibility profile:** 2026.10
**Year:** 2026
**Product status:** active
**Main specification:** `SISS_OpenCode_Full_Project_Plan.md` (see also `docs/assumptions-and-decisions.md`, `docs/requirements.md`, `docs/workflows.md`, `docs/architecture.md`, `docs/testing-plan.md`)

## Product Goals

- Digitize inventory records for the Property Custodian Office, Hospitality Management Lab Office, and Science Laboratory Office in one application.
- Let authorized school users submit requests and track their status.
- Support review, approval, issuance, borrowing, reservations, and returns with a traceable inventory movement history.
- Record damaged/missing items and their resolution without erasing history.
- Maintain supplier, purchase request, purchase order, and delivery receiving records.
- Provide role-scoped dashboards, reports, and audit logs with RLS-enforced access boundaries.

## Users

Students, teachers, non-teaching personnel, office staff, office heads/approvers, and system administrators (roles: `student`, `teacher`, `non_teaching`, `office_staff`, `office_head`, `admin`; office-scoped roles carry an office assignment).

## Core Workflows

Request submission → staff review/approval (never implies fulfillment) → fulfillment: consumable issue (atomic stock deduction of actual issued quantity), equipment loan/return (condition + due dates + overdue flags), reservation (conflict-free time blocking), or purchase → receiving adds stock by accepted quantity only → reports/notifications/audit. See `docs/workflows.md`.

## Acceptance Criteria

MVP (plan §18): authentication works with role/office boundaries; three offices exist in the database; staff manage items; serialized vs quantity stock handled differently; balances and movements stay consistent; users submit and track requests; staff record decisions; consumable issuance is atomic; loans/returns traceable; damage/missing reports work; key actions audited; dashboards/reports show real data; critical functional/authorization/concurrency tests pass; setup and limitations documented. Full list in `docs/requirements.md`.

## Out of Scope

Accounting/payroll, supplier payment processing, automated payment/purchasing, SIS integration, native mobile app, predictive analytics, barcode hardware, automated chemical safety/regulatory decisions. (Plan §4.2.)

## Generated Baseline

<!-- These values were selected during generation. Deviations require explicit approval. -->

- Architecture profile: medium
- Production baseline: generated default; deviations require approval.
- Authentication: not-yet (SISS plan selects Supabase Auth; Phase 1 implements it — see Product Decisions)
- Uploads: object-storage
- Background jobs: none
- Offline behavior: none

## Product Decisions

- 2026-10-21: `SISS_OpenCode_Full_Project_Plan.md` is the main specification (user instruction). See D1–D9 in `docs/assumptions-and-decisions.md`.
- Preserve all generated starter infrastructure; replace starter behavior only when its real replacement exists.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (existing names kept); secrets never committed.
- No public registration until the school's account policy is confirmed (default: admin-created accounts, `pending/active/suspended` status).
- Inventory integrity via transactional PostgreSQL functions with RLS; no client-side balance writes.
- MVP phase order per plan §16: foundation/auth → catalog → stock ledger + requests → loans/reservations/incidents → suppliers/procurement → reports → final validation.

## Approved Deviations

<!-- Record date, approver, rationale, affected files, and recovery path. -->

- (none yet — pending user approval on: vitest `pool: 'forks'` config change (Q4), adding `zod` (Q3))

## Notes

- Open questions Q1–Q5 (account policy, Supabase environment target, zod, vitest pool, per-office approval differences) are listed in `docs/assumptions-and-decisions.md`.
- Baseline verified healthy on 2026-10-21: install, lint, typecheck, build pass; unit tests pass with `--pool=forks`.

## Expected Concerns (advisory)

- validation
- query
- state
- env
- url-state
- safe-action
- dark-mode
