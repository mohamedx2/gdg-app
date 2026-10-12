import { Image } from 'expo-image';
import { GuestGate } from '@/components/GuestGate';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { AnimatedNumber, Stagger } from '@/components/animations';
import { Avatar } from '@/components/ui/Avatar';
import { Gradient } from '@/components/ui/Gradient';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Orbs } from '@/components/ui/Orbs';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { TRACKS } from '@/constants/taxonomy';
import { useAuth } from '@/features/auth/auth-provider';
import { useMemories } from '@/hooks/use-content';
import { useAchievementSummary, useAnnouncements } from '@/hooks/use-community';
import { useAttendance, useEvents, useUpcomingEvents } from '@/hooks/use-events';
import { useRecommendedResources, useResourceProgress } from '@/hooks/use-resources';
import { ACCESS_LEVELS } from '@/lib/auth/permissions';
import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import type { Announcement, GdgEvent, Resource } from '@/types';
import { formatCountdown, formatTime, isPast, parseDate } from '@/utils/date';

import { SPACE_BOTTOM_PADDING } from './SpaceScaffold';

const DAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** "FRI 28 MAR · 2025" in mono, as on the Stitch greeting row. */
function stamp(date: Date): string {
  return `${DAY[date.getDay()]} ${date.getDate()} ${MONTH[date.getMonth()]}`;
}

/** "IN 2H 15M" / "IN 3D" / "LIVE" / "ENDED" countdown for the ticket hero. */
function countdown(startsAt: string, endsAt: string): string {
  const now = Date.now();
  const start = parseDate(startsAt).getTime();
  if (parseDate(endsAt).getTime() < now) return 'ENDED';
  if (start <= now) return 'LIVE';
  const minutes = Math.round((start - now) / 60_000);
  if (minutes < 60) return `IN ${minutes}M`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `IN ${hours}H ${minutes % 60}M`;
  return `IN ${Math.floor(hours / 24)}D`;
}

/** TODAY — personal feed: next seat, level, micro-sprints, news, week, learning, memories. */
export function TodaySpace() {
  const insets = useSafeAreaInsets();
  const { isGuest } = useAuth();
  const { data: announcements } = useAnnouncements();
  const { data: upcoming } = useUpcomingEvents(6);
  const { data: recent } = useEvents({ scope: 'past', pageSize: 6 });
  const { data: summary } = useAchievementSummary();
  const { data: resources } = useRecommendedResources(4);
  const memories = useMemories();

  const pinned = announcements?.find((item) => item.pinned) ?? announcements?.[0];
  const offSeason = upcoming !== undefined && upcoming.length === 0;
  const showcase = offSeason ? recent?.data : upcoming;
  const featured = showcase?.find((item) => item.featured) ?? showcase?.[0];
  const week = showcase?.filter((item) => item.id !== featured?.id) ?? [];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 4,
        paddingBottom: SPACE_BOTTOM_PADDING + insets.bottom,
        gap: 24,
      }}
    >
      <Reveal>
        <Greeting />
      </Reveal>

      <YStack paddingHorizontal={16}>
        {featured ? (
          <Reveal delay={40}>
            <TicketHero event={featured} />
          </Reveal>
        ) : showcase ? null : (
          <Skeleton height={260} radius={22} />
        )}
      </YStack>

      <YStack paddingHorizontal={16}>
        {isGuest ? (
          <GuestGate reason="track your XP, level and streak" icon="militaryTech">
            {null}
          </GuestGate>
        ) : summary ? (
          <Reveal delay={80}>
            <LevelCard
              tier={summary.tier}
              nextTier={summary.nextTier}
              xp={summary.xp ?? summary.points}
              xpGoal={summary.xpGoal ?? 0}
              streakDays={summary.streakDays}
            />
          </Reveal>
        ) : (
          <Skeleton height={150} radius={22} />
        )}
      </YStack>

      <Reveal delay={110}>
        <Section title="Daily Micro-Sprints" trailing="RESET 00:00">
          <MicroSprints />
        </Section>
      </Reveal>

      {pinned ? (
        <Reveal delay={130}>
          <YStack paddingHorizontal={16}>
            <AnnouncementCard announcement={pinned} />
          </YStack>
        </Reveal>
      ) : null}

      <Reveal delay={150}>
        <Section
          title={offSeason ? 'Latest Activities' : 'Happening This Week'}
          count={week.length || undefined}
          trailing="VIEW SCHEDULE"
          onTrailing={() => router.push('/(spaces)?space=explore')}
          bleed
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
          >
            {showcase
              ? week.map((event, index) => (
                  <Stagger key={event.id} index={index} direction="right">
                    <WeekCard event={event} />
                  </Stagger>
                ))
              : [1, 2].map((key) => <Skeleton key={key} width={240} height={150} radius={18} />)}
          </ScrollView>
        </Section>
      </Reveal>

      {resources === undefined || resources.length ? (
        <Reveal delay={170}>
          <Section
            title="Active Learning Tracks"
            trailing={resources ? `${resources.length} PICKED` : undefined}
            onTrailing={() => router.push('/(spaces)?space=explore&segment=learn' as never)}
          >
            <YStack gap={12}>
              {resources
                ? resources.slice(0, 2).map((resource) => <TrackRow key={resource.id} resource={resource} />)
                : [1, 2].map((key) => <Skeleton key={key} height={84} radius={18} />)}
            </YStack>
          </Section>
        </Reveal>
      ) : null}

      {memories.length ? (
        <Reveal delay={190}>
          <Section
            title="Campus Memories"
            titleIcon="autoAwesome"
            trailing="#GDGEPI"
            onTrailing={() => router.push('/memories' as never)}
            bleed
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
            >
              {memories.slice(0, 6).map((memory) => (
                <MemoryCard key={memory.id} source={memory.source} caption={memory.caption} />
              ))}
            </ScrollView>
          </Section>
        </Reveal>
      ) : null}
    </ScrollView>
  );
}

