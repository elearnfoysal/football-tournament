import "server-only";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { getSettings } from "@/lib/data/settings";
import { formatKickoff, formatMatchDate } from "@/lib/format";

export const PUBLIC_SECTIONS = [
  "matches",
  "standings",
  "teams",
  "players",
  "stats",
  "bracket",
  "news",
  "gallery",
  "about",
  "contact",
] as const;

export type PublicSection = (typeof PUBLIC_SECTIONS)[number];

export interface PublicPageItem {
  title: string;
  detail?: string | null;
  meta?: string | null;
  imageUrl?: string | null;
}

export interface PublicPageData {
  title: string;
  description: string;
  items: PublicPageItem[];
  emptyTitle: string;
  emptyDescription: string;
}

const teamColumns = "id,name,slug,short_name,logo_url";
const matchColumns = `
  id,home_score,away_score,kickoff_at,venue,round,status,
  home:teams!home_team_id(${teamColumns}),
  away:teams!away_team_id(${teamColumns})
`;

async function rows<T>(
  label: string,
  query: PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<T[]> {
  const { data, error } = await query;
  if (error) {
    console.error(`[public-page:${label}]`, error.message);
    throw new Error(`Could not load ${label}.`);
  }
  return (data as T[] | null) ?? [];
}

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getPublicPageData(section: string): Promise<PublicPageData> {
  if (!PUBLIC_SECTIONS.includes(section as PublicSection)) notFound();

  const supabase = createPublicClient();
  const current = section as PublicSection;

  switch (current) {
    case "matches": {
      const matches = await rows<{
        home_score: number;
        away_score: number;
        kickoff_at: string;
        venue: string | null;
        round: string;
        status: string;
        home: { name: string }[] | { name: string } | null;
        away: { name: string }[] | { name: string } | null;
      }>(
        "matches",
        supabase.from("matches").select(matchColumns).order("kickoff_at", { ascending: true }),
      );
      return {
        title: "Fixtures and results",
        description: "Every scheduled match, live score and completed result.",
        items: matches.map((match) => ({
          title: `${one(match.home)?.name ?? "TBD"} ${match.home_score} – ${match.away_score} ${one(match.away)?.name ?? "TBD"}`,
          detail: [formatMatchDate(match.kickoff_at), formatKickoff(match.kickoff_at), match.venue].filter(Boolean).join(" · "),
          meta: `${match.round.replaceAll("_", " ")} · ${match.status}`,
        })),
        emptyTitle: "No fixtures yet",
        emptyDescription: "Match schedules will appear here when they are added.",
      };
    }
    case "standings": {
      const standings = await rows<{
        name: string;
        group_name: string | null;
        played: number;
        won: number;
        drawn: number;
        lost: number;
        goal_diff: number;
        points: number;
      }>(
        "standings",
        supabase.from("standings").select("*").order("position", { ascending: true }),
      );
      return {
        title: "Standings",
        description: "Tournament table calculated from completed group-stage matches.",
        items: standings.map((team) => ({
          title: `${team.name} — ${team.points} pts`,
          detail: `${team.played} played · ${team.won}W ${team.drawn}D ${team.lost}L · GD ${team.goal_diff}`,
          meta: team.group_name ?? "Unassigned group",
        })),
        emptyTitle: "Standings will appear here",
        emptyDescription: "Tables are calculated when group-stage results are recorded.",
      };
    }
    case "teams": {
      const teams = await rows<{
        name: string;
        short_name: string | null;
        coach: string | null;
        logo_url: string | null;
        group: { name: string }[] | { name: string } | null;
      }>(
        "teams",
        supabase
          .from("teams")
          .select("name,short_name,coach,logo_url,group:groups(name)")
          .order("name", { ascending: true }),
      );
      return {
        title: "Teams",
        description: "Meet the clubs taking part in the tournament.",
        items: teams.map((team) => ({
          title: team.name,
          detail: [team.short_name, team.coach ? `Coach: ${team.coach}` : null].filter(Boolean).join(" · "),
          meta: one(team.group)?.name ?? "Group to be announced",
          imageUrl: team.logo_url,
        })),
        emptyTitle: "Teams will be announced soon",
        emptyDescription: "Team information will appear here once it is added.",
      };
    }
    case "players":
    case "stats": {
      const players = await rows<{
        name: string;
        jersey_no: number;
        position: string;
        photo_url: string | null;
        team_name: string;
        goals: number;
        assists: number;
        yellow_cards: number;
        red_cards: number;
        matches_played: number;
      }>(
        current === "stats" ? "player stats" : "players",
        supabase
          .from("player_stats")
          .select("name,jersey_no,position,photo_url,team_name,goals,assists,yellow_cards,red_cards,matches_played")
          .order(current === "stats" ? "goals" : "name", { ascending: current !== "stats" }),
      );
      return {
        title: current === "stats" ? "Player statistics" : "Players",
        description:
          current === "stats"
            ? "Goals, assists and disciplinary records across the tournament."
            : "Tournament squads and player profiles.",
        items: players.map((player) => ({
          title: `${player.name} · #${player.jersey_no}`,
          detail:
            current === "stats"
              ? `${player.goals} goals · ${player.assists} assists · ${player.yellow_cards} yellow · ${player.red_cards} red`
              : `${player.position} · ${player.team_name} · ${player.matches_played} matches`,
          meta: current === "stats" ? player.team_name : undefined,
          imageUrl: current === "players" ? player.photo_url : null,
        })),
        emptyTitle: current === "stats" ? "Statistics will appear soon" : "Squads will be announced soon",
        emptyDescription: "Player data will appear here when it is added.",
      };
    }
    case "bracket": {
      const matches = await rows<{
        home_score: number;
        away_score: number;
        kickoff_at: string;
        venue: string | null;
        round: string;
        status: string;
        home: { name: string }[] | { name: string } | null;
        away: { name: string }[] | { name: string } | null;
      }>(
        "knockout bracket",
        supabase
          .from("matches")
          .select(matchColumns)
          .neq("round", "group")
          .order("kickoff_at", { ascending: true }),
      );
      return {
        title: "Knockout bracket",
        description: "Follow the route from the round of 16 through to the final.",
        items: matches.map((match) => ({
          title: `${one(match.home)?.name ?? "TBD"} ${match.home_score} – ${match.away_score} ${one(match.away)?.name ?? "TBD"}`,
          detail: [formatMatchDate(match.kickoff_at), formatKickoff(match.kickoff_at), match.venue].filter(Boolean).join(" · "),
          meta: `${match.round.replaceAll("_", " ")} · ${match.status}`,
        })),
        emptyTitle: "The bracket is not ready yet",
        emptyDescription: "Knockout fixtures will be shown here when they are announced.",
      };
    }
    case "news": {
      const news = await rows<{
        title: string;
        excerpt: string | null;
        cover_url: string | null;
        published_at: string;
        is_announcement: boolean;
      }>(
        "news",
        supabase
          .from("news")
          .select("title,excerpt,cover_url,published_at,is_announcement")
          .eq("published", true)
          .order("published_at", { ascending: false }),
      );
      return {
        title: "Tournament news",
        description: "Announcements and updates from the tournament.",
        items: news.map((item) => ({
          title: item.title,
          detail: item.excerpt,
          meta: `${item.is_announcement ? "Announcement · " : ""}${formatMatchDate(item.published_at)}`,
          imageUrl: item.cover_url,
        })),
        emptyTitle: "No news published yet",
        emptyDescription: "Tournament updates will appear here.",
      };
    }
    case "gallery": {
      const photos = await rows<{
        title: string | null;
        caption: string | null;
        image_url: string;
      }>(
        "gallery",
        supabase.from("gallery").select("title,caption,image_url").order("sort_order", { ascending: true }),
      );
      return {
        title: "Gallery",
        description: "Photos and moments from the tournament.",
        items: photos.map((photo) => ({
          title: photo.title ?? "Tournament photo",
          detail: photo.caption,
          imageUrl: photo.image_url,
        })),
        emptyTitle: "The gallery is waiting for its first photo",
        emptyDescription: "Tournament photos will appear here when published.",
      };
    }
    case "about": {
      const settings = await getSettings();
      return {
        title: "About and rules",
        description: settings.about ?? `Everything you need to know about ${settings.name}.`,
        items: [
          ...(settings.rules ? [{ title: "Tournament rules", detail: settings.rules }] : []),
          ...(settings.location ? [{ title: "Venue", detail: settings.location }] : []),
        ],
        emptyTitle: "Tournament information is being prepared",
        emptyDescription: "More information will be published soon.",
      };
    }
    case "contact": {
      const settings = await getSettings();
      const contacts = [
        settings.contact_email && { title: "Email", detail: settings.contact_email },
        settings.contact_phone && { title: "Phone", detail: settings.contact_phone },
        settings.contact_address && { title: "Address", detail: settings.contact_address },
      ].filter((item): item is { title: string; detail: string } => Boolean(item));
      return {
        title: "Contact",
        description: `Get in touch with the ${settings.name} organisers.`,
        items: contacts,
        emptyTitle: "Contact details are not available yet",
        emptyDescription: "Please check again later for organiser contact information.",
      };
    }
  }
}
