# Technical & UI/UX Architecture Blueprint: Airdrop (CODM Settings Vault)

- **Project**: Airdrop (Garena & Global CODM Battle Royale Settings & Presets Vault)
- **Target Audience**: CODM Mobile & Tablet Players (Phone & iPad Viewports, PH/SEA & Global Meta)
- **Design Pattern**: Apple Human Interface Guidelines (HIG) / Tactical Minimalist Dark-Mode
- **Primary Goal**: Sub-second discovery, multi-dimensional filtering, creator attribution, and 1-tap clipboard copying of verified season settings.
- **Core Stack**: Next.js 16 (App Router + Turbopack), React 19, TypeScript (Strict Mode), Tailwind CSS v4, Supabase (PostgreSQL 15 + Auth + Storage), Upstash (Serverless Redis + Ratelimit).
- **Engineering Guidelines**: Aligned with active agent skills (`supabase`, `supabase-postgres-best-practices`, `vercel-react-best-practices`, `upstash`, `shadcn`, `better-interface`).

---

## 1. Scope & System Boundaries

### In-Scope (Phase 1 MVP — Graphics & Visual Presets)
- **Community Graphic Presets Vault**: Battle Royale visual configurations optimized for 60 FPS, 90 FPS, and 120 FPS targets.
- **1-Tap In-Game Import**: Official numeric share code clipboard export with step-by-step visual guidance (`Settings` $\rightarrow$ `Audio and Graphics` $\rightarrow$ `BR Mode Graphic Style` $\rightarrow$ `Unfold` $\rightarrow$ `Import`).
- **Responsive Viewport Lightbox**: Multi-ratio media viewer with dynamic scaling for 16:9 phone screens, 20:9 ultrawides, and 4:3 iPad/tablet displays with zero letterboxing (`max-h-[65vh] object-contain`).
- **Zero-Server Image Compression**: In-browser client WebP pipeline using HTML5 Canvas, shrinking screenshot payloads by >80% to stay under the 500KB storage limit.
- **Creator Discovery & Attribution**: Automatic Google profile avatar sync, custom in-game IGN and clan tags, and social channel links (YouTube, TikTok, Facebook Gaming).
- **Author-Specific Permissions**:
  - Authors retain 1-click self-deletion of their own presets.
  - Non-authors only see community reporting / moderation flags.
- **Distributed Abuse Protection (Upstash Redis)**:
  - Sliding-window rate limiters protecting mutations (votes: 10/10s, submissions: 3/10m, reports: 3/10m, deletions: 5/10m).
- **Community Moderation & Auto-Quarantine**:
  - 3-strike reporting threshold (`report_count >= 3`) that automatically hides reported presets (`is_hidden = true`) via an atomic PostgreSQL RPC.

### Out-of-Scope (Deferred to Future Phases)
- **Phase 2**: Camera, ADS, and gyroscope sensitivity profiles and DPI scaling notes.
- **Phase 3**: 2-finger, 4-finger, and 6-finger claw HUD layout blueprints and gunsmith attachment synergy.

---

## 2. Agent Skills Alignment Matrix

| Agent Skill | Applied Architecture & Best Practice Patterns |
| :--- | :--- |
| `supabase` & `supabase-postgres-best-practices` | RLS enabled on all tables; atomic functions with `SECURITY DEFINER SET search_path = public`; composite primary keys (`preset_votes (user_id, preset_id)`); foreign key indexing (`idx_presets_user_id`); user-isolated storage paths (`(storage.foldername(name))[1] = auth.uid()::text`). |
| `vercel-react-best-practices` | Server Actions for all mutations; lean props serialization (`UserSessionProfile`) eliminating client layout shifts; request deduplication with `React.cache()`; offscreen rendering with `content-visibility: auto`; dynamic imports for heavy modal/drawer bundles. |
| `upstash` & `upstash-ratelimit-js` | Serverless sliding-window rate limiting on all Server Actions to protect Supabase connection pool and prevent vote manipulation, spam submissions, or report bombing. |
| `shadcn` & `better-interface` | Base UI primitives (`@base-ui/react`); `Collapsible` for in-game import guides; concentric border radii (`rounded-2xl` card, `rounded-xl` wells); minimum 44×44px touch targets; WCAG 2.1 AA text contrast; monospace tabular numbers (`font-mono tabular-nums`) preventing layout shifts (CLS). |

---

## 3. Database Schema & Data Integrity (PostgreSQL / Supabase)

