import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Shield,
  Shirt,
  Trophy,
} from "lucide-react";
import { MatchCard, StatusBadge } from "@/components/match-card";
import { PlayerAvatar } from "@/components/player-avatar";
import { SectionHeader } from "@/components/section-header";
import { TeamLogo } from "@/components/team-logo";
import { Card, CardContent } from "@/components/ui/card";
import { POSITION_LABELS, ROUND_LABELS } from "@/lib/constants";
import { formatKickoff, formatLongDate, formatMatchDate } from "@/lib/format";
import { getTeamRecord, type MatchDetail, type PlayerDetail, type TeamDetail } from "@/lib/data/details";
import type { MatchWithTeams, TeamLite } from "@/types";

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center shadow-sm sm:p-5">
      <p className="font-display text-3xl font-extrabold tabular-nums text-primary sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {children}
    </Link>
  );
}

function TeamLink({ team, size = 52 }: { team: TeamLite; size?: number }) {
  return (
    <Link href={`/teams/${team.slug}`} className="flex min-w-0 flex-col items-center gap-2 text-center hover:text-primary">
      <TeamLogo name={team.name} src={team.logo_url} size={size} />
      <span className="max-w-full truncate font-semibold">{team.name}</span>
    </Link>
  );
}

export function PlayerDetailPage({ player }: { player: PlayerDetail }) {
  const stats = player.stats;
  const appearances = player.appearances.map((item) => item.match).filter((match): match is MatchWithTeams => Boolean(match));

  return (
    <section className="container py-8 sm:py-12">
      <BackLink href="/players">All players</BackLink>
      <Card className="overflow-hidden">
        <div className="pitch-stripes grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:p-8">
          <div className="mx-auto">
            {player.photo_url ? (
              <Image
                src={player.photo_url}
                alt={player.name}
                width={176}
                height={176}
                unoptimized
                className="h-36 w-36 rounded-full border-4 border-background object-cover object-top shadow-lg sm:h-44 sm:w-44"
              />
            ) : (
              <PlayerAvatar name={player.name} size={176} className="border-4 border-background shadow-lg" />
            )}
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <div className="mb-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">
                {POSITION_LABELS[player.position]}
              </span>
              {player.is_captain && (
                <span className="rounded-full bg-accent/25 px-3 py-1 text-xs font-bold uppercase text-accent-foreground">Captain</span>
              )}
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">{player.name}</h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground sm:justify-start">
              <span className="inline-flex items-center gap-1.5"><Shirt className="h-4 w-4" aria-hidden /> #{player.jersey_no}</span>
              <Link href={`/teams/${player.team.slug}`} className="inline-flex items-center gap-2 font-semibold hover:text-primary">
                <TeamLogo name={player.team.name} src={player.team.logo_url} size={24} />
                {player.team.name}
              </Link>
            </div>
            {player.bio && <p className="mx-auto mt-4 max-w-2xl whitespace-pre-line text-sm text-muted-foreground sm:mx-0 sm:text-base">{player.bio}</p>}
          </div>
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Matches" value={stats.matches_played} />
            <StatTile label="Goals" value={stats.goals} />
            <StatTile label="Assists" value={stats.assists} />
            <StatTile label="Yellow cards" value={stats.yellow_cards} />
            <StatTile label="Red cards" value={stats.red_cards} />
            <StatTile label="Own goals" value={stats.own_goals} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-10">
        <SectionHeader title="Match appearances" description="Matches where this player was included in the lineup." />
        {appearances.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {appearances.map((match) => <MatchCard key={match.id} match={match} />)}
          </div>
        ) : (
          <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No match appearances have been recorded yet.</CardContent></Card>
        )}
      </div>
    </section>
  );
}

function PlayerLink({ player }: { player: TeamDetail["players"][number] }) {
  return (
    <Link href={`/players/${player.player_id}`} className="flex min-w-0 items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-secondary/40">
      <PlayerAvatar name={player.name} src={player.photo_url} size={44} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{player.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{POSITION_LABELS[player.position]} · #{player.jersey_no}</span>
      </span>
      <span className="text-right">
        <span className="block font-display text-xl font-bold tabular-nums">{player.goals}</span>
        <span className="text-[11px] text-muted-foreground">goals</span>
      </span>
    </Link>
  );
}

export function TeamDetailPage({ data }: { data: TeamDetail }) {
  const { team, players, matches } = data;
  const record = getTeamRecord(matches, team.id);
  const bannerStyle = team.banner_url
    ? { backgroundImage: `linear-gradient(90deg, hsl(var(--background) / .96), hsl(var(--background) / .72)), url("${team.banner_url}")` }
    : undefined;

  return (
    <section className="container py-8 sm:py-12">
      <BackLink href="/teams">All teams</BackLink>
      <Card className="overflow-hidden">
        <div style={bannerStyle} className="pitch-stripes bg-cover bg-center p-5 sm:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            {team.logo_url ? (
              <Image src={team.logo_url} alt="" width={120} height={120} unoptimized className="h-24 w-24 shrink-0 object-contain sm:h-32 sm:w-32" />
            ) : (
              <TeamLogo name={team.name} size={120} />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{team.group?.name ?? "Tournament team"}</p>
              <h1 className="mt-1 font-display text-4xl font-extrabold sm:text-6xl">{team.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {[team.short_name, team.coach ? `Coach: ${team.coach}` : null].filter(Boolean).join(" · ") || "Tournament squad"}
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Played" value={record.played} />
            <StatTile label="Won" value={record.won} />
            <StatTile label="Drawn" value={record.drawn} />
            <StatTile label="Lost" value={record.lost} />
            <StatTile label="Goals for" value={record.goalsFor} />
            <StatTile label="Goals against" value={record.goalsAgainst} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-10">
        <SectionHeader title="Squad" description={`${players.length} ${players.length === 1 ? "player" : "players"} in the team`} />
        {players.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((player) => <PlayerLink key={player.player_id} player={player} />)}
          </div>
        ) : (
          <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">The squad has not been announced yet.</CardContent></Card>
        )}
      </div>

      <div className="mt-10">
        <SectionHeader title="Fixtures and results" />
        {matches.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((match) => <MatchCard key={match.id} match={match} />)}
          </div>
        ) : (
          <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No fixtures have been scheduled for this team.</CardContent></Card>
        )}
      </div>
    </section>
  );
}

