# Development Environments

## Default local workflow

Run the generator directly on the host, then use the commands in `setup.md`. Docker is optional and is never required to run create-win-project itself. Local files and package-manager metadata remain the source of truth.

## Optional Docker workflow

Docker Engine 27 or newer with Docker Compose v2.30 or newer is recommended. Allocate at least 4 GB of memory and 10 GB of free disk space for images, caches, and databases. Check occupied ports before startup with `ss -ltn` (Linux) or your platform's equivalent.

```bash
docker compose config
docker compose build
docker compose up -d
```

Override host collisions with `FRONTEND_HOST_PORT`, `BACKEND_HOST_PORT`, and `POSTGRES_HOST_PORT`. Backend runtimes and databases stay inside containers, reducing the host tools you need.

## Dev Containers

A generic Dev Container is intentionally not generated: JavaScript, Java, PHP, and mobile stacks need different host/device boundaries. VS Code and Codespaces users can open the generated repository normally and add a stack-specific Dev Container later without changing the supported local or Compose workflows.
