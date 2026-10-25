import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { SpotlightCarousel } from "@/components/home/spotlight-carousel";
import { Rise } from "@/components/rise";
import { buttonVariants } from "@/components/ui/button";
import { formatDateRange } from "@/lib/format";
import type { MatchWithTeams, NewsItem, TournamentSettings } from "@/types";

export function Hero({
  settings,
  upcoming,
  recent,
  news,
}: {
  settings: TournamentSettings;
  upcoming: MatchWithTeams[];
  recent: MatchWithTeams[];
  news: NewsItem[];
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

      <div className="container relative grid gap-10 py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-8 lg:py-20">
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

        <Rise delay={0.24} className="min-w-0">
          <SpotlightCarousel upcoming={upcoming} recent={recent} news={news} />
        </Rise>
      </div>
    </section>
  );
}
