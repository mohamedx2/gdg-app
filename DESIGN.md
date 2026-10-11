# GDG on Campus EPI — App Design Specification

**Product:** Google Developer Groups on Campus — EPI Sousse (Tunisia)
**Platform:** iOS · Android (React Native / Expo, Tamagui styling engine)
**Scheme:** `gdgepi://`
**API:** `https://gdg-app.onrender.com/api/v1`

A mobile-first "campus hub" for a student developer community: event discovery, member directory, learning resources, gamified engagement (squads, quests, quiz, XP/levels), community voice (ideas, decisions, tasks), chats, memories gallery, and a role-based organizer admin surface.

---

## 1. Brand & Design Foundations

Design language: **"GDG Bold"** — warm paper-like surfaces, near-black ink text, Google product colors used as deliberate accent blocks, generous rounded corners, soft shadows, and confident typography.

### 1.1 Color System

Every value exists in a **light** and a **dark** scheme and is consumed through semantic tokens (never raw hex in UI code).

#### Core surfaces & text

| Token | Light | Dark |
|---|---|---|
| `background` | `#FAFAF7` | `#0B0D12` |
| `surface` | `#FAFAF7` | `#0B0D12` |
| `surfaceBright` | `#FFFFFF` | `#1C1F27` |
| `surfaceDim` | `#E7E6DF` | `#07080C` |
| `surfaceContainerLowest` | `#FFFFFF` | `#15181F` |
| `surfaceContainerLow` | `#F3F2EC` | `#12141A` |
| `surfaceContainer` | `#EDECE5` | `#1A1D25` |
| `surfaceContainerHigh` | `#E6E5DD` | `#22262F` |
| `surfaceContainerHighest` | `#DEDDD4` | `#2C303A` |
| `onSurface` (ink) | `#111318` | `#F2F3F5` |
| `onSurfaceVariant` | `#4A4D57` | `#A3A7B3` |
| `outline` | `#6E717C` | `#8A8E9A` |
| `outlineVariant` | `#D9D8D0` | `#33373F` |
| `divider` | `#ECEBE4` | `#1C1F27` |

#### Brand / accent (Google-inspired)

| Token | Light | Dark |
|---|---|---|
| `primary` (Google Blue) | `#1A5FD6` | `#8AB4F8` |
| `primaryContainer` | `#1A73E8` | `#1A73E8` |
| `primaryFixed` | `#DCE8FF` | `#132B55` |
| `secondary` (warm gold) | `#5B5E68` | `#9AA0A6` |
| `secondaryContainer` | `#FFF1C2` | `#3A2E05` |
| `tertiary` (Google Green) | `#137A3A` | `#81C995` |
| `tertiaryContainer` | `#1E8E3E` | `#137333` |
| `error` | `#C5221F` | `#F28B82` |
| `errorContainer` | `#FCDCD8` | `#8C1D18` |
| `warning` | `#E8A200` | `#FDD663` |
| `success` | `#1E8E3E` | `#81C995` |
| `info` | `#1A73E8` | `#8AB4F8` |
| `terminal` (code blocks) | `#0B0D12` | `#0B1120` |

The four brand "GDG dots" are fixed Google colors, used as a signature accent:
`#EA4335` (red) · `#4285F4` (blue) · `#FBBC04` (yellow) · `#34A853` (green).

#### Gradients
- **`brand`** — blue→violet hero gradient behind headers (announcement banner, profile hero, level card, tab highlight).
- **`aurora`** — animated multi-hue gradient used on the XP/level card.
- **`warning`, `tertiary`, `secondary`** — accent gradients for featured content.

Hero gradients render with floating soft **"orbs"** (decorative blurred circles) for depth.

### 1.2 Typography

