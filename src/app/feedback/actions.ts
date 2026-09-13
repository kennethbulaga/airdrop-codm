'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { feedbackSchema, type FeedbackInput } from '@/lib/validations';
import { feedbackRateLimiter } from '@/lib/ratelimit';

/**
 * Server Action to submit community feedback, bug reports, and mode suggestions.
 * Strictly restricted to authenticated operators.
 */
export async function submitFeedbackAction(input: FeedbackInput) {
  const supabase = await createClient();

  // 1. Mandatory authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: 'Authentication required. Please sign in with Google to send feedback.',
    };
  }

  // 2. Validate input schema
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Please provide valid feedback.',
    };
  }

  // 3. Upstash Rate Limiting per authenticated user
  if (feedbackRateLimiter) {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || user.id;
    const { success: allowed } = await feedbackRateLimiter.limit(`feedback:${user.id}:${ip}`);
    if (!allowed) {
      return {
        success: false,
        error: 'Too many submissions. Please wait a moment before sending more feedback.',
      };
    }
  }

  const { category, message } = parsed.data;

  // 4. Insert into public.feedback
  const { error: insertError } = await supabase.from('feedback').insert({
    user_id: user.id,
    category,
    message,
    contact_info: null,
  });

  if (insertError) {
    console.error('Failed to submit feedback:', insertError);
    return {
      success: false,
      error: 'Failed to record feedback. Please try again.',
    };
  }

  return { success: true };
}
