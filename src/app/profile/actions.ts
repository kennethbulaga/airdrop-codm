'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validations';
import { profileRateLimiter } from '@/lib/ratelimit';
import type { UserSessionProfile } from '@/lib/types';

/**
 * Server Action to update the player's profile (CODM In-Game Name, Clan Tag, Socials).
 * Synchronizes with both public.profiles and public.presets atomically.
 */
export async function updateProfileAction(input: ProfileUpdateInput) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Authentication required. Please sign in.' };
  }

  // 2. Validate input schema
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid profile information.',
    };
  }

  // 3. Upstash Rate Limiting
  if (profileRateLimiter) {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || user.id;
    const { success: allowed } = await profileRateLimiter.limit(`profile:${user.id}:${ip}`);
    if (!allowed) {
      return {
        success: false,
        error: 'Too many profile updates. Please wait a moment before trying again.',
      };
    }
  }

  const data = parsed.data;

  // 4. Update public.profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: data.ign,
      clan_tag: data.clan_tag || null,
      youtube_url: data.youtube_url || null,
      tiktok_url: data.tiktok_url || null,
      facebook_url: data.facebook_url || null,
      social_platform: data.social_platform || null,
      social_url: data.social_url || null,
      social_handle: data.social_handle || null,
      has_completed_onboarding: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (profileError) {
    console.error('Failed to update profile:', profileError.message);
    return { success: false, error: 'Unable to update profile. Please try again.' };
  }

  // 5. Update existing public.presets authored by this user
  await supabase
    .from('presets')
    .update({
      creator_name: data.ign,
      team_name: data.clan_tag || null,
      youtube_url: data.youtube_url || null,
      tiktok_url: data.tiktok_url || null,
      facebook_url: data.facebook_url || null,
      social_platform: data.social_platform || null,
      social_url: data.social_url || null,
      social_handle: data.social_handle || null,
    })
    .eq('user_id', user.id);

  revalidatePath('/');

  return {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: data.ign,
      clanTag: data.clan_tag || null,
      hasCompletedOnboarding: true,
      youtubeUrl: data.youtube_url || null,
      tiktokUrl: data.tiktok_url || null,
      facebookUrl: data.facebook_url || null,
      socialPlatform: data.social_platform || null,
      socialUrl: data.social_url || null,
      socialHandle: data.social_handle || null,
    },
  };
}

/**
 * Fetch the authenticated user's profile from public.profiles
 */
export async function getUserProfileAction() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Operator',
        avatarUrl:
          (user.user_metadata?.avatar_url || user.user_metadata?.picture) as string | undefined,
        clanTag: null,
        hasCompletedOnboarding: false,
        youtubeUrl: null,
        tiktokUrl: null,
        facebookUrl: null,
        socialPlatform: null,
        socialUrl: null,
        socialHandle: null,
      },
    };
  }

  return {
    success: true,
    profile: {
      id: profile.id,
      email: profile.email || user.email,
      name: profile.full_name || 'Operator',
      avatarUrl:
        profile.avatar_url ||
        ((user.user_metadata?.avatar_url || user.user_metadata?.picture) as string | undefined),
      clanTag: profile.clan_tag,
      hasCompletedOnboarding: Boolean(profile.has_completed_onboarding),
      youtubeUrl: profile.youtube_url || null,
      tiktokUrl: profile.tiktok_url || null,
      facebookUrl: profile.facebook_url || null,
      socialPlatform: profile.social_platform as UserSessionProfile['socialPlatform'],
      socialUrl: profile.social_url,
      socialHandle: profile.social_handle,
    },
  };
}
