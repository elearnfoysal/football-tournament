import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOut } from "@/components/admin-sign-out";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_NAV_ITEMS } from "@/lib/admin/modules";
import { requireAdmin } from "@/lib/supabase/require-admin";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { notice?: string; error?: string };
}) {
  const { supabase, user } = await requireAdmin();
  const [teams, players, matches, news] = await Promise.all([
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase.from("matches").select("id", { count: "exact", head: true }),
    supabase.from("news").select("id", { count: "exact", head: true }),
  ]);

  for (const [label, result] of [
    ["teams", teams],
    ["players", players],
    ["matches", matches],
    ["news", news],
  ] as const) {
    if (result.error) {
      console.error(`[admin:${label}]`, result.error.message);
      throw new Error(`Could not load ${label} from Supabase.`);
    }
  }

  const counts = [
    ["Teams", teams.count ?? 0, "/teams"],
    ["Players", players.count ?? 0, "/players"],
    ["Matches", matches.count ?? 0, "/matches"],
    ["News items", news.count ?? 0, "/news"],
  ] as const;

  return (
    <section className="container py-12">
      <AdminNav />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
          <h1 className="font-display text-4xl font-bold">Tournament admin</h1>
          <p className="mt-1 text-muted-foreground">Manage tournament modules and keep public pages up to date.</p>
        </div>
        <AdminSignOut />
      </div>

      {searchParams.notice && (
        <p role="status" className="mb-6 rounded-md border border-primary/30 bg-primary/10 p-3 text-sm">
          {searchParams.notice}
        </p>
      )}
      {searchParams.error && (
        <p role="alert" className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
          {searchParams.error === "not-admin"
            ? "This account does not have tournament administrator access."
            : "The requested admin action could not be completed."}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map(([label, count, href]) => (
          <Link key={label} href={href} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
              <CardContent><p className="font-display text-4xl font-extrabold text-primary">{count}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mb-4 mt-10 font-display text-2xl font-bold">Manage modules</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_NAV_ITEMS.filter((item) => item.href !== "/admin").map((item) => (
          <Link key={item.href} href={item.href} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader><CardTitle>{item.label}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">Open {item.label.toLowerCase()} manager</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
