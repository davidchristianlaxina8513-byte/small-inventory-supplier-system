# Toolchain Requirements

Install only the tools required by the chosen local workflow. ESLint, Prettier, Prisma, TypeScript, and framework CLIs are project dependencies; run them through npm scripts or `npx`, never as global installations.

| Tool | Version | When needed | Version source |
|---|---|---|---|
| Node.js | 22.14.0+ (tested 24.20.0) | JavaScript application | `.node-version`, `package.json` |
| npm | 11.19.0+ | Local package scripts | `package.json#packageManager`, `.npmrc` |
| Docker with Compose | Current supported release | Generated containers and local managed services | `docker-compose.yml` when selected |

Dependency retries run inside the generated package directory, so npm reads this project's own `package.json`, lockfile, engines, and `.npmrc`. Different projects can retain different tested dependency versions without global conflicts.

## Host ports

Before starting containers, check whether the default ports are already in use (for example, `ss -ltn` on Linux). Override conflicts when launching Compose with `FRONTEND_HOST_PORT`, `BACKEND_HOST_PORT`, or `POSTGRES_HOST_PORT`; container ports and service-to-service addresses remain unchanged.
