-- ==============================================================================
-- AIRDROP PLATFORM: FULL SUPABASE DATABASE SETUP
-- Target Project: kbbuukebzquvxllgezis (Airdrop)
-- Standards: Supabase Postgres Best Practices & RLS Guidelines
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USER PROFILES TABLE & GOOGLE OAUTH SYNC TRIGGER
-- ------------------------------------------------------------------------------

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

-- Drop existing policies if re-running
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  to public
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Automatic Google OAuth profile sync trigger
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. COMMUNITY PRESETS & TELEMETRY TABLE
-- ------------------------------------------------------------------------------

create table if not exists public.presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('sensitivity', 'hud', 'graphics')),
  creator_name text not null,
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
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes for lightning fast queries and foreign keys
create index if not exists idx_presets_user_id on public.presets(user_id);
create index if not exists idx_presets_category on public.presets(category);
create index if not exists idx_presets_created_at on public.presets(created_at desc);
create index if not exists idx_presets_upvotes on public.presets(upvotes desc);

alter table public.presets enable row level security;

-- Presets RLS Policies
drop policy if exists "Presets are viewable by everyone" on public.presets;
create policy "Presets are viewable by everyone"
  on public.presets
  for select
  to public
  using (true);

drop policy if exists "Authenticated users can create presets" on public.presets;
create policy "Authenticated users can create presets"
  on public.presets
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own presets" on public.presets;
create policy "Users can update their own presets"
  on public.presets
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own presets" on public.presets;
create policy "Users can delete their own presets"
  on public.presets
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ------------------------------------------------------------------------------
-- 3. PRESET VOTES TABLE & ATOMIC RPC TOGGLE
-- ------------------------------------------------------------------------------

create table if not exists public.preset_votes (
  user_id uuid references auth.users(id) on delete cascade not null,
  preset_id uuid references public.presets(id) on delete cascade not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (user_id, preset_id)
);

create index if not exists idx_preset_votes_preset_id on public.preset_votes(preset_id);
create index if not exists idx_preset_votes_user_id on public.preset_votes(user_id);

alter table public.preset_votes enable row level security;

drop policy if exists "Preset votes are viewable by everyone" on public.preset_votes;
create policy "Preset votes are viewable by everyone"
  on public.preset_votes
  for select
  to public
  using (true);

drop policy if exists "Authenticated users can vote" on public.preset_votes;
create policy "Authenticated users can vote"
  on public.preset_votes
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their own vote" on public.preset_votes;
create policy "Users can remove their own vote"
  on public.preset_votes
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Concurrency-safe atomic voting function
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

-- ------------------------------------------------------------------------------
-- 4. GRANTS FOR DATA API ACCESS
-- ------------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.profiles to anon;

grant select, insert, update, delete on table public.presets to authenticated;
grant select on table public.presets to anon;

grant select, insert, delete on table public.preset_votes to authenticated;
grant select on table public.preset_votes to anon;

grant execute on function public.toggle_preset_vote(uuid) to authenticated;