| Role | Font | Size / Line / Track | Used for |
|---|---|---|---|
| `headlineXl` | Plus Jakarta Sans 700 | 36/44, −0.72 | Launcher/hero copy |
| `headlineXlMobile` | Plus Jakarta Sans 700 | 28/36, −0.56 | Onboarding titles |
| `headlineLg` | Plus Jakarta Sans 600 | 24/32, −0.36 | Screen titles |
| `headlineMd` | Plus Jakarta Sans 600 | 20/28, −0.2 | Section/page headings |
| `headlineSm` | Plus Jakarta Sans 600 | 16/24 | Card heroes |
| `titleLg` | Plus Jakarta Sans 700 | 18/26 | Card titles |
| `titleMd` | Plus Jakarta Sans 600 | 16/22 | Card/row titles |
| `titleSm` | Inter 600 | 14/20 | List item titles |
| `bodyLg` | Inter 400 | 16/26 | Lead copy |
| `bodyMd` | Inter 400 | 14/22 | Body copy |
| `bodySm` | Inter 400 | 12/18 | Secondary copy |
| `bodyXs` | Inter 400 | 10/14 | Micro copy |
| `labelLg` | Inter 600 | 14/20 | Button/label text |
| `labelMd` | Inter 500 | 12/16 | Captions |
| `labelSm` | Inter 600 | 11/14 | Tab labels |
| `codeMd` | JetBrains Mono 500 | 13/20 | Code / meta |
| `codeSm` | JetBrains Mono 500 | 11/16, +0.22 | Uppercase labels, count badges, timestamps |

Selective use of monospace (`codeSm`/`codeMd`) for data-y accents (counts, campus labels, deadlines, XP numbers) gives the app a developer feel.

### 1.3 Spacing & Radius

Spacing scale (8-pt based, `px`): 2, 4, 6, 8, 10, 12, 14, 16, 20, 22, 24, 28, 32, 40.
Screen gutters: `16px` horizontal, tab content bottom padding `112px` (above floating dock).

Radius scale (tokens: `xs 6`, `sm 8`, `base 10`, `card 12`, `md 14`, `lg 16`, `xl 20`, `full 999`).
Cards `12px`, buttons `8px`, pills/dots `999px`.

### 1.4 Elevation & Motion

- **Shadows:** layered soft shadows (`theme.shadow(1..3)`); key surfaces (settings card, terminal card) use level 1.
- **Haptics:** light press feedback on primary gestures.
- **Reveal/Stagger:** content groups fade+lift in with staggered delay as you scroll (`<Reveal>`, `<Stagger>`).
- **AnimatedNumber:** XP/counters roll up to value.
- **PressableScale:** interactive cards scale down ~2% on press.
- **Skeletons:** shimmer placeholders while data loads (never blank screens).
- **KeyboardShift:** forms lift inputs above the keyboard.
- Preferred screen width for design: **375 pt** (compact), with 2-up grid cards.

---

## 2. Shared UI Components

| Component | Behavior |
|---|---|
| `Button` | Primary (`primaryContainer`, white label), secondary, ghost, `loading` spinner, leading/trailing icon |
| `IconButton` | Round press target, optional dot **badge** (unread) + `primaryFixed` bubble when active |
| `Text` | 18 typographic variants (`variant`), auto-contrast for `onSurface`, `muted`, `primary`, `tertiary`, `error` colors |
| `Avatar` | Image or initials; optional white ring (`ring="brand"`), online dot, optional accent border |
| `AvatarStack` | Overlapping avatars (used on onboarding cards) |
| `Chip` | `Pill` (dotted role label), `SolidPill` (uppercase announcement tag, used on gradients), `FilterChip`/`TagPill` (selectable filter), `FilterChip` supports leading icon |
| `SearchBar` | Rounded search field + filter (tune) button; Home screen submit navigates to Events with the query |
| `Card` (EventCard, ResourceCard, ActivityCard, MemberCard…) | Surface card with `borderRadius: card`, hairline border, shadow; `CompactEventCard` and `FeaturedEventCard` variants |
| `Surface` | Grouped-list container (`overflow: hidden` + hairline dividers between rows) |
| `SectionHeader` | Title + subtitle + optional accent + "See all" action |
| `Skeleton` / `SkeletonCard` | Shimmer loaders; card-shaped or custom size |
| `EmptyState` / `ErrorState` | Illustration icon + title + message + optional retry/action button |
| `Gradient` + `Orbs` | Decorated hero/announcement backgrounds |
| `SpotlightCard` | Glow behind gradient content (level card) |
| `PressableScale` | Animated pressable wrapper for cards/rows |
| `FormTextField` | Labeled input with icon, react-hook-form + zod validation, secure/auto-fill support |
| `KeyboardShift` | Animates content above keyboard |

