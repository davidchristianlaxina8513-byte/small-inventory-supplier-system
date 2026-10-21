# SISS Architecture

Companion to the generated starter docs in `docs/architecture/` (they describe the starter; this file describes the SISS target and how the starter evolves into it). Specification: `SISS_OpenCode_Full_Project_Plan.md` §10.

## Stack (verified installed versions, 2026-10-21)

- Next.js 16.3.4 (App Router, Turbopack), React 19.2.8, TypeScript 6.0.3 (strict)
- Tailwind CSS 4.3.3 (`@tailwindcss/postcss`), CVA + clsx + tailwind-merge for components
- Supabase: `@supabase/supabase-js` 2.114.0, `@supabase/ssr` 0.12.5, `supabase` CLI 2.116.0 (PostgreSQL 16)
- Testing: Vitest 4.1.11 + Testing Library + jsdom; Playwright 1.62.1; `supabase test db` for RLS SQL tests
- Node >= 22.14.0 (profile runtime 24.20.0), npm >= 11.19.0

## Current starter state (what exists and is preserved)

```text
src/
  app/                 layout.tsx, page.tsx (starter hero), api/health/route.ts, globals.css
  components/
    common/            Button.tsx (+ test)
    layout/            Container.tsx, Section.tsx
  features/status/     StarterStatus feature slice (to be replaced once dashboards exist)
  lib/
    supabase/          client.ts (browser), server.ts (RSC/server actions) — keep
    cn.ts              class helper — keep
  test/setup.ts        vitest setup — keep
supabase/
  config.toml          local stack (api 54321, db 54322, studio 54323)
  migrations/00000000000000_create_examples.sql   fail-closed placeholder — keep until real migrations supersede it
  tests/examples_rls.test.sql                     RLS test example — keep as pattern
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

- Auth: Supabase Auth sessions via `@supabase/ssr` cookie pattern (browser client, server client). A middleware/proxy for session refresh and route protection must be added in Phase 1 (not present in the starter).
- Authorization: server-side checks in actions/route handlers **and** PostgreSQL RLS on every exposed table (fail-closed). Never trust role/user/office IDs from the browser. No self-promotion.
- Secrets: only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (from `.env.example`). A service-role key, if ever required, stays server-only with no public prefix.
- Inventory: balances and movements are writable only through transactional PostgreSQL functions (row locking, no negative stock, atomic movement insert). Browser writes denied.
- Audit: append-only `audit_logs`; private attachments stored with authorized downloads only.

## Data model and integrity

Logical schema is specified in plan §8.1 (offices, profiles, user_roles, categories, items, locations, inventory_balances, assets, stock_movements, requests, request_items, approvals, reservations, loans, loan_items, incident_reports, suppliers, purchase_requests/items, purchase_orders/items, goods_receipts/items, notifications, audit_logs).

Implementation rules: UUID PKs; FKs and check constraints; `numeric` for money; `timestamptz` for times; database-generated reference numbers; cross-office relationships impossible by constraint; transactions for balance+movement pairs; accepted ≤ received; no overlapping reservations; soft deactivation for catalog records with history; indexes on owner/status/date, office/status/date, item code, movement item/date.

Schema lands in **small migrations per phase**, with `npm run supabase:types` regenerating `src/types/database.types.ts` after each change. No mega-migration.

## Known environment caveats

- **Vitest pool:** the default threads pool fails on this Windows machine ("Timeout waiting for worker to respond"); `npm test -- --pool=forks` passes (2/2). Proposed fix (pending approval, Q4): set `pool: 'forks'` in `vitest.config.ts`.
- **No lockfile was committed** by the generator; `npm install` created one. Commit before enabling CI (`npm ci`).
- **No Supabase env yet:** without `.env.local`, the Supabase clients cannot connect. Phase 1 needs a local (`supabase start`) or hosted project (Q2).
- The starter home page and `features/status` are placeholders; replace only when the real login/dashboard exists (Starter Transition rule).
