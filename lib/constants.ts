import type { MatchRound, PlayerPosition, TournamentSettings } from "@/types";

export const ROUND_LABELS: Record<MatchRound, string> = {
  group: "Group stage",
  round_of_16: "Round of 16",
  quarter_final: "Quarter-final",
  semi_final: "Semi-final",
  third_place: "Third place",
  final: "Final",
};

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  FW: "Forward",
};

export const NAV_LINKS = [
  { href: "/matches", label: "Fixtures" },
  { href: "/standings", label: "Standings" },
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/stats", label: "Stats" },
  { href: "/bracket", label: "Bracket" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
] as const;

export const SECONDARY_LINKS = [
  { href: "/about", label: "About and rules" },
  { href: "/contact", label: "Contact" },
] as const;

// Shown when the tournament_settings row is missing or Supabase is unreachable.
export const DEFAULT_SETTINGS: TournamentSettings = {
  id: 1,
  name: "Football Tournament",
  tagline: null,
  logo_url: null,
  start_date: null,
  end_date: null,
  location: null,
  about: null,
  rules: null,
  qualify_per_group: 2,
  contact_email: null,
  contact_phone: null,
  contact_address: null,
  facebook_url: null,
  instagram_url: null,
  youtube_url: null,
};
