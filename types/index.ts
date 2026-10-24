// App-level types. These mirror supabase/migrations. To generate the raw
// Supabase types as well, run `npm run gen:types` (writes types/supabase.ts).

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";
export type MatchRound =
  | "group"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";
export type EventType = "goal" | "assist" | "yellow" | "red" | "own_goal";
export type PlayerPosition = "GK" | "DF" | "MF" | "FW";

export interface TournamentSettings {
  id: number;
  name: string;
  tagline: string | null;
  logo_url: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  about: string | null;
  rules: string | null;
  qualify_per_group: number;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
}

export interface TeamLite {
  id: string;
  name: string;
  slug: string;
  short_name: string | null;
  logo_url: string | null;
}

export interface MatchWithTeams {
  id: string;
  home_score: number;
  away_score: number;
  kickoff_at: string;
  venue: string | null;
  round: MatchRound;
  status: MatchStatus;
  group_id: string | null;
  group: { name: string } | null;
  home: TeamLite;
  away: TeamLite;
}

export interface StandingRow {
  team_id: string;
  name: string;
  slug: string;
  short_name: string | null;
  logo_url: string | null;
  group_id: string | null;
  group_name: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
  form: string | null;
  position: number;
}

export interface PlayerStat {
  player_id: string;
  name: string;
  jersey_no: number;
  position: PlayerPosition;
  photo_url: string | null;
  is_captain: boolean;
  team_id: string;
  team_name: string;
  team_slug: string;
  team_logo_url: string | null;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  own_goals: number;
  matches_played: number;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  is_announcement: boolean;
  published_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  tier: string | null;
}

export interface CaptainSlide {
  id: string;
  captainName: string;
  jerseyNo: number | null;
  position: PlayerPosition | null;
  photoUrl: string | null;
  teamName: string;
  teamSlug: string;
  teamLogoUrl: string | null;
  tagline: string | null;
}

export interface HomeData {
  settings: TournamentSettings;
  liveMatch: MatchWithTeams | null;
  nextMatch: MatchWithTeams | null;
  upcoming: MatchWithTeams[];
  recent: MatchWithTeams[];
  standings: StandingRow[];
  scorers: PlayerStat[];
  news: NewsItem[];
  sponsors: Sponsor[];
  captains: CaptainSlide[];
}