Floating **Dock Tab Bar** (5 tabs): pill-shaped floating bar with full-radius gradient pill behind the active icon, white icon + `labelSm` caption; badges not present on tabs.

---

## 3. Navigation Architecture

```
(app entry) _layout → auth provider, theme store, Tamagui provider, toasts

(auth)
  welcome ──▶ register ──▶ (tabs)
  └─▶ login ──────────┘

(tabs)  ← floating dock: Home · Events · Community · Resources · Profile
  Home
  Events ──▶ events/[id] ──▶ ticket/[id]  (RSVP → e-ticket)
  Community ──▶ community/[id]
  Resources ──▶ resource/[id]
  Profile ──▶ settings/{index, appearance, notifications}
           └─▶ admin/{index, check-in, roles}   (organizers only)

Stack (pushed full-screen from Home/Profile):
  notifications · messages · messages/[id]
  memos-tier surfaces: memories · squads · quests · quiz · achievements · stats · presence
  animation lab: animations
  voice surfaces: ideas · decisions · tasks
```

Auth is **guest-friendly**: unauthenticated users may browse the tabs, but `(tabs)` redirects to `(auth)/welcome` when there is no session; organizer-only routes guard on permission.

---

## 4. Screen-by-Screen Specification

### 4.0 Auth flow

#### Onboarding / Welcome — `(auth)/welcome`
- **Purpose:** Brand-first intro carousel + auth entry.
- **Top bar:** campus chip (`GDG dots` + "EPI Sousse, Tunisia") + `Skip`.
- **Carousel (3 server-driven slides, paged, 375pt):** each slide = illustration card + badge pill + `headlineXlMobile` title + `bodyLg`.
  - Slide 1: **GDG Interactive Console** — a terminal card with tab switcher (Python / Flutter / React), live code snippet on near-black `terminal` background, `Active Hub` status pill, avatar stack + "+420 builders in Sousse".
  - Slides 2/3: **mentor cards** — EPI Alumni & GDE Network rows (avatar, name, role, track), "Exclusive campus fast-track for Google Summer of Code" note.
- **Dots indicator** (active dot elongates to 28px).
- **CTA:** `Join GDG EPI` (advance) → last slide shows `Get Started with GDG` (→ register). Secondary `Continue as guest`, tertiary `Sign in` link.
- Slides come from server `app_config` (taxonomy `welcome.slides`), so copy/colors are editable remotely.

#### Sign in — `(auth)/login`
- **Purpose:** Authenticate returning members.
- Header `Welcome back 👋`, subtitle.
- **Continue with Google** button (brand 4-dot mark, outlined).
- `OR` divider → Email + Password `FormTextField`s (`you@epi.dev` placeholder, icons).
- Inline `errorContainer` banner for server failures.
- Primary `Sign in` (loading state) → replaces to `(tabs)`. Link: `Create an account`.

#### Create account — `(auth)/register`
- **Purpose:** New-member onboarding.
- Header `Join the chapter 🚀`.
- Fields: Full name, Email, Password (min 8 chars), Confirm password.
- Custom **checkbox** for "I agree to the community guidelines / code of conduct" — blocking inline error if unchecked.
- Primary `Create account` (loading) → `(tabs)`. Link: `Sign in`.

---

### 4.1 Home — `(tabs)/index`

Single vertical feed; every block is a `Reveal`.

1. **Header:** avatar w/ brand ring, GDG dots + `GDG ON CAMPUS` mono label, `Hello, {first name}` headline; trailing **Messages** + **Notifications** icon buttons (unread → `primaryFixed` bubble + dot badge).
2. **SearchBar** — typing navigates to Events (`/events?search=…`); filter button → Events.
3. **Announcement banner** — full-width `brand` gradient + orbs, `SolidPill` tag, mono deadline ("Live now" / "Due Sep 12"), title, 2-line body, `Read more`.
4. **Featured event** — `FeaturedEventCard` (large). Off-season fallback: "Latest activities" from past events.
5. **Upcoming events** — horizontal `CompactEventCard` rail (stagger in), `SectionHeader` "See all" → Events. Subtitle flips to "Season 2025/26 recap · new dates soon" when off-season.
6. **Level card** — `aurora` gradient + orbs: tier ("{Tier} Builder"), animated XP count, `XP / goal`, next-tier label, white progress bar, 3 metrics (Events/Labs/Streak).
7. **Compete row** — 3 tiles: Squads · Quests · Daily quiz.
8. **Voice row** — 2 tiles; adaptive by permission: "Core votes + Event tasks" for decision-makers, else "Idea box + Decisions".
9. **Memories** — horizontal photo rail (150×190, card radius), latest 6.
10. **Community pulse** — 3 `ActivityCard`s → Community. Hidden when empty.
11. **Continue learning** — horizontal recommended `ResourceCard` rail → Resources. Hidden when empty.