/** Avatar with presence dot, name + role badge, mono date, quick actions. */
function Greeting() {
  const { user, access, isGuest } = useAuth();
  const role = ACCESS_LEVELS[access];
  return (
    <XStack paddingHorizontal={16} alignItems="center" gap={12}>
      <YStack width={48} height={48} position="relative">
        <Avatar uri={user?.avatar} name={user?.name ?? 'Guest'} size={48} />
        {isGuest || !user ? null : (
          <YStack
            position="absolute"
            right={-1}
            bottom={-1}
            width={14}
            height={14}
            borderRadius={7}
            backgroundColor="live"
            borderWidth={2}
            borderColor="background"
          />
        )}
      </YStack>
      <YStack flex={1} gap={2}>
        <XStack alignItems="center" gap={8}>
          <Text variant="titleLg" weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
            {isGuest ? 'Welcome, guest' : (user?.name ?? 'Builder')}
          </Text>
          {access !== 'member' ? (
            <YStack paddingHorizontal={8} paddingVertical={2} borderRadius="full" backgroundColor="primaryFixed">
              <Text variant="codeSm" weight="bold" color="onPrimaryFixedVariant">
                {access === 'core' ? 'CORE' : 'ADMIN'}
              </Text>
            </YStack>
          ) : null}
        </XStack>
        <XStack alignItems="center" gap={6}>
          <YStack width={6} height={6} borderRadius={3} backgroundColor="primary" />
          <Text
            variant="codeSm"
            muted
            numberOfLines={1}
            style={{ flexShrink: 1 }}
            accessibilityLabel={`Today, ${role.label}`}
          >
            {stamp(new Date())}
          </Text>
        </XStack>
      </YStack>
      <IconButton
        name="calendarMonth"
        accessibilityLabel="Open schedule"
        onPress={() => router.push('/(spaces)?space=explore')}
      />
      <IconButton
        name="notifications"
        accessibilityLabel="Open notifications"
        onPress={() => router.push('/inbox?segment=notifications' as never)}
      />
    </XStack>
  );
}

