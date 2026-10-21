# Architecture Overview

## Runtime shape

- Frontend: Next.js
- Backend/data: Supabase
- Platform: web
- Architecture profile: medium
- Styling mode: tailwind
- Authentication: undecided

## Generated source map

This map is derived from the runnable source, routes, migrations, and tests generated for this
specific stack and architecture profile. Tooling, deployment, and guidance files are omitted.

```text
smallinventoryandsuppliersystem/
├── config/capabilities/
│   └── uploads.json
├── src/
│   ├── app/
│   │   ├── api/health/
│   │   │   └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.test.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.tsx
│   │   └── layout/
│   │       ├── Container.tsx
│   │       └── Section.tsx
│   ├── features/status/
│   │   ├── components/
│   │   │   └── StarterStatus.tsx
│   │   ├── services/
│   │   │   └── getStarterStatus.ts
│   │   └── types.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── cn.ts
│   └── test/
│       └── setup.ts
└── supabase/
    ├── migrations/
    │   └── 00000000000000_create_examples.sql
    ├── tests/
    │   └── examples_rls.test.sql
    └── config.toml
```

This is the exact generated source tree, not the complete reference architecture. The application
is intentionally a small vertical slice; absent reference folders are not missing requirements.
Add domain features only after recording product goals and boundaries in `CONTEXT.md`. Keep entry
points thin, validate at trust boundaries, and enforce authorization beside protected data or side
effects.

## Detailed structure rules

- `playbooks/stack/nextjs/structure.md`

The structure playbooks show available destinations and profile growth rules. Create a folder only
when its responsibility exists. Before an agent removes or reorganizes user-created architecture,
it must explain the change, future placement, and recovery path and then ask for approval.

## Verification boundary

The starter is considered healthy when its lint/typecheck/tests/build commands pass.
Documentation explains those executable patterns; it does not override working code and tests.
