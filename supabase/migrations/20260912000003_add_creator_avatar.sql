-- ==============================================================================
-- Migration: 20260912000003_add_creator_avatar.sql
-- Description: Add creator_avatar_url column to public.presets and backfill from profiles
-- ==============================================================================

alter table public.presets
add column if not exists creator_avatar_url text;

-- Backfill existing presets with creator's avatar from profiles
update public.presets p
set creator_avatar_url = pr.avatar_url
from public.profiles pr
where p.user_id = pr.id
and pr.avatar_url is not null;
