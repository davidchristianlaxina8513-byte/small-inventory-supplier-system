# SISS Architecture

Companion to the generated starter docs in `docs/architecture/` (they describe the starter; this file describes the SISS target and how the starter evolves into it). Specification: `SISS_OpenCode_Full_Project_Plan.md` §10.

## Stack (verified installed versions, 2026-10-21)

- Next.js 16.3.4 (App Router, Turbopack), React 19.2.8, TypeScript 6.0.3 (strict)
- Tailwind CSS 4.3.3 (`@tailwindcss/postcss`), CVA + clsx + tailwind-merge for components
- Supabase: `@supabase/supabase-js` 2.114.0, `@supabase/ssr` 0.12.5, `supabase` CLI 2.121.0; local PostgreSQL 17.11 (`db.major_version = 17`, approved deviation — see `CONTEXT.md`)
- Testing: Vitest 4.1.11 + Testing Library + jsdom; Playwright 1.62.1; pgTAP via `supabase test db`
- Node >= 22.14.0 (profile runtime 24.20.0), npm >= 11.19.0

## Current state after Phase 1 security hardening (2026-10-22)

```text
src/
  proxy.ts              Next 16 session refresh + unauthenticated redirects
  app/
    page.tsx            session-based redirect to login/dashboard/account-status
    login/              sign-in page
    account-status/     pending/suspended landing page
    (app)/              active-user layout; dashboard; admin/users
    api/health/         retained starter health route
  components/
    common/Button.tsx, layout/{Container,Section}.tsx
  features/
    auth/               actions, LoginForm, session services, status/redirect/role helpers + tests
    admin/              admin actions/services
  lib/supabase/         client.ts, server.ts, proxy.ts + proxy.test.ts (typed with generated Database)
  features/auth/services/session.test.ts   pending/suspended/admin guard tests
  types/database.types.ts   generated
  test/setup.ts         vitest cleanup + jest-dom
supabase/
  config.toml           local stack: api 54331, db 54332, studio 54333, PG 17; public signup disabled
  migrations/00000000000000_create_examples.sql   retained fail-closed example
  migrations/20261021120000_create_identity.sql   Phase 1 identity schema + RLS
  migrations/20261022120000_harden_account_provisioning.sql   auth email mirror + admin guardrails
  seed.sql              three fictional offices
  tests/examples_rls.test.sql, tests/identity_rls.test.sql
```

Also preserved: security headers in `next.config.ts`, Docker/Makefile/CI workflows, playbooks, governance docs (`AGENTS.md`, `RULES.md`, `CONTEXT.md`, `PROGRESS.md`).

## Target structure (adapted plan §10.1 to this repo's conventions)

```text
src/
  app/
    (auth)/login/page.tsx
    (dashboard)/dashboard|requests|inventory|reservations|borrowings|incidents|suppliers|purchasing|reports|admin/...
    api/...
  components/          common/ ui/ layout/ + feature-owned components
  features/            <feature>/{components,services,types}  — follow existing status feature pattern
  lib/
    supabase/          client.ts, server.ts, (+ middleware/proxy session refresh)
    auth/permissions.ts
    validations/       zod schemas per domain
    services/          server-side operations calling Supabase / RPCs
  types/               database.types.ts (generated), app.ts
supabase/migrations/   small, reviewed migrations + seed.sql (fictional data)
```

Rules: server components by default; client components only for browser behavior; mutations via server actions/route handlers; validation schemas outside UI; centralized permission checks; generated Supabase types; pagination for lists; loading/empty/error states everywhere.

## Security model

- Auth: Supabase Auth email/password via `@supabase/ssr` cookie pattern. Public signup is disabled in local config while the email provider remains enabled for sign-in. `src/proxy.ts` refreshes the session and redirects unauthenticated users; server components/actions re-check the user (`getUser`), account status, and roles. Accounts start `pending` and require administrator activation through the Admin API.
- Identity: `profiles.email` mirrors `auth.users.email` via database triggers, including email changes, and is backfilled for existing profiles. The value comes from Auth, never from `raw_user_meta_data`; RLS allows the owner or an admin to read it, and column privileges prevent authenticated users from writing it.
- Authorization: server-side checks in layouts/actions (`requireActiveUser`, `requireAdmin`) **and** PostgreSQL RLS on every exposed table (fail-closed). Never trust role/user/office IDs from the browser. No self-promotion; suspended administrators lose administrator authority. Database triggers block self-suspension and self/last-active-admin role removal, with an advisory lock for concurrent admin-role changes. `has_role()` also requires an active profile.
- Secrets: only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (from `.env.example`). A service-role key, if ever required, stays server-only with no public prefix. The admin email solution requires no service-role key in application code.
- Inventory: balances and movements are writable only through transactional PostgreSQL functions (row locking, no negative stock, atomic movement insert). Browser writes denied.
- Audit: append-only `audit_logs`; private attachments stored with authorized downloads only.

## Data model and integrity

Logical schema is specified in plan §8.1 (offices, profiles, user_roles, categories, items, locations, inventory_balances, assets, stock_movements, requests, request_items, approvals, reservations, loans, loan_items, incident_reports, suppliers, purchase_requests/items, purchase_orders/items, goods_receipts/items, notifications, audit_logs).

Implementation rules: UUID PKs; FKs and check constraints; `numeric` for money; `timestamptz` for times; database-generated reference numbers; cross-office relationships impossible by constraint; transactions for balance+movement pairs; accepted ≤ received; no overlapping reservations; soft deactivation for catalog records with history; indexes on owner/status/date, office/status/date, item code, movement item/date.

Schema lands in **small migrations per phase**, with `npm run supabase:types` regenerating `src/types/database.types.ts` after each change. No mega-migration.

## Known environment caveats

- **Disk space:** the C: drive was nearly full during Phase 1 validation. Docker's VHDX and browser caches consume most space. Free space before large builds or Docker pruning; Docker Desktop may need a restart if its engine hangs under disk pressure.
- **Vitest pool:** the default pool passed the Phase 1 suite (22 tests). `--pool=forks` remains available if worker timeouts return on this machine; the Q4 config change was not applied.
- **Local env:** `.env.local` points at the local Supabase stack (`127.0.0.1:54331`) and is gitignored. No hosted project is linked; hosted Auth signup settings remain unconfigured. Demo accounts are created manually via the Supabase Admin API; `npm run supabase:reset` removes them.
- **Ports:** API 54331, DB 54332, shadow 54330, pooler 54339, studio 54333, analytics 54337 — chosen to avoid the other local Supabase project.
- **Remote parity:** `db.major_version = 17` must be checked against any future hosted project (`SHOW server_version`) before linking.
- The starter `examples` table/test is retained as a fail-closed RLS pattern; it is not part of the SISS domain model.
