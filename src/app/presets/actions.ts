'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { presetSubmissionSchema, type PresetSubmissionInput } from '@/lib/validations';
import { submitRateLimiter, voteRateLimiter, reportRateLimiter } from '@/lib/ratelimit';
import { invalidateFeedCache } from '@/lib/queries';

/**
 * Server Action to submit a new preset into the Supabase presets table.
 * Strictly verifies the authenticated user session and validates input via Zod.
 */
export async function createPresetAction(input: PresetSubmissionInput) {
  const supabase = await createClient();

  // 1. Authenticate user session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Authentication required. Please sign in.' };
  }

  // 2. Validate input schema
  const parsed = presetSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input data.',
    };
  }

  // 3. Rate limiting check (Upstash Redis)
  if (submitRateLimiter) {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || user.id;
    const { success: allowed } = await submitRateLimiter.limit(ip);
    if (!allowed) {
      return {
        success: false,
        error: 'Too many submissions. Please wait a moment before sharing another setup.',
      };
    }
  }

  const data = parsed.data;

  // 4. Insert into public.presets
  const avatarUrl =
    (user.user_metadata?.avatar_url || user.user_metadata?.picture) as string | null;

  const { error: insertError } = await supabase.from('presets').insert({
    user_id: user.id,
    creator_name: data.creator_name,
    creator_avatar_url: avatarUrl,
    team_name: data.team_name || null,
    category: data.category,
    code: data.code,
    season: 'S8',
    mode: data.mode,
    playstyle: data.playstyle || null,
    device_type: data.device_type,
    device_name: data.device_name || null,
    grip: data.grip || null,
    gyro: data.gyro ?? null,
    graphic_quality: data.graphic_quality || null,
    fps_target: data.fps_target || null,
    youtube_url: data.youtube_url || null,
    tiktok_url: data.tiktok_url || null,
    facebook_url: data.facebook_url || null,
    social_platform: data.social_platform || null,
    social_handle: data.social_handle || null,
    social_url: data.social_handle
      ? data.social_platform === 'TikTok'
        ? `https://www.tiktok.com/@${data.social_handle.replace(/^@/, '')}`
        : data.social_platform === 'YouTube'
          ? `https://youtube.com/@${data.social_handle.replace(/^@/, '')}`
          : null
      : null,
    image_url: data.image_url || null,
    description: data.description || null,
    upvotes: 0,
    is_verified: false,
  });

  if (insertError) {
    console.error('Failed to create preset:', insertError.message);
    return { success: false, error: 'Unable to publish setup. Check your inputs and try again.' };
  }

  // 5. Revalidate feed cache
  await invalidateFeedCache();
  revalidatePath('/');
  return { success: true };
}

/**
 * Server Action to atomically toggle a preset vote.
 * Executes the PostgreSQL toggle_preset_vote RPC function.
 */
export async function togglePresetVoteAction(presetId: string) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Sign in to vote on setups.' };
  }

  // 2. Rate limiting check (Upstash Redis)
  if (voteRateLimiter) {
    const { success: allowed } = await voteRateLimiter.limit(user.id);
    if (!allowed) {
      return {
        success: false,
        error: 'Voting too fast. Please slow down.',
      };
    }
  }

  // 3. Execute atomic RPC function
  const { data, error } = await supabase.rpc('toggle_preset_vote', {
    p_preset_id: presetId,
  });

  if (error) {
    console.error('Failed to toggle vote:', error.message);
    return { success: false, error: error.message };
  }

  await invalidateFeedCache();
  revalidatePath('/');
  return { success: true, data };
}

/**
 * Server Action to report a preset for inappropriate content or spam.
 * Triggers 3-strike auto-quarantine via public.report_preset RPC.
 */
export async function reportPresetAction(
  presetId: string,
  reason: string = 'inappropriate_content'
) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Please sign in to report this setup.' };
  }

  // 2. Rate limiting check (Upstash Redis: 5 reports per 60s)
  if (reportRateLimiter) {
    const { success: allowed } = await reportRateLimiter.limit(`report:${user.id}`);
    if (!allowed) {
      return {
        success: false,
        error: 'Too many reports submitted. Please wait a moment.',
      };
    }
  }

  // 3. Execute atomic RPC function
  const { data, error } = await supabase.rpc('report_preset', {
    p_preset_id: presetId,
    p_reason: reason,
  });

  if (error) {
    console.error('Failed to report preset:', error.message);
    return { success: false, error: 'Unable to submit report. Please try again.' };
  }

  await invalidateFeedCache();
  revalidatePath('/');
  return { success: true, data };
}

/**
 * Server Action to delete a user's own preset.
 * Strictly verifies user ownership before removing the record and associated screenshot.
 */
export async function deletePresetAction(presetId: string) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Sign in to delete your setup.' };
  }

  // 2. Fetch preset to retrieve screenshot path
  const { data: preset } = await supabase
    .from('presets')
    .select('user_id, image_url')
    .eq('id', presetId)
    .single();

  if (!preset || preset.user_id !== user.id) {
    return { success: false, error: 'Unauthorized to delete this setup.' };
  }

  // 3. Delete screenshot from storage if present
  if (preset.image_url) {
    try {
      const urlParts = preset.image_url.split('/presets/');
      if (urlParts[1]) {
        const storagePath = urlParts[1];
        await supabase.storage.from('presets').remove([decodeURIComponent(storagePath)]);
      }
    } catch {
      // Non-fatal if already removed
    }
  }

  // 4. Delete preset row
  const { error: deleteError } = await supabase
    .from('presets')
    .delete()
    .eq('id', presetId)
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Failed to delete preset:', deleteError.message);
    return { success: false, error: 'Unable to delete setup. Please try again.' };
  }

  await invalidateFeedCache();
  revalidatePath('/');
  return { success: true };
}
