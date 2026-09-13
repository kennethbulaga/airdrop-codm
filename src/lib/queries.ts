import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redis } from '@/lib/ratelimit';
import type { ItemCategory, PostRecord, UserSessionProfile } from './types';

const FEED_CACHE_TTL_SECONDS = 60;

/**
 * Purges the Upstash Redis feed cache upon mutations (insert, delete, upvote).
 */
export async function invalidateFeedCache(): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(
      'airdrop:feed:all',
      'airdrop:feed:hud',
      'airdrop:feed:sensitivity',
      'airdrop:feed:graphics'
    );
  } catch (err) {
    console.warn('Redis feed cache invalidation failed (non-blocking):', err);
  }
}

/**
 * Server Component query to fetch presets with an Upstash Redis Cache-Aside layer.
 * Drastically reduces Supabase 2GB egress and database compute while maintaining sub-second reads.
 */
export async function getPresets(category?: ItemCategory): Promise<PostRecord[]> {
  const cacheKey = category ? `airdrop:feed:${category}` : 'airdrop:feed:all';

  // 1. Check Upstash Redis Cache-Aside Layer (Fast-path ~10ms, protects Supabase Free Tier)
  if (redis) {
    try {
      const cached = await redis.get<PostRecord[]>(cacheKey);
      if (cached && Array.isArray(cached)) {
        return cached;
      }
    } catch (err) {
      if ((err as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE') {
        throw err;
      }
      console.warn('Redis cache lookup failed, falling back to Supabase:', err);
    }
  }

  // 2. Cache Miss: Query Supabase PostgreSQL directly
  try {
    const supabase = await createClient();
    let query = supabase
      .from('presets')
      .select('*')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching presets from Supabase:', error.message);
      return [];
    }

    const records = (data as unknown as PostRecord[]) || [];

    // 3. Write-back to Redis with 60-second TTL (non-blocking)
    if (redis && records.length > 0) {
      redis.set(cacheKey, records, { ex: FEED_CACHE_TTL_SECONDS }).catch((writeErr) => {
        console.warn('Redis cache populate failed (non-blocking):', writeErr);
      });
    }

    return records;
  } catch (err) {
    if ((err as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    console.error('Failed to query presets:', err);
    return [];
  }
}

/**
 * Server Component query to fetch the current top trending preset by upvotes.
 */
export async function getFeaturedPreset(): Promise<PostRecord | undefined> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .eq('is_hidden', false)
      .order('upvotes', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return undefined;
    }

    return data as unknown as PostRecord;
  } catch {
    return undefined;
  }
}

/**
 * Cached Server Component query to fetch current user session once per request.
 */
export const getCachedCurrentUser = cache(async () => {
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
});

/**
 * Cached Server Component query to fetch user session profile once per request.
 */
export const getCurrentUserProfile = cache(async (): Promise<UserSessionProfile | null> => {
  const user = await getCachedCurrentUser();
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
      name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Operator',
      email: user.email || '',
      clanTag: profile?.clan_tag || null,
      avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      hasCompletedOnboarding: Boolean(profile?.has_completed_onboarding),
      youtubeUrl: profile?.youtube_url || null,
      tiktokUrl: profile?.tiktok_url || null,
      facebookUrl: profile?.facebook_url || null,
    };
  } catch {
    return null;
  }
});

/**
 * Server Component query to fetch preset IDs voted by the currently logged-in user.
 */
export async function getUserVotedPresetIds(): Promise<string[]> {
  try {
    const user = await getCachedCurrentUser();
    if (!user) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('preset_votes')
      .select('preset_id')
      .eq('user_id', user.id);

    if (error || !data) return [];

    return data.map((row) => row.preset_id);
  } catch (err) {
    if ((err as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    return [];
  }
}
