# Assumptions and Decisions

Source of truth: `SISS_OpenCode_Full_Project_Plan.md` (the main specification).
Update this file as office interviews and user feedback clarify requirements.

## Confirmed project decisions

- Academic prototype named Small Inventory and Supplier System (SISS).
- Stack: Next.js App Router, TypeScript, Supabase (PostgreSQL + Auth + Storage), Tailwind CSS. The generated repository already matches this stack.
- Three participating offices: Property Custodian Office, Hospitality Management Lab Office, Science Laboratory Office.
- Target users: students, teachers, non-teaching personnel, office staff, office heads/approvers, system administrators.
- In scope: authentication, RBAC, inventory catalog, stock ledger, requests/approvals, borrowing/returns, reservations, damage/loss reports, suppliers, purchasing/receiving, reports, notifications, audit logs.
- MVP order (plan §4.3): auth → catalog → stock ledger → requests → loans/returns → incidents → reports → purchasing → notifications.
- Supplier management is in scope but implemented after core inventory and request workflows.
- Payment processing, accounting, SIS integration, native mobile apps, and barcode hardware are out of scope (plan §4.2).

## Assumptions to validate (not confirmed findings)

- Some offices keep records manually on paper or in spreadsheets; exact workflows and pain points need validation per office.
- Staff may need a quicker way to check stock and equipment availability.
- Offices may have different approval workflows.
- The school may require overdue-loan reminders and low-stock alerts.
- Purchasing may involve external suppliers and designated approvers.
- Users have access to internet-connected devices.
- The school may require school-email registration or manual account approval.

## Phase 0 repository findings (2026-10-21)

- The repository is a freshly generated `create-win-project` starter (stack `nextjs-supabase`, medium architecture profile), not an empty directory. No SISS business logic exists yet.
- Verified baseline: `npm install` OK; `npm run lint` OK; `npm run typecheck` OK; `npm run build` OK; unit tests pass with `--pool=forks` (2/2). See `docs/architecture.md` for the vitest pool caveat.
- Supabase wiring exists (browser + server clients via `@supabase/ssr`) but no `.env.local` has been created and no Supabase project (local or hosted) has been configured.
- The only migration (`00000000000000_create_examples.sql`) is a fail-closed placeholder with no policies; it is not part of the SISS domain model.

## Decisions made

| #   | Decision                                                                                                                                                                                             | Rationale                                                                                                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Treat `SISS_OpenCode_Full_Project_Plan.md` as the main specification.                                                                                                                                | User instruction, Phase 0.                                                                                                                                                                                 |
| D2  | Preserve the generated starter infrastructure (Supabase clients, components, tests, Docker, CI, playbooks, governance docs). Replace starter behavior only when its real product replacement exists. | Plan §1 rule 2 and Starter Transition playbook.                                                                                                                                                            |
| D3  | Keep the existing env var names `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.                                                                                               | Matches installed `@supabase/ssr` 0.12.5 convention; plan §17 permits the publishable-key name. Never commit secrets; service-role key (if ever needed) stays server-only without a `NEXT_PUBLIC_` prefix. |
| D4  | No public registration until the school's account policy is confirmed. Phase 1 default: admin-created (invite-only) accounts with `pending/active/suspended` status.                                 | Plan §6.1; safe default pending confirmation.                                                                                                                                                              |
| D5  | Roles are modeled as a `user_roles` table with an `app_role` enum; role changes are admin-only and server-validated. Users may hold multiple roles.                                                  | Plan §5.1 and §8.1.                                                                                                                                                                                        |
| D6  | Inventory integrity: stock movements are append-only history; balances change only through transactional PostgreSQL functions with row locking; negative stock is prevented.                         | Plan §9.                                                                                                                                                                                                   |
| D7  | Request state machine and permitted transitions live in one shared server-side business-logic layer, with critical transitions enforced in database functions.                                       | Plan §7.1, §13.                                                                                                                                                                                            |
| D8  | Database schema is implemented incrementally in small migrations with generated TypeScript types after each schema change. No single unreviewed mega-migration.                                      | Plan §8.3, §1.12.                                                                                                                                                                                          |
| D9  | Fictional, clearly labeled seed data only; never invent real school, user, or supplier records.                                                                                                      | Plan §1.6, §15.                                                                                                                                                                                            |
| D10 | Local `supabase/config.toml` uses `db.major_version = 17` (not 16).                                                                                                                                  | Supabase CLI 2.121.0 accepts 13/14/15/17; Supabase requires this value to match any linked remote's `SHOW server_version`. The plan pins no version. Approved by the user; runtime verified as PostgreSQL 17.11. Remote parity remains unverified. See `CONTEXT.md` Approved Deviations. |
| D11 | Phase 1 uses Supabase email/password auth with no public registration. Admin-created accounts start `pending`; active accounts pass the proxy and server-side status gate; pending/suspended users only see `/account-status`. | Plan §6.1 permits invite-only or approval-based accounts. Avoids exposing registration before the school confirms policy (Q1). |
| D12 | Server actions validate untrusted input explicitly (email/password, UUIDs, role/status enums, office scope) instead of adding `zod` in Phase 1. | Q3 is still open; a small explicit validation layer covers Phase 1 without a new dependency. Revisit when schemas grow in Phase 2+. |

## Open questions (block or shape Phase 1+)

| #   | Question                                                                                                                                        | Impact                                                                              | Proposed default                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Account policy: invite-only/admin-created vs public registration with approval?                                                                 | Auth flow in Phase 1 (plan says confirm before enabling public registration).       | Admin-created accounts (D4).                                                                                                 |
| Q2  | Supabase environment: local `supabase start` (Docker required) or a hosted Supabase project?                                                    | Needed before any Phase 1 database/auth testing.                                    | Ask the user; local CLI is already configured in the repo.                                                                   |
| Q3  | Approve adding `zod` as a dependency for server-side input validation?                                                                          | Required by plan §1/§13 ("validate inputs on the server"); not currently installed. | Add `zod` in Phase 1 (smallest coherent validation layer per existing playbook).                                             |
| Q4  | Approve changing `vitest.config.ts` to `pool: 'forks'`?                                                                                         | Default threads pool times out on this Windows machine; forks passes reliably.      | Apply the one-line config change in Phase 1.                                                                                 |
| Q5  | Office-specific approval workflows: do the three offices genuinely differ, or is one shared default approval flow acceptable for the prototype? | Shapes Phase 3 approvals.                                                           | Implement one configurable shared flow (staff review → approve/partial/reject/clarify) until interviews confirm differences. |
| Q6  | If a hosted Supabase project is used (Q2), which PostgreSQL major version does it run?                                                          | `db.major_version` must match the linked remote; a mismatch breaks local/remote parity. | Keep 17 locally for now; run `SHOW server_version` on the remote and update config/docs with approval before linking.       |

Resolved for Phase 1: Q2 uses the local Supabase stack (CLI 2.121.0, PostgreSQL 17.11, ports 54331–54337 after the user-approved reassignment). Q4 did not need a config change because the default Vitest pool passed the Phase 1 suite. Q3 remains open; D12 records the interim manual-validation approach. Q1 uses the D4/D11 safe default until the school confirms its account policy; as of 2026-10-22, local public signup is disabled and the hosted setting remains pending a hosted project.
