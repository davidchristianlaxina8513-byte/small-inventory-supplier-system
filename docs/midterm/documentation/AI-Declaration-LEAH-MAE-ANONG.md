<!-- prettier-ignore-file -->

# IT305 Individual AI Declaration Form

## A. Student and team details

| Field | Information |
|---|---|
| Student full name | LEAH MAE ANONG |
| Student number | |
| Course and section | IT 305 |
| Team name/number | COFFEE CODERS |
| Project | Small Inventory and Supplier System (SISS) |
| Instructor | |
| Declaration date | October 24, 2026 |

## B. AI use level

- [ ] Level 0 — No AI assistance used
- [ ] Level 1 — AI used for explanation, brainstorming, or proofreading
- [x] Level 2 — AI suggested code/documentation that the student reviewed and modified
- [x] Level 3 — AI generated substantial code/documentation under student direction and verification
- [ ] Other instructor-defined level: ______________________________

## C. Tools actually used

- [x] OpenCode / Antigravity
- [ ] Codex
- [x] ChatGPT
- [ ] Other: ______________________________
- [ ] No AI tool used

## D. AI usage log

| Actual date | Tool | Prompt/task summary | Affected files or feature | Decision: accepted, modified, or rejected | Student verification performed | Real commit hash | Dated evidence path under `/ai-evidence` |
|---|---|---|---|---|---|---|---|
| 2026-10-24 | OpenCode / Antigravity | Refactor UI components, apply DCASIS styling, responsive sidebar navigation, full-width module layout, and split-screen login with hero image | `src/app/globals.css`, `src/app/login/page.tsx`, `src/components/layout/AppNavigation.tsx`, `src/components/layout/Container.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/features/auth/components/LoginForm.tsx` | Accepted after review | Ran `npm run lint`, `npm run typecheck`, `npm test` (49/49 passed), and verified visual layout in browser | `4d20515` | `ai-evidence/2026-10-24-ui-ux-refactor.md` |
| 2026-10-24 | OpenCode / Antigravity | Update staff test user terminology from Property Custodian to Non-Working Personnel (`non_teaching` role) in seed data and login badges | `src/features/auth/components/LoginForm.tsx`, `supabase/seed.sql` | Accepted and modified | Verified in Supabase PostgreSQL tables (`auth.users`, `public.profiles`, `public.user_roles`) and verified login | `09c5a69` | `ai-evidence/2026-10-24-staff-role-update.md` |
| 2026-10-24 | OpenCode / Antigravity | Fix Vue `v-if` syntax to React JSX boolean expression for inventory item active/inactive status and format status badge pills | `src/app/(app)/inventory/page.tsx`, `src/features/auth/components/LoginForm.tsx` | Accepted | Verified table rendering and ran TypeScript compiler check (`npm run typecheck`) and ESLint (`npm run lint`) | `af16536` | `ai-evidence/2026-10-24-inventory-status-fix.md` |

## E. Verification statement

I verified the AI-assisted material attributed to me by reviewing the affected source or documentation and performing the checks recorded above (linting, typechecking, running unit tests, and verifying live app behavior).

Initials: **LMA**

## F. Understanding statement

I can explain the submitted work attributed to me, including its purpose, data flow, security boundaries, limitations, and verification. Specifically, I understand the React JSX component architecture, Tailwind CSS layout classes, Supabase Auth role permissions, and how server actions interact with the database.

Initials: **LMA**

## G. Honesty statement

I declare that this form is complete and truthful. I have not fabricated prompts, dates, contribution records, evidence, signatures, test results, or commit hashes.

Student signature: ____________________________________

Printed name: **LEAH MAE ANONG**

Date signed: **October 24, 2026**
