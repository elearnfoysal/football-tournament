-- =============================================================================
-- Football Tournament Management: schema, triggers, views
-- Run order: 1) this file  2) 20240101000100_rls_storage.sql  3) ../seed.sql
-- =============================================================================

-- ---------- Enums ------------------------------------------------------------
create type match_status     as enum ('scheduled', 'live', 'finished', 'postponed');
create type match_round      as enum ('group', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final');
create type match_event_type as enum ('goal', 'assist', 'yellow', 'red', 'own_goal');
create type player_position  as enum ('GK', 'DF', 'MF', 'FW');

-- ---------- Admin helper -----------------------------------------------------
-- An admin is a Supabase Auth user whose app_metadata contains {"role": "admin"}.
-- app_metadata can only be changed server-side, so users cannot promote themselves.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- ---------- Tournament settings (single row) ---------------------------------
create table tournament_settings (
  id               int primary key default 1 check (id = 1),
  name             text not null default 'Football Tournament',
  tagline          text,
  logo_url         text,
  start_date       date,
  end_date         date,
  location         text,
  about            text,
  rules            text,
  qualify_per_group int not null default 2 check (qualify_per_group >= 0),
  contact_email    text,
  contact_phone    text,
  contact_address  text,
  facebook_url     text,
  instagram_url    text,
  youtube_url      text,
  updated_at       timestamptz not null default now()
);

-- ---------- Groups -----------------------------------------------------------
create table groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Teams ------------------------------------------------------------
create table teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  short_name text check (char_length(short_name) <= 5),
  logo_url   text,
  banner_url text,
  group_id   uuid references groups(id) on delete set null,
  coach      text,
  captain_id uuid, -- FK added after players exists
  created_at timestamptz not null default now()
);
create index teams_group_id_idx on teams(group_id);

-- ---------- Players ----------------------------------------------------------
create table players (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references teams(id) on delete cascade,
  name       text not null,
  jersey_no  int  not null check (jersey_no between 0 and 99),
  position   player_position not null,
  photo_url  text,
  is_captain boolean not null default false,
  bio        text,
  created_at timestamptz not null default now(),
  unique (team_id, jersey_no)
);
create index players_team_id_idx on players(team_id);

alter table teams
  add constraint teams_captain_id_fkey
  foreign key (captain_id) references players(id) on delete set null;

-- Keep teams.captain_id and players.is_captain in sync (one captain per team).
create or replace function sync_team_captain()
returns trigger
language plpgsql
as $$
begin
  if new.is_captain then
    update players set is_captain = false
      where team_id = new.team_id and id <> new.id and is_captain;
    update teams set captain_id = new.id where id = new.team_id;
  elsif tg_op = 'UPDATE' and old.is_captain then
    update teams set captain_id = null
      where id = new.team_id and captain_id = new.id;
  end if;
  return new;
end;
$$;

create trigger players_sync_captain
after insert or update of is_captain on players
for each row execute function sync_team_captain();

-- ---------- Matches ----------------------------------------------------------
create table matches (
  id             uuid primary key default gen_random_uuid(),
  home_team_id   uuid not null references teams(id) on delete cascade,
  away_team_id   uuid not null references teams(id) on delete cascade,
  home_score     int  not null default 0 check (home_score >= 0),
  away_score     int  not null default 0 check (away_score >= 0),
  home_penalties int check (home_penalties >= 0),
  away_penalties int check (away_penalties >= 0),
  kickoff_at     timestamptz not null,
  venue          text,
  round          match_round  not null default 'group',
  status         match_status not null default 'scheduled',
  group_id       uuid references groups(id) on delete set null,
  report         text,
  created_at     timestamptz not null default now(),
  check (home_team_id <> away_team_id)
);
create index matches_kickoff_idx on matches(kickoff_at);
create index matches_status_idx  on matches(status);
create index matches_home_idx    on matches(home_team_id);
create index matches_away_idx    on matches(away_team_id);

-- ---------- Match events -----------------------------------------------------
-- team_id is the team of the PLAYER. For 'own_goal' the goal is credited to the
-- opposing team automatically.
create table match_events (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references matches(id) on delete cascade,
  player_id  uuid references players(id) on delete set null,
  team_id    uuid not null references teams(id) on delete cascade,
  type       match_event_type not null,
  minute     int not null check (minute between 0 and 130),
  created_at timestamptz not null default now()
);
create index match_events_match_idx  on match_events(match_id);
create index match_events_player_idx on match_events(player_id);

-- ---------- Lineups ----------------------------------------------------------
create table match_lineups (
  match_id   uuid not null references matches(id) on delete cascade,
  player_id  uuid not null references players(id) on delete cascade,
  team_id    uuid not null references teams(id) on delete cascade,
  is_starter boolean not null default true,
  primary key (match_id, player_id)
);
create index match_lineups_player_idx on match_lineups(player_id);

-- Score is derived from goal events whenever events change.
-- Matches without any events keep whatever score the admin typed in manually.
create or replace function recalc_match_score(p_match_id uuid)
returns void
language plpgsql
as $$
declare
  m  matches%rowtype;
  hs int;
  aws int;
begin
  select * into m from matches where id = p_match_id;
  if not found then
    return;
  end if;

  select
    count(*) filter (where (type = 'goal'     and team_id = m.home_team_id)
                        or (type = 'own_goal' and team_id = m.away_team_id)),
    count(*) filter (where (type = 'goal'     and team_id = m.away_team_id)
                        or (type = 'own_goal' and team_id = m.home_team_id))
  into hs, aws
  from match_events
  where match_id = p_match_id;

  update matches
     set home_score = hs, away_score = aws
   where id = p_match_id
     and (home_score, away_score) is distinct from (hs, aws);
