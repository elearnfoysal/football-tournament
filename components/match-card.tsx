import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { TeamLogo } from "@/components/team-logo";
import { Badge } from "@/components/ui/badge";
import { ROUND_LABELS } from "@/lib/constants";
import { formatKickoff, formatMatchDate } from "@/lib/format";
import type { MatchStatus, MatchWithTeams, TeamLite } from "@/types";

export function StatusBadge({ status }: { status: MatchStatus }) {
  switch (status) {
    case "live":
      return (
        <Badge variant="live">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
          Live
        </Badge>
      );
    case "finished":
      return <Badge variant="muted">FT</Badge>;
    case "postponed":
      return <Badge variant="accent">Postponed</Badge>;
    default:
      return <Badge variant="outline">Scheduled</Badge>;
  }
}

function TeamSide({ team }: { team: TeamLite }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <TeamLogo name={team.name} src={team.logo_url} size={48} />
      <span className="w-full truncate text-sm font-semibold">{team.name}</span>
    </div>
  );
}

function matchLabel(match: MatchWithTeams) {
  return match.round === "group" && match.group ? match.group.name : ROUND_LABELS[match.round];
}

/** Card used for upcoming and live fixtures. */
export function MatchCard({ match }: { match: MatchWithTeams }) {
  const scheduled = match.status === "scheduled";

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{matchLabel(match)}</span>
        <StatusBadge status={match.status} />
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSide team={match.home} />
        <div className="text-center font-display text-3xl font-extrabold tabular-nums">
          {scheduled ? (
            <span className="text-2xl">{formatKickoff(match.kickoff_at)}</span>
          ) : (
            <span>
              {match.home_score}
              <span className="px-1 text-muted-foreground">-</span>
              {match.away_score}
            </span>
          )}
        </div>
        <TeamSide team={match.away} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">
          {formatMatchDate(match.kickoff_at)}
          {match.venue ? `, ${match.venue}` : ""}
        </span>
        {scheduled && <Countdown target={match.kickoff_at} variant="compact" className="shrink-0 text-xs" />}
      </div>
    </Link>
  );
}

/** Compact row used for results lists. */
export function ResultRow({ match }: { match: MatchWithTeams }) {
  const homeWon = match.home_score > match.away_score;
  const awayWon = match.away_score > match.home_score;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex min-w-0 items-center justify-end gap-3">
        <span className={`truncate text-sm ${homeWon ? "font-bold" : "font-medium"}`}>{match.home.name}</span>
        <TeamLogo name={match.home.name} src={match.home.logo_url} size={32} />
      </div>

      <div className="text-center">
        <div className="rounded-md bg-secondary px-3 py-1 font-display text-xl font-extrabold tabular-nums">
          {match.home_score} - {match.away_score}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">{formatMatchDate(match.kickoff_at)}</div>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <TeamLogo name={match.away.name} src={match.away.logo_url} size={32} />
        <span className={`truncate text-sm ${awayWon ? "font-bold" : "font-medium"}`}>{match.away.name}</span>
      </div>
    </Link>
  );
}
