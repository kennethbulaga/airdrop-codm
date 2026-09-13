'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { UserSessionProfile } from '@/lib/types';

/**
 * Initiates the Google OAuth sign-in flow via PKCE.
 * Generates the callback URL using the current request origin and redirects to Google.
 */
export async function signInWithGoogle(redirectToPath: string = '/') {
  const supabase = await createClient();
  const headerList = await headers();
  const host = headerList.get('host') || 'localhost:3000';
  const protocol = headerList.get('x-forwarded-proto') || 'http';
  const origin = `${protocol}://${host}`;

  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectToPath)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google OAuth initialization error:', error.message);
    throw new Error(error.message);
  }

  if (data?.url) {
    redirect(data.url);
  }
}

/**
 * Signs out the current user session and refreshes active feeds.
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Fetches the currently authenticated user session safely using getUser().
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Fetches a minimal serializable user profile for RSC boundaries.
 * Strictly complies with Vercel React Best Practices rule: server-serialization.
 */
export async function getCurrentUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      name:
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Operator',
      avatarUrl:
        profile?.avatar_url ||
        ((user.user_metadata?.avatar_url || user.user_metadata?.picture) as string | undefined),
      clanTag: profile?.clan_tag || null,
      hasCompletedOnboarding: Boolean(profile?.has_completed_onboarding),
      youtubeUrl: profile?.youtube_url || null,
      tiktokUrl: profile?.tiktok_url || null,
      facebookUrl: profile?.facebook_url || null,
      socialPlatform: (profile?.social_platform as UserSessionProfile['socialPlatform']) || null,
      socialUrl: profile?.social_url || null,
      socialHandle: profile?.social_handle || null,
    };
  } catch {
    return {
      id: user.id,
      email: user.email,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Operator',
      avatarUrl: (user.user_metadata?.avatar_url || user.user_metadata?.picture) as string | undefined,
      clanTag: null,
      hasCompletedOnboarding: false,
      youtubeUrl: null,
      tiktokUrl: null,
      facebookUrl: null,
      socialPlatform: null,
      socialUrl: null,
      socialHandle: null,
    };
  }
}
