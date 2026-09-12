-- ==============================================================================
-- Migration: 20260912000001_presets_and_voting.sql
-- Description: Community presets storage, upvoting system, indexes, and RLS
-- Standards: Supabase Postgres Best Practices (RLS, Foreign Keys, Security Definer)
-- ==============================================================================

-- 1. Create Presets Table
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

-- 2. Foreign Key & Performance Indexes on Presets
create index if not exists idx_presets_user_id on public.presets(user_id);
create index if not exists idx_presets_category on public.presets(category);
create index if not exists idx_presets_created_at on public.presets(created_at desc);
create index if not exists idx_presets_upvotes on public.presets(upvotes desc);

-- 3. Create Preset Votes Table (1 vote per user per preset)
create table if not exists public.preset_votes (
  user_id uuid references auth.users(id) on delete cascade not null,
  preset_id uuid references public.presets(id) on delete cascade not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (user_id, preset_id)
);

-- 4. Foreign Key Indexes on Votes
create index if not exists idx_preset_votes_preset_id on public.preset_votes(preset_id);
create index if not exists idx_preset_votes_user_id on public.preset_votes(user_id);

-- 5. Enable Row-Level Security (RLS)
alter table public.presets enable row level security;
alter table public.preset_votes enable row level security;

-- 6. Presets RLS Policies
create policy "Presets are viewable by everyone"
  on public.presets
  for select
  to public
  using (true);

create policy "Authenticated users can create presets"
  on public.presets
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own presets"
  on public.presets
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own presets"
  on public.presets
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 7. Preset Votes RLS Policies
create policy "Preset votes are viewable by everyone"
  on public.preset_votes
  for select
  to public
  using (true);

create policy "Authenticated users can vote"
  on public.preset_votes
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own vote"
  on public.preset_votes
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 8. Atomic Vote Toggle Stored Function (Protects against Race Conditions)
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
  -- Validate caller authentication
  v_user_id := (select auth.uid());
  if v_user_id is null then
    raise exception 'Authentication required to vote';
  end if;

  -- Check if user already voted
  select exists(
    select 1 from public.preset_votes
    where user_id = v_user_id and preset_id = p_preset_id
  ) into v_has_voted;

  if v_has_voted then
    -- Remove vote
    delete from public.preset_votes
    where user_id = v_user_id and preset_id = p_preset_id;

    -- Decrement counter atomically
    update public.presets
    set upvotes = greatest(0, upvotes - 1),
        updated_at = timezone('utc'::text, now())
    where id = p_preset_id
    returning upvotes into v_new_count;

    return jsonb_build_object('voted', false, 'upvotes', v_new_count);
  else
    -- Add vote
    insert into public.preset_votes (user_id, preset_id)
    values (v_user_id, p_preset_id);

    -- Increment counter atomically
    update public.presets
    set upvotes = upvotes + 1,
        updated_at = timezone('utc'::text, now())
    where id = p_preset_id
    returning upvotes into v_new_count;

    return jsonb_build_object('voted', true, 'upvotes', v_new_count);
  end if;
end;
$$;

-- 9. Grant Permissions for Data API
grant select, insert, update, delete on table public.presets to authenticated;
grant select on table public.presets to anon;

grant select, insert, delete on table public.preset_votes to authenticated;
grant select on table public.preset_votes to anon;

grant execute on function public.toggle_preset_vote(uuid) to authenticated;
