-- ============================================================================
-- GDG on Campus EPI — backend schema (Postgres / Supabase)
-- Run in the Supabase SQL editor (or `supabase db push`).
-- The API talks to these tables with the service_role key, so Row Level
-- Security is enabled with NO policies: anon/user keys cannot read or write,
-- only the trusted server can.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── Members ─────────────────────────────────────────────────────────────────
-- One row per person: community directory profile, auth identity and the
-- member's own opt-in presence state.
create table if not exists members (
  id                     text primary key default ('usr-' || replace(gen_random_uuid()::text, '-', '')),
  email                  text unique not null,
  password_hash          text,
  name                   text not null,
  role                   text not null default 'student'
                           check (role in ('super-admin', 'student', 'core-team', 'speaker', 'alumni')),
  headline               text not null default '',
  bio                    text not null default '',
  avatar                 text not null default '',
  online                 boolean not null default false,
  skills                 text[] not null default '{}',
  socials                jsonb not null default '{}'::jsonb,
  mutual_events          int not null default 0,
  projects               jsonb not null default '[]'::jsonb,
  badges                 int not null default 0,
  points                 int not null default 0,
  events_attended        int not null default 0,
  workshops              int not null default 0,
  tier                   text not null default 'Novice',
  joined_at              timestamptz not null default now(),
  -- opt-in, coarse presence (never an exact location)
  presence_status        text not null default 'off_campus',
  presence_scope         text not null default 'none',
  presence_event_id      text,
  presence_window_label  text,
  presence_expires_at    timestamptz,
  presence_ghost         boolean not null default false,
  presence_eta_mins      int,
  presence_share_team    boolean not null default false,
  presence_updated_at    timestamptz
);
create index if not exists members_role_idx on members (role);

-- ── Events ──────────────────────────────────────────────────────────────────
create table if not exists events (
  id               text primary key,
  title            text not null,
  summary          text not null default '',
  description      text not null default '',
  category         text not null,
  track            text not null default 'general',
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  duration_label   text not null default '',
  location         text not null default '',
  venue            text not null default '',
  capacity         int not null default 0,
  registered_count int not null default 0,
  cover_image      text not null default '',
  speaker          jsonb,
  featured         boolean not null default false,
  flagship         boolean not null default false,
  prize            text,
  highlights       jsonb not null default '[]'::jsonb,
  perks            jsonb,
  agenda           jsonb,
  organizer_note   text,
  created_at       timestamptz not null default now()
);
create index if not exists events_starts_at_idx on events (starts_at);

-- ── Registrations, tickets & attendance ─────────────────────────────────────
create table if not exists registrations (
  id            text primary key default ('reg-' || replace(gen_random_uuid()::text, '-', '')),
  member_id     text not null references members (id) on delete cascade,
  event_id      text not null references events (id) on delete cascade,
  status        text not null default 'registered'
                  check (status in ('none', 'registered', 'waitlist', 'attended')),
  registered_at timestamptz not null default now(),
  attended_at   timestamptz,
  token         text unique,
  unique (member_id, event_id)
);
create index if not exists registrations_token_idx on registrations (token);

-- ── Learning resources ──────────────────────────────────────────────────────
create table if not exists resources (
  id             text primary key,
  title          text not null,
  summary        text not null default '',
  description    text not null default '',
  type           text not null,
  category       text not null default '',
  difficulty     text not null default 'beginner',
  technologies   text[] not null default '{}',
  duration_mins  int not null default 0,
  author         text not null default '',
  cover_image    text not null default '',
  url            text not null default '',
  points         int not null default 25
);

