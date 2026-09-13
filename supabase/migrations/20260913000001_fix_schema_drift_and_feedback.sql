-- ==============================================================================
-- Migration: 20260913000001_fix_schema_drift_and_feedback.sql
-- Description:
--   1. Create public.feedback table with RLS, constraints, and indexes.
--   2. Add missing social URL columns to profiles and presets.
--   3. Secure presets table: prevent author tampering with upvotes/moderation.
--   4. Update presets SELECT RLS policy to hide quarantined items from public.
--   5. Add CHECK constraints for mode and fps_target on presets.
--   6. Add partial composite indexes for lightning-fast feed and trending queries.
--   7. Secure toggle_preset_vote and preset_reports permissions.
--   8. Add storage UPDATE policy for presets bucket.
--   9. Drop redundant index on profiles.id.
-- ==============================================================================

BEGIN;

-- 1. Create Feedback Table (if not exists)
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

grant select, insert on table public.feedback to authenticated;


-- 2. Backfill Missing URL Columns on profiles and presets
alter table public.profiles
  add column if not exists youtube_url text,
  add column if not exists tiktok_url text,
  add column if not exists facebook_url text;

alter table public.presets
  add column if not exists youtube_url text,
  add column if not exists tiktok_url text,
  add column if not exists facebook_url text;


-- 3. Add CHECK constraints on presets for mode and fps_target
alter table public.presets drop constraint if exists presets_mode_check;
alter table public.presets add constraint presets_mode_check
  check (mode in ('Battle Royale', 'Multiplayer'));

alter table public.presets drop constraint if exists presets_fps_target_check;
alter table public.presets add constraint presets_fps_target_check
  check (fps_target is null or fps_target in ('Low', 'Medium', 'High', 'Very High', 'Max', 'Ultra'));


-- 4. Prevent Non-Admin Tampering with Presets Moderation & Counter Columns
create or replace function public.protect_preset_immutable_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- If invoked by regular API roles, disallow modifying upvotes, is_hidden, report_count, or is_verified directly
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


-- 5. Update Presets SELECT Policy to Protect Quarantined Setups
drop policy if exists "Presets are viewable by everyone" on public.presets;
create policy "Presets are viewable by everyone"
  on public.presets
  for select
  to public
  using (is_hidden = false or (select auth.uid()) = user_id);


-- 6. Add High-Performance Partial Composite Indexes
create index if not exists idx_presets_feed_active
  on public.presets(category, created_at desc)
  where is_hidden = false;

create index if not exists idx_presets_trending_active
  on public.presets(upvotes desc)
  where is_hidden = false;


-- 7. Secure Functions and Grants
revoke execute on function public.toggle_preset_vote(uuid) from public, anon;
grant execute on function public.toggle_preset_vote(uuid) to authenticated;

grant select, insert on table public.preset_reports to authenticated;


-- 8. Add Storage UPDATE Policy for Presets Bucket Upserts
drop policy if exists "Users can update their own preset screenshots" on storage.objects;
create policy "Users can update their own preset screenshots"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'presets' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'presets' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );


-- 9. Drop Redundant Index on profiles.id (PK already indexed)
drop index if exists public.idx_profiles_id;

COMMIT;