**States:** skeletons for avatar/featured/level while loading; blocks conditionally hide on empty; banner absent when no announcement.

---

### 4.2 Events — `(tabs)/events`

- **Purpose:** browse/search/filter the event calendar.
- Header: `ScreenHeading` ("Events", count right-aligned in mono), SearchBar, horizontal **track FilterChips** (All/Themes from taxonomy) + **Past events** toggle chip.
- Subheader row: uppercase label (`Upcoming events` / `Previously at GDG EPI`) + mono count.
- Vertical `EventCard` list (date block, title, track pill, location, meta).
- Search is debounced (250ms), server-side; track filter is single-select.
- **States:** `SkeletonCard` ×4 while loading; `EmptyState` (`Search clear filters` action) when no matches; `ErrorState` with retry.

### 4.3 Event detail — `events/[id]`
- **Purpose:** full event page + RSVP.
- Hero: event cover (gradient fallback), date chips, title, track tag, location/time.
- Body: description, agenda/stats, organizer mentions, "Who's going" avatar strip.
- **Primary action:** RSVP / register button; capacity state shown when full.
- Success flow → `ticket/[id]`.

### 4.4 E-ticket — `ticket/[id]`
- **Purpose:** QR-style confirmation pass for an RSVP'd event.
- Dark hero with brand gradient, event name, date/time/venue, member name + permalink mini-URL, QR code block, and a "flip" visual of ticket perforation. Styled like a physical stub.

---

### 4.5 Community — `(tabs)/community`
- **Purpose:** member directory.
- Header: `ScreenHeading` ("Community", total count), SearchBar, wrapping **role FilterChips** (All + roles from taxonomy).
- **2-column `FlashList`** of `MemberCard`s: avatar with role-colored ring + online dot, name, role `Pill` (color-coded: core-team/secondary, speaker/primary, alumni/tertiary), 2-line headline.
- **States:** skeleton cards, `EmptyState` (clear), `ErrorState` retry.

### 4.6 Member profile — `community/[id]`
- **Purpose:** public member deep-dive.
- Hero card: big avatar, name, role pill, headline; presence (online) indicator; bio.
- Sections as data permits: activity feed, XP/badges snapshot, link/button to chat with the member → `messages/[id]`.

---

### 4.7 Resources — `(tabs)/resources`
- **Purpose:** learning library (codelabs, videos, articles, docs).
- Header + SearchBar + **difficulty chip row** + **type chip row** (icons per type).
- **2-column grid** of `ResourceCard`s (type icon, title, difficulty pill, source/platform meta); horizontal variant used on Home.
- **States:** skeletons, `EmptyState` (clear filters), `ErrorState` retry.

### 4.8 Resource detail — `resource/[id]`
- **Purpose:** single learning item.
- Header: type + difficulty tags, title, author/source.
- Body: description, key concepts/keywords, meta (duration, platform).
- Primary action: **Open/Navigate** (external link) + optional mark-as-completed for XP.

---

### 4.9 Profile — `(tabs)/profile`
- **Purpose:** personal Hub for a member.
- **ProfileHero** — brand gradient + orbs, `My Profile` eyebrow, settings icon button (→ `settings/appearance`); avatar in white ring, name, headline; XP progress bar + tier, hero stats (Events / Badges / Points), `View achievements` button. Skeleton while loading.
- **Access banner:** member = neutral; core/organizer = `primaryFixed` highlighted with role icon, label + description (from `ACCESS_LEVELS`).
- **Organizer dashboard** row (organizers only) → `/admin`.
- **Menu groups** (server-driven `app_config` taxonomy, permission-filtered, decisions de-duped for voters): e.g. **Have your say** (My ideas, Decisions), **My contribution** (Messages, My achievement…), **Insights** (Presence, Stats, Animations lab). Grouped in `Surface` list rows with hairline dividers; danger row styled red.
- **Sign out** (red, centered).

