import { createClient } from '@/lib/supabase/server';
import type { ItemCategory, PostRecord } from './types';

/**
 * Server Component query to fetch presets from Supabase with optional category filtering.
 * Strictly queries the PostgreSQL database with zero mock data.
 */
export async function getPresets(category?: ItemCategory): Promise<PostRecord[]> {
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

    return (data as unknown as PostRecord[]) || [];
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
 * Server Component query to fetch preset IDs voted by the currently logged-in user.
 */
export async function getUserVotedPresetIds(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

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
