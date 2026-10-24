import { createBrowserClient } from "@supabase/ssr";

// Browser client: used for Realtime subscriptions and the admin panel.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
