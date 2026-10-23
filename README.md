# Small Inventory and Supplier System (SISS)

Academic inventory, request, borrowing, reservation, incident, supplier, and purchasing prototype for three school offices. Built with Next.js 16, TypeScript, Tailwind CSS 4, and Supabase.

## Requirements

- Node.js 22.14 or newer
- npm 11.19 or newer
- Docker Desktop for the local Supabase stack
- Supabase CLI (the project currently uses 2.121.0)

## Local setup

```bash
npm install
npm run supabase:start
supabase db reset
npm run supabase:types
npm run dev
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. These browser variables are public configuration.

Public signup is disabled. Create demo users through the local Supabase Auth administration API, then activate them and assign roles from `/admin/users`. `supabase db reset` removes local users and data and re-seeds the three fictional offices.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run supabase:test
npm run test:e2e
npm run build
```

The default Vitest worker pool is unstable on the current Windows machine. The verified fallback is `npx vitest run --pool=threads --maxWorkers=1`. Database policy and workflow tests run through pgTAP.

## Implemented modules

- Authentication, account status, role, and office boundaries
- Inventory catalog, balances, serialized assets, stock movements, and transfers
- Requests, approval history, partial approval, and atomic issuance
- Reservations with overlap protection; loans, overdue display, and returns
- Damage/missing reports and resolution
- Suppliers, purchase requests, orders, receiving, and discrepancies
- Notifications, audit logs, live dashboards, and reports
- Administrator user, role, and office management

See `CONTEXT.md`, `PROGRESS.md`, and `docs/` for decisions, requirements, workflows, architecture, database design, and test status.
