-- ==============================================================================
-- Migration: 20260912000000_auth_profiles.sql
-- Description: Public profiles and automatic user creation trigger from Google OAuth
-- Standards: Supabase Postgres Best Practices (RLS, Foreign Keys, Security Definer)
-- ==============================================================================

-- 1. Create Public Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  clan_tag text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Index Primary/Foreign Key
create index if not exists idx_profiles_id on public.profiles(id);

-- 3. Enable Row-Level Security (RLS)
alter table public.profiles enable row level security;

-- 4. RLS Policies
-- Public read: anyone can read player profiles
create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  to public
  using (true);

-- Authenticated update: users can only update their own profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 5. Automated Profile Sync Trigger on Signup (Google OAuth)
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

-- 6. Attach Trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. Grant Permissions to anon & authenticated roles for Data API
grant usage on schema public to anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant select on table public.profiles to anon;
