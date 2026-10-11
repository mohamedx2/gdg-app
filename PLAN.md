# Navigation Architecture Plan — 4 Spaces

Status: **DRAFT — awaiting approval.** Do not start Phase 1 until approved.

## 1. Goal

Replace the current 5-tab dock (`index` / `events` / `community` / `resources` / `profile`) with four
swipeable **Spaces** plus bottom-sheet detail surfaces, matching the Google Stitch designs in
`design/stitch/` (24 screens).

- **TODAY** — greeting/hero, next event, memories ("on this day"), quick actions, presence.
- **EXPLORE** — Events · People · Resources (segmented).
- **ARENA** — Quests · Squads · Leaderboard · Quiz · Stats/Badges (segmented).
- **VOICE** — Ideas · Tasks · Decisions (segmented).
- Shared shell: **TopBar** (avatar → Profile sheet, space title, Inbox icon w/ unread badge),
  **CommandBar**, floating **SpaceSwitcher** pill, **CommandPalette** sheet.

## 2. Navigation architecture

```
src/app/
  _layout.tsx                      # providers (unchanged) + Stack.Screen registry + modal presentations
  (auth)/_layout.tsx, welcome.tsx, login.tsx, register.tsx        # restyle only
  (spaces)/
    _layout.tsx                    # swipe navigator + TopBar + CommandBar + SpaceSwitcher
    index.tsx                      # redirect -> (spaces)/today
    today.tsx  explore.tsx  arena.tsx  voice.tsx
  me.tsx                           # Profile bottom sheet (from TopBar avatar)
  inbox/
    index.tsx                      # Messages · Notifications segments (merged)
    [id].tsx                       # chat thread (full screen; was messages/[id].tsx)
  event/[id].tsx                   # event detail sheet
  ticket/[id].tsx                  # existing -> sheet restyle
  member/[id].tsx                  # person sheet (alias of community/[id])
  resource/[id].tsx                # existing -> sheet restyle
  decision/[id].tsx                # NEW (vote detail sheet; was part of decisions.tsx)
  quiz.tsx                         # quiz sheet (from Arena)
  settings/{index,appearance,notifications}.tsx   # keep, restyle
  admin/{index,check-in,roles}.tsx                # keep, restyle, permission-gated
```

### Swipe navigator decision (D1 — needs your call)
The designs require horizontal swipe **and** tap-in-sync with the SpaceSwitcher, over real routes.

- **Option A (recommended): custom `withLayoutContext` navigator over `react-native-pager-view`.**
  One new native dep, aligns with the installed Reanimated 4 + gesture-handler stack, full control of
  the bottom pill + indicator animation, and keeps the four routes real (deep links + back stack).
  Conflicts: none.
- **Option B: expo-router's bundled material-top-tabs.** `expo-router/build/react-navigation/material-top-tabs`
  exists but requires `react-native-tab-view` + `react-native-pager-view` (neither installed) and sits on
  an internal build path (fragile). Would also need a fully custom `tabBar`.
- **Option C: hand-rolled Reanimated pager, zero new deps.** Most code to own/maintain; higher risk of
  gesture/settle bugs; not recommended.

### Sheets decision (D2 — needs your call)
- **Option A (recommended): reuse the existing `src/components/ui/BottomSheet.tsx` (Modal + Reanimated)**
  hosted by Expo Router routes using `presentation: 'transparentModal'`. Zero new deps, consistent look.
- **Option B: `@gorhom/bottom-sheet`.** Best-in-class snapping/gestures, but a new native dep + provider
  wiring. Use only if the existing sheet proves insufficient for draggable detents.

## 3. Screen → route mapping (all 24 Stitch screens)