/** Ticket-styled hero for the next event: seat status, countdown, details, perforation, pass. */
function TicketHero({ event }: { event: GdgEvent }) {
  const { data: attendance } = useAttendance(event.id);
  const registered = attendance === 'registered' || attendance === 'attended';
  const time = countdown(event.startsAt, event.endsAt);
  const ended = time === 'ENDED';
  const passCode = `GDG-EPI-${event.id.replace(/^evt-/, '').toUpperCase().slice(0, 12)}`;

  return (
    <YStack borderRadius="card" overflow="hidden">
      <Gradient token="night" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Orbs />
        {/* Only the details open the event; the pass row has its own action (no nested buttons). */}
        <PressableScale
          onPress={() => router.push(`/events/${event.id}` as never)}
          accessibilityLabel={`Open ${event.title}`}
        >
          <YStack padding={18} gap={12}>
            <XStack alignItems="center" justifyContent="space-between" gap={8}>
              <XStack
                alignItems="center"
                gap={6}
                paddingHorizontal={10}
                paddingVertical={4}
                borderRadius="full"
                backgroundColor="tertiaryFixed"
              >
                <YStack width={6} height={6} borderRadius={3} backgroundColor="live" />
                <Text variant="codeSm" weight="bold" color="onTertiaryFixedVariant">
                  {registered ? 'CONFIRMED SEAT' : ended ? 'PAST EVENT' : 'UP NEXT'}
                </Text>
              </XStack>
              <YStack
                paddingHorizontal={10}
                paddingVertical={4}
                borderRadius="full"
                borderWidth={1}
                borderColor="outlineVariant"
              >
                <Text variant="codeSm" weight="bold" color="onNight">
                  {time}
                </Text>
              </YStack>
            </XStack>

            <Text variant="headlineSm" weight="bold" color="onNight" numberOfLines={2}>
              {event.title}
            </Text>
            <Text variant="bodySm" color="outline" numberOfLines={2}>
              {event.summary}
            </Text>

            <XStack gap={10}>
              <InfoChip icon="schedule" label={`${formatTime(event.startsAt)} GMT+1`} />
              <InfoChip icon="location" label={event.venue || event.location} />
            </XStack>
          </YStack>
        </PressableScale>

        {/* Perforation with side notches. */}
        <XStack alignItems="center" height={20}>
          <YStack width={20} height={20} borderRadius={10} marginLeft={-10} backgroundColor="background" />
          <YStack flex={1} borderTopWidth={1.5} borderStyle="dashed" borderColor="outline" opacity={0.5} />
          <YStack width={20} height={20} borderRadius={10} marginRight={-10} backgroundColor="background" />
        </XStack>

        <XStack padding={18} paddingTop={10} alignItems="center" gap={12}>
          <YStack
            width={40}
            height={40}
            borderRadius={12}
            alignItems="center"
            justifyContent="center"
            borderWidth={1}
            borderColor="outlineVariant"
          >
            <Icon name="verifiedUser" size={20} color="onNight" />
          </YStack>
          <YStack flex={1}>
            <Text variant="codeSm" color="outline">
              {registered ? 'FAST TRACK PASS' : `${event.registeredCount}/${event.capacity} SEATS`}
            </Text>
            <Text variant="codeSm" weight="bold" color="onNight" numberOfLines={1}>
              {registered ? passCode : (TRACKS[event.track]?.label.toUpperCase() ?? 'GDG EPI')}
            </Text>
          </YStack>
          {registered ? (
            <PillAction icon="qrCode" label="Show Ticket" onPress={() => router.push(`/ticket/${event.id}` as never)} />
          ) : !ended ? (
            <PillAction
              icon="register"
              label="Get a seat"
              onPress={() => router.push(`/events/${event.id}` as never)}
            />
          ) : null}
        </XStack>
      </Gradient>
    </YStack>
  );
}

function InfoChip({ icon, label }: { icon: IconName; label: string }) {
  return (
    <XStack
      flex={1}
      alignItems="center"
      gap={8}
      paddingHorizontal={12}
      paddingVertical={10}
      borderRadius={14}
      borderWidth={1}
      borderColor="outlineVariant"
    >
      <Icon name={icon} size={16} color="onNight" />
      <Text variant="codeSm" color="onNight" numberOfLines={1} style={{ flexShrink: 1 }}>
        {label}
      </Text>
    </XStack>
  );
}

function PillAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label}>
      <XStack
        alignItems="center"
        gap={6}
        paddingHorizontal={16}
        height={44}
        borderRadius={14}
        backgroundColor="primaryFixed"
      >
        <Icon name={icon} size={18} color="onPrimaryFixedVariant" />
        <Text variant="labelLg" weight="bold" color="onPrimaryFixedVariant">
          {label}
        </Text>
      </XStack>
    </PressableScale>
  );
}