function EventLabel({ type }: { type: MatchDetail["events"][number]["type"] }) {
  const labels = { goal: "Goal", assist: "Assist", yellow: "Yellow card", red: "Red card", own_goal: "Own goal" };
  return labels[type];
}

export function MatchDetailPage({ match }: { match: MatchDetail }) {
  const matchLabel = match.round === "group" && match.group ? match.group.name : ROUND_LABELS[match.round];

  return (
    <section className="container py-8 sm:py-12">
      <BackLink href="/matches">All fixtures</BackLink>
      <Card className="overflow-hidden">
        <div className="bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground sm:px-6">
          <span>{matchLabel}</span>
          <span className="mx-2 opacity-60">·</span>
          <span>{formatLongDate(match.kickoff_at)}</span>
        </div>
        <CardContent className="p-5 sm:p-8">
          <div className="mb-5 flex items-center justify-center gap-2"><StatusBadge status={match.status} /></div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
            <TeamLink team={match.home} size={64} />
            <div className="text-center">
              <p className="font-display text-4xl font-extrabold tabular-nums sm:text-6xl">
                {match.status === "scheduled" ? formatKickoff(match.kickoff_at) : `${match.home_score} - ${match.away_score}`}
              </p>
              {match.home_penalties !== null && match.away_penalties !== null && (
                <p className="mt-1 text-xs text-muted-foreground">Penalties {match.home_penalties} - {match.away_penalties}</p>
              )}
            </div>
            <TeamLink team={match.away} size={64} />
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 border-t pt-5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" aria-hidden />{formatMatchDate(match.kickoff_at)}</span>
            <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" aria-hidden />{formatKickoff(match.kickoff_at)}</span>
            {match.venue && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden />{match.venue}</span>}
          </div>
        </CardContent>
      </Card>

      {match.report && (
        <Card className="mt-6">
          <CardContent className="p-5 sm:p-6">
            <h2 className="font-display text-2xl font-bold">Match report</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{match.report}</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-10">
        <SectionHeader title="Match events" description="Goals, assists and cards recorded during the match." />
        {match.events.length ? (
          <Card>
            <ol className="divide-y">
              {match.events.map((event) => (
                <li key={event.id} className="flex items-center gap-3 p-4 sm:gap-4 sm:px-6">
                  <span className="w-12 shrink-0 rounded-md bg-secondary px-2 py-1 text-center text-sm font-bold tabular-nums">{event.minute}&apos;</span>
                  <span className={`h-3 w-2 shrink-0 rounded-sm ${event.type === "yellow" ? "bg-yellow-400" : event.type === "red" ? "bg-red-600" : "bg-primary"}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{event.player?.name ?? "Player not recorded"}</p>
                    <p className="truncate text-xs text-muted-foreground">{event.team.name} · <EventLabel type={event.type} /></p>
                  </div>
                  {event.player && (
                    <Link href={`/players/${event.player.id}`} className="shrink-0 text-xs font-semibold text-primary hover:underline">
                      View player
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        ) : (
          <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No match events have been recorded yet.</CardContent></Card>
        )}
      </div>

      <div className="mt-10">
        <SectionHeader title="Line-ups" description="Players recorded for each team in this match." />
        {match.lineups.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[match.home, match.away].map((team) => {
              const players = match.lineups
                .filter((lineup) => lineup.team.id === team.id)
                .sort((a, b) => Number(b.is_starter) - Number(a.is_starter) || a.player.jersey_no - b.player.jersey_no);
              return (
                <Card key={team.id}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-2 border-b pb-3">
                      <TeamLogo name={team.name} src={team.logo_url} size={32} />
                      <h3 className="font-display text-xl font-bold">{team.name}</h3>
                    </div>
                    {players.length ? (
                      <ul className="space-y-2">
                        {players.map(({ player, is_starter }) => (
                          <li key={player.id}>
                            <Link href={`/players/${player.id}`} className="flex min-w-0 items-center gap-3 rounded-md p-2 hover:bg-secondary/60">
                              <PlayerAvatar name={player.name} src={player.photo_url} size={36} />
                              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{player.name}</span>
                              <span className="text-xs tabular-nums text-muted-foreground">#{player.jersey_no}</span>
                              <span className="text-[10px] font-bold uppercase text-muted-foreground">{is_starter ? "Starter" : "Sub"}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="py-3 text-sm text-muted-foreground">No line-up recorded.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">Line-ups have not been recorded yet.</CardContent></Card>
        )}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href={`/teams/${match.home.slug}`} className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/50">
          <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-primary" aria-hidden /><span className="min-w-0 truncate font-semibold">{match.home.name} team profile</span></div>
        </Link>
        <Link href={`/teams/${match.away.slug}`} className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/50">
          <div className="flex items-center gap-3"><Trophy className="h-5 w-5 text-primary" aria-hidden /><span className="min-w-0 truncate font-semibold">{match.away.name} team profile</span></div>
        </Link>
      </div>
    </section>
  );
}
