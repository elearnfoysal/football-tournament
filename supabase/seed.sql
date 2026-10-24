-- =============================================================================
-- Seed data: 2 groups, 8 teams, 40 players, 12 matches (6 finished, 1 live,
-- 5 scheduled), match events, lineups, news, sponsors.
-- Run ONCE, after both migrations. Dates are relative to the moment you run it.
-- Scores are produced by the match_events trigger, so every goal is an event.
-- =============================================================================

insert into tournament_settings
  (id, name, tagline, start_date, end_date, location, about, rules,
   qualify_per_group, contact_email, contact_phone, contact_address)
values (
  1,
  'City Football Cup 2026',
  'Eight teams. One trophy.',
  current_date - 10,
  current_date + 21,
  'Municipal Stadium',
  'The City Football Cup brings eight local clubs together for three weeks of group football and knockout drama.',
  E'1. Matches are 2 x 30 minutes with a 10 minute break.\n2. A win earns 3 points, a draw 1, a loss 0.\n3. Table ties are broken by goal difference, goals scored, then head-to-head result.\n4. Two yellow cards in a match means a red card. A red card means a one-match suspension.\n5. Knockout matches level after full time go straight to penalties.',
  2,
  'info@example.com',
  '+880 1700 000000',
  'Municipal Stadium, City Centre'
)
on conflict (id) do nothing;

insert into groups (name, sort_order) values
  ('Group A', 1),
  ('Group B', 2);

insert into teams (name, slug, short_name, group_id, coach)
select v.name, v.slug, v.short_name, g.id, v.coach
from (values
  ('Riverside FC',     'riverside-fc',     'RIV', 'Group A', 'Anwar Hossain'),
  ('Harbor United',    'harbor-united',    'HAR', 'Group A', 'Delwar Karim'),
  ('Northern Lions',   'northern-lions',   'NOR', 'Group A', 'Mizanur Rahman'),
  ('Golden Eagles',    'golden-eagles',    'GOL', 'Group A', 'Faruk Ahmed'),
  ('Coastal Strikers', 'coastal-strikers', 'COA', 'Group B', 'Shahin Alam'),
  ('Red Dragons',      'red-dragons',      'RED', 'Group B', 'Mahbub Alam'),
  ('Blue Falcons',     'blue-falcons',     'BLU', 'Group B', 'Jashim Uddin'),
  ('Metro Warriors',   'metro-warriors',   'MET', 'Group B', 'Habibur Rahman')
) as v(name, slug, short_name, group_name, coach)
join groups g on g.name = v.group_name;

