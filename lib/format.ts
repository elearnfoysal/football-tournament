// All kickoff times are shown in the tournament timezone so server-rendered
// and client-rendered output match, whatever the visitor's device is set to.
const TZ = process.env.NEXT_PUBLIC_TOURNAMENT_TZ || "Asia/Dhaka";

const matchDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const matchTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const longDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Calendar dates (no time) are parsed as UTC so they never shift a day.
const dayMonthUtc = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});
const fullUtc = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatMatchDate(iso: string) {
  return matchDate.format(new Date(iso));
}

export function formatKickoff(iso: string) {
  return matchTime
    .format(new Date(iso))
    .replace(/[\u202f\u00a0]/g, " ")
    .toUpperCase();
}

export function formatLongDate(iso: string) {
  return longDate.format(new Date(iso));
}

export function formatDateRange(start: string | null, end: string | null) {
  if (start && end) {
    return `${dayMonthUtc.format(new Date(start))} to ${fullUtc.format(new Date(end))}`;
  }
  const single = start ?? end;
  return single ? fullUtc.format(new Date(single)) : null;
}

export function signed(n: number) {
  return n > 0 ? `+${n}` : String(n);
}