Menu is configurable remotely through `app_config.profileMenu`.

---

### 4.10 Settings — `settings/{index, appearance, notifications}`
- **index:** header w/ back + `Settings`; `Surface` group of rows (Appearance, Notifications, etc.) icon + label + description + chevron, server-driven `app_config.settingsRows`; footer version text ("GDG on Campus EPI · v1.0.0 · Expo SDK 57").
- **appearance:** theme preference — **System / Light / Dark** segmented control (persisted to store; resolution `system` follows `useColorScheme`).
- **notifications:** per-category toggle list (events, messages, announcements, admin alerts) with `Switch` controls; persisted locally (push registration out of scope for this handoff).

---

### 4.11 Engagement surfaces

#### Squads — `/squads`
- **Purpose:** team-based competition (4×4 member squads).
- Header with total; horizontal **leaderboard rail** (Podium: first place w/ crown accent) + vertically ranked squad list.
- Each squad card: rank number, name, XP, members avatar stack, progress to next level, "View" chevron. Complete the pattern w/ "Squad XP" and join/leave feedback toasts.

#### Quests — `/quests`
- **Purpose:** XP tasks ("Earn XP").
- Header; cards for each quest: icon, title, description, **XP reward pill**, progress bar ("2/4 steps"), status chip (In progress / Claimed / Done).
- Primary action: **claim reward** button when complete → animated XP toast. Staggered reveal on scroll.

#### Daily quiz — `/quiz`
- **Purpose:** daily streak quiz (8 questions).
- Start card: streak flame, "Daily challenge", score explainer, `Start` → question flow.
- Question screen: `headlineMd` question, 2×2 answer option cards, feedback state (correct → green / wrong → red highlight + reveal).
- Results: score ring/number, correct count, streak update, XP awarded, share/retry.

#### Achievements — `/achievements`
- **Purpose:** badge gallery by tier (Bronze/Silver/Gold + secret).
- Header; summary card (total unlocked, progress); tier sections of badge tiles (locked = muted/dashed, unlocked = colored + shine), each with name + "how to earn".

#### Stats — `/stats`
- **Purpose:** personal analytics.
- Card stack: total XP animated, events attended, labs, streak, badges; **bar/donut breakdown** per category (workshop/lab/hackathon) + activity timeline.

#### Presence — `/presence`
- **Purpose:** who's online/on campus now.
- Header w/ live count; "On campus" spotlight cards list (avatar, name, role, location/track, "last seen"), grouped presence states; click → message the member.

#### Animations — `/animations`
- **Purpose:** internal animation lab (designer/dev sanity-check page).
- Gallery of previews: number counters, progress presets, gradient orbs, pulse rings, stagger grids — each with a Reload trigger.

---

### 4.12 Community voice

#### Ideas — `/ideas`
- **Purpose:** suggest & upvote.
- Header + `New idea` FAB-style composer; list of idea cards: title, description, category chip, vote count, upvote button (toggles + animates on/off), pinned/staff tags.

#### Decisions — `/decisions`
- **Purpose:** chapter votes & outcomes.
- List of decision cards: question, status (Open / Closed / Decided), deadline chip, result snippet; Open decision → detail with option rows (vote progress + counts), vote action (members w/ `decisions.vote` can approve), result announcement banner when closed.

#### Tasks — `/tasks`
- **Purpose:** personal event task board ("Your board").
- Grouped by status (Available / In progress / Done); task rows: title, event tag, XP reward, status `Pill`; completion/lifecycle actions result in XP + toast.

---

### 4.13 Messaging

#### Messages list — `/messages`
- **Purpose:** DM inbox.
- Header; conversation rows: avatar (online dot), name, preview, mono timestamp, unread-right.**count badge**; row → thread. Pull-to-refresh; empty state w/ CTA to Community.