-- The players trigger copies each captain into teams.captain_id.
insert into players (team_id, name, jersey_no, position, is_captain, bio)
select t.id, v.name, v.jersey_no, v.pos::player_position, v.is_captain, v.bio
from (values
  ('riverside-fc',     'Tanvir Ahmed',     1,  'GK', false, 'Reliable shot-stopper and the loudest voice in the back line.'),
  ('riverside-fc',     'Rafiq Islam',      4,  'DF', true,  'Captain. Reads the game early and wins most aerial duels.'),
  ('riverside-fc',     'Sabbir Khan',      8,  'MF', false, 'Box-to-box engine with a long throw.'),
  ('riverside-fc',     'Imran Chowdhury',  10, 'MF', false, 'Playmaker who sets the tempo for Riverside.'),
  ('riverside-fc',     'Nayeem Sarker',    9,  'FW', false, 'Poacher with a knack for late goals.'),

  ('harbor-united',    'Mehedi Hasan',     1,  'GK', false, 'Quick off his line and calm with the ball at his feet.'),
  ('harbor-united',    'Jahid Rahman',     5,  'DF', false, 'Strong tackler who rarely gives away fouls.'),
  ('harbor-united',    'Farhan Alam',      6,  'MF', false, 'Holds the midfield together.'),
  ('harbor-united',    'Shakil Mia',       10, 'MF', true,  'Captain. Creative left foot and the team''s set-piece taker.'),
  ('harbor-united',    'Rubel Hossain',    11, 'FW', false, 'Pacey winger who cuts in on his right.'),

  ('northern-lions',   'Kamal Uddin',      1,  'GK', false, 'Veteran keeper with excellent positioning.'),
  ('northern-lions',   'Asif Karim',       3,  'DF', false, 'Left back who overlaps relentlessly.'),
  ('northern-lions',   'Tareq Aziz',       8,  'MF', true,  'Captain. Leads by example in every press.'),
  ('northern-lions',   'Hasib Munna',      7,  'MF', false, 'Direct dribbler on the right side.'),
  ('northern-lions',   'Ovi Barua',        9,  'FW', false, 'Target man who holds the ball up well.'),

  ('golden-eagles',    'Sohan Reza',       1,  'GK', false, 'Commands his area and distributes quickly.'),
  ('golden-eagles',    'Emon Dey',         2,  'DF', false, 'Athletic right back with a strong recovery run.'),
  ('golden-eagles',    'Shuvo Paul',       10, 'MF', true,  'Captain. Sees passes others miss.'),
  ('golden-eagles',    'Rakib Talukder',   6,  'MF', false, 'Disciplined defensive midfielder.'),
  ('golden-eagles',    'Nabil Siddique',   9,  'FW', false, 'Clinical finisher inside the box.'),

  ('coastal-strikers', 'Joy Das',          1,  'GK', false, 'Brave keeper who thrives in one-on-ones.'),
  ('coastal-strikers', 'Parvez Hossain',   4,  'DF', true,  'Captain. Organises the defence from the front.'),
  ('coastal-strikers', 'Zubair Ali',       8,  'MF', false, 'Tireless runner with a good passing range.'),
  ('coastal-strikers', 'Rahat Khan',       10, 'MF', false, 'Attacking midfielder with a powerful shot.'),
  ('coastal-strikers', 'Sumon Mallik',     7,  'FW', false, 'Lightning-quick forward who stretches defences.'),

  ('red-dragons',      'Liton Ghosh',      1,  'GK', false, 'Sharp reflexes, especially from close range.'),
  ('red-dragons',      'Masud Parvez',     5,  'DF', false, 'Physical centre back, strong in the air.'),
  ('red-dragons',      'Rony Sheikh',      6,  'MF', false, 'Breaks up play and recycles possession.'),
  ('red-dragons',      'Arman Hossain',    10, 'MF', true,  'Captain. Heartbeat of the Red Dragons.'),
  ('red-dragons',      'Tuhin Roy',        9,  'FW', false, 'Hard-working striker who presses from the front.'),

  ('blue-falcons',     'Ashik Rahman',     1,  'GK', false, 'Consistent and vocal, a leader from the back.'),
  ('blue-falcons',     'Fahim Ahmed',      3,  'DF', true,  'Captain. Calm under pressure, rarely beaten.'),
  ('blue-falcons',     'Mamun Bhuiyan',    8,  'MF', false, 'Combative midfielder who wins second balls.'),
  ('blue-falcons',     'Salman Sarwar',    10, 'MF', false, 'Silky dribbler and set-piece specialist.'),
  ('blue-falcons',     'Dipu Nath',        11, 'FW', false, 'Left-sided forward with an eye for goal.'),

  ('metro-warriors',   'Nurul Amin',       1,  'GK', false, 'Dominant presence, rarely troubled in the air.'),
  ('metro-warriors',   'Sajid Kabir',      2,  'DF', false, 'Quick full back who loves to attack.'),
  ('metro-warriors',   'Habib Ullah',      4,  'MF', true,  'Captain. Mixes grit with a sharp passing game.'),
  ('metro-warriors',   'Rasel Mia',        10, 'MF', false, 'Free-kick specialist and the team''s main creator.'),
  ('metro-warriors',   'Kawsar Ali',       9,  'FW', false, 'Strong finisher who thrives on through balls.')
) as v(team_slug, name, jersey_no, pos, is_captain, bio)
join teams t on t.slug = v.team_slug;

