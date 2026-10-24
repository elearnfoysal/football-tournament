import Link from "next/link";
import { Goal } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PlayerAvatar } from "@/components/player-avatar";
import { SectionHeader } from "@/components/section-header";
import type { PlayerStat } from "@/types";

export function TopScorersWidget({ scorers }: { scorers: PlayerStat[] }) {
  return (
    <section className="min-w-0">
      <SectionHeader title="Top scorers" href="/stats" linkLabel="All stats" />
      {scorers.length === 0 ? (
        <EmptyState icon={Goal} title="No goals yet" description="The scoring chart starts with the first goal." />
      ) : (
        <ol className="divide-y rounded-lg border bg-card">
          {scorers.map((player, i) => (
            <li key={player.player_id}>
              <Link
                href={`/players/${player.player_id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span className={`w-5 text-center font-display text-lg font-bold ${i === 0 ? "text-accent" : "text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <PlayerAvatar name={player.name} src={player.photo_url} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{player.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{player.team_name}</span>
                </span>
                <span className="text-right">
                  <span className="block font-display text-2xl font-extrabold leading-none tabular-nums">{player.goals}</span>
                  <span className="text-xs text-muted-foreground">{player.goals === 1 ? "goal" : "goals"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