| # | Stitch screen | Destination |
|---|---|---|
| 1 | welcome_onboarding | `(auth)/welcome` |
| 2 | sign_in | `(auth)/login` (+ `register`) |
| 3 | today_space_gdg_on_campus_epi | `(spaces)/today` |
| 4 | today_space_dark_mode | `(spaces)/today` (dark variant) |
| 5 | explore_space_events | `(spaces)/explore` — Events segment |
| 6 | explore_space_people | `(spaces)/explore` — People segment |
| 7 | explore_space_dark_mode | `(spaces)/explore` (dark variant) |
| 8 | arena_space_quests_gamification | `(spaces)/arena` — Quests segment |
| 9 | arena_space_squads_leaderboard | `(spaces)/arena` — Squads segment |
| 10 | arena_space_dark_mode | `(spaces)/arena` (dark variant) |
| 11 | voice_space_community_ideas | `(spaces)/voice` — Ideas segment |
| 12 | voice_space_community_tasks_board | `(spaces)/voice` — Tasks segment |
| 13 | voice_space_decisions_voting_detail | `(spaces)/voice` — Decisions segment + `decision/[id]` sheet |
| 14 | daily_dev_quiz_question_results | `quiz.tsx` sheet (from Arena) |
| 15 | my_stats_badges_showcase | `stats`/`achievements` inside Arena + Profile sheet entry |
| 16 | event_detail_bottom_sheet | `event/[id]` (sheet) |
| 17 | event_e_ticket_bottom_sheet | `ticket/[id]` (sheet) |
| 18 | profile_account_bottom_sheet | `me.tsx` (Profile sheet) |
| 19 | inbox_messages | `inbox/index.tsx` — Messages segment |
| 20 | chat_thread_sarra_b | `inbox/[id].tsx` (full screen) |
| 21 | command_palette_jump_to | `CommandPalette` overlay sheet (not a route) |
| 22 | organizer_console_gate_scanner | `admin/check-in.tsx` (restyle) |
| 23 | gdg_bold_campus_hub_1 | design reference only (light tokens) |
| 24 | gdg_bold_campus_hub_2 | design reference only (dark tokens) |

## 4. File changes

### New
- `src/app/(spaces)/_layout.tsx`, `index.tsx`, `today.tsx`, `explore.tsx`, `arena.tsx`, `voice.tsx`
- `src/app/me.tsx`, `src/app/inbox/index.tsx`, `src/app/inbox/[id].tsx`, `src/app/decision/[id].tsx`
- `src/app/event/[id].tsx`, `src/app/member/[id].tsx`
- `src/components/navigation/` : `SpaceSwitcher.tsx`, `CommandBar.tsx`, `CommandPalette.tsx`, `TopBar.tsx`
- `src/components/ui/SegmentedControl.tsx`, `src/components/ui/Sheet.tsx` (thin wrapper if D2=A)
- `src/features/spaces/` : `TodaySpace.tsx`, `ExploreSpace.tsx`, `ArenaSpace.tsx`, `VoiceSpace.tsx`
  (content components; route files stay thin).
- Redirect shims for old deep links: `src/app/(tabs)/index.tsx → (spaces)/today` (or a `_layout` redirect),
  `src/app/events/[id].tsx → event/[id]`, `src/app/messages/[id].tsx → inbox/[id]`.

### Changed
- `src/app/_layout.tsx` — register `(spaces)`; add `presentation: 'transparentModal'` for sheet routes;
  update notification/deep-link target map.
- `src/app/(tabs)/_layout.tsx` + tab screens — repurpose/redirect (see Deleted).
- `src/app/(auth)/*` — restyle to `welcome_onboarding` / `sign_in`.
- `src/constants/app.ts` — remap `profileMenu` targets to new Spaces; update `DEEP_LINK_EXAMPLES`
  (keep `events/:id` and `event/:id` working).
- `src/theme/colors.ts` (+ `tamagui.config.ts` if new tokens) — new semantic tokens (Section 6).

### Deleted (after relocation)
- `src/app/(tabs)/` (events, community, resources, profile, index) — replaced by `(spaces)`.
- `src/app/{squads,quests,quiz,achievements,stats,ideas,decisions,tasks,presence,memories}.tsx`
  — folded into Spaces/sheets.
- `src/app/messages.tsx` + `messages/[id].tsx` — folded into `inbox/`.
- `src/app/notifications.tsx` — folded into `inbox/`.
- `src/app/animations.tsx` — dev-only; keep or delete (confirm).

## 5. Dependencies

- `npx expo install react-native-pager-view` — **only if D1 = A/B**.
- `react-native-tab-view` — **only if D1 = B**.
- `@gorhom/bottom-sheet` — **only if D2 = B**.
- Everything else reuses installed libs (Reanimated 4, gesture-handler, screens, expo-image,
  FlashList, expo-linear-gradient, expo-glass-effect).

