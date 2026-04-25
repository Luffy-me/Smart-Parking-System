# Smart Parking System

Production-ready pnpm monorepo for the Smart Parking SaaS:
- **Web app**: `artifacts/smart-parking` (Vite + React)
- **API**: `artifacts/api-server` (Express + Clerk + Drizzle/Postgres)

## Prerequisites

- Node.js 20+ (24 recommended)
- Corepack enabled (`corepack enable`)
- pnpm 10 (`corepack prepare pnpm@10.33.2 --activate`)
- PostgreSQL database
- Clerk project (publishable + secret keys)

## Install

```bash
pnpm install
```

## Required environment variables

### Web (`artifacts/smart-parking/.env`)

Copy from `artifacts/smart-parking/.env.example`:

- `VITE_CLERK_PUBLISHABLE_KEY` (required)
- `VITE_CLERK_PROXY_URL` (recommended: `/api/__clerk` when web+api share domain)
- `VITE_YANDEX_MAPS_API_KEY` (required for live map)
- `VITE_API_BASE_URL` (optional; set only if API is on another origin)

### API (`artifacts/api-server/.env`)

Copy from `artifacts/api-server/.env.example`:

- `PORT` (required at runtime)
- `NODE_ENV=production`
- `DATABASE_URL` (required)
- `CORS_ORIGINS` (required in production; frontend origin(s), comma-separated)
- `CLERK_SECRET_KEY` (required in production)
- `LOG_LEVEL` (optional)

## Validate before deploy

```bash
pnpm run typecheck
pnpm run build
```

## Appwrite build settings

Use this build command in Appwrite to pin pnpm and keep lockfile checks strict:

```bash
corepack enable && corepack prepare pnpm@10.33.2 --activate && pnpm install --frozen-lockfile && pnpm run build
```

If deploy fails with a lockfile mismatch, retry once with:

```bash
corepack enable && corepack prepare pnpm@10.33.2 --activate && pnpm install --no-frozen-lockfile && pnpm run build
```

Keep pnpm pinned to `10.33.2` in all CI/deploy environments.

## Deploy architecture

Use one of these setups:

1. **Same domain (recommended)**  
   - Serve web on `https://app.your-domain.com`  
   - Route `/api/*` on that same domain to API service  
   - Keep `VITE_API_BASE_URL` empty (default relative `/api`)

2. **Split domains**  
   - Web: `https://app.your-domain.com`  
   - API: `https://api.your-domain.com`  
   - Set `VITE_API_BASE_URL=https://api.your-domain.com` in web env  
   - Set API `CORS_ORIGINS=https://app.your-domain.com`

## Build and run services

### API

```bash
pnpm --filter @workspace/api-server run build
node --enable-source-maps artifacts/api-server/dist/index.mjs
```

### Web

```bash
pnpm --filter @workspace/smart-parking run build
```

Deploy static files from:

`artifacts/smart-parking/dist/public`

Configure SPA fallback rewrite:

`/* -> /index.html`
