"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Remaining {
  done: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function remaining(target: number): Remaining {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    done: ms === 0,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({
  target,
  variant = "large",
  className,
}: {
  target: string;
  variant?: "large" | "compact";
  className?: string;
}) {
  const time = new Date(target).getTime();
  // null until mounted, so server and client markup match.
  const [left, setLeft] = useState<Remaining | null>(null);

  useEffect(() => {
    setLeft(remaining(time));
    const id = setInterval(() => setLeft(remaining(time)), variant === "large" ? 1000 : 30000);
    return () => clearInterval(id);
  }, [time, variant]);

  if (variant === "compact") {
    let text = "Starts soon";
    if (left) {
      text = left.done
        ? "Kick-off"
        : left.days > 0
          ? `In ${left.days}d ${pad(left.hours)}h`
          : `In ${left.hours}h ${pad(left.minutes)}m`;
    }
    return <span className={cn("font-semibold tabular-nums text-primary", className)}>{text}</span>;
  }

  if (left?.done) {
    return <p className={cn("font-display text-3xl font-bold text-primary", className)}>Kick-off time</p>;
  }

  const units = [
    { label: "Days", value: left?.days },
    { label: "Hours", value: left?.hours },
    { label: "Min", value: left?.minutes },
    { label: "Sec", value: left?.seconds },
  ];

  return (
    <div role="timer" aria-label="Time until kick-off" className={cn("grid grid-cols-4 gap-2", className)}>
      {units.map((unit) => (
        <div key={unit.label} className="rounded-md bg-secondary px-2 py-3 text-center">
          <div className="font-display text-4xl font-extrabold leading-none tabular-nums sm:text-5xl">
            {unit.value === undefined ? "--" : pad(unit.value)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}
