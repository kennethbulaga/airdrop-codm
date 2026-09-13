-- ==============================================================================
-- AIRDROP PLATFORM: FULL MASTER SUPABASE DATABASE SETUP
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
  has_completed_onboarding boolean not null default false,
  social_platform text check (social_platform is null or social_platform in ('YouTube', 'TikTok', 'Facebook', 'Twitch', 'X')),
  social_url text,
  social_handle text,
  youtube_url text,
  tiktok_url text,
  facebook_url text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

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

-- Trigger to sync updated profile names, clans, and socials to presets
create or replace function public.sync_profile_to_presets()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.presets
  set
    creator_name = new.full_name,
    team_name = new.clan_tag,
    youtube_url = new.youtube_url,
    tiktok_url = new.tiktok_url,
    facebook_url = new.facebook_url,
    social_platform = new.social_platform,
    social_url = new.social_url,
    social_handle = new.social_handle
  where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists on_profile_updated_sync_presets on public.profiles;
create trigger on_profile_updated_sync_presets
  after update of full_name, clan_tag, youtube_url, tiktok_url, facebook_url, social_platform, social_url, social_handle on public.profiles
  for each row execute function public.sync_profile_to_presets();

-- ------------------------------------------------------------------------------
-- 2. COMMUNITY PRESETS & TELEMETRY TABLE
-- ------------------------------------------------------------------------------

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
  youtube_url text,
  tiktok_url text,
  facebook_url text,
  code text not null,
  season text not null default 'Season 8',
  mode text not null default 'Battle Royale' check (mode in ('Battle Royale', 'Multiplayer')),
  playstyle text check (playstyle in ('Rusher', 'Sniper', 'All-Rounder')),
  device_type text not null check (device_type in ('Phone', 'iPad / Tablet')),
  device_name text,
  grip text check (grip is null or grip in ('2-Finger', '3-Finger', '4-Finger', '5+ Finger')),
  gyro boolean,
  tier text,
  graphic_quality text check (graphic_quality is null or graphic_quality in ('Low', 'Medium', 'High', 'Very High')),
  fps_target text check (fps_target is null or fps_target in ('Low', 'Medium', 'High', 'Very High', 'Max', 'Ultra')),
  image_url text,
  layout_highlight text,
  description text,
  specs jsonb,
  upvotes integer not null default 0 check (upvotes >= 0),
  is_hidden boolean not null default false,
  report_count integer not null default 0 check (report_count >= 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes for lightning fast queries and foreign keys
create index if not exists idx_presets_user_id on public.presets(user_id);
create index if not exists idx_presets_category on public.presets(category);
create index if not exists idx_presets_graphic_quality on public.presets(graphic_quality);
create index if not exists idx_presets_created_at on public.presets(created_at desc);
create index if not exists idx_presets_upvotes on public.presets(upvotes desc);
create index if not exists idx_presets_is_hidden on public.presets(is_hidden);

-- Partial composite indexes for feed & trending queries
create index if not exists idx_presets_feed_active
  on public.presets(category, created_at desc)
  where is_hidden = false;

create index if not exists idx_presets_trending_active
  on public.presets(upvotes desc)
  where is_hidden = false;

alter table public.presets enable row level security;

-- Presets RLS Policies
drop policy if exists "Presets are viewable by everyone" on public.presets;
create policy "Presets are viewable by everyone"
  on public.presets
  for select
  to public
  using (is_hidden = false or (select auth.uid()) = user_id);

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

-- Trigger to prevent client tampering with upvotes, moderation, or verification
create or replace function public.protect_preset_immutable_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.upvotes <> old.upvotes then
      raise exception 'Direct modification of upvotes is not permitted. Use toggle_preset_vote().';
    end if;
    if new.report_count <> old.report_count or new.is_hidden <> old.is_hidden then
      raise exception 'Direct modification of moderation status is not permitted.';
    end if;
    if new.is_verified <> old.is_verified then
      raise exception 'Direct modification of verification status is not permitted.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_preset_columns on public.presets;
create trigger trg_protect_preset_columns
  before update on public.presets
  for each row execute function public.protect_preset_immutable_columns();

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
-- 4. PRESET REPORTS TABLE & ATOMIC RPC MODERATION
-- ------------------------------------------------------------------------------

create table if not exists public.preset_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  preset_id uuid references public.presets(id) on delete cascade not null,
  reason text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (reporter_id, preset_id)
);

