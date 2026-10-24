import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MatchCard } from "@/components/match-card";
import { SectionHeader } from "@/components/section-header";
import type { MatchWithTeams } from "@/types";

export function UpcomingMatches({ matches }: { matches: MatchWithTeams[] }) {
  return (
    <section className="container py-12">
      <SectionHeader title="Upcoming matches" href="/matches" linkLabel="All fixtures" />
      {matches.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No upcoming matches"
          description="New fixtures will show up here as soon as they are scheduled."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}
