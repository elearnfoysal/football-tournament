import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free, anon-key client for public pages. Because it never touches
 * cookies(), pages that use it can be statically generated and revalidated
 * (ISR). Every request it makes is cached for `revalidate` seconds.
 */
export function createPublicClient(revalidate = 60) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate } }),
    },
  });
}
