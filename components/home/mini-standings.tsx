import Link from "next/link";
import { ListOrdered } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import { TeamLogo } from "@/components/team-logo";
import { buttonVariants } from "@/components/ui/button";
import { signed } from "@/lib/format";
import type { StandingRow } from "@/types";

export function MiniStandings({ rows }: { rows: StandingRow[] }) {
  return (
    <section className="min-w-0">
      <SectionHeader title="Top of the table" />
      {rows.length === 0 ? (
        <EmptyState icon={ListOrdered} title="Table not available" description="Standings appear once teams are added." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">Top four teams by points</caption>
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th scope="col" className="w-10 py-3 pl-4 font-medium">
                    Pos
                  </th>
                  <th scope="col" className="py-3 font-medium">
                    Team
                  </th>
                  <th scope="col" className="px-2 py-3 text-right font-medium">
                    P
                  </th>
                  <th scope="col" className="px-2 py-3 text-right font-medium">
                    GD
                  </th>
                  <th scope="col" className="py-3 pl-2 pr-4 text-right font-medium">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.team_id} className="border-b last:border-0">
                    <td className={`py-3 pl-4 font-display text-lg font-bold ${i === 0 ? "text-primary" : ""}`}>{i + 1}</td>
                    <td className="py-3">
                      <Link href={`/teams/${row.slug}`} className="flex items-center gap-3 font-semibold hover:underline">
                        <TeamLogo name={row.name} src={row.logo_url} size={28} />
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">{row.played}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{signed(row.goal_diff)}</td>
                    <td className="py-3 pl-2 pr-4 text-right font-display text-xl font-extrabold tabular-nums">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/standings" className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}>
            View full table
          </Link>
        </>
      )}
    </section>
  );
}
