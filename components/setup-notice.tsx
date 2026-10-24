import { DatabaseZap } from "lucide-react";

export function SetupNotice() {
  return (
    <div className="container py-20">
      <div className="mx-auto max-w-xl rounded-xl border bg-card p-8 text-center">
        <DatabaseZap className="mx-auto h-10 w-10 text-primary" aria-hidden />
        <h1 className="mt-4 font-display text-4xl font-bold">Connect your database</h1>
        <p className="mt-3 text-muted-foreground">
          This site needs two environment variables before it can load tournament data:
        </p>
        <p className="mt-4 font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</p>
        <p className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Copy .env.example to .env.local, fill in both values from your Supabase project, then restart the dev server.
        </p>
      </div>
    </div>
  );
}