/** Tier, level badge, streak multiplier and XP-to-goal bar. */
function LevelCard({
  tier,
  nextTier,
  xp,
  xpGoal,
  streakDays,
}: {
  tier: string;
  nextTier?: string;
  xp: number;
  xpGoal: number;
  streakDays: number;
}) {
  const progress = xpGoal > 0 ? Math.min(1, xp / xpGoal) : 1;
  const level = Math.max(1, Math.floor(xp / 400) + 1);
  return (
    <PressableScale
      onPress={() => router.push('/(spaces)?space=arena&segment=badges' as never)}
      accessibilityLabel="Open your level and badges"
    >
      <YStack
        padding={16}
        gap={14}
        borderRadius="card"
        backgroundColor="surfaceContainerLowest"
        borderWidth={1}
        borderColor="outlineVariant"
      >
        <XStack alignItems="center" gap={12}>
          <YStack
            width={44}
            height={44}
            borderRadius={14}
            alignItems="center"
            justifyContent="center"
            backgroundColor="surfaceContainerHigh"
          >
            <Icon name="militaryTech" size={22} color="gold" />
          </YStack>
          <YStack flex={1}>
            <XStack alignItems="center" gap={8}>
              <Text variant="titleMd" weight="bold">
                {tier} Builder
              </Text>
              <YStack paddingHorizontal={6} paddingVertical={1} borderRadius={6} backgroundColor="primaryContainer">
                <Text variant="codeSm" weight="bold" color="onPrimaryContainer">
                  LVL {level}
                </Text>
              </YStack>
            </XStack>
            {xpGoal > xp ? (
              <Text variant="codeSm" muted>
                +{xpGoal - xp} XP to {nextTier ?? 'next tier'}
              </Text>
            ) : null}
          </YStack>
          {streakDays > 0 ? (
            <XStack
              alignItems="center"
              gap={4}
              paddingHorizontal={10}
              paddingVertical={6}
              borderRadius="full"
              backgroundColor="surfaceContainerHigh"
            >
              <Icon name="fire" size={14} color="warning" />
              <Text variant="codeSm" weight="bold">
                {streakDays}-DAY
              </Text>
            </XStack>
          ) : null}
        </XStack>
        <YStack gap={6}>
          <XStack justifyContent="space-between">
            <XStack alignItems="baseline">
              <Text variant="codeSm" muted>
                Current:{' '}
              </Text>
              <AnimatedNumber value={xp} variant="codeSm" weight="bold" />
              <Text variant="codeSm" weight="bold">
                {' '}
                XP
              </Text>
            </XStack>
            {xpGoal > 0 ? (
              <Text variant="codeSm" muted>
                {xpGoal.toLocaleString('en-US')} XP Goal
              </Text>
            ) : null}
          </XStack>
          <YStack height={8} borderRadius={4} backgroundColor="surfaceContainerHigh" overflow="hidden">
            <YStack width={`${progress * 100}%`} height="100%" borderRadius={4} overflow="hidden">
              <Gradient token="aurora" start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
            </YStack>
          </YStack>
        </YStack>
      </YStack>
    </PressableScale>
  );
}