### A. Core Tables & DDL Specification

```sql
-- 1. Profiles Table (Automatic Google OAuth Sync)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  clan_tag text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_profiles_id on public.profiles(id);
alter table public.profiles enable row level security;

-- 2. Community Presets Table
create table if not exists public.presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('sensitivity', 'hud', 'graphics')),
  creator_name text not null,
  creator_avatar_url text,
  team_name text,
  is_verified boolean not null default false,
  social_platform text check (social_platform in ('YouTube', 'TikTok', 'Facebook', 'Twitch', 'X')),
  social_url text,
  social_handle text,
  code text not null,
  season text not null default 'Season 8',
  mode text not null default 'Battle Royale',
  playstyle text check (playstyle in ('Rusher', 'Sniper', 'All-Rounder')),
  device_type text not null check (device_type in ('Phone', 'iPad / Tablet')),
  device_name text,
  grip text check (grip in ('2-Finger Thumbs', '3-Finger', '4-Finger Claw', '5+ Finger')),
  gyro boolean,
  tier text,
  fps_target text,
  image_url text,
  layout_highlight text,
  description text,
  specs jsonb,
  upvotes integer not null default 0 check (upvotes >= 0),
  report_count integer not null default 0,
  is_hidden boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_presets_user_id on public.presets(user_id);
create index if not exists idx_presets_category on public.presets(category);
create index if not exists idx_presets_created_at on public.presets(created_at desc);
create index if not exists idx_presets_upvotes on public.presets(upvotes desc);
create index if not exists idx_presets_is_hidden on public.presets(is_hidden);
alter table public.presets enable row level security;

-- 3. Preset Votes Table (Composite Primary Key prevents surrogate key index bloat)
create table if not exists public.preset_votes (
  user_id uuid references auth.users(id) on delete cascade not null,
  preset_id uuid references public.presets(id) on delete cascade not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (user_id, preset_id)
);

create index if not exists idx_preset_votes_preset_id on public.preset_votes(preset_id);
create index if not exists idx_preset_votes_user_id on public.preset_votes(user_id);
alter table public.preset_votes enable row level security;

-- 4. Preset Reports Table (Community Moderation)
create table if not exists public.preset_reports (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text default 'inappropriate_content',
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint unique_user_preset_report unique (preset_id, user_id)
);

create index if not exists idx_preset_reports_preset_id on public.preset_reports(preset_id);
create index if not exists idx_preset_reports_user_id on public.preset_reports(user_id);
alter table public.preset_reports enable row level security;
```

### B. Row-Level Security (RLS) Policies

```sql
-- Profiles Policies
create policy "Profiles are viewable by everyone" on public.profiles
  for select to public using (true);

create policy "Users can update their own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Presets Policies
create policy "Presets are viewable by everyone" on public.presets
  for select to public
  using (is_hidden = false or (select auth.uid()) = user_id);

create policy "Authenticated users can create presets" on public.presets
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own presets" on public.presets
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own presets" on public.presets
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Preset Votes Policies
create policy "Preset votes are viewable by everyone" on public.preset_votes
  for select to public using (true);

create policy "Authenticated users can vote" on public.preset_votes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own vote" on public.preset_votes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Preset Reports Policies
create policy "Authenticated users can report presets" on public.preset_reports
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can view their own reports" on public.preset_reports
  for select to authenticated
  using ((select auth.uid()) = user_id);
```

### C. Concurrency-Safe Functions & Triggers

#### 1. Automatic Google OAuth Profile Sync
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1),
      'Operator'
    ),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    email = coalesce(excluded.email, profiles.email),
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

#### 2. Atomic Toggle Vote RPC
```sql
create or replace function public.toggle_preset_vote(p_preset_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_has_voted boolean;
  v_new_count integer;
begin
  v_user_id := (select auth.uid());
  if v_user_id is null then
    raise exception 'Authentication required to vote';
  end if;

  select exists(
    select 1 from public.preset_votes
    where user_id = v_user_id and preset_id = p_preset_id
  ) into v_has_voted;

  if v_has_voted then
    delete from public.preset_votes
    where user_id = v_user_id and preset_id = p_preset_id;

    update public.presets
    set upvotes = greatest(0, upvotes - 1),
        updated_at = timezone('utc'::text, now())
    where id = p_preset_id
    returning upvotes into v_new_count;

    return jsonb_build_object('voted', false, 'upvotes', v_new_count);
  else
    insert into public.preset_votes (user_id, preset_id)
    values (v_user_id, p_preset_id);

    update public.presets
    set upvotes = upvotes + 1,
        updated_at = timezone('utc'::text, now())
    where id = p_preset_id
    returning upvotes into v_new_count;

    return jsonb_build_object('voted', true, 'upvotes', v_new_count);
  end if;
end;
$$;
```

