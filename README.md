# GDG on Campus EPI — Mobile App

The mobile app of **Google Developer Groups on Campus — EPI Sousse**. Students discover events and get a QR ticket, learn Google tech, compete in squads and quests, and have their say — while the core team runs events, votes and tasks from the same app.

- **App:** Expo / React Native (Android APK, iOS-ready)
- **API:** Express on Render — `https://gdg-app.onrender.com/api/v1`
- **Database:** Supabase (Postgres)
- **Design:** "GDG Bold", rebuilt from the Google Stitch screens in [`design/stitch/`](design/stitch)

## The app: four spaces

Swipe between spaces or tap the switcher at the bottom. The command bar (`gdg://command search…`) jumps anywhere.

| Space | What's inside |
| --- | --- |
| **Today** | Your next seat as a ticket, level & streak, daily micro-sprints, the pinned announcement, this week's events, learning tracks, campus memories |
| **Explore** | One search over **Events** (track filters, upcoming / past lineup, RSVP), **People** (member directory, connect) and **Learn** (codelabs, courses, videos) |
| **Arena** | Rank card, then **Quests** (missions + XP breakdown), **Squads** (podium + leaderboard), **Quiz** (daily dev quiz) and **Badges** (showcase by tier + club stats) |
| **Voice** | **Ideas** (suggest, upvote, roadmap), **Decisions** (core-team votes) and **Tasks** (event task board) |

Opened as sheets or screens: event detail with agenda & RSVP, e-ticket with gate QR, profile (stats, memories, theme), inbox (messages + notifications), chat threads, memories gallery, organizer console with the gate scanner, roles & access.

### Guest mode

Anyone can browse events, resources, announcements and club stats without an account. Member-only areas (Arena, Voice, People, Inbox, Profile, XP) show a **Sign in to unlock** prompt.

### Roles

| Role | Can do |
| --- | --- |
| **Super admin** | Everything below, plus promote/demote members in **Roles & access** |
| **Core team** | Vote on decisions and open new votes, own the event task board, move ideas along the roadmap, organizer console, broadcasts, gate check-in |
| **Member** | Events & tickets, learning, squads, quests, quiz, badges, suggest/upvote ideas, follow decision outcomes |

## Architecture

```
Expo app  ──HTTPS + JWT──▶  Express API (Render, server/)  ──service_role──▶  Supabase Postgres
```

- The app only knows the API URL (`EXPO_PUBLIC_API_URL`). It never talks to Supabase directly and never holds a database key.
- The API issues its own JWTs and reads/writes Supabase with the **service_role** key (Row Level Security on, no policies — only the server can access the data).
- Public catalogue routes (events, resources, announcements, activity, club stats, app config, memories) need no token; everything under `/me`, members, votes, tasks, messages and admin needs one.

## Run the app

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go**, or press `a` (Android emulator) / `i` (iOS simulator). The app uses the deployed API by default (`.env`):

```bash
EXPO_PUBLIC_API_MODE=production
EXPO_PUBLIC_API_URL=https://gdg-app.onrender.com/api/v1
```

- Point at a local API: put `EXPO_PUBLIC_API_URL=http://<your-lan-ip>:4000/api/v1` in `.env.local` (git-ignored).
- Work offline: `EXPO_PUBLIC_API_MODE=mock` uses the in-memory demo database in `src/lib/api/mock`.
- The free Render instance sleeps when idle — the first request after a quiet period can take up to a minute.

> Event reminders and the camera check-in scanner need a development build; everything else works in Expo Go.

## Run the API

See [`server/README.md`](server/README.md). In short:

```bash
cd server
cp .env.example .env      # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
npm install
npm run dev               # http://localhost:4000/api/v1
```

> `SUPABASE_SERVICE_ROLE_KEY` and `JWT_SECRET` are server secrets: keep them in `server/.env` and in Render's environment only. Never put them in an `EXPO_PUBLIC_*` variable — those are bundled into the APK.

## Data & seeding

The database is seeded from [`server/src/seed`](server/src/seed):

- **Events** — the GDG On Campus EPI activity plan: the real **2025/26** season (15 activities, Info Session → Build with AI) as the past archive, and the same plan one year later as the **2026/27** upcoming lineup (ids ending in `-2627`, dates provisional — edit them in the Supabase table editor).
- **Members** — the real core team 26/27: super admins Maram Belgacem and Zeyneb, and 12 core-team members. Demo profiles used by the seed data are removed at the end of every seed.
- Resources, squads, quests, quiz questions, badges, ideas, decisions, tasks, conversations, memories and the remote UI config.

```bash
cd server
npm run seed          # full seed (also resets demo points/registrations)
npm run seed:events   # events only — safe for a live database
npm run remove:demo-members   # delete the invented demo profiles
```

### Accounts

Seeded members sign in with `<member-id>@epi.dev` (e.g. `usr-zeyneb@epi.dev`) and the seed password `gdgepi2026`; `admin@epi.dev` is Maram Belgacem (super admin). Give members their real emails and change these passwords before opening the app to everyone.

## Deploy

**API (Render)** — [`render.yaml`](render.yaml) deploys `server/` as a free Node web service with `autoDeploy`, so every push to `main` redeploys it. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `JWT_SECRET` in the service's **Environment** tab. Health check: `/health`.

**Android APK (EAS)** — requires a free [Expo account](https://expo.dev):

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

The build page shows a download link and an install QR code. Share the `.apk` file directly (Android only for now); rebuild after app changes.

## Checks

```bash
npm run lint             # expo lint
npm run typecheck        # tsc --noEmit
npm test                 # jest
cd server && npm run typecheck && npm run build
```

## Tech stack

Expo SDK 57 · React Native 0.86 · expo-router · TypeScript · Tamagui · TanStack Query · React Hook Form + Zod · zustand · Reanimated · react-native-pager-view · react-native-svg · Express · Supabase

## Structure

```
src/
  app/               routes (expo-router): (auth), (spaces), sheets, inbox, admin, settings
  features/spaces/   Today · Explore · Arena · Voice and the pager shell
  features/arena/    quests, squads, quiz, badges, rank card
  features/voice/    ideas, decisions, tasks
  components/        UI kit, cards, navigation (TopBar, SpaceSwitcher, CommandBar, CommandPalette)
  hooks/             data hooks (TanStack Query)
  lib/api/           API contract, HTTP client, offline mock backend
  lib/auth/          session, roles & permissions
  theme/             design tokens (colors, type, radius, gradients, shadows)
server/
  src/routes/        Express routes under /api/v1
  src/seed/          seed data + scripts
  supabase/          schema.sql
design/stitch/       Google Stitch designs (source of truth for the UI)
```