/** Three short daily actions with their XP or status badge. */
function MicroSprints() {
  const { can } = useAuth();
  const sprints: {
    icon: IconName;
    label: string;
    badge: string;
    hint: string;
    route: string;
    color: ColorToken;
  }[] = [
    {
      icon: 'help',
      label: 'Daily Quiz',
      badge: '+50 XP',
      hint: 'Keep the streak',
      route: '/quiz',
      color: 'primary',
    },
    {
      icon: 'flag',
      label: 'Squad Quest',
      badge: '+60 XP',
      hint: 'Arena · quests',
      route: '/(spaces)?space=arena&segment=quests',
      color: 'warning',
    },
    can('decisions.vote')
      ? {
          icon: 'howToVote',
          label: 'Core Vote',
          badge: 'OPEN',
          hint: 'Cast yours',
          route: '/(spaces)?space=voice&segment=decisions',
          color: 'error',
        }
      : {
          icon: 'lightbulb',
          label: 'Idea Box',
          badge: 'OPEN',
          hint: 'Suggest & upvote',
          route: '/(spaces)?space=voice&segment=ideas',
          color: 'error',
        },
  ];
  return (
    <XStack gap={10}>
      {sprints.map((sprint) => (
        <PressableScale
          key={sprint.label}
          onPress={() => router.push(sprint.route as never)}
          accessibilityLabel={sprint.label}
          style={{ flex: 1 }}
        >
          <YStack
            padding={12}
            gap={14}
            borderRadius={18}
            backgroundColor="surfaceContainerLowest"
            borderWidth={1}
            borderColor="outlineVariant"
          >
            <XStack alignItems="center" justifyContent="space-between">
              <YStack
                width={32}
                height={32}
                borderRadius={10}
                alignItems="center"
                justifyContent="center"
                backgroundColor="surfaceContainerHigh"
              >
                <Icon name={sprint.icon} size={17} color={sprint.color} />
              </YStack>
              <Text variant="codeSm" weight="bold" color={sprint.badge === 'OPEN' ? 'onSurfaceVariant' : 'tertiary'}>
                {sprint.badge}
              </Text>
            </XStack>
            <YStack>
              <Text variant="labelLg" weight="bold" numberOfLines={1}>
                {sprint.label}
              </Text>
              <Text variant="codeSm" muted numberOfLines={1}>
                {sprint.hint}
              </Text>
            </YStack>
          </YStack>
        </PressableScale>
      ))}
    </XStack>
  );
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const deadline = announcement.deadline ? formatCountdown(announcement.deadline).toUpperCase() : null;
  return (
    <YStack
      padding={16}
      gap={10}
      borderRadius="card"
      backgroundColor="surfaceContainerLowest"
      borderWidth={1}
      borderColor="outlineVariant"
    >
      <XStack alignItems="center" justifyContent="space-between" gap={8}>
        <XStack alignItems="center" gap={6} flexShrink={1}>
          <YStack width={7} height={7} borderRadius={4} backgroundColor="error" />
          <Text variant="codeSm" weight="bold" color="error" numberOfLines={1}>
            {(announcement.tag || 'Campus announcement').toUpperCase()}
          </Text>
        </XStack>
        {deadline ? (
          <YStack paddingHorizontal={8} paddingVertical={3} borderRadius={8} backgroundColor="errorContainer">
            <Text variant="codeSm" weight="bold" color="onErrorContainer">
              {deadline}
            </Text>
          </YStack>
        ) : null}
      </XStack>
      <Text variant="titleMd" weight="bold">
        {announcement.title}
      </Text>
      <Text variant="bodySm" muted numberOfLines={3}>
        {announcement.body}
      </Text>
      {announcement.ctaLabel ? (
        <PressableScale
          onPress={() => announcement.ctaLink && router.push(announcement.ctaLink as never)}
          accessibilityLabel={announcement.ctaLabel}
          style={{ alignSelf: 'flex-end' }}
        >
          <XStack alignItems="center" gap={4} paddingVertical={6}>
            <Text variant="labelLg" weight="bold" primary>
              {announcement.ctaLabel}
            </Text>
            <Icon name="arrowForward" size={16} color="primary" />
          </XStack>
        </PressableScale>
      ) : null}
    </YStack>
  );
}

function WeekCard({ event }: { event: GdgEvent }) {
  const date = parseDate(event.startsAt);
  const track = TRACKS[event.track];
  return (
    <PressableScale
      onPress={() => router.push(`/events/${event.id}` as never)}
      accessibilityLabel={`Open ${event.title}`}
    >
      <YStack
        width={240}
        padding={14}
        gap={10}
        borderRadius={18}
        backgroundColor="surfaceContainerLowest"
        borderWidth={1}
        borderColor="outlineVariant"
      >
        <XStack alignItems="center" justifyContent="space-between">
          <YStack paddingHorizontal={8} paddingVertical={3} borderRadius={8} backgroundColor="primaryFixed">
            <Text variant="codeSm" weight="bold" color="onPrimaryFixedVariant">
              {(track?.label ?? event.category).toUpperCase()}
            </Text>
          </YStack>
          <Text variant="codeSm" muted>
            {DAY[date.getDay()]} · {formatTime(date)}
          </Text>
        </XStack>
        <Text variant="labelLg" weight="bold" numberOfLines={2}>
          {event.title}
        </Text>
        <Text variant="bodySm" muted numberOfLines={1}>
          {event.summary}
        </Text>
        <XStack alignItems="center" justifyContent="space-between">
          <Text variant="codeSm" muted numberOfLines={1} style={{ flexShrink: 1 }}>
            {event.venue || event.location}
          </Text>
          <Text variant="codeSm" weight="bold" primary>
            {isPast(event.endsAt) ? 'RECAP' : 'RSVP'}
          </Text>
        </XStack>
      </YStack>
    </PressableScale>
  );
}

