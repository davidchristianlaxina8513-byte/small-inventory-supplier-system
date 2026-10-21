# smallinventoryandsuppliersystem

> anewwebapplication

Generated with create-win-project.

## Start

```bash
cp .env.example .env.local 2>/dev/null || cp .env.example .env
npm install
npm run dev
```

## Validate

```bash
npm run lint
npm run typecheck
npm run test --if-present
npm run build
```

Commit the generated lockfile before enabling CI; CI uses `npm ci`.

## Agent-assisted work

1. Put product goals and boundaries in `CONTEXT.md`.
2. Read `AGENTS.md` for commands and authority boundaries.
3. Use `RULES.md` to open only the relevant playbook section.
4. Treat tests and application behavior as the source of truth when prose drifts.

## Important files

- `README.md`: start and validation instructions.
- `docs/`: architecture, API, setup, and deployment documentation.
