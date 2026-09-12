<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Hotdrop Engineering Guidelines

## Architecture & Stack
- **Core Stack:** Next.js 16 (App Router + Turbopack), React 19, TypeScript (Strict Mode), Tailwind CSS v4, Supabase (PostgreSQL + Auth), Upstash (Redis + Ratelimit), shadcn/ui.
- **Folder Structure:**
  - Put reusable UI primitives in `@/components/ui`.
  - Colocate feature-specific components, actions, and utils inside route-level private directories (e.g., `src/app/(feed)/_components/`).
  - Shared domain components live in `src/components/`, data queries in `src/lib/queries.ts`, and validations in `src/lib/validations.ts`.

## Data Fetching & Server Boundaries
- **RSCs for Read Operations:** Default to React Server Components for data fetching. Query directly via Supabase client without `useEffect` waterfalls.
- **Streaming with Suspense:** Decompose pages into `<Suspense>` boundaries with skeleton fallbacks so the static shell prerenders and streams immediately.
- **Async Request APIs (Next.js 16):** Dynamic APIs are asynchronous; always `await params`, `await searchParams`, `await cookies()`, and `await headers()`.
- **Server Actions for Mutations:** Use Server Actions for web UI mutations. Always authenticate (`auth.uid()`) and validate inputs with Zod schemas (`server-auth-actions`).
- **Route Handlers:** Reserve `/api` route handlers strictly for webhooks and external consumers.
- **Client Components at the Leaves:** Keep `"use client"` directives isolated to interactive leaf components (forms, modals, buttons with DOM events, local UI state).

## Database & Supabase Conventions
- **Row-Level Security (RLS):** All tables must have RLS enabled with explicit policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
- **Foreign Key Indexing:** Always index foreign keys on child tables (e.g., `user_id`, `post_id`) to prevent sequential scans and slow cascade operations.
- **Atomic Operations & Functions:** Use `SECURITY DEFINER SET search_path = public` for database functions and handle concurrency atomically (`INSERT ... ON CONFLICT`, `DELETE ... RETURNING`).
- **Type Safety:** No `any`. Rely on generated Supabase TypeScript definitions (`supabase gen types typescript`).

## UI, Styling & Accessibility
- **Tailwind CSS v4:** Configure design tokens in `src/app/globals.css` via `@theme inline` and CSS variables. Do not use legacy `tailwind.config.js`.
- **Variant Styling:** Use `cva` (Class Variance Authority) and `cn()` for conditional variants instead of string concatenation.
- **Accessibility (WCAG 2.1 AA):**
  - Ensure minimum 4.5:1 text contrast ratios on all backgrounds.
  - Maintain minimum 44×44px touch targets on mobile touch points (`min-h-[44px] min-w-[44px]`).
  - Overlay components (`Dialog`, `Drawer`, `Sheet`) must have accessible titles (`DialogTitle`, `DrawerTitle`).
- **Telemetry Display:** Use monospace tabular numerals (`font-mono tabular-nums`) for numeric telemetry values, sensitivity meters, and counters to eliminate layout shifts (CLS).

## Active Agent Skills
Always consult the domain-specific guides in `.agents/skills/` before writing or refactoring code:
- `vercel-react-best-practices` — Eliminating waterfalls, server/client performance, bundle size optimization, and re-render prevention.
- `supabase` & `supabase-postgres-best-practices` — Schema design, RLS, indexing, connection pooling, and secure RPC authoring.
- `shadcn` — Composition rules, registry usage, form patterns (`FieldGroup`, `Field`, `InputGroup`), and accessible primitives.
- `upstash` & `upstash-ratelimit-js` / `upstash-redis-js` — Serverless rate limiting, abuse prevention, and low-latency cache-aside layer to protect Supabase free-tier limits.
- `better-interface` & `better-*` — Accessibility (`better-accessibility`), semantic color tokens (`better-colors`), layout hierarchy (`better-layout`), typography (`better-typography`), UI polish (`better-ui`), and clear microcopy (`better-writing`).

