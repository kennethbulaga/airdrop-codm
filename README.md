<div align="center">

# Airdrop

**The open-source community vault for Call of Duty: Mobile (CODM) Battle Royale graphic styles, sensitivity tunings, and tactical presets.**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-20232a?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <br />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Postgres_15-3ecf8e?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Upstash-Redis_%26_Ratelimit-00e9a3?style=flat-square&logo=upstash&logoColor=white" alt="Upstash" />
</p>

[Roadmap](#project-status--roadmap) · [Features](#key-features) · [How It Works](#how-it-works-in-codm) · [Architecture](#architecture--tech-stack) · [Quickstart](#getting-started) · [Contributing](#contributing)

</div>

---

## Overview

**Airdrop** is a high-performance web platform built to catalog, share, and benchmark Battle Royale graphic configurations and sensitivity loadouts for competitive CODM players.

> [!NOTE]
> **Project Status: Active Development (Phase 1 — Graphics & Visual Presets)**  
> Airdrop is currently under active development. Development is currently focused on polishing the core **Battle Royale Graphics** module (1-tap import codes, phone/tablet screenshot viewports, creator attribution, and moderation). Contributions and feedback from developers and players are welcome!

---

## Project Status & Roadmap

- **Phase 1: Battle Royale Graphics Vault** *(Current Focus — In Polish)*
  - [x] 1-Tap in-game import codes with guided step-by-step instructions
  - [x] In-browser Canvas WebP compression (sub-500KB client uploads)
  - [x] Adaptive lightbox supporting 16:9 phones, 20:9 ultrawides, and 4:3 tablets
  - [x] Dynamic creator identity (IGN, Clan tags, Google OAuth avatars)
  - [x] Author preset management (self-deletion) & community moderation quarantine
  - [x] Distributed Upstash Redis sliding-window rate limiting
  - [ ] Advanced search and map filtering (Isolated vs. Blackout visual tunings)

- **Phase 2: Sensitivity & Gyroscope Presets** *(Upcoming)*
  - [ ] Standard, ADS, and gyroscope sensitivity curves
  - [ ] Device-specific DPI and screen dimension scaling notes

- **Phase 3: HUD Layouts & Gunsmith Synergy** *(Planned)*
  - [ ] 2-finger, 4-finger, and claw layout diagrams
  - [ ] Weapon loadout recommendations tailored to graphic clarity

---

## Key Features

- **1-Tap In-Game Import** — Copy official graphic style codes directly to your clipboard with step-by-step visual guidance for CODM Battle Royale settings.
- **Adaptive Viewport Lightbox** — Native support for 16:9 phone displays, 20:9 ultrawide devices, and 4:3 iPad/tablet viewports without letterboxing or distortion.
- **Client-Side Image Pipeline** — High-resolution screenshots are compressed to WebP via HTML5 Canvas before reaching Supabase Storage, slashing payload sizes by >80%.
- **Creator Attribution & Sync** — Presets automatically display the creator's Google avatar and custom in-game IGN/Clan identity.
- **Author-Specific Controls** — Creators retain full ownership with direct 1-click deletion of their own presets, while community members have access to moderation flagging.
- **Sliding-Window Rate Limiting** — Distributed Upstash Redis rate limiters protect mutation endpoints against automated spam submissions and vote manipulation.
- **Granular Row-Level Security (RLS)** — Public reads for active presets, authenticated-only creation, author-restricted deletions, and an automated quarantine trigger when reports exceed thresholds.
- **Modern Next.js 16 Foundation** — Built on React 19 Server Components, minimal client-side hydration, and zero layout shift (`font-mono tabular-nums`).

---

## How It Works in CODM

Call of Duty: Mobile allows Battle Royale players to export and import complete graphical rendering pipelines via numeric share codes. Airdrop bridges community discovery with in-game settings:

1. **Find a Preset** — Filter by target refresh rate (60 FPS, 90 FPS, 120 FPS) and view the HUD screenshot.
2. **Copy the Code** — Click the copy button on the preset card or lightbox modal.
3. **Import In-Game**:
   - Open **CODM** $\rightarrow$ **Settings** $\rightarrow$ **Audio and Graphics**.
   - Scroll down to the **BR Mode Graphic Style** section.
   - Tap **Unfold** $\rightarrow$ Tap **Import**.
   - Paste the code and tap **Confirm** to apply the style instantly.


---

## Architecture & Tech Stack

```
airdrop/
├── src/
│   ├── app/
│   │   ├── (feed)/
│   │   │   ├── _components/      # Colocated route components (Feed, HeroSpotlight, LightboxModal)
│   │   │   └── actions.ts        # Server actions for votes, deletions, reporting, and submissions
│   │   ├── auth/callback/        # PKCE OAuth token exchange handler
│   │   ├── globals.css           # Tailwind v4 @theme inline tokens & CSS variables
│   │   └── layout.tsx            # Root layout with ThemeProvider and Sonner toaster
│   ├── components/
│   │   ├── ui/                   # Accessible UI primitives (@base-ui/react, shadcn)
│   │   ├── navbar.tsx            # Header navigation & Google OAuth trigger
│   │   └── user-nav.tsx          # Authenticated user dropdown & profile management
│   ├── lib/
│   │   ├── db.ts                 # Direct Postgres / Supabase client wrappers
│   │   ├── queries.ts            # Server-side data access queries (RSC)
│   │   ├── ratelimit.ts          # Upstash Redis sliding-window rate limiter
│   │   ├── utils.ts              # Class merging (clsx + twMerge) and helpers
│   │   └── validations.ts        # Zod schemas for submission and moderation payloads
│   └── types/
│       └── database.ts           # Strictly typed Supabase database schema definitions
└── supabase/
    └── migrations/               # PostgreSQL DDL migrations, functions, triggers, and RLS policies
```

### Core Technologies

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16.3 (App Router)** | Framework with React Server Components (RSC) and Server Actions |
| **React 19** | Modern concurrent rendering and Server Actions integration |
| **Tailwind CSS v4** | Next-generation styling engine with inline theme configuration |
| **Supabase** | PostgreSQL 15+, Auth (Google OAuth), Row-Level Security, and Storage |
| **Upstash Redis** | Serverless rate-limiting (`@upstash/ratelimit`) on mutation actions |
| **shadcn / Base UI** | Accessible, unstyled UI primitives powered by `@base-ui/react` |
| **Zod** | Runtime validation for server actions and client forms |

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm`, `pnpm`, or `bun`
- A free **[Supabase](https://supabase.com)** project
- A free **[Upstash Redis](https://upstash.com)** database

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/airdrop.git
cd airdrop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory by copying the sample:

```bash
cp .env.example .env.local
```

Fill in the required credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key

# Upstash Redis Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local development server with Turbopack |
| `npm run build` | Compiles the production build and type-checks the codebase |
| `npm run start` | Runs the compiled production server locally |
| `npm run lint` | Runs ESLint checks across all source files |


---

## Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Your Supabase project URL (e.g. `https://xyzcompany.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Yes** | Public/anon API key safe for client-side browser exposure |
| `SUPABASE_SECRET_KEY` | **Yes** | Privileged service-role key used strictly inside Server Actions |
| `UPSTASH_REDIS_REST_URL` | **Yes** | Upstash Serverless Redis REST endpoint for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes** | Upstash Serverless Redis REST auth token |

---

## Database Setup

Airdrop relies on Supabase for data persistence, authentication, and asset storage.

### Running Migrations

All SQL schema, indexes, RLS policies, and triggers are consolidated in [`supabase/migrations/combined_airdrop_setup.sql`](file:///c:/Projects/airdrop/supabase/migrations/combined_airdrop_setup.sql).

1. Navigate to your **Supabase Dashboard** -> **SQL Editor**.
2. Paste the contents of `combined_airdrop_setup.sql` and run the script.
3. The migration sets up:
   - `public.profiles` with automatic sync from `auth.users` (Google OAuth avatar and metadata).
   - `public.presets` with target FPS constraints, dynamic IGN/clan naming, and creator avatars.
   - `public.preset_votes` with atomic increment/decrement RPC triggers.
   - `public.preset_reports` with an automated quarantine trigger (`is_flagged = true` when threshold is met).
   - `preset-images` public storage bucket with strict 5MB upload policies for authenticated users.

### Google OAuth Configuration

1. In Supabase Dashboard, head to **Authentication** -> **Providers** -> **Google**.
2. Enable Google and provide your Google Cloud OAuth Client ID and Secret.
3. Add the redirect URL:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
4. In **Authentication** -> **URL Configuration**, add your local origin (`http://localhost:3000`) and production domain to the **Redirect URLs** list.

---

## Contributing

Airdrop is an open-source project and welcomes contributions from engineers, designers, and competitive players alike! Whether you are fixing bugs, optimizing rendering performance, or adding new features, your PRs are appreciated.

### Development Workflow

1. **Fork the repository** on GitHub.
2. **Create a feature branch**:
   ```bash
   git checkout -b feat/my-new-feature
   ```
3. **Make your changes** following the project conventions:
   - Use React Server Components (RSC) for data fetching.
   - Restrict `"use client"` directives to interactive leaf components.
   - Use Tailwind CSS v4 design tokens from `src/app/globals.css`.
   - Never expose `SUPABASE_SECRET_KEY` to client components.
4. **Verify TypeScript & Linting**:
   ```bash
   npm run lint
   npm run build
   ```
5. **Commit your changes** using conventional commit messages:
   ```bash
   git commit -m "feat(presets): add filter for tablet aspect ratio presets"
   ```
6. **Push to your branch & submit a Pull Request**:
   ```bash
   git push origin feat/my-new-feature
   ```

### Community & Ideas

Interested in contributing but unsure where to start? Check out these areas:
- [ ] Add filter presets for weapon loadouts or HUD layout sensitivity maps
- [ ] Implement search indexing or fuzzy search over player/clan names
- [ ] Add preset export to social share preview cards (OpenGraph dynamic generation)
- [ ] Add localization (i18n) for international competitive regions

---

## License

This project is licensed under the [MIT License](LICENSE).

