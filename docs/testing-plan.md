# Testing Plan

Source: `SISS_OpenCode_Full_Project_Plan.md` §14. Layers: unit/component (Vitest + Testing Library), database/RLS (`supabase test db`), end-to-end (Playwright), plus documented manual acceptance and usability checks.

Status: `[ ]` not started, `[~]` partial, `[x]` passed.

## Baseline and Phase 1 (verified 2026-10-22)

- [x] `npm run lint` — pass
- [x] `npm run typecheck` — pass
- [x] `npm run build` — pass
- [x] `npm test` — 22/22 Phase 1 unit/component tests pass (default pool)
- [x] `npm run supabase:test` — 35/35 pgTAP assertions pass (identity RLS + retained example)
- [x] `npm run test:e2e` — 2/2 committed unauthenticated redirect/health tests pass
- [x] Non-destructive authenticated Playwright smoke run (local demo accounts) — admin email visibility, student admin-route denial, pending status gating, and authenticated login routing pass; not committed because it depends on local seeded accounts.
- [ ] Docker/disk environment permanently healthy — the C: drive remains nearly full; generated caches were cleared and Docker was restarted.

## 1. Functional tests

- [x] AUTH-01 Active user can sign in; sign-out clears the session.
- [x] AUTH-03 Suspended/pending user cannot access protected functionality.
- [x] AUTH-04 Admin can activate an account and assign a role; admin routes are denied to non-admins.
- [ ] REQ-01 Eligible user submits a valid request; receives a reference number.
- [ ] REQ-02 Invalid/incomplete request is rejected with useful feedback.
- [ ] REQ-04 Authorized office staff can review their office's requests.
- [ ] Unauthorized user cannot approve a request.
- [ ] REQ-05 Actual issued quantity (not requested) is deducted.
- [ ] LOAN-01 Return records the correct asset and condition.
- [ ] LOAN-03 Damaged asset does not become available automatically.
- [ ] STK-03 Low-stock alert appears at the configured threshold.
- [ ] SUP-01 / PUR-01 Authorized users can create suppliers and purchase requests.
- [ ] PUR-03/PUR-04 Accepted delivery quantity is recorded; stock increases only by accepted amount.
- [ ] RPT-01/02 Reports respect office and user permissions.
- [ ] AUD-01 Significant actions appear in audit history.

## 2. Security tests

- [ ] SEC-01 Student cannot edit inventory.
- [ ] SEC-04 User cannot read another user's private request.
- [ ] SEC-03 Office A staff cannot modify Office B data (SQL-level test).
- [x] SEC-01/04 User cannot grant themselves a privileged role (pgTAP: RLS denies self-promotion).
- [x] SEC-08 Suspended administrator loses administrator authority and cannot assign roles (pgTAP); `has_role()` also returns false for suspended accounts.
- [x] SEC-07 Anonymous role has no table access; service credentials are not in `NEXT_PUBLIC_*` variables.
- [x] SEC-09 Public signup is disabled locally (`/auth/v1/settings` reports `disable_signup: true`) while email/password login remains enabled.
- [x] SEC-10 Admin can read the Auth email mirrored into `profiles.email`; a student cannot read another user's email and cannot update email through the profile API (pgTAP).
- [x] SEC-11 Database rejects self-suspension and self/last-active-admin role removal; a second active admin can still remove another admin (pgTAP).
- [x] SEC-12 Pending/suspended guards and admin-route denial are covered by Vitest session tests and a non-destructive authenticated Playwright smoke run.
- [ ] SEC-05 Browser cannot write directly to balances or movement ledger.
- [ ] Private attachments cannot be downloaded by unauthorized users.
- [ ] SEC-06 Audit records cannot be silently changed by ordinary users.

## 3. Concurrency and integrity tests (SQL / transactional)

- [ ] STK-02 Two requests competing for the last units cannot over-issue.
- [ ] Concurrent issues cannot produce a negative balance.
- [ ] Duplicate submission/retry does not issue stock twice.
- [ ] RESV-02 Two users cannot reserve the same asset for overlapping periods.
- [ ] Failed transaction rolls back all related changes.
- [ ] PUR-04 Partial delivery changes inventory only by accepted quantity.
- [ ] Transfer movements update both locations consistently.

## 4. Usability evaluation (manual, representative users)

Tasks: find an item; submit a request; check request status; approve a request (if authorized); record a release and return; report a damaged item; locate a stock/transaction report.

Collect task completion, observed difficulties, and feedback. Compare with the current paper/spreadsheet process where possible. Do not claim measured improvement before conducting the evaluation (plan §14.4).

## 5. Starter test migration

- `src/app/page.test.tsx` and `e2e/home.spec.ts` were replaced because the starter hero no longer exists: the root now routes by session, and E2E asserts the unauthenticated redirect to `/login`.
- `features/status` and its starter status service/component were removed after the real dashboard replaced them.
- `Button.test.tsx` and `examples_rls.test.sql` are retained; the examples test remains a fail-closed RLS pattern.
- Never delete or weaken tests merely to make validation pass.

## 6. Final validation gate (Phase 7)

`npm run check` (format:check + lint + typecheck + unit tests), `npm run build`, `npm run test:e2e`, and `npm run supabase:test` all green, or exact blockers reported. Note: the repository-wide `format:check` currently flags pre-existing docs/playbooks and starter files; Phase 1 source files were formatted with Prettier individually.
