import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { Rise } from "@/components/rise";
import { StatusBadge } from "@/components/match-card";
import { TeamLogo } from "@/components/team-logo";
import { buttonVariants } from "@/components/ui/button";
import { formatDateRange, formatKickoff, formatMatchDate } from "@/lib/format";
import type { MatchWithTeams, TournamentSettings } from "@/types";

function Spotlight({ match }: { match: MatchWithTeams | null }) {
  if (!match) {
    return (
      <div className="rounded-xl border bg-card/80 p-6 backdrop-blur">
        <p className="font-display text-2xl font-bold">No matches scheduled yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Fixtures will appear here as soon as they are published.</p>
      </div>
    );
  }

  const live = match.status === "live";

  return (
    <div className="rounded-xl border bg-card/80 p-5 backdrop-blur sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">{live ? "Playing now" : "Next match"}</h2>
        <StatusBadge status={match.status} />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamLogo name={match.home.name} src={match.home.logo_url} size={64} />
          <span className="text-sm font-semibold">{match.home.name}</span>
        </div>
        <span className="font-display text-2xl font-bold text-muted-foreground">
          {live ? (
            <span className="text-4xl font-extrabold text-foreground tabular-nums">
              {match.home_score} - {match.away_score}
            </span>
          ) : (
            "vs"
          )}
        </span>
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamLogo name={match.away.name} src={match.away.logo_url} size={64} />
          <span className="text-sm font-semibold">{match.away.name}</span>
        </div>
      </div>

      {!live && <Countdown target={match.kickoff_at} className="mt-6" />}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {formatMatchDate(match.kickoff_at)}, {formatKickoff(match.kickoff_at)}
        </span>
        {match.venue && <span>{match.venue}</span>}
      </div>

      <Link
        href={`/matches/${match.id}`}
        className={buttonVariants({ variant: live ? "accent" : "outline", className: "mt-5 w-full" })}
      >
        {live ? "Follow the match" : "Match details"}
      </Link>
    </div>
  );
}

export function Hero({
  settings,
  liveMatch,
  nextMatch,
}: {
  settings: TournamentSettings;
  liveMatch: MatchWithTeams | null;
  nextMatch: MatchWithTeams | null;
}) {
  const dates = formatDateRange(settings.start_date, settings.end_date);

  return (
    <section className="relative overflow-hidden border-b">
      <div aria-hidden className="pitch-stripes absolute inset-0" />
      {/* Centre circle and halfway line, like the pitch seen from above */}
      <svg
        aria-hidden
        viewBox="0 0 800 800"
        className="pointer-events-none absolute -right-48 top-1/2 h-[860px] w-[860px] -translate-y-1/2 text-primary/25"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <circle cx="400" cy="400" r="230" />
        <circle cx="400" cy="400" r="7" fill="currentColor" />
        <line x1="400" y1="0" x2="400" y2="800" />
      </svg>

      <div className="container relative grid gap-10 py-14 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:py-24">
        <div>
          <Rise>
            <div className="flex items-center gap-4">
              {settings.logo_url ? (
                <Image
                  src={settings.logo_url}
                  alt={`${settings.name} logo`}
                  width={72}
                  height={72}
                  unoptimized
                  priority
                  style={{ width: 72, height: 72 }}
                  className="object-contain"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Trophy className="h-8 w-8" aria-hidden />
                </span>
              )}
              <div className="space-y-1 text-sm text-muted-foreground">
                {dates && (
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
                    {dates}
                  </p>
                )}
                {settings.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" aria-hidden />
                    {settings.location}
                  </p>
                )}
              </div>
            </div>
          </Rise>

          <Rise delay={0.08}>
            <h1 className="mt-6 font-display text-6xl font-extrabold uppercase leading-[0.9] tracking-tight sm:text-8xl lg:text-9xl">
              {settings.name}
            </h1>
          </Rise>

          <Rise delay={0.16}>
            {settings.tagline && <p className="mt-5 max-w-xl text-lg text-muted-foreground">{settings.tagline}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/matches" className={buttonVariants({ size: "lg" })}>
                See fixtures
              </Link>
              <Link href="/standings" className={buttonVariants({ size: "lg", variant: "outline" })}>
                Points table
              </Link>
            </div>
          </Rise>
        </div>

        <Rise delay={0.24}>
          <Spotlight match={liveMatch ?? nextMatch} />
        </Rise>
      </div>
    </section>
  );
}
