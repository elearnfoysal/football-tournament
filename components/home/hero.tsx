import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { Rise } from "@/components/rise";
import { TeamLogo } from "@/components/team-logo";
import { buttonVariants } from "@/components/ui/button";
import { ROUND_LABELS } from "@/lib/constants";
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
    <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 p-5 text-white sm:p-7">
        <div aria-hidden className="pitch-stripes absolute inset-0 opacity-50" />
        <svg
          aria-hidden
          viewBox="0 0 800 400"
          className="pointer-events-none absolute -right-24 top-1/2 h-[440px] w-[880px] -translate-y-1/2 text-white/10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="30" y="30" width="740" height="340" rx="8" />
          <line x1="400" y1="30" x2="400" y2="370" />
          <circle cx="400" cy="200" r="90" />
          <circle cx="400" cy="200" r="4" fill="currentColor" />
        </svg>

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
              <span
                aria-hidden
                className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-red-400" : "bg-amber-300"}`}
              />
              {live ? "Live now" : "Upcoming match"}
            </span>
            <span className="text-right text-xs font-semibold text-white/75">
              {match.round === "group" && match.group ? match.group.name : ROUND_LABELS[match.round]}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            {[match.home, match.away].map((team, index) => (
              <div
                key={team.id}
                className={`flex min-w-0 flex-col items-center gap-3 text-center ${index === 1 ? "col-start-3" : ""}`}
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg sm:h-24 sm:w-24">
                  <TeamLogo name={team.name} src={team.logo_url} size={72} className="max-h-full max-w-full" />
                </span>
                <span className="w-full truncate text-base font-extrabold sm:text-lg">{team.name}</span>
              </div>
            ))}
            <span className="col-start-2 row-start-1 rounded-full border border-white/20 bg-black/20 px-3 py-2 font-display text-sm font-black italic text-amber-300 sm:px-4 sm:text-base">
              {live ? `${match.home_score} - ${match.away_score}` : "VS"}
            </span>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-white/80 sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-amber-300" aria-hidden />
              {formatMatchDate(match.kickoff_at)} · {formatKickoff(match.kickoff_at)}
            </span>
            {match.venue && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-amber-300" aria-hidden />
                {match.venue}
              </span>
            )}
          </div>
          {!live && <Countdown target={match.kickoff_at} variant="compact" className="mt-3 block text-center text-white" />}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold leading-tight">{live ? "Match in progress" : "Next match"}</h2>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {match.home.name} vs {match.away.name}
          </p>
        </div>
        <Link
          href={`/matches/${match.id}`}
          className={buttonVariants({ variant: live ? "accent" : "default", className: "shrink-0" })}
        >
          {live ? "Follow match" : "Match details"}
        </Link>
      </div>
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
          <Spotlight match={nextMatch ?? liveMatch} />
        </Rise>
      </div>
    </section>
  );
}