-- Matches. Finished and live scores come from the events inserted below.
insert into matches (home_team_id, away_team_id, kickoff_at, venue, round, status, group_id)
select h.id, a.id, v.kickoff, v.venue, 'group', v.status::match_status, h.group_id
from (values
  ('riverside-fc',     'harbor-united',    date_trunc('hour', now()) - interval '10 days',                 'Municipal Stadium', 'finished'),
  ('northern-lions',   'golden-eagles',    date_trunc('hour', now()) - interval '10 days' + interval '3 hours', 'Municipal Stadium', 'finished'),
  ('coastal-strikers', 'red-dragons',      date_trunc('hour', now()) - interval '9 days',                  'Riverside Ground',  'finished'),
  ('blue-falcons',     'metro-warriors',   date_trunc('hour', now()) - interval '9 days' + interval '3 hours',  'Riverside Ground',  'finished'),
  ('harbor-united',    'golden-eagles',    date_trunc('hour', now()) - interval '4 days',                  'Municipal Stadium', 'finished'),
  ('red-dragons',      'metro-warriors',   date_trunc('hour', now()) - interval '3 days',                  'Riverside Ground',  'finished'),
  ('riverside-fc',     'golden-eagles',    now() - interval '40 minutes',                                  'Municipal Stadium', 'live'),
  ('riverside-fc',     'northern-lions',   date_trunc('hour', now()) + interval '1 day 3 hours',           'Municipal Stadium', 'scheduled'),
  ('coastal-strikers', 'blue-falcons',     date_trunc('hour', now()) + interval '1 day 6 hours',           'Riverside Ground',  'scheduled'),
  ('harbor-united',    'northern-lions',   date_trunc('hour', now()) + interval '2 days 3 hours',          'Municipal Stadium', 'scheduled'),
  ('coastal-strikers', 'metro-warriors',   date_trunc('hour', now()) + interval '2 days 6 hours',          'Riverside Ground',  'scheduled'),
  ('red-dragons',      'blue-falcons',     date_trunc('hour', now()) + interval '3 days 3 hours',          'Riverside Ground',  'scheduled')
) as v(home_slug, away_slug, kickoff, venue, status)
join teams h on h.slug = v.home_slug
join teams a on a.slug = v.away_slug;

