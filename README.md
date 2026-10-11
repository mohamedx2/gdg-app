# GDG on Campus EPI — Mobile App

A mobile app for **Google Developer Groups on Campus — EPI Sousse**. It helps students discover events, connect with the community, learn Google tech, and earn achievements — with a built-in mock backend so it runs with no server.

## What the app does

### Discover & learn
- **Events** — browse upcoming workshops, talks, study jams and hackathons, filter by track (Flutter, AI/ML, Cloud, Web, Android), and register with one tap.
- **Event details** — agenda, speakers, perks and location; add to your phone calendar, get a reminder, and share it.
- **QR check-in** — show your ticket QR at the door; organizers scan it to record attendance and award points.
- **Resources** — codelabs, courses, videos and articles by level; bookmark them, track progress, and earn XP.
- **Community** — explore member profiles (core team, speakers, alumni), see skills and projects, and connect.

### Compete & contribute
- **Achievements & XP** — unlock badges for attending events, completing resources, quizzes and more; level up from Novice to Champion Builder.
- **Squads** — join a track team and climb the semester leaderboard.
- **Quests** — multi-step goals that reward XP when all steps are done.
- **Daily quiz** — a short campus quiz with a streak and a perfect-score badge.
- **Event tasks** *(core team)* — the organizing board, grouped by event: assign tasks to an activity, move them to-do → in-progress → done, and earn points on completion.

### Connect & have your say
- **Who's around** — opt-in, coarse presence with "on my way" ETAs; off by default, with ghost mode and auto-expiry. Core team sees individuals, members see crowd level.
- **Idea box** — suggest features, upvote others, and track the roadmap with the club's "You said, we did" responses.
- **Decisions** — core-team ballots with quorum, deadlines, and live or hidden results; members follow outcomes.
- **Club stats** — public, club-wide impact numbers, per-track breakdown, and top contributors.
- **Messages** — chat threads with the club and event teams (mock; see note below).
- **Profile & settings** — points, badges, notification preferences, and light/dark/system theme.
- **Organizer dashboard** *(core team only)* — stats, publish announcements, scan check-ins, and manage the community.
- **Push reminders** — optional local notifications for events you registered for.

## Roles

| Role | Can do |
| --- | --- |
| **Super admin** | Everything the core team can, plus promote/demote members in **Roles & access** |
| **Core member** | Vote on decisions, open new votes, own the event task board, move ideas along the roadmap (one-tap *Upgrade*), organizer dashboard & check-in |
| **Member** | Events, resources, community, suggest/upvote ideas, see decision outcomes (read-only) |

## Demo accounts

The app ships with a built-in mock backend (no server needed). Tap an account on the sign-in screen to fill it in:

| Account | Password | Role |
| --- | --- | --- |
| `admin@epi.dev` | `gdgepi2026` | Super admin |
| `organizer@epi.dev` | `gdgepi2026` | Core member |
| `member@epi.dev` | `gdgepi2026` | Member |

Events are seeded from the 2025/26 GDG On Campus EPI activity plan (Info Session → Build with AI series).

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go**, or press `a` for an Android emulator / `i` for iOS simulator.

> Note: event reminder notifications and the camera-based check-in scanner need a development build (they're limited in Expo Go). Everything else works offline thanks to the mock backend.

## Checks

```bash
npm run lint        # expo lint
npm run typecheck   # tsc --noEmit
npm test            # jest
```

## Build an Android APK

Requires a free [Expo account](https://expo.dev):

```bash
npx eas-cli login
npx eas-cli build -p android --profile preview
```

## Tech stack

Expo SDK 57 · React Native 0.86 · expo-router · TypeScript · TanStack Query · React Hook Form + Zod · zustand · Reanimated · react-native-svg

## Structure

```
src/
  app/             screens & routes (expo-router)
  components/      reusable UI kit + cards
  features/        auth, events, resources, community, achievements, notifications, profile
  hooks/           data hooks (events, squads, quests, presence, quiz, ideas, decisions, tasks, messages…)
  lib/api/         API contract + in-memory mock backend (swappable via isMockMode)
  stores/          zustand stores (theme, ui)
  theme/           design tokens (colors, type, spacing, gradients)
  types/           shared TypeScript types
  constants/       taxonomy + environment config
  utils/           date & formatting helpers
```

## Mock backend

All data flows through a single replaceable `api` surface (`src/lib/api`). In mock mode it reads from an in-memory database seeded with realistic demo data and persists small session changes (votes, registrations, sent messages, custom ideas/tasks/decisions) via AsyncStorage. Set the API to HTTP mode to point the same hooks at a real server.

Realtime messaging is mocked: threads and sending work locally, but live delivery would need a backend (e.g. Supabase, Firebase or WebSockets).