end;
$$;

create or replace function match_events_after_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform recalc_match_score(old.match_id);
  else
    perform recalc_match_score(new.match_id);
    if tg_op = 'UPDATE' and old.match_id <> new.match_id then
      perform recalc_match_score(old.match_id);
    end if;
  end if;
  return null;
end;
$$;

create trigger match_events_recalc
after insert or update or delete on match_events
for each row execute function match_events_after_change();

-- ---------- Content tables ---------------------------------------------------
create table news (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  excerpt         text,
  content         text,
  cover_url       text,
  is_announcement boolean not null default false,
  published       boolean not null default true,
  published_at    timestamptz not null default now(),
  created_at      timestamptz not null default now()
);
create index news_published_idx on news(published, published_at desc);

create table gallery (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  caption    text,
  image_url  text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table sponsors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  website_url text,
  tier        text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Home page captain carousel. If this table has no active rows, the home page
-- falls back to every player flagged is_captain.
create table carousel_slides (
  id         uuid primary key default gen_random_uuid(),
  player_id  uuid not null references players(id) on delete cascade,
  title      text,
  subtitle   text,
  image_url  text, -- optional override of the player's photo
  sort_order int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Views ------------------------------------------------------------
-- Points table. 3 pts win, 1 draw, 0 loss. Counts finished group-stage matches.
-- Order: points, goal difference, goals for. Head-to-head is applied in the
-- app (lib/standings.ts, Phase 3) for teams still level after these three.
create or replace view standings
with (security_invoker = true) as
with results as (
  select m.home_team_id as team_id, m.home_score as gf, m.away_score as ga, m.kickoff_at
  from matches m
  where m.status = 'finished' and m.round = 'group'
  union all
  select m.away_team_id, m.away_score, m.home_score, m.kickoff_at
  from matches m
  where m.status = 'finished' and m.round = 'group'
),
agg as (
  select
    team_id,
    count(*)::int                         as played,
    (count(*) filter (where gf > ga))::int as won,
    (count(*) filter (where gf = ga))::int as drawn,
    (count(*) filter (where gf < ga))::int as lost,
    sum(gf)::int                          as goals_for,
    sum(ga)::int                          as goals_against
  from results
  group by team_id
),
table_rows as (
  select
    t.id         as team_id,
    t.name,
    t.slug,
    t.short_name,
    t.logo_url,
    t.group_id,
    g.name       as group_name,
    coalesce(a.played, 0)        as played,
    coalesce(a.won, 0)           as won,
    coalesce(a.drawn, 0)         as drawn,
    coalesce(a.lost, 0)          as lost,
    coalesce(a.goals_for, 0)     as goals_for,
    coalesce(a.goals_against, 0) as goals_against,
    coalesce(a.goals_for, 0) - coalesce(a.goals_against, 0) as goal_diff,
    coalesce(a.won, 0) * 3 + coalesce(a.drawn, 0)           as points,
    -- last five results, most recent first, e.g. 'WDLWW'
    (
      select string_agg(r.res, '' order by r.kickoff_at desc)
      from (
        select
          case when x.gf > x.ga then 'W' when x.gf = x.ga then 'D' else 'L' end as res,
          x.kickoff_at
        from results x
        where x.team_id = t.id
        order by x.kickoff_at desc
        limit 5
      ) r
    ) as form
  from teams t
  left join groups g on g.id = t.group_id
  left join agg a    on a.team_id = t.id
)
select
  table_rows.*,
  (rank() over (
    partition by group_id
    order by points desc, goal_diff desc, goals_for desc
  ))::int as position
from table_rows;

-- Per-player totals.
create or replace view player_stats
with (security_invoker = true) as
select
  p.id        as player_id,
  p.name,
  p.jersey_no,
  p.position,
  p.photo_url,
  p.is_captain,
  p.team_id,
  t.name      as team_name,
  t.slug      as team_slug,
  t.logo_url  as team_logo_url,
  coalesce(ev.goals, 0)::int        as goals,
  coalesce(ev.assists, 0)::int      as assists,
  coalesce(ev.yellow_cards, 0)::int as yellow_cards,
  coalesce(ev.red_cards, 0)::int    as red_cards,
  coalesce(ev.own_goals, 0)::int    as own_goals,
  coalesce(lu.matches_played, 0)::int as matches_played
from players p
join teams t on t.id = p.team_id
left join lateral (
  select
    count(*) filter (where e.type = 'goal')     as goals,
    count(*) filter (where e.type = 'assist')   as assists,
    count(*) filter (where e.type = 'yellow')   as yellow_cards,
    count(*) filter (where e.type = 'red')      as red_cards,
    count(*) filter (where e.type = 'own_goal') as own_goals
  from match_events e
  where e.player_id = p.id
) ev on true
left join lateral (
  select count(distinct l.match_id) as matches_played
  from match_lineups l
  where l.player_id = p.id
) lu on true;

create or replace view top_scorers
with (security_invoker = true) as
select *
from player_stats
where goals > 0
order by goals desc, assists desc, name asc;

-- ---------- Realtime ---------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table matches;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table match_events;
exception when duplicate_object then null;
end $$;
