-- Migration: 20260912000002_storage_and_reporting.sql
-- Description: Storage bucket for preset screenshots and community reporting / auto-quarantine

-- 1. Add moderation columns to presets
alter table public.presets
  add column if not exists is_hidden boolean not null default false,
  add column if not exists report_count integer not null default 0;

create index if not exists idx_presets_is_hidden on public.presets(is_hidden);

-- 2. Create preset_reports table
create table if not exists public.preset_reports (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  constraint unique_user_preset_report unique (preset_id, user_id)
);

create index if not exists idx_preset_reports_preset_id on public.preset_reports(preset_id);
create index if not exists idx_preset_reports_user_id on public.preset_reports(user_id);

alter table public.preset_reports enable row level security;

drop policy if exists "Authenticated users can report presets" on public.preset_reports;
create policy "Authenticated users can report presets"
  on public.preset_reports
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own reports" on public.preset_reports;
create policy "Users can view their own reports"
  on public.preset_reports
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 3. Atomic RPC for reporting a preset with 3-strike auto-quarantine
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

  -- 1. Insert report (idempotent per user)
  insert into public.preset_reports (preset_id, user_id, reason)
  values (p_preset_id, calling_user, p_reason)
  on conflict (preset_id, user_id) do nothing;

  -- If already reported by this user, do not double-increment
  if not found then
    return jsonb_build_object('action', 'already_reported', 'message', 'You have already reported this setup.');
  end if;

  -- 2. Increment report count and check 3-strike auto-quarantine threshold
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

revoke execute on function public.report_preset(uuid, text) from public, anon;
grant execute on function public.report_preset(uuid, text) to authenticated;

-- 4. Supabase Storage: 'presets' bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('presets', 'presets', true, 524288, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set
  public = true,
  file_size_limit = 524288,
  allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'];

-- Storage RLS
drop policy if exists "Preset screenshots are viewable by everyone" on storage.objects;
create policy "Preset screenshots are viewable by everyone"
  on storage.objects
  for select
  to public
  using (bucket_id = 'presets');

drop policy if exists "Authenticated users can upload preset screenshots" on storage.objects;
create policy "Authenticated users can upload preset screenshots"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'presets' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their own preset screenshots" on storage.objects;
create policy "Users can delete their own preset screenshots"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'presets' and
    (storage.foldername(name))[1] = (select auth.uid())::text
  );
