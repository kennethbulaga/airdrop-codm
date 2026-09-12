import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers using Next.js 16 asynchronous cookies().
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // In Server Components, setAll can throw if headers have already been sent.
            // This is safe to ignore when middleware is in place to refresh sessions.
          }
        },
      },
    }
  );
}
