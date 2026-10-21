# Testing Plan

Source: `SISS_OpenCode_Full_Project_Plan.md` §14. Layers: unit/component (Vitest + Testing Library), database/RLS (`supabase test db`), end-to-end (Playwright), plus documented manual acceptance and usability checks.

Status: `[ ]` not started, `[~]` partial, `[x]` passed.

## Baseline (verified 2026-10-21)

- [x] `npm run lint` — pass
- [x] `npm run typecheck` — pass
- [x] `npm run build` — pass
- [x] `npm test -- --pool=forks` — 2/2 starter tests pass (default pool times out on this machine; see `docs/architecture.md` caveats)
- [ ] Supabase local stack / RLS tests — blocked on env setup (Q2)

## 1. Functional tests

- [ ] AUTH-01 Active user can sign in; sign-out clears the session.
- [ ] AUTH-03 Suspended/pending user cannot access protected functionality.
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
- [ ] SEC-01/04 User cannot grant themselves a privileged role.
- [ ] SEC-05 Browser cannot write directly to balances or movement ledger.
- [ ] SEC-07 Service-role credentials absent from client bundles.
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

Starter assertions (`page.test.tsx`, `Button.test.tsx`, `e2e/home.spec.ts`, `examples_rls.test.sql`) stay until their real product replacement exists; then they are replaced with product-behavior tests. Never delete or weaken tests merely to make validation pass.

## 6. Final validation gate (Phase 7)

`npm run check` (format:check + lint + typecheck + unit tests) and `npm run build` and `npm run test:e2e` and `npm run supabase:test` all green, or exact blockers reported.