#### Thread — `messages/[id]`
- **Purpose:** 1:1 chat.
- Header w/ member avatar + name (+ online); `FlashList` of bubbles — **outgoing** = brand-tinted block, right; **incoming** = surface block, left, with dynamic corner radii; mono timestamps; day dividers.
- Composer: text input + send button above safe-area; KeyboardShift; optimistic send w/ failure snackbar.

---

### 4.14 Broadcasts & recap

#### Notifications — `/notifications`
- **Purpose:** push/in-app story.
- Header; category filter chips (All/Events/Messages/Admin); grouped list (Today, Earlier): icon in tonal tile, title, body, mono time, **unread dot**; mark-all-read action; swipe/`mark as read` on rows. Empty state.

#### Memories — `/memories`
- **Purpose:** season recap gallery (server-driven images).
- Header; masonry 2-col grid of memory photos (150×190 portrait cards, 160 wide) with caption + date overlay on press; photo opens full-screen lightbox (pan/zoom-out on Android). Data from `content/memories` API (13 seeded).

---

### 4.15 Admin (organizers only — permission-gated)

#### Admin home — `/admin`
- **Purpose:** organizer operational hub.
- Hero: admin badge, quick stats (upcoming events, members, RSVPs).
- Sections: **Events** (manage list, publish, RSVP counts), **Announcements** (compose/pin), **Content** (edit `app_config`: menu, taxonomy, slides), **Team** (roles & check-in links).
- Each section lists action rows → sub-flows or `/admin/{check-in, roles}`.

#### Check-in — `/admin/check-in`
- **Purpose:** event attendee check-in.
- Header w/ event selector; large QR/scan block (camera access) + manual member search; success state w/ animation (green pulse), validation feedback for wrong-event/invalid code; recent check-ins list (name, time).

#### Roles — `/admin/roles`
- **Purpose:** membership & permission management.
- Member search/FilterChips by role; assign/change role (realtime permission badges), promote to core-team confirm dialog, role explainer cards (Student/Core/organizer capabilities); changes surface immediately via permission checks.

---

### 4.16 Guest behavior

- Unauthenticated guests may open the app, browse Home/Events/Community/Resources, and RSVP-less explore.
- Storage/session restore happens in `_layout` (auth `loading` gate renders nothing → splash).
- `(tabs)` redirects to `(auth)/welcome` when logged out; every protected action (RSVP, chat, vote, quest claim, admin) is behind permission/`can()` gates with a graceful toast.

---

## 5. Design Conventions

- **Skeletons over spinners** on every list/hero (shimmer `surface` tone).
- **Empty ≠ blank** — every empty list has icon + title + message + 1 CTA.
- **Error is recoverable** — `ErrorState` always offers Retry.
- **Feedback is specific** — success in green toast, info in neutral toast, errors in `errorContainer` inline banners.
- **Counts are mono** — numbers read as "data" (`codeSm`).
- **Pills carry status** — role, track, difficulty, XP, deadline, and operation statuses all use the shared chip language.
- **Interactive cards scale** (`PressableScale`) — tactile press, never a plain jump.
- **Accessibility:** every IconButton/horizontal-rail tile has `accessibilityLabel`; tabs expose `accessibilityRole="tab"` + selected state; checkboxes/links announce roles; color contrast meets AA in both schemes.
- **Theming:** all colors via semantic tokens; switching System/Light/Dark re-themes instantly with no layout shift.

## 6. Tech Notes (for the implementer)

- Styling: **Tamagui v3** (`createTamagui`), bare token strings (`backgroundColor="background"`, `gap={12}`, `borderRadius="card"`).
- Fonts: Expo-loaded **Plus Jakarta Sans / Inter / JetBrains Mono**.
- Navigation: **Expo Router** file-based; tabs = custom floating `DockTabBar`.
- Lists: `@shopify/flash-list`; performance: `expo-image` for photo rails/cards.
- Data: Hook-based query layer (`use-events`, `use-members`, `use-resources`, `use-content`, `use-community`…) — server at Render (Supabase backing store); config-driven UI via `app_config` taxonomy (events, resources, profile menu, settings rows, onboarding slides all remote-editable).
- Roles/permissions: `ACCESS_LEVELS` + `can('resource.action')` policy checks throughout.