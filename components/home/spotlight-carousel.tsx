"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Pause, Play, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamLogo } from "@/components/team-logo";
import { ROUND_LABELS } from "@/lib/constants";
import { formatKickoff, formatLongDate, formatMatchDate } from "@/lib/format";
import type { MatchWithTeams, NewsItem } from "@/types";

type SpotlightSlide =
  | { type: "match"; match: MatchWithTeams }
  | { type: "result"; match: MatchWithTeams }
  | { type: "news"; item: NewsItem };

function MatchSlide({ match, result }: { match: MatchWithTeams; result: boolean }) {
  const live = match.status === "live";
  const round = match.round === "group" && match.group ? match.group.name : ROUND_LABELS[match.round];

  return (
    <Link
      href={`/matches/${match.id}`}
      className="relative flex min-h-[440px] h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 p-5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[480px] sm:p-8"
    >
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

      <div className="relative flex items-center justify-between gap-3">
        <Badge variant={live ? "live" : result ? "muted" : "accent"} className="px-3 py-1.5 uppercase tracking-wider">
          {live ? "Live now" : result ? "Recent result" : "Upcoming match"}
        </Badge>
        <span className="text-right text-xs font-semibold text-white/75 sm:text-sm">{round}</span>
      </div>

      <div className="relative mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-5">
        {[match.home, match.away].map((team, index) => (
          <div
            key={team.id}
            className={`flex min-w-0 flex-col items-center gap-3 text-center sm:gap-4 ${index === 1 ? "col-start-3" : ""}`}
          >
            <span className="flex h-24 w-24 items-center justify-center sm:h-32 sm:w-32">
              <TeamLogo name={team.name} src={team.logo_url} size={96} className="h-full w-full" />
            </span>
            <span className="w-full truncate text-base font-extrabold sm:text-xl">{team.name}</span>
          </div>
        ))}
        <span className="col-start-2 row-start-1 rounded-full border border-white/20 bg-black/25 px-3 py-2 font-display text-lg font-black italic text-amber-300 sm:px-5 sm:py-3 sm:text-2xl">
          {result || live ? `${match.home_score} - ${match.away_score}` : "VS"}
        </span>
      </div>

      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-white/80 sm:text-sm">
        <span className="inline-flex items-center gap-1.5">
          {result ? <Trophy className="h-4 w-4 text-amber-300" aria-hidden /> : <CalendarDays className="h-4 w-4 text-amber-300" aria-hidden />}
          {formatMatchDate(match.kickoff_at)}
          {!result && ` · ${formatKickoff(match.kickoff_at)}`}
        </span>
        {match.venue && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-amber-300" aria-hidden />
            {match.venue}
          </span>
        )}
        <span className="basis-full text-center text-sm font-semibold text-white sm:text-base">
          {result ? "View final result" : live ? "Follow live match" : "View match details"}
        </span>
      </div>
    </Link>
  );
}

function NewsSlide({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="relative flex min-h-[440px] h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-stone-950 via-emerald-950 to-green-900 p-6 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[480px] sm:p-10"
    >
      <div aria-hidden className="pitch-stripes absolute inset-0 opacity-30" />
      <div className="relative flex items-center justify-between gap-3">
        <Badge variant={item.is_announcement ? "accent" : "muted"} className="px-3 py-1.5 uppercase tracking-wider">
          {item.is_announcement ? "Announcement" : "Latest news"}
        </Badge>
        <time dateTime={item.published_at} className="text-right text-xs font-semibold text-white/75 sm:text-sm">
          {formatLongDate(item.published_at)}
        </time>
      </div>
      <div className="relative py-8">
        <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-amber-300 sm:h-20 sm:w-20">
          <Trophy className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden />
        </span>
        <h2 className="max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {item.title}
        </h2>
        {item.excerpt && <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{item.excerpt}</p>}
      </div>
      <p className="relative text-sm font-semibold text-amber-300">Read the full story <span aria-hidden>→</span></p>
    </Link>
  );
}

export function SpotlightCarousel({
  upcoming,
  recent,
  news,
}: {
  upcoming: MatchWithTeams[];
  recent: MatchWithTeams[];
  news: NewsItem[];
}) {
  const slides: SpotlightSlide[] = [
    ...upcoming.filter((match) => match.status === "live" || match.status === "scheduled").map((match) => ({ type: "match" as const, match })),
    ...recent.map((match) => ({ type: "result" as const, match })),
    ...news.map((item) => ({ type: "news" as const, item })),
  ];
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1, align: "start", duration: 28 }, [autoplay.current]);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(slides.length > 1);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      autoplay.current.stop();
      setPlaying(false);
    }

    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const togglePlay = () => {
    if (autoplay.current.isPlaying()) {
      autoplay.current.stop();
      setPlaying(false);
    } else {
      autoplay.current.play();
      setPlaying(true);
    }
  };

  if (slides.length === 0) {
    return (
      <div className="flex min-h-[440px] flex-col justify-center rounded-2xl border bg-card/80 p-6 backdrop-blur sm:min-h-[480px] sm:p-8">
        <p className="font-display text-2xl font-bold">No updates yet</p>
        <p className="mt-2 text-sm text-muted-foreground">Upcoming matches, recent results and news will appear here.</p>
      </div>
    );
  }

  return (
    <div
      className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border bg-card shadow-xl"
      aria-roledescription="carousel"
      aria-label="Tournament updates"
    >
      <div ref={emblaRef} className="min-w-0 overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={slide.type === "news" ? `news-${slide.item.id}` : `${slide.type}-${slide.match.id}`}
              className="min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
            >
              {slide.type === "news" ? (
                <NewsSlide item={slide.item} />
              ) : (
                <MatchSlide match={slide.match} result={slide.type === "result"} />
              )}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-between gap-3 border-t px-3 py-2 sm:px-4 sm:py-3">
          <Button variant="ghost" size="icon" onClick={togglePlay} aria-label={playing ? "Pause slideshow" : "Start slideshow"}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="flex min-w-0 items-center justify-center gap-1.5 overflow-hidden sm:gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.type === "news" ? `news-dot-${slide.item.id}` : `${slide.type}-dot-${slide.match.id}`}
                type="button"
                aria-label={`Show ${slide.type === "news" ? slide.item.title : slide.type === "result" ? `${slide.match.home.name} versus ${slide.match.away.name} result` : `${slide.match.home.name} versus ${slide.match.away.name} match`}`}
                aria-current={index === selected ? "true" : undefined}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                  index === selected ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => emblaApi?.scrollPrev()} aria-label="Previous update">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => emblaApi?.scrollNext()} aria-label="Next update">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
