import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { getSettings } from "@/lib/data/settings";
import type {
  CaptainSlide,
  HomeData,
  MatchWithTeams,
  NewsItem,
  PlayerPosition,
  PlayerStat,
  Sponsor,
  StandingRow,
  TeamLite,
} from "@/types";

const TEAM_COLUMNS = "id,name,slug,short_name,logo_url";

// Two foreign keys point at teams, so each embed names the column to follow.
const MATCH_SELECT = `
  id, home_score, away_score, kickoff_at, venue, round, status, group_id,
  group:groups(name),
  home:teams!home_team_id(${TEAM_COLUMNS}),
  away:teams!away_team_id(${TEAM_COLUMNS})
`;

// players <-> teams reference each other (team_id and captain_id), so name the column here too.
const PLAYER_EMBED = `id,name,jersey_no,position,photo_url,team:teams!team_id(${TEAM_COLUMNS})`;

interface PlayerEmbed {
  id: string;
  name: string;
  jersey_no: number | null;
  position: PlayerPosition | null;
  photo_url: string | null;
  team: TeamLite | null;
}

interface SlideRow {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  player: PlayerEmbed | null;
}

type QueryResult = { data: unknown; error: { message: string } | null };

// One failing section should not take the whole home page down.
async function safe<T>(label: string, run: () => PromiseLike<QueryResult>, fallback: T): Promise<T> {
  try {
    const { data, error } = await run();
    if (error) {
      console.error(`[home:${label}]`, error.message);
      return fallback;
    }
    return (data as T | null) ?? fallback;
  } catch (err) {
    console.error(`[home:${label}]`, err);
    return fallback;
  }
}

function toSlide(player: PlayerEmbed, id: string, tagline: string | null, photoOverride?: string | null): CaptainSlide | null {
  if (!player.team) return null;
  return {
    id,
    captainName: player.name,
    jerseyNo: player.jersey_no,
    position: player.position,
    photoUrl: photoOverride ?? player.photo_url,
    teamName: player.team.name,
    teamSlug: player.team.slug,
    teamLogoUrl: player.team.logo_url,
    tagline,
  };
}

/**
 * Loads everything the home page needs in parallel.
 * Throws only when the Supabase env vars are missing, so the page can show a setup notice.
 */
export async function getHomeData(): Promise<HomeData> {
  const supabase = createPublicClient();

  const [settings, upcomingRaw, recent, standings, scorers, news, sponsors, slideRows, captainRows] =
    await Promise.all([
      getSettings(),
      safe<MatchWithTeams[]>(
        "upcoming",
        () =>
          supabase
            .from("matches")
            .select(MATCH_SELECT)
            .in("status", ["live", "scheduled"])
            .order("kickoff_at", { ascending: true })
            .limit(6),
        [],
      ),
      safe<MatchWithTeams[]>(
        "recent",
        () =>
          supabase
            .from("matches")
            .select(MATCH_SELECT)
            .eq("status", "finished")
            .order("kickoff_at", { ascending: false })
            .limit(5),
        [],
      ),
      safe<StandingRow[]>(
        "standings",
        () =>
          supabase
            .from("standings")
            .select("*")
            .order("points", { ascending: false })
            .order("goal_diff", { ascending: false })
            .order("goals_for", { ascending: false })
            .limit(4),
        [],
      ),
      safe<PlayerStat[]>(
        "scorers",
        () =>
          supabase
            .from("top_scorers")
            .select("*")
            .order("goals", { ascending: false })
            .order("assists", { ascending: false })
            .limit(5),
        [],
      ),
      safe<NewsItem[]>(
        "news",
        () =>
          supabase
            .from("news")
            .select("id,title,slug,excerpt,is_announcement,published_at")
            .eq("published", true)
            .order("published_at", { ascending: false })
            .limit(5),
        [],
      ),
      safe<Sponsor[]>(
        "sponsors",
        () =>
          supabase
            .from("sponsors")
            .select("id,name,logo_url,website_url,tier")
            .order("sort_order", { ascending: true }),
        [],
      ),
      safe<SlideRow[]>(
        "slides",
        () =>
          supabase
            .from("carousel_slides")
            .select(`id,title,subtitle,image_url,sort_order,player:players!player_id(${PLAYER_EMBED})`)
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        [],
      ),
      safe<PlayerEmbed[]>(
        "captains",
        () => supabase.from("players").select(PLAYER_EMBED).eq("is_captain", true),
        [],
      ),
    ]);

  // Curated slides win. With none, every team captain is shown.
  let captains: CaptainSlide[] = slideRows
    .map((row) => (row.player ? toSlide(row.player, row.id, row.title ?? row.subtitle, row.image_url) : null))
    .filter((slide): slide is CaptainSlide => slide !== null);

  if (captains.length === 0) {
    captains = captainRows
      .map((player) => toSlide(player, player.id, null))
      .filter((slide): slide is CaptainSlide => slide !== null)
      .sort((a, b) => a.teamName.localeCompare(b.teamName));
  }

  return {
    settings,
    liveMatch: upcomingRaw.find((m) => m.status === "live") ?? null,
    nextMatch: upcomingRaw.find((m) => m.status === "scheduled") ?? null,
    upcoming: upcomingRaw,
    recent,
    standings,
    scorers,
    news,
    sponsors,
    captains,
  };
}
