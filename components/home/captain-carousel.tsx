"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { TeamLogo } from "@/components/team-logo";
import { Button } from "@/components/ui/button";
import { POSITION_LABELS } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";
import type { CaptainSlide } from "@/types";

function Slide({
  slide,
  index,
  count,
  active,
}: {
  slide: CaptainSlide;
  index: number;
  count: number;
  active: boolean;
}) {
  const reduce = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);
  const description =
    slide.tagline ?? (slide.position ? `${POSITION_LABELS[slide.position]} and captain of ${slide.teamName}.` : `Captain of ${slide.teamName}.`);

  return (
    <div
      className="min-w-0 flex-[0_0_100%]"
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}: ${slide.captainName}`}
    >
      <div className="grid md:min-h-[480px] md:grid-cols-[1.1fr_1fr]">
        <div className="relative order-2 flex flex-col justify-center overflow-hidden p-6 sm:p-10 md:order-1">
          {slide.jerseyNo !== null && (
            <span
              aria-hidden
              className="text-outline pointer-events-none absolute -bottom-16 -right-2 select-none font-display text-[14rem] font-extrabold leading-none sm:text-[18rem]"
            >
              {slide.jerseyNo}
            </span>
          )}

          <motion.div
            className="relative"
            animate={reduce ? undefined : { opacity: active ? 1 : 0.15, x: active ? 0 : -28 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3">
              <TeamLogo name={slide.teamName} src={slide.teamLogoUrl} size={44} />
              <Link
                href={`/teams/${slide.teamSlug}`}
                className="text-lg font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {slide.teamName}
              </Link>
            </div>

            <h3 className="mt-5 font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
              {slide.captainName}
            </h3>
            <p className="mt-4 max-w-md text-muted-foreground">{description}</p>
            {slide.jerseyNo !== null && (
              <p className="mt-6 font-display text-3xl font-bold text-primary">No. {slide.jerseyNo}</p>
            )}
          </motion.div>
        </div>

        <div className="relative order-1 h-80 bg-secondary md:order-2 md:h-auto">
          {slide.photoUrl && !imageFailed ? (
            <Image
              src={slide.photoUrl}
              alt={`${slide.captainName}, captain of ${slide.teamName}`}
              fill
              unoptimized
              priority={index === 0}
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover object-top"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-9xl font-extrabold text-muted-foreground/40">
              {initials(slide.captainName)}
            </div>
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent md:bg-gradient-to-r md:from-card md:via-transparent"
          />
        </div>
      </div>
    </div>
  );
}

export function CaptainCarousel({ slides }: { slides: CaptainSlide[] }) {
  const count = slides.length;
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: count > 1, align: "start", duration: 28 }, [
    autoplay.current,
  ]);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(count > 1);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);

    // People who ask for reduced motion get a carousel that never moves on its own.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      autoplay.current.stop();
      setPlaying(false);
    }

    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const togglePlay = () => {
    const plugin = autoplay.current;
    if (plugin.isPlaying()) {
      plugin.stop();
      setPlaying(false);
    } else {
      plugin.play();
      setPlaying(true);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card" aria-roledescription="carousel" aria-label="Team captains">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, i) => (
            <Slide key={slide.id} slide={slide} index={i} count={count} active={i === selected} />
          ))}
        </div>
      </div>

      {count > 1 && (
        <div className="flex items-center justify-between gap-4 border-t px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            aria-label={playing ? "Pause automatic slideshow" : "Start automatic slideshow"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Choose a captain">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === selected}
                aria-label={`Show ${slide.captainName}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  i === selected ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/70",
                )}
              />
            ))}
          </div>

          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => emblaApi?.scrollPrev()} aria-label="Previous captain">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => emblaApi?.scrollNext()} aria-label="Next captain">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