-- Events: (home, away, team of player, jersey, type, minute)
insert into match_events (match_id, player_id, team_id, type, minute)
select m.id, p.id, p.team_id, v.ev_type::match_event_type, v.minute
from (values
  -- Riverside 2-1 Harbor
  ('riverside-fc', 'harbor-united', 'riverside-fc',  10, 'goal',   23),
  ('riverside-fc', 'harbor-united', 'riverside-fc',   8, 'assist', 23),
  ('riverside-fc', 'harbor-united', 'harbor-united', 10, 'goal',   55),
  ('riverside-fc', 'harbor-united', 'riverside-fc',   9, 'goal',   67),
  -- Northern Lions 1-1 Golden Eagles
  ('northern-lions', 'golden-eagles', 'northern-lions',  9, 'goal',   12),
  ('northern-lions', 'golden-eagles', 'golden-eagles',   2, 'yellow', 44),
  ('northern-lions', 'golden-eagles', 'golden-eagles',  10, 'goal',   80),
  -- Coastal Strikers 3-0 Red Dragons
  ('coastal-strikers', 'red-dragons', 'coastal-strikers',  7, 'goal',   10),
  ('coastal-strikers', 'red-dragons', 'coastal-strikers',  7, 'goal',   34),
  ('coastal-strikers', 'red-dragons', 'coastal-strikers', 10, 'assist', 34),
  ('coastal-strikers', 'red-dragons', 'red-dragons',       6, 'yellow', 40),
  ('coastal-strikers', 'red-dragons', 'coastal-strikers', 10, 'goal',   71),
  -- Blue Falcons 0-2 Metro Warriors
  ('blue-falcons', 'metro-warriors', 'metro-warriors', 10, 'goal',   30),
  ('blue-falcons', 'metro-warriors', 'blue-falcons',    8, 'red',    60),
  ('blue-falcons', 'metro-warriors', 'metro-warriors',  9, 'goal',   85),
  -- Harbor United 2-2 Golden Eagles
  ('harbor-united', 'golden-eagles', 'harbor-united',  11, 'goal',   15),
  ('harbor-united', 'golden-eagles', 'golden-eagles',   9, 'goal',   30),
  ('harbor-united', 'golden-eagles', 'harbor-united',  11, 'goal',   50),
  ('harbor-united', 'golden-eagles', 'harbor-united',   5, 'yellow', 62),
  ('harbor-united', 'golden-eagles', 'golden-eagles',  10, 'goal',   75),
  -- Red Dragons 1-2 Metro Warriors
  ('red-dragons', 'metro-warriors', 'red-dragons',    9, 'goal',   18),
  ('red-dragons', 'metro-warriors', 'metro-warriors', 10, 'goal',   44),
  ('red-dragons', 'metro-warriors', 'metro-warriors',  2, 'yellow', 70),
  ('red-dragons', 'metro-warriors', 'metro-warriors',  4, 'goal',   79),
  -- Riverside 1-1 Golden Eagles (live)
  ('riverside-fc', 'golden-eagles', 'riverside-fc', 10, 'goal', 14),
  ('riverside-fc', 'golden-eagles', 'golden-eagles',  9, 'goal', 33)
) as v(home_slug, away_slug, team_slug, jersey_no, ev_type, minute)
join teams ht on ht.slug = v.home_slug
join teams aw on aw.slug = v.away_slug
join matches m on m.home_team_id = ht.id and m.away_team_id = aw.id
join teams tm on tm.slug = v.team_slug
join players p on p.team_id = tm.id and p.jersey_no = v.jersey_no;

-- Lineups: every squad member featured in finished and live matches.
insert into match_lineups (match_id, player_id, team_id, is_starter)
select m.id, p.id, p.team_id, true
from matches m
join players p on p.team_id in (m.home_team_id, m.away_team_id)
where m.status in ('finished', 'live');

insert into news (title, slug, excerpt, content, is_announcement, published_at) values
  ('Fixtures for the group stage are out',
   'fixtures-released',
   'All 12 group matches are now scheduled. Check the fixtures page for dates and venues.',
   'The organising committee has confirmed every group stage fixture. Kick-off times are listed on the fixtures page and may be updated if weather requires.',
   true,  now() - interval '11 days'),
  ('Fair play reminder for all squads',
   'fair-play-reminder',
   'Teams are asked to arrive 45 minutes before kick-off and submit squad lists to the match commissioner.',
   'Please arrive early, bring your own match balls for warm-up, and hand in your team sheet at least 30 minutes before kick-off.',
   true,  now() - interval '6 days'),
  ('Coastal Strikers open with a statement win',
   'coastal-strikers-open-with-a-win',
   'A brace from Sumon Mallik helped Coastal Strikers beat Red Dragons 3-0 in Group B.',
   'Coastal Strikers set the early pace in Group B with a convincing 3-0 win. Sumon Mallik scored twice before Rahat Khan sealed the result.',
   false, now() - interval '9 days');

insert into sponsors (name, website_url, tier, sort_order) values
  ('Harbor Bank',        'https://example.com', 'Title sponsor',    1),
  ('Metro Mobile',       'https://example.com', 'Official partner', 2),
  ('GreenField Sports',  'https://example.com', 'Official partner', 3),
  ('Riverside Dairy',    'https://example.com', 'Supporter',        4);