## 6. Theme / tokens

Reuse semantic tokens everywhere; no hardcoded hex in components.

- **Conflict (T1):** Stitch light surface is cool (`#f9f9ff`, `#ecedfa`); the repo's current theme and
  root `DESIGN.md` use warm paper (`#FAFAF7`). The two `DESIGN.md` variants disagree. **Decision needed:**
  adopt Stitch cool palette, or keep warm paper and treat Stitch as layout-only.
- **Conflict (T2):** Stitch maps `secondary = green`, `tertiary = gold`; the app's tokens currently give
  `secondary`/`tertiary` different meanings. Map Stitch roles onto **new named tokens**
  (`accentSuccess`, `accentGold`) rather than repurposing existing semantics.
- Add (as needed): `surfaceContainerLow/High` steps for segmented controls + sheets, an
  `onPrimaryContainer` pair, a `success`/`live` color + soft glow, and a `glow` shadow/gradient token
  for dark-mode primary CTAs.
- Gradients: reuse `brand`/`aurora`/`sunrise`/`google`/`night`; add only if the design's Arena/Voice
  hero ramps differ materially.

## 7. Remote config (`app_config`)

- `profileMenu` → drives **only** the Profile sheet rows; remap arena/voice/messages items to the new
  Spaces. **No schema change required** — deriving targets client-side.
- `welcome.slides` and `settingsRows` → preserved unchanged.
- CommandPalette actions → derived from existing routes + `profileMenu` + `settingsRows`. No schema change.
- If any Space header copy must be server-driven, that is a **backend schema addition** — flag for approval;
  default plan avoids it.

## 8. Constraints honored

1. No changes to API client, data hooks, auth provider, theme store, or permission logic (add hooks only
   if a new screen truly has none).
2. Deep links preserved: `gdgepi://events/:id`, `event/:id`, `community/:id`, `member/:id`,
   `resource/:id`, `ticket/:id`, `messages/:id` (old) → `inbox/:id` (via redirect).
3. Guest mode + all `can()` gates intact; protected actions keep the existing toast.
4. Remote config behavior preserved (Section 7).
5. Semantic tokens only (Section 6).
6. Conventions kept: skeletons on every list/hero, `EmptyState`+CTA, `ErrorState`+Retry, JetBrains Mono
   for numbers/dates/XP, `PressableScale` on interactive cards, `accessibilityLabel` on icon buttons,
   `accessibilityRole="tab"` on the switcher.
7. Reuse existing components; new ones only for new patterns (Section 4).

## 9. Phased execution (commit after each phase; `npx tsc --noEmit` + `npx expo lint` clean each time)

- **P1 — Foundation:** theme tokens (Section 6) + `SegmentedControl`, `Sheet`, `TopBar`.
- **P2 — Shell:** `(spaces)/_layout.tsx` (pager per D1), `SpaceSwitcher`, `CommandBar`, `index` redirect,
  redirect shims for old links.
- **P3 — Today + Explore:** `TodaySpace`, `ExploreSpace` (+ events/people/resources segments) + event/ticket
  sheets + `member/[id]`.
- **P4 — Arena + Voice:** move existing squads/quests/quiz/stats/achievements and ideas/tasks/decisions
  logic into the Spaces (relocate, do not rewrite); add `decision/[id]` sheet.
- **P5 — Profile + Inbox + CommandPalette:** `me.tsx` sheet, `inbox/index.tsx` (Messages·Notifications),
  `inbox/[id]`, CommandPalette overlay.
- **P6 — Polish:** auth restyle, settings, admin, full dark-mode pass (`*_dark_mode` screens), delete dead code.

## 10. Open decisions (blocking Phase 1)

- **D1** — pager vehicle: A (pager-view custom navigator, recommended) / B (bundled material-top-tabs) / C (Reanimated, no deps).
- **D2** — sheets: A (existing `BottomSheet`, recommended) / B (`@gorhom/bottom-sheet`).
- **T1** — palette: adopt Stitch cool light palette, or keep warm paper and use Stitch for layout only.
- Confirm deletion of `src/app/animations.tsx`.
