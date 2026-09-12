import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authRateLimiter } from '@/lib/ratelimit';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Sanitize next parameter to prevent open-redirect vulnerabilities
  const safeNext =
    next.startsWith('/') && !next.startsWith('//') && !next.includes('://')
      ? next
      : '/';

  // Apply Upstash rate limiting if Redis is configured
  if (authRateLimiter) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const { success } = await authRateLimiter.limit(ip);
    if (!success) {
      return new NextResponse(
        'Too many authentication requests. Please wait a minute and try again.',
        { status: 429 }
      );
    }
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safeNext}`);
      } else {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    }

    console.error('OAuth code exchange failed:', error.message);
  }

  // Return to homepage with error indicator
  return NextResponse.redirect(`${origin}/?auth_error=oauth_failed`);
}
