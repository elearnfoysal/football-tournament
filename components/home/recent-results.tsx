import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ResultRow } from "@/components/match-card";
import { SectionHeader } from "@/components/section-header";
import type { MatchWithTeams } from "@/types";

export function RecentResults({ matches }: { matches: MatchWithTeams[] }) {
  return (
    <section className="min-w-0">
      <SectionHeader title="Recent results" href="/matches?tab=completed" linkLabel="All results" />
      {matches.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No results yet" description="Final scores will appear after the first match." />
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <ResultRow key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}