#### 3. Community Moderation & 3-Strike Auto-Quarantine RPC
```sql
create or replace function public.report_preset(
  p_preset_id uuid,
  p_reason text default 'inappropriate_content'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  calling_user uuid := auth.uid();
  v_new_reports int;
  v_is_hidden boolean := false;
begin
  if calling_user is null then
    raise exception 'Authentication required to report setups';
  end if;

  -- 1. Insert report idempotently per user
  insert into public.preset_reports (preset_id, user_id, reason)
  values (p_preset_id, calling_user, p_reason)
  on conflict (preset_id, user_id) do nothing;

  if not found then
    return jsonb_build_object('action', 'already_reported', 'message', 'You have already reported this setup.');
  end if;

  -- 2. Increment report count and trigger auto-quarantine at 3 reports
  update public.presets
  set
    report_count = report_count + 1,
    is_hidden = case when (report_count + 1) >= 3 then true else is_hidden end
  where id = p_preset_id
  returning report_count, is_hidden into v_new_reports, v_is_hidden;

  return jsonb_build_object(
    'action', 'reported',
    'report_count', v_new_reports,
    'is_quarantined', v_is_hidden
  );
end;
$$;
```

### D. Supabase Storage Specification (`preset-images`)

```sql
-- Create public presets storage bucket with 512KB size limit
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('presets', 'presets', true, 524288, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set
  public = true,
  file_size_limit = 524288,
  allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'];

-- Public read for all preset screenshots
create policy "Preset screenshots are viewable by everyone" on storage.objects
  for select to public using (bucket_id = 'presets');

-- Upload restricted to authenticated user folder prefix
create policy "Authenticated users can upload preset screenshots" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'presets' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Delete restricted to image owner
create policy "Users can delete their own preset screenshots" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'presets' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );
```

---

## 4. Client-Side Image Compression Pipeline

To respect Supabase free-tier egress and storage limits while preventing slow mobile uploads, all preset screenshots are processed in-browser before hitting the network:

```
[Raw Mobile Screenshot (2-8 MB, PNG/HEIC)]
                     │
                     ▼
[HTML5 Canvas Pipeline: Resize max 1920×1080]
                     │
                     ▼
[WebP Encoder: Quality 0.82]
                     │
                     ▼
[Compressed Blob: 120–280 KB (<500KB Limit)]
                     │
                     ▼
[Supabase Storage: /presets/{user_id}/{preset_id}.webp]
```

