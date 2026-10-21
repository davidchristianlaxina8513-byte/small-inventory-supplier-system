# Local Setup Guide

## Prerequisites

- Node.js 22.14.0 or newer with npm 11.19.0 or newer (tested on Node.js 24.20.0)
- npm
- A running Docker-compatible runtime for the pinned local Supabase CLI

## Install and start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Start the local Supabase stack from the npm package directory:

```bash
npm run supabase:start
```

## Validate

```bash
npm run lint
npm run typecheck
npm run test --if-present
npm run build
```

Commit the generated `package-lock.json`; CI uses `npm ci`.