/** One recommended resource as a learning track row with progress. */
function TrackRow({ resource }: { resource: Resource }) {
  const { data: progress } = useResourceProgress(resource.id);
  const pct = progress === 'completed' ? 100 : progress === 'started' ? 45 : 0;
  return (
    <PressableScale
      onPress={() => router.push(`/resource/${resource.id}` as never)}
      accessibilityLabel={`Open ${resource.title}`}
    >
      <XStack
        padding={14}
        gap={12}
        alignItems="center"
        borderRadius={18}
        backgroundColor="surfaceContainerLowest"
        borderWidth={1}
        borderColor="outlineVariant"
      >
        <YStack
          width={44}
          height={44}
          borderRadius={14}
          alignItems="center"
          justifyContent="center"
          backgroundColor="surfaceContainerHigh"
        >
          <Icon
            name={resource.type === 'video' ? 'playCircle' : resource.type === 'codelab' ? 'terminal' : 'menuBook'}
            size={20}
            color="primary"
          />
        </YStack>
        <YStack flex={1} gap={6}>
          <XStack alignItems="center" justifyContent="space-between" gap={8}>
            <Text variant="labelLg" weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
              {resource.title}
            </Text>
            <Text variant="codeSm" weight="bold" primary>
              {pct}%
            </Text>
          </XStack>
          <YStack height={5} borderRadius={3} backgroundColor="surfaceContainerHigh" overflow="hidden">
            <YStack width={`${pct}%`} height="100%" backgroundColor="primary" />
          </YStack>
          <XStack justifyContent="space-between">
            <Text variant="codeSm" muted numberOfLines={1} style={{ flexShrink: 1 }}>
              {resource.category}
            </Text>
            <Text variant="codeSm" muted>
              {resource.durationMins}m
            </Text>
          </XStack>
        </YStack>
        <YStack
          width={36}
          height={36}
          borderRadius={18}
          alignItems="center"
          justifyContent="center"
          backgroundColor="surfaceContainerHigh"
        >
          <Icon name="arrowForward" size={16} color="onSurface" />
        </YStack>
      </XStack>
    </PressableScale>
  );
}

function MemoryCard({ source, caption }: { source: React.ComponentProps<typeof Image>['source']; caption: string }) {
  const theme = useTheme();
  return (
    <PressableScale onPress={() => router.push('/memories' as never)} accessibilityLabel={`Open memories: ${caption}`}>
      <YStack
        width={150}
        borderRadius={18}
        overflow="hidden"
        backgroundColor="surfaceContainerLowest"
        borderWidth={1}
        borderColor="outlineVariant"
      >
        <Image
          source={source}
          contentFit="cover"
          style={{
            width: '100%',
            height: 170,
            backgroundColor: theme.colors.surfaceContainer,
          }}
        />
        <YStack padding={10}>
          <Text variant="codeSm" muted numberOfLines={1}>
            {caption}
          </Text>
        </YStack>
      </YStack>
    </PressableScale>
  );
}

/** Section title row with optional count bubble and a mono trailing action. */
function Section({
  title,
  titleIcon,
  count,
  trailing,
  onTrailing,
  bleed,
  children,
}: {
  title: string;
  titleIcon?: IconName;
  count?: number;
  trailing?: string;
  onTrailing?: () => void;
  /** Children manage their own horizontal padding (horizontal scrollers). */
  bleed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <YStack gap={12}>
      <XStack paddingHorizontal={16} alignItems="center" justifyContent="space-between" gap={8}>
        <XStack alignItems="center" gap={8} flexShrink={1}>
          <Text variant="titleMd" weight="bold" numberOfLines={1}>
            {title}
          </Text>
          {titleIcon ? <Icon name={titleIcon} size={16} color="tertiary" /> : null}
          {count ? (
            <YStack
              minWidth={22}
              height={22}
              paddingHorizontal={6}
              borderRadius={11}
              alignItems="center"
              justifyContent="center"
              backgroundColor="surfaceContainerHigh"
            >
              <Text variant="codeSm" weight="bold">
                {count}
              </Text>
            </YStack>
          ) : null}
        </XStack>
        {trailing ? (
          onTrailing ? (
            <PressableScale onPress={onTrailing} accessibilityLabel={trailing}>
              <Text variant="codeSm" weight="bold" primary style={{ paddingVertical: 8 }}>
                {trailing}
              </Text>
            </PressableScale>
          ) : (
            <Text variant="codeSm" weight="bold" muted>
              {trailing}
            </Text>
          )
        ) : null}
      </XStack>
      {bleed ? children : <YStack paddingHorizontal={16}>{children}</YStack>}
    </YStack>
  );
}

export default TodaySpace;