Implementation resides in [`src/lib/image-compression.ts`](file:///c:/Projects/airdrop/src/lib/image-compression.ts).

---

## 5. Free-Tier Infrastructure Protection (Upstash Redis)

Upstash Serverless Redis serves as an edge-rate-limiting barrier in [`src/lib/ratelimit.ts`](file:///c:/Projects/airdrop/src/lib/ratelimit.ts):

```ts
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

export const redis = Redis.fromEnv();

// Voting: 10 votes per 10 seconds per authenticated user
export const voteRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  prefix: 'ratelimit:vote'
});

// Preset Submission: 3 submissions per 10 minutes
export const submitRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  prefix: 'ratelimit:submit'
});

// Community Reporting: 3 reports per 10 minutes
export const reportRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  prefix: 'ratelimit:report'
});

// Author Deletion: 5 deletions per 10 minutes
export const deleteRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  prefix: 'ratelimit:delete'
});
```

---

## 6. Frontend Architecture & Boundaries (Next.js 16 + React 19)

### A. Directory Structure
```
src/
├── app/
│   ├── (feed)/
│   │   ├── _components/
│   │   │   ├── CategorySwitcher.tsx    # Category switcher (Graphics / Sens / HUD)
│   │   │   ├── FilterChipBar.tsx       # FPS & Device contextual filters
│   │   │   ├── Header.tsx              # Brand identity & share trigger
│   │   │   ├── HeroSpotlight.tsx       # Top charisma showcase with avatar
│   │   │   ├── LightboxModal.tsx       # Multi-ratio dialog with step-by-step import guide
│   │   │   ├── PresetCard.tsx          # Memoized preset card with author controls
│   │   │   ├── PresetGrid.tsx          # Client container with optimistic upvotes
│   │   │   ├── SortSwitcher.tsx        # Trending / Top / Latest sort controls
│   │   │   ├── SubmissionDrawer.tsx    # Vaul drawer with dynamic IGN preview & Canvas WebP
│   │   │   └── UserNav.tsx             # User session profile avatar & sign-out
│   │   └── page.tsx                    # Server Component: React.cache() queries & Suspense
│   ├── auth/
│   │   ├── actions.ts                  # Google OAuth sign-in/out Server Actions
│   │   └── callback/route.ts           # PKCE OAuth callback handler
│   ├── presets/
│   │   └── actions.ts                  # Server Actions (vote, submit, delete, report)
│   ├── globals.css                     # Tailwind v4 @theme inline tokens & CSS variables
│   └── layout.tsx                      # Root layout with Sonner toaster
├── components/
│   ├── DeleteDialog.tsx                # Author 1-click confirmation dialog
│   ├── ReportDialog.tsx                # Community moderation report modal
│   └── ui/                             # Base UI & shadcn primitives
└── lib/
    ├── image-compression.ts            # Client-side HTML5 Canvas WebP compression
    ├── queries.ts                      # Server-side Supabase preset fetchers
    ├── ratelimit.ts                    # Upstash Redis rate limiters
    ├── validations.ts                  # Zod schemas for submissions and moderation
    └── supabase/
        ├── client.ts                   # @supabase/ssr browser client
        └── server.ts                   # @supabase/ssr server client (cookies API)
```

### B. Server/Client Performance Rules (`vercel-react-best-practices`)
1. **Zero Dynamic Layout Shifts**: Minimal session profiles (`UserSessionProfile`) are evaluated server-side and passed directly into `SubmissionDrawer` and `UserNav` to eliminate sign-in pop-in or layout shift.
2. **Server Actions for All Mutations**: Every data mutation executes via Next.js Server Actions (`'use server'`) with Zod schema validation and authenticated user binding (`auth.uid()`).
3. **Selective Client Boundaries**: Heavy presentation dialogs (`LightboxModal`, `SubmissionDrawer`) are isolated as client components while the data layer prerenders on the server.
4. **Resilient Clipboard Engine**: Employs `navigator.clipboard` with an immediate `document.execCommand('copy')` fallback for in-app WebViews (TikTok, Facebook, Instagram).

---

## 7. Zod Validation Schemas (`src/lib/validations.ts`)

```ts
import { z } from 'zod';

const emptyToNull = (val: unknown) => (typeof val === 'string' && val.trim() === '' ? null : val);

export const PresetSubmissionSchema = z.object({
  category: z.enum(['sensitivity', 'hud', 'graphics']),
  creator_name: z.string().trim().min(2, "IGN must be at least 2 characters").max(60),
  team_name: z.preprocess(emptyToNull, z.string().trim().max(40).nullable().optional()),
  social_platform: z.enum(['YouTube', 'TikTok', 'Facebook', 'Twitch', 'X']).optional(),
  social_url: z.preprocess(emptyToNull, z.string().url("Must be a valid HTTPS URL").nullable().optional()),
  social_handle: z.preprocess(emptyToNull, z.string().trim().max(60).nullable().optional()),
  code: z.string().trim().min(6, "Share code must be at least 6 characters").max(64),
  season: z.string().default('Season 8'),
  mode: z.string().default('Battle Royale'),
  device_type: z.enum(['Phone', 'iPad / Tablet']),
  device_name: z.preprocess(emptyToNull, z.string().trim().max(80).nullable().optional()),
  fps_target: z.preprocess(emptyToNull, z.string().nullable().optional()),
  tier: z.preprocess(emptyToNull, z.string().nullable().optional()),
  image_url: z.preprocess(emptyToNull, z.string().url().nullable().optional()),
  layout_highlight: z.preprocess(emptyToNull, z.string().max(120).nullable().optional()),
  description: z.preprocess(emptyToNull, z.string().max(300).nullable().optional())
});

export type PresetSubmission = z.infer<typeof PresetSubmissionSchema>;

export const PresetReportSchema = z.object({
  preset_id: z.string().uuid(),
  reason: z.enum(['inappropriate_content', 'broken_code', 'wrong_category', 'other'])
});
```

