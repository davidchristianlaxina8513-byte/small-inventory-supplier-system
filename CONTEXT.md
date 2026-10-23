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
- Authentication: Supabase Auth (email/password) with Next.js proxy session refresh — implemented in Phase 1
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

- 2026-10-21 — **Local PostgreSQL 17 deviation (approved by user during the Phase 1 pause):**
  `supabase/config.toml` sets `db.major_version = 17`. The generated baseline docs referenced
  PostgreSQL 16 and the SISS plan does not pin a database version. Runtime verification: local
  Supabase (CLI 2.121.0) reports PostgreSQL 17.11; the CLI accepts `db.major_version` 13, 14, 15,
  and 17. Supabase requires this value to match any linked remote project's `SHOW server_version`;
  no remote is linked or verified. Affected files: `supabase/config.toml`, `docs/architecture.md`.
  Recovery path: do not change the version silently; verify the target database version and obtain
  explicit approval before linking a remote or changing the major version.
- Not adopted in Phase 1: adding `zod` (Q3) and changing the Vitest pool (Q4). Server actions use
  explicit validation; the default Vitest pool passed the Phase 1 suite. Both remain optional
  improvements if the user approves them.

## Notes

- 2026-10-23: Final Performance Task delivery is narrowed to a reliable two-day MVP demonstration using the existing architecture. Property Custodian and Science Laboratory findings are interview-based. Hospitality Management Laboratory was not interviewed; its prototype temporarily uses the Science Laboratory's general equipment inventory and borrowing workflow while retaining separate office data and permissions. This assumption must not be described as interview-confirmed. Science student borrowing requires teacher approval according to the interview, while the current prototype implements one authorized approval step; the separate teacher stage remains a documented limitation pending confirmation.

- Open questions Q1–Q5 (account policy, Supabase environment target, zod, vitest pool, per-office approval differences) are listed in `docs/assumptions-and-decisions.md`. Q2 is resolved to local Supabase for now. Q1's safe default is now enforced locally: no public registration, admin-created accounts with approval; hosted Auth settings still require explicit configuration when a project exists.
- 2026-10-21: Phase 1 is implemented and tested against local Supabase (PostgreSQL 17.11): identity migration + three-office seed, fail-closed RLS, Next 16 proxy session refresh, login/account-status/dashboard/admin-users flows, and server-side role/status updates. Awaiting user review before Phase 2.
- 2026-10-22: Phase 1 security-review fixes applied. Local Auth signup is disabled (`[auth] enable_signup = false`; `/auth/v1/settings` reports `disable_signup: true` while email login remains enabled). `profiles.email` mirrors `auth.users.email` through triggers; admins can read it via RLS, but authenticated users cannot update it. `has_role()` now requires an active profile, and database triggers block self-suspension and self/last-active-admin role removal. Hosted Auth settings remain unchanged because no hosted project is configured.
- 2026-10-22: Phase 2A inventory foundation implemented locally. `categories`, `locations`, `items`, `inventory_balances`, and append-only `stock_movements` use fail-closed RLS; all stock changes flow through the locked, transactional `record_stock_movement` RPC. Admins manage all offices; `office_staff`/`office_head` manage only assigned offices; adjustments are limited to office heads/admins; movement reasons are mandatory. `serialized_asset` is a label only in this milestone. Asset registration, transfers, requests, suppliers, and reporting remain deferred. Validation passed locally (44 Vitest, 105 pgTAP, lint, typecheck, build); review pending.
- 2026-10-22: The user authorized the remaining plan. The operational MVP now includes assets, transfers, requests/approvals/issuance, reservations, loans/returns, incidents, procurement/receiving, notifications, audits, dashboards, reports, and office administration. One approval step remains the prototype default. Private incident uploads, scheduled notifications, representative-user evaluation, and a dedicated two-session issue-race harness remain follow-up work.
- Local demo accounts are created manually through the Supabase Admin API (no in-app registration). The database reset command removes them.
- Local environment risk: disk space was exhausted during validation and recovered by clearing caches; Docker Desktop required one restart and the existing Supabase containers restarted with it. Free disk space before running builds, browser tests, or Docker pruning.

## Expected Concerns (advisory)

- validation
- query
- state
- env
- url-state
- safe-action
- dark-mode
