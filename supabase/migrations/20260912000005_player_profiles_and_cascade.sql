-- Add columns to public.profiles if they don't exist
alter table public.profiles
  add column if not exists has_completed_onboarding boolean not null default false,
  add column if not exists social_platform text check (social_platform is null or social_platform in ('YouTube', 'TikTok', 'Facebook', 'Twitch', 'X')),
  add column if not exists social_url text,
  add column if not exists social_handle text;

-- Create sync trigger from profiles to presets
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
    social_platform = new.social_platform,
    social_url = new.social_url,
    social_handle = new.social_handle
  where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists on_profile_updated_sync_presets on public.profiles;
create trigger on_profile_updated_sync_presets
  after update of full_name, clan_tag, social_platform, social_url, social_handle on public.profiles
  for each row execute function public.sync_profile_to_presets();