create index if not exists idx_preset_reports_preset_id on public.preset_reports(preset_id);
create index if not exists idx_preset_reports_reporter_id on public.preset_reports(reporter_id);

alter table public.preset_reports enable row level security;

drop policy if exists "Authenticated users can report" on public.preset_reports;
create policy "Authenticated users can report"
  on public.preset_reports
  for insert
  to authenticated
  with check ((select auth.uid()) = reporter_id);

drop policy if exists "Users can view their own reports" on public.preset_reports;
create policy "Users can view their own reports"
  on public.preset_reports
  for select
  to authenticated
  using ((select auth.uid()) = reporter_id);

-- Atomic reporting RPC with 3-strike auto quarantine
create or replace function public.report_preset(
  p_preset_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_new_report_count integer;
  v_is_hidden boolean;
begin
  v_user_id := (select auth.uid());
  if v_user_id is null then
    raise exception 'Authentication required to report';
  end if;

  insert into public.preset_reports (reporter_id, preset_id, reason)
  values (v_user_id, p_preset_id, p_reason)
  on conflict (reporter_id, preset_id) do nothing;

  update public.presets
  set
    report_count = report_count + 1,
    is_hidden = case when (report_count + 1) >= 3 then true else is_hidden end,
    updated_at = timezone('utc'::text, now())
  where id = p_preset_id
  returning report_count, is_hidden into v_new_report_count, v_is_hidden;

  return jsonb_build_object(
    'reported', true,
    'report_count', v_new_report_count,
    'is_hidden', v_is_hidden
  );
end;
$$;

-- ------------------------------------------------------------------------------
-- 5. FEEDBACK TABLE
-- ------------------------------------------------------------------------------

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('suggestion', 'bug', 'mode_request', 'general')),
  message text not null,
  contact_info text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_feedback_user_id on public.feedback(user_id);
create index if not exists idx_feedback_created_at on public.feedback(created_at desc);

alter table public.feedback enable row level security;

drop policy if exists "Authenticated users can submit feedback" on public.feedback;
create policy "Authenticated users can submit feedback"
  on public.feedback
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own feedback" on public.feedback;
create policy "Users can view their own feedback"
  on public.feedback
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- ------------------------------------------------------------------------------
-- 6. STORAGE BUCKET & POLICIES
-- ------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'presets',
  'presets',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'];

drop policy if exists "Preset screenshots are publicly accessible" on storage.objects;
create policy "Preset screenshots are publicly accessible"
  on storage.objects for select to public
  using (bucket_id = 'presets');

drop policy if exists "Authenticated users can upload screenshots" on storage.objects;
create policy "Authenticated users can upload screenshots"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'presets' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update their own preset screenshots" on storage.objects;
create policy "Users can update their own preset screenshots"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'presets' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'presets' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their own preset screenshots" on storage.objects;
create policy "Users can delete their own preset screenshots"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'presets' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ------------------------------------------------------------------------------
-- 7. GRANTS FOR DATA API ACCESS
-- ------------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.profiles to anon;

grant select, insert, update, delete on table public.presets to authenticated;
grant select on table public.presets to anon;

grant select, insert, delete on table public.preset_votes to authenticated;
grant select on table public.preset_votes to anon;

grant select, insert on table public.preset_reports to authenticated;
grant select, insert on table public.feedback to authenticated;

revoke execute on function public.toggle_preset_vote(uuid) from public, anon;
grant execute on function public.toggle_preset_vote(uuid) to authenticated;

revoke execute on function public.report_preset(uuid, text) from public, anon;
grant execute on function public.report_preset(uuid, text) to authenticated;
