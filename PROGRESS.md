# PROGRESS.md

## Status

🟢 Phase 1 security-review fixes implemented and validated locally — awaiting final review. Phase 2 has not started.

---

## Completed

### Phase 1 — Project foundation and authentication (2026-10-21)

- Supabase local stack: CLI 2.121.0, PostgreSQL 17.11, API on `127.0.0.1:54331`, DB on `127.0.0.1:54332` (ports reassigned with user approval to avoid the other local Supabase project).
- Migration `20261021120000_create_identity.sql`: `app_role` and `account_status` enums; `offices`, `profiles`, `user_roles`; updated-at trigger; auth-user profile trigger; `is_admin()`, `is_active_user()`, `has_role()` helpers.
- Migration `20261022120000_harden_account_provisioning.sql`: trusted `profiles.email` mirror from `auth.users` (insert + email-change triggers and backfill); email excluded from authenticated updates; active-aware `has_role()`; DB triggers blocking self-status changes and self/last-active-admin role removal; advisory lock for concurrent admin-role removal.
- Fail-closed RLS on all identity tables: users read only their own profile/roles, active users read offices, admins manage accounts/roles, anonymous users have no table access, suspended admins lose administrator authority, office-scoped roles require an office.
- Local Auth public signup disabled in `supabase/config.toml`; `/auth/v1/settings` reports `disable_signup: true`; email/password login remains enabled.
- `supabase/seed.sql`: the three fictional offices from the plan.
- Next 16 `src/proxy.ts` session refresh plus unauthenticated redirects; login, account-status, dashboard, and admin-user pages; sign-in/sign-out server actions; pending/suspended accounts gated server-side. Authenticated `/login` requests now reach the page, which resolves profile state without a missing-profile redirect loop.
- Admin user administration: activate/suspend accounts, assign/remove roles, show trusted Auth email, prevent self-status changes and self/last-admin role removal in application actions and database triggers.
- Generated `src/types/database.types.ts` and typed Supabase browser/server clients.
- Tests: 22 Vitest unit/component tests; 35 pgTAP database/RLS assertions (`supabase test db`); non-destructive authenticated Playwright smoke run verified admin email visibility, student admin-route denial, pending status gating, and authenticated login routing. The smoke spec was temporary and not committed because it depends on local demo accounts.
- Validation: lint, typecheck, unit tests, pgTAP, Playwright, and production build all pass.

### Phase 0 — Repository inspection and plan (2026-10-21)

- Inspected the full repository: it is a generated `create-win-project` starter (Next.js 16.3.4 + Supabase + Tailwind 4), not an empty project. No SISS business logic existed.
- Confirmed versions, scripts, dependencies, Supabase clients (`src/lib/supabase/{client,server}.ts`), placeholder migration, and governance docs. All starter work preserved; nothing deleted.
- Verified baseline health: `npm install` OK; lint OK; typecheck OK; build OK; unit tests 2/2 with `--pool=forks` (default vitest pool times out on this Windows machine — documented, fix proposed as Q4).
- Reconciled the SISS plan against the repo (gaps, contradictions, and env caveats documented).
- Created: `docs/assumptions-and-decisions.md`, `docs/requirements.md`, `docs/workflows.md`, `docs/architecture.md`, `docs/testing-plan.md`.
- Updated: `CONTEXT.md` (product truth recorded, status → active), this file.

## In Progress

- Nothing. Phase 1 security-review fixes are complete and validated locally; waiting for final review. Phase 2 has not started.

## Up Next (only after Phase 1 review)

### Phase 2 — Inventory catalog

1. Add categories, items, locations, and asset registration with office boundaries.
2. Separate serialized assets from quantity stock; add search and filters.
3. Implement inventory display and safe initial stock receipt/adjustment operations.
4. Add catalog migrations, generated types, RLS tests, and component/unit tests.
5. Run lint, typecheck, tests, and build; report before Phase 3.

## Completed checklist detail — Phase 1

1. [x] Local Supabase selected and configured; `.env.local` created from `.env.example` (gitignored).
2. [x] Session refresh/protected routes via Next 16 proxy; `/login`, sign-in, sign-out.
3. [x] Identity migration, RLS, helper functions, and three-office seed.
4. [x] Account status gate server-side; admin-only role assignment; no self-promotion.
5. [x] Admin users page; starter home replaced by login/dashboard routing.
6. [x] TypeScript database types generated. `zod` (Q3) not added; manual server-side validation used. Vitest default pool passed, so Q4 config change not applied.
7. [x] Unit tests for auth helpers/form + pgTAP RLS checks.
8. [x] Results reported; Phase 2 not started.

## Blocked

- No functional blockers. Q1's safe default (admin-created accounts, no public registration) is now enforced locally; any hosted Auth project still needs the same setting applied explicitly.
- Environment risk: the C: drive remains nearly full (about 0.4 GB free after validation); generated caches were cleared and Docker was restarted, but free space before the next large build or browser run.

## Decisions Made

- The SISS plan (`SISS_OpenCode_Full_Project_Plan.md`) is the main specification.
- All generated starter infrastructure is preserved; starter behavior was replaced only where real Phase 1 behavior now exists (`page.tsx`, `page.test.tsx`, `features/status`).
- No public registration. Local Auth signup is disabled; accounts are created by an administrator through the Supabase Admin API; the app gates pending/suspended accounts.
- Authorization is enforced twice: server-side `requireActiveUser`/`requireAdmin` checks and PostgreSQL RLS/security-definer helpers.
- Admin identity verification uses the Auth email mirrored into `profiles.email`, never user-editable metadata. The email is readable by the owner or admins and is not writable through the authenticated API.
- 2026-10-21: PostgreSQL 17 deviation recorded (runtime verified 17.11); no silent database version changes.
- 2026-10-21: Phase 1 reviewed; Phase 2 must not start until the security-review concerns are fixed. The 2026-10-22 hardening follow-up is complete locally; review pending.
