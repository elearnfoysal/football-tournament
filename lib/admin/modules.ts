export type AdminLookupTable = "groups" | "teams" | "players" | "matches";
export type AdminImageBucket = "logos" | "players" | "banners" | "gallery";

export interface AdminField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "datetime" | "boolean" | "select" | "image";
  required?: boolean;
  options?: readonly { value: string; label: string }[];
  lookup?: { table: AdminLookupTable; label: string };
  image?: { bucket: AdminImageBucket; maxSizeMB: number };
}

export interface AdminModule {
  title: string;
  description: string;
  table: string;
  fields: readonly AdminField[];
  listColumns: readonly { name: string; label: string }[];
  filter?: "knockout";
  readOnly?: boolean;
  singleton?: boolean;
}

const roundOptions = [
  { value: "group", label: "Group stage" },
  { value: "round_of_16", label: "Round of 16" },
  { value: "quarter_final", label: "Quarter-final" },
  { value: "semi_final", label: "Semi-final" },
  { value: "third_place", label: "Third-place match" },
  { value: "final", label: "Final" },
] as const;

export const ADMIN_MODULES = {
  groups: {
    title: "Groups",
    description: "Create tournament groups and assign teams to them.",
    table: "groups",
    fields: [
      { name: "name", label: "Group name", type: "text", required: true },
      { name: "sort_order", label: "Display order", type: "number", required: true },
    ],
    listColumns: [{ name: "name", label: "Group" }, { name: "sort_order", label: "Order" }],
  },
  teams: {
    title: "Teams",
    description: "Manage team profiles, groups, coaches and logo links.",
    table: "teams",
    fields: [
      { name: "name", label: "Team name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", required: true },
      { name: "short_name", label: "Short name (max 5 characters)", type: "text" },
      { name: "group_id", label: "Group", type: "select", lookup: { table: "groups", label: "name" } },
      { name: "coach", label: "Coach", type: "text" },
      { name: "logo_url", label: "Team logo", type: "image", image: { bucket: "logos", maxSizeMB: 2 } },
      { name: "banner_url", label: "Team banner", type: "image", image: { bucket: "banners", maxSizeMB: 5 } },
    ],
    listColumns: [{ name: "name", label: "Team" }, { name: "short_name", label: "Short name" }, { name: "coach", label: "Coach" }],
  },
  players: {
    title: "Players",
    description: "Manage squads, player profiles and captain status.",
    table: "players",
    fields: [
      { name: "team_id", label: "Team", type: "select", required: true, lookup: { table: "teams", label: "name" } },
      { name: "name", label: "Player name", type: "text", required: true },
      { name: "jersey_no", label: "Jersey number (0–99)", type: "number", required: true },
      { name: "position", label: "Position", type: "select", required: true, options: [
        { value: "GK", label: "Goalkeeper" }, { value: "DF", label: "Defender" },
        { value: "MF", label: "Midfielder" }, { value: "FW", label: "Forward" },
      ] },
      { name: "photo_url", label: "Player photo", type: "image", image: { bucket: "players", maxSizeMB: 5 } },
      { name: "is_captain", label: "Team captain", type: "boolean" },
      { name: "bio", label: "Player bio", type: "textarea" },
    ],
    listColumns: [{ name: "name", label: "Player" }, { name: "jersey_no", label: "Number" }, { name: "position", label: "Position" }, { name: "team_id", label: "Team ID" }],
  },
  matches: {
    title: "Fixtures and results",
    description: "Schedule matches, update scores and publish match results.",
    table: "matches",
    fields: [
      { name: "home_team_id", label: "Home team", type: "select", required: true, lookup: { table: "teams", label: "name" } },
      { name: "away_team_id", label: "Away team", type: "select", required: true, lookup: { table: "teams", label: "name" } },
      { name: "kickoff_at", label: "Kick-off time", type: "datetime", required: true },
      { name: "venue", label: "Venue", type: "text" },
      { name: "round", label: "Round", type: "select", required: true, options: roundOptions },
      { name: "group_id", label: "Group (group stage)", type: "select", lookup: { table: "groups", label: "name" } },
      { name: "status", label: "Status", type: "select", required: true, options: [
        { value: "scheduled", label: "Scheduled" }, { value: "live", label: "Live" },
        { value: "finished", label: "Finished" }, { value: "postponed", label: "Postponed" },
      ] },
      { name: "home_score", label: "Home score", type: "number", required: true },
      { name: "away_score", label: "Away score", type: "number", required: true },
      { name: "home_penalties", label: "Home penalties", type: "number" },
      { name: "away_penalties", label: "Away penalties", type: "number" },
      { name: "report", label: "Match report", type: "textarea" },
    ],
    listColumns: [{ name: "kickoff_at", label: "Kick-off" }, { name: "home_team_id", label: "Home team ID" }, { name: "away_team_id", label: "Away team ID" }, { name: "home_score", label: "Score" }, { name: "status", label: "Status" }],
  },
  bracket: {
    title: "Knockout bracket",
    description: "Manage knockout fixtures and results. Group-stage fixtures are managed separately.",
    table: "matches",
    filter: "knockout",
    fields: [
      { name: "home_team_id", label: "Home team", type: "select", required: true, lookup: { table: "teams", label: "name" } },
      { name: "away_team_id", label: "Away team", type: "select", required: true, lookup: { table: "teams", label: "name" } },
      { name: "kickoff_at", label: "Kick-off time", type: "datetime", required: true },
      { name: "venue", label: "Venue", type: "text" },
      { name: "round", label: "Round", type: "select", required: true, options: roundOptions.filter(({ value }) => value !== "group") },
      { name: "status", label: "Status", type: "select", required: true, options: [
        { value: "scheduled", label: "Scheduled" }, { value: "live", label: "Live" },
        { value: "finished", label: "Finished" }, { value: "postponed", label: "Postponed" },
      ] },
      { name: "home_score", label: "Home score", type: "number", required: true },
      { name: "away_score", label: "Away score", type: "number", required: true },
      { name: "home_penalties", label: "Home penalties", type: "number" },
      { name: "away_penalties", label: "Away penalties", type: "number" },
      { name: "report", label: "Match report", type: "textarea" },
    ],
    listColumns: [{ name: "kickoff_at", label: "Kick-off" }, { name: "home_team_id", label: "Home team ID" }, { name: "away_team_id", label: "Away team ID" }, { name: "home_score", label: "Score" }, { name: "round", label: "Round" }],
  },
  stats: {
    title: "Statistics and match events",
    description: "Add goals, assists and cards. Goal events update match scores and player statistics automatically.",
    table: "match_events",
    fields: [
      { name: "match_id", label: "Match", type: "select", required: true, lookup: { table: "matches", label: "kickoff_at" } },
      { name: "team_id", label: "Player's team", type: "select", required: true, lookup: { table: "teams", label: "name" } },
      { name: "player_id", label: "Player (optional)", type: "select", lookup: { table: "players", label: "name" } },
      { name: "type", label: "Event", type: "select", required: true, options: [
        { value: "goal", label: "Goal" }, { value: "own_goal", label: "Own goal" },
        { value: "assist", label: "Assist" }, { value: "yellow", label: "Yellow card" },
        { value: "red", label: "Red card" },
      ] },
      { name: "minute", label: "Minute", type: "number", required: true },
    ],
    listColumns: [{ name: "match_id", label: "Match ID" }, { name: "team_id", label: "Team ID" }, { name: "player_id", label: "Player ID" }, { name: "type", label: "Event" }, { name: "minute", label: "Minute" }],
  },
  standings: {
    title: "Standings",
    description: "Calculated automatically from finished group-stage matches. Record match results in Fixtures and results to update this table.",
    table: "standings",
    fields: [],
    listColumns: [{ name: "position", label: "#" }, { name: "name", label: "Team" }, { name: "group_name", label: "Group" }, { name: "played", label: "P" }, { name: "won", label: "W" }, { name: "drawn", label: "D" }, { name: "lost", label: "L" }, { name: "goals_for", label: "GF" }, { name: "goals_against", label: "GA" }, { name: "goal_diff", label: "GD" }, { name: "points", label: "Pts" }],
    readOnly: true,
  },
  news: {
    title: "News",
    description: "Write, publish and update tournament announcements.",
    table: "news",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", required: true },
      { name: "excerpt", label: "Summary", type: "textarea" },
      { name: "content", label: "Article content", type: "textarea" },
      { name: "cover_url", label: "News cover image", type: "image", image: { bucket: "banners", maxSizeMB: 5 } },
      { name: "is_announcement", label: "Announcement", type: "boolean" },
      { name: "published", label: "Published", type: "boolean" },
      { name: "published_at", label: "Publish date", type: "datetime", required: true },
    ],
    listColumns: [{ name: "title", label: "Title" }, { name: "slug", label: "Slug" }, { name: "published", label: "Published" }, { name: "published_at", label: "Publish date" }],
  },
  gallery: {
    title: "Gallery",
    description: "Upload, caption and order tournament photos.",
    table: "gallery",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "caption", label: "Caption", type: "textarea" },
      { name: "image_url", label: "Gallery image", type: "image", required: true, image: { bucket: "gallery", maxSizeMB: 8 } },
      { name: "sort_order", label: "Display order", type: "number", required: true },
    ],
    listColumns: [{ name: "title", label: "Title" }, { name: "caption", label: "Caption" }, { name: "image_url", label: "Image URL" }, { name: "sort_order", label: "Order" }],
  },
  sponsors: {
    title: "Sponsors",
    description: "Manage sponsor names, logos, links and sponsorship tiers.",
    table: "sponsors",
    fields: [
      { name: "name", label: "Sponsor name", type: "text", required: true },
      { name: "logo_url", label: "Sponsor logo", type: "image", image: { bucket: "logos", maxSizeMB: 2 } },
      { name: "website_url", label: "Website URL", type: "text" },
      { name: "tier", label: "Sponsorship tier", type: "text" },
      { name: "sort_order", label: "Display order", type: "number", required: true },
    ],
    listColumns: [{ name: "name", label: "Sponsor" }, { name: "tier", label: "Tier" }, { name: "website_url", label: "Website" }, { name: "sort_order", label: "Order" }],
  },
  settings: {
    title: "About and contact",
    description: "Update public tournament information, rules, location and contact details.",
    table: "tournament_settings",
    singleton: true,
    fields: [
      { name: "name", label: "Tournament name", type: "text", required: true },
      { name: "tagline", label: "Tagline", type: "text" },
      { name: "logo_url", label: "Tournament logo", type: "image", image: { bucket: "logos", maxSizeMB: 2 } },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "location", label: "Location", type: "text" },
      { name: "about", label: "About", type: "textarea" },
      { name: "rules", label: "Rules", type: "textarea" },
      { name: "qualify_per_group", label: "Teams qualifying per group", type: "number", required: true },
      { name: "contact_email", label: "Contact email", type: "text" },
      { name: "contact_phone", label: "Contact phone", type: "text" },
      { name: "contact_address", label: "Contact address", type: "textarea" },
      { name: "facebook_url", label: "Facebook URL", type: "text" },
      { name: "instagram_url", label: "Instagram URL", type: "text" },
      { name: "youtube_url", label: "YouTube URL", type: "text" },
    ],
    listColumns: [],
  },
} satisfies Record<string, AdminModule>;

export type AdminModuleKey = keyof typeof ADMIN_MODULES;

export const ADMIN_NAV_ITEMS: readonly { label: string; href: string }[] = [
  { label: "Overview", href: "/admin" },
  { label: "Fixtures", href: "/admin/matches" },
  { label: "Standings", href: "/admin/standings" },
  { label: "Teams", href: "/admin/teams" },
  { label: "Players", href: "/admin/players" },
  { label: "Stats / events", href: "/admin/stats" },
  { label: "Bracket", href: "/admin/bracket" },
  { label: "News", href: "/admin/news" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "About / contact", href: "/admin/settings" },
  { label: "Groups", href: "/admin/groups" },
  { label: "Sponsors", href: "/admin/sponsors" },
];