create table if not exists resource_bookmarks (
  member_id   text not null references members (id) on delete cascade,
  resource_id text not null references resources (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (member_id, resource_id)
);

create table if not exists resource_progress (
  member_id   text not null references members (id) on delete cascade,
  resource_id text not null references resources (id) on delete cascade,
  progress    text not null default 'none'
                check (progress in ('none', 'started', 'completed')),
  updated_at  timestamptz not null default now(),
  primary key (member_id, resource_id)
);

-- ── Announcements & activity feed ───────────────────────────────────────────
create table if not exists announcements (
  id          text primary key,
  title       text not null,
  body        text not null default '',
  tag         text not null default '',
  deadline    timestamptz,
  created_at  timestamptz not null default now(),
  cta_label   text,
  cta_link    text,
  pinned      boolean not null default false
);

create table if not exists activity (
  id         text primary key,
  kind       text not null,
  actor      text not null,
  action     text not null,
  target     text,
  target_id  text,
  meta       text,
  stars      int,
  created_at timestamptz not null default now()
);

-- ── Notifications ───────────────────────────────────────────────────────────
-- member_id null => broadcast announcement visible to everyone.
create table if not exists notifications (
  id         text primary key,
  member_id  text references members (id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null default '',
  created_at timestamptz not null default now(),
  deep_link  text
);

create table if not exists notification_reads (
  member_id       text not null references members (id) on delete cascade,
  notification_id text not null references notifications (id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (member_id, notification_id)
);

create table if not exists notification_preferences (
  member_id             text primary key references members (id) on delete cascade,
  event_reminders       boolean not null default true,
  registration_updates  boolean not null default true,
  announcements         boolean not null default true,
  community_updates     boolean not null default true
);

-- ── Achievements ────────────────────────────────────────────────────────────
create table if not exists badges (
  id          text primary key,
  name        text not null,
  description text not null default '',
  icon        text not null default '',
  points      int not null default 0,
  rarity      text not null default 'common',
  seed_unlocked boolean not null default false,
  sort_order  int not null default 0
);

create table if not exists member_badges (
  member_id   text not null references members (id) on delete cascade,
  badge_id    text not null references badges (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (member_id, badge_id)
);

-- ── Squads ──────────────────────────────────────────────────────────────────
create table if not exists squads (
  id           text primary key,
  name         text not null,
  track        text not null,
  emblem       text not null default '',
  tagline      text not null default '',
  member_count int not null default 0,
  squad_xp     int not null default 0,
  week_xp      int not null default 0
);

create table if not exists member_squads (
  member_id  text primary key references members (id) on delete cascade,
  squad_id   text not null references squads (id) on delete cascade,
  joined_at  timestamptz not null default now()
);

-- ── Quests ──────────────────────────────────────────────────────────────────
create table if not exists quests (
  id          text primary key,
  title       text not null,
  description text not null default '',
  icon        text not null default '',
  track       text,
  reward      int not null default 0,
  locked      boolean not null default false,
  sort_order  int not null default 0
);

create table if not exists quest_steps (
  id          text primary key,
  quest_id    text not null references quests (id) on delete cascade,
  label       text not null,
  seed_done   boolean not null default false,
  sort_order  int not null default 0
);

create table if not exists member_quest_steps (
  member_id  text not null references members (id) on delete cascade,
  quest_id   text not null references quests (id) on delete cascade,
  step_id    text not null references quest_steps (id) on delete cascade,
  done_at    timestamptz not null default now(),
  primary key (member_id, step_id)
);

create table if not exists member_quests (
  member_id  text not null references members (id) on delete cascade,
  quest_id   text not null references quests (id) on delete cascade,
  claimed_at timestamptz not null default now(),
  primary key (member_id, quest_id)
);

-- ── Presence arrival board (organizers) ─────────────────────────────────────
create table if not exists arrivals (
  id         text primary key,
  member_id  text,
  name       text not null,
  avatar     text not null default '',
  eta_mins   int not null default 0,
  seed       boolean not null default false
);

-- ── Daily quiz ──────────────────────────────────────────────────────────────
create table if not exists quiz_questions (
  id          text primary key,
  prompt      text not null,
  options     jsonb not null default '[]'::jsonb,
  answer      int not null,
  explanation text not null default '',
  track       text not null default 'general',
  difficulty  text not null default 'easy',
  sort_order  int not null default 0
);

create table if not exists member_quiz_state (
  member_id     text primary key references members (id) on delete cascade,
  streak        int not null default 0,
  awarded_date  date,
  perfect       boolean not null default false,
  updated_at    timestamptz not null default now()
);

-- ── Idea box ────────────────────────────────────────────────────────────────
create table if not exists ideas (
  id           text primary key,
  title        text not null,
  body         text not null default '',
  category     text not null default 'other',
  anonymous    boolean not null default false,
  author_id    text references members (id) on delete set null,
  author_name  text,
  author_avatar text,
  base_votes   int not null default 0,
  status       text not null default 'new',
  response     text,
  responded_at timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists idea_votes (
  member_id  text not null references members (id) on delete cascade,
  idea_id    text not null references ideas (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (member_id, idea_id)
);

-- ── Decisions (core-team ballots) ───────────────────────────────────────────
create table if not exists decisions (
  id              text primary key,
  title           text not null,
  description     text not null default '',
  status          text not null default 'open' check (status in ('open', 'closed')),
  closes_at       timestamptz not null,
  quorum          int not null default 0,
  eligible_voters int not null default 0,
  results_visible boolean not null default false,
  important       boolean not null default false,
  created_at      timestamptz not null default now()
);

create table if not exists decision_options (
  id          text primary key,
  decision_id text not null references decisions (id) on delete cascade,
  label       text not null,
  base_votes  int not null default 0,
  sort_order  int not null default 0
);

create table if not exists decision_votes (
  member_id   text not null references members (id) on delete cascade,
  decision_id text not null references decisions (id) on delete cascade,
  option_id   text not null references decision_options (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (member_id, decision_id)
);

-- ── Organizing tasks ────────────────────────────────────────────────────────
create table if not exists tasks (
  id             text primary key,
  title          text not null,
  description    text not null default '',
  status         text not null default 'todo'
                   check (status in ('todo', 'in-progress', 'done')),
  priority       text not null default 'medium'
                   check (priority in ('low', 'medium', 'high')),
  points         int not null default 20,
  due_at         timestamptz,
  event_id       text references events (id) on delete set null,
  assignee_id    text references members (id) on delete set null,
  assignee_name  text,
  assignee_avatar text,
  created_at     timestamptz not null default now(),
  completed_at   timestamptz
);

create table if not exists task_completions (
  member_id     text not null references members (id) on delete cascade,
  task_id       text not null references tasks (id) on delete cascade,
  completed_at  timestamptz not null default now(),
  primary key (member_id, task_id)
);

-- ── Messenger ───────────────────────────────────────────────────────────────
create table if not exists conversations (
  id              text primary key,
  name            text not null,
  avatar          text,
  context         text,
  is_group        boolean not null default false,
  participants    int not null default 0,
  online          boolean not null default false,
  pinned          boolean not null default false,
  last_message    text not null default '',
  last_message_at timestamptz not null default now(),
  base_unread     int not null default 0
);

create table if not exists messages (
  id              text primary key,
  conversation_id text not null references conversations (id) on delete cascade,
  author_id       text references members (id) on delete set null,
  author_name     text not null default '',
  author_avatar   text,
  body            text not null default '',
  sent_at         timestamptz not null default now(),
  delivery        text not null default 'sent',
  system          boolean not null default false
);
create index if not exists messages_conversation_idx on messages (conversation_id, sent_at);

create table if not exists conversation_reads (
  member_id       text not null references members (id) on delete cascade,
  conversation_id text not null references conversations (id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (member_id, conversation_id)
);

-- ── Connections (member network) ────────────────────────────────────────────
create table if not exists member_connections (
  member_id    text not null references members (id) on delete cascade,
  connected_id text not null references members (id) on delete cascade,
  connected_at timestamptz not null default now(),
  primary key (member_id, connected_id)
);

-- ============================================================================
-- Row Level Security — locked down. The service role bypasses RLS.
-- ============================================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'members','events','registrations','resources','resource_bookmarks',
    'resource_progress','announcements','activity','notifications',
    'notification_reads','notification_preferences','badges','member_badges',
    'squads','member_squads','quests','quest_steps','member_quest_steps',
    'member_quests','arrivals','quiz_questions','member_quiz_state','ideas',
    'idea_votes','decisions','decision_options','decision_votes','tasks',
    'task_completions','conversations','messages','conversation_reads',
    'member_connections'
  ]
  loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- ============================================================================
-- Atomic counter helpers (avoid read-modify-write races)
-- ============================================================================
create or replace function increment_points(p_member_id text, p_delta int)
returns int
language plpgsql
as $$
declare
  new_points int;
begin
  update members
     set points = greatest(0, points + p_delta)
   where id = p_member_id
  returning points into new_points;
  return coalesce(new_points, 0);
end $$;

create or replace function bump_event_registered(p_event_id text, p_delta int)
returns int
language plpgsql
as $$
declare
  new_count int;
begin
  update events
     set registered_count = greatest(0, registered_count + p_delta)
   where id = p_event_id
  returning registered_count into new_count;
  return coalesce(new_count, 0);
end $$;

-- ============================================================================
-- Storage: public bucket for user-uploaded media (avatars, event covers, ...)
-- The API also creates this on boot; this keeps a fresh project in sync.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Public read of objects in the media bucket; writes are done by the API
-- using the service_role key (which bypasses RLS), so no write policy needed.
drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');
