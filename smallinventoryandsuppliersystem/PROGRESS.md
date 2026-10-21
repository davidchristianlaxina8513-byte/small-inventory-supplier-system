# PROGRESS.md

## Status

🟡 Phase 0 complete — awaiting approval to start Phase 1

---

## Completed

### Phase 0 — Repository inspection and plan (2026-10-21)

- Inspected the full repository: it is a generated `create-win-project` starter (Next.js 16.3.4 + Supabase + Tailwind 4), not an empty project. No SISS business logic existed.
- Confirmed versions, scripts, dependencies, Supabase clients (`src/lib/supabase/{client,server}.ts`), placeholder migration, and governance docs. All starter work preserved; nothing deleted.
- Verified baseline health: `npm install` OK; lint OK; typecheck OK; build OK; unit tests 2/2 with `--pool=forks` (default vitest pool times out on this Windows machine — documented, fix proposed as Q4).
- Reconciled the SISS plan against the repo (gaps, contradictions, and env caveats documented).
- Created: `docs/assumptions-and-decisions.md`, `docs/requirements.md`, `docs/workflows.md`, `docs/architecture.md`, `docs/testing-plan.md`.
- Updated: `CONTEXT.md` (product truth recorded, status → active), this file.

## In Progress

<!-- Current work -->

## Up Next (awaiting user approval)

### Phase 1 — Project foundation and authentication (smallest safe slice)

1. Decide Q2: local `supabase start` vs hosted Supabase project; create `.env.local` from `.env.example`.
2. Add session-refresh/protected-routes middleware (or Next 16 proxy) + `/login` page with Supabase Auth sign-in/sign-out.
3. Migration: `app_role` enum, `offices`, `profiles`, `user_roles` tables + RLS (fail-closed, admin-managed roles) + helper functions; seed the three offices (fictional data only).
4. Account status gate (`pending`/`suspended` denied server-side); admin-only role assignment; no self-promotion.
5. Minimal admin users page; replace starter home behavior with real login/dashboard flow (only after replacement exists).
6. With approval: add `zod` (Q3) and set vitest `pool: 'forks'` (Q4); generate `src/types/database.types.ts`.
7. Tests: unit tests for auth gating + `supabase test db` RLS checks (student cannot promote self; office isolation).
8. Report results before Phase 2 (catalog).

## Blocked

- Q1: account policy (invite-only vs public registration) — default admin-created accounts assumed for Phase 1.
- Q2: Supabase environment target (local CLI needs Docker; or hosted project keys) — blocks any DB/auth testing.

## Decisions Made

- The SISS plan (`SISS_OpenCode_Full_Project_Plan.md`) is the main specification.
- All generated starter infrastructure is preserved; starter tests remain until real product tests replace them.
- No destructive changes were made in Phase 0 (only additive docs + CONTEXT/PROGRESS updates; `npm install` created the lockfile).
