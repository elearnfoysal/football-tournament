import "server-only";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import type { MatchWithTeams, PlayerPosition, PlayerStat, TeamLite } from "@/types";

const TEAM_COLUMNS = "id,name,slug,short_name,logo_url";
const MATCH_COLUMNS = `
  id,home_score,away_score,home_penalties,away_penalties,kickoff_at,venue,round,status,group_id,report,
  group:groups(name),
  home:teams!home_team_id(${TEAM_COLUMNS}),
  away:teams!away_team_id(${TEAM_COLUMNS})
`;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type QueryResult = { data: unknown; error: { message: string } | null };

async function requireData<T>(label: string, query: PromiseLike<QueryResult>): Promise<T> {
  const { data, error } = await query;
  if (error) {
    console.error(`[details:${label}]`, error.message);
    throw new Error(`Could not load ${label}.`);
  }
  if (data === null) notFound();
  return data as T;
}

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeMatch<T extends { home: unknown; away: unknown; group: unknown }>(
  match: T,
): Omit<T, "home" | "away" | "group"> & {
  home: TeamLite;
  away: TeamLite;
  group: { name: string } | null;
} {
  const home = one(match.home as TeamLite | TeamLite[] | null);
  const away = one(match.away as TeamLite | TeamLite[] | null);
  if (!home || !away) notFound();
  return {
    ...match,
    home,
    away,
    group: one(match.group as { name: string } | { name: string }[] | null),
  };
}

export interface PlayerDetail {
  id: string;
  name: string;
  jersey_no: number;
  position: PlayerPosition;
  photo_url: string | null;
  is_captain: boolean;
  bio: string | null;
  team: TeamLite;
  stats: PlayerStat;
  appearances: Array<{ match: MatchWithTeams | null }>;
}

export async function getPlayerDetail(id: string): Promise<PlayerDetail> {
  if (!UUID_PATTERN.test(id)) notFound();
  const supabase = createPublicClient();
  const player = await requireData<Omit<PlayerDetail, "stats" | "appearances">>(
    "player",
    supabase
      .from("players")
      .select(`id,name,jersey_no,position,photo_url,is_captain,bio,team:teams!team_id(${TEAM_COLUMNS})`)
      .eq("id", id)
      .maybeSingle(),
  );
  const [stats, appearances] = await Promise.all([
    requireData<PlayerStat>(
      "player statistics",
      supabase.from("player_stats").select("*").eq("player_id", id).maybeSingle(),
    ),
    requireData<PlayerDetail["appearances"]>(
      "player appearances",
      supabase
        .from("match_lineups")
        .select(`match:matches!match_id(${MATCH_COLUMNS})`)
        .eq("player_id", id),
    ),
  ]);
  const team = one(player.team as TeamLite | TeamLite[] | null);
  if (!team) notFound();
  return {
    ...player,
    team,
    stats,
    appearances: appearances
      .filter((appearance) => appearance.match !== null)
      .map((appearance) => ({ match: appearance.match ? normalizeMatch(appearance.match) : null }))
      .sort((a, b) => (b.match?.kickoff_at ?? "").localeCompare(a.match?.kickoff_at ?? "")),
  };
}

export interface TeamDetail {
  team: TeamLite & {
    coach: string | null;
    banner_url: string | null;
    group: { name: string } | null;
  };
  players: PlayerStat[];
  matches: Array<MatchWithTeams & { report?: string | null }>;
}

export async function getTeamDetail(slug: string): Promise<TeamDetail> {
  const supabase = createPublicClient();
  const rawTeam = await requireData<TeamDetail["team"]>(
    "team",
    supabase
      .from("teams")
      .select(`id,name,slug,short_name,logo_url,banner_url,coach,group:groups(name)`)
      .eq("slug", slug)
      .maybeSingle(),
  );
  const team = {
    ...rawTeam,
    group: one(rawTeam.group as { name: string } | { name: string }[] | null),
  };
  const [players, matches] = await Promise.all([
    requireData<PlayerStat[]>(
      "team squad",
      supabase
        .from("player_stats")
        .select("*")
        .eq("team_id", team.id)
        .order("jersey_no", { ascending: true }),
    ),
    requireData<TeamDetail["matches"]>(
      "team matches",
      supabase
        .from("matches")
        .select(MATCH_COLUMNS)
        .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
        .order("kickoff_at", { ascending: false }),
    ),
  ]);
  return { team, players, matches: matches.map(normalizeMatch) };
}

export interface MatchEvent {
  id: string;
  type: "goal" | "assist" | "yellow" | "red" | "own_goal";
  minute: number;
  player: { id: string; name: string; jersey_no: number } | null;
  team: TeamLite;
}

export interface MatchLineup {
  is_starter: boolean;
  player: {
    id: string;
    name: string;
    jersey_no: number;
    position: PlayerPosition;
    photo_url: string | null;
  };
  team: TeamLite;
}

export interface MatchDetail extends MatchWithTeams {
  home_penalties: number | null;
  away_penalties: number | null;
  report: string | null;
  group: { name: string } | null;
  events: MatchEvent[];
  lineups: MatchLineup[];
}

export async function getMatchDetail(id: string): Promise<MatchDetail> {
  if (!UUID_PATTERN.test(id)) notFound();
  const supabase = createPublicClient();
  const match = await requireData<MatchDetail>(
    "match",
    supabase
      .from("matches")
      .select(MATCH_COLUMNS)
      .eq("id", id)
      .maybeSingle(),
  );
  const [events, lineups] = await Promise.all([
    requireData<MatchEvent[]>(
      "match events",
      supabase
        .from("match_events")
        .select(`id,type,minute,player:players!player_id(id,name,jersey_no),team:teams!team_id(${TEAM_COLUMNS})`)
        .eq("match_id", id)
        .order("minute", { ascending: true }),
    ),
    requireData<MatchLineup[]>(
      "match lineups",
      supabase
        .from("match_lineups")
        .select(`is_starter,player:players!player_id(id,name,jersey_no,position,photo_url),team:teams!team_id(${TEAM_COLUMNS})`)
        .eq("match_id", id),
    ),
  ]);
  const normalizedMatch = normalizeMatch(match);
  return {
    ...normalizedMatch,
    events: events.map((event) => ({
      ...event,
      player: one(event.player as MatchEvent["player"] | MatchEvent["player"][]),
      team: one(event.team as TeamLite | TeamLite[] | null) ?? notFound(),
    })),
    lineups: lineups.map((lineup) => ({
      ...lineup,
      player: one(lineup.player as MatchLineup["player"] | MatchLineup["player"][]) ?? notFound(),
      team: one(lineup.team as TeamLite | TeamLite[]) ?? notFound(),
    })),
  };
}

export function getTeamRecord(matches: TeamDetail["matches"], teamId: string) {
  return matches.reduce(
    (record, match) => {
      if (match.status !== "finished") return record;
      record.played += 1;
      const isHome = match.home.id === teamId;
      const goalsFor = isHome ? match.home_score : match.away_score;
      const goalsAgainst = isHome ? match.away_score : match.home_score;
      record.goalsFor += goalsFor;
      record.goalsAgainst += goalsAgainst;
      if (goalsFor > goalsAgainst) record.won += 1;
      else if (goalsFor === goalsAgainst) record.drawn += 1;
      else record.lost += 1;
      return record;
    },
    { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
  );
}
