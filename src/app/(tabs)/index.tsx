import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { ActivityCard } from '@/components/ActivityCard';
import { AnimatedNumber, Stagger } from '@/components/animations';
import { Avatar } from '@/components/ui/Avatar';
import { CompactEventCard, FeaturedEventCard } from '@/components/EventCard';
import { Gradient } from '@/components/ui/Gradient';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Orbs } from '@/components/ui/Orbs';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { SearchBar } from '@/components/ui/SearchBar';
import { SectionHeader } from '@/components/ui/Screen';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { SolidPill } from '@/components/ui/Chip';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Text } from '@/components/ui/Text';
import { ResourceCard } from '@/components/ResourceCard';
import {
  useActivity,
  useAchievementSummary,
  useAnnouncements,
  useProfile,
  useUnreadCount,
} from '@/hooks/use-community';
import { useAuth } from '@/features/auth/auth-provider';
import { Image } from 'expo-image';
import { useMemories } from '@/hooks/use-content';
import { useEvents, useUpcomingEvents } from '@/hooks/use-events';
import { useConversations } from '@/hooks/use-messages';
import { useRecommendedResources } from '@/hooks/use-resources';
import { useTheme } from '@/theme';

const GDG_DOTS = ['#EA4335', '#4285F4', '#FBBC04', '#34A853'] as const;

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { data: profile } = useProfile();
  const { data: unread = 0 } = useUnreadCount();
  const { data: conversations } = useConversations();
  const messagesUnread = (conversations ?? []).reduce((sum, item) => sum + item.unreadCount, 0);
  const { data: announcements } = useAnnouncements();
  const { data: upcoming } = useUpcomingEvents(6);
  const { data: summary } = useAchievementSummary();
  const { data: resources } = useRecommendedResources(4);
  const { data: activity } = useActivity();
  const memories = useMemories();

  const pinned = announcements?.find((item) => item.pinned) ?? announcements?.[0];
  // Between seasons there is nothing upcoming — fall back to the latest activities.
  const offSeason = upcoming !== undefined && upcoming.length === 0;
  const { data: recent } = useEvents({ scope: 'past', pageSize: 6 });
  const showcase = offSeason ? (recent?.data ?? []) : upcoming;
  const featured = showcase?.find((item) => item.featured) ?? showcase?.[0];
  const others = showcase?.filter((item) => item.id !== featured?.id) ?? [];

  const firstName = profile?.name?.split(' ')[0] ?? 'Builder';

  return (
    <YStack flex={1} backgroundColor="background">
      <YStack paddingTop={insets.top + 8} paddingHorizontal={16} gap={14}>
        <XStack alignItems="center" gap={12}>
          {profile ? (
            <Avatar uri={profile.avatar} name={profile.name} size={40} ring="brand" />
          ) : (
            <Skeleton width={44} height={44} radius={22} />
          )}
          <YStack flex={1} gap={3}>
            <XStack alignItems="center" gap={6}>
              <GDGDots />
              <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                GDG on Campus
              </Text>
            </XStack>
            <Text variant="headlineMd" family="heading">
              Hello, {firstName}
            </Text>
          </YStack>
          <IconButton
            name="chatBubble"
            onPress={() => router.push('/messages')}
            accessibilityLabel="Messages"
            color={messagesUnread > 0 ? 'primary' : 'secondary'}
            badge={messagesUnread > 0}
            backgroundColor={messagesUnread > 0 ? 'primaryFixed' : 'surfaceContainerLowest'}
          />
          <IconButton
            name="notifications"
            onPress={() => router.push('/notifications')}
            accessibilityLabel="Notifications"
            color={unread > 0 ? 'primary' : 'secondary'}
            badge={unread > 0}
            backgroundColor={unread > 0 ? 'primaryFixed' : 'surfaceContainerLowest'}
          />
        </XStack>

        <SearchBar
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (text.trim()) {
              router.push(`/events?search=${encodeURIComponent(text.trim())}`);
              setQuery('');
            }
          }}
          placeholder="Search events, people, resources…"
          onFilterPress={() => router.push('/events')}
        />
      </YStack>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 112, gap: 22 }}
        showsVerticalScrollIndicator={false}
      >
        {pinned ? (
          <Reveal>
            <PressableBanner announcement={pinned} />
          </Reveal>
        ) : null}

        {featured ? (
          <Reveal delay={40}>
            <YStack paddingHorizontal={16}>
              <FeaturedEventCard event={featured} />
            </YStack>
          </Reveal>
        ) : showcase ? null : (
          <YStack paddingHorizontal={16}>
            <Skeleton height={190} radius={12} />
          </YStack>
        )}

        <Reveal delay={80}>
          <YStack paddingHorizontal={16} gap={12}>
            <SectionHeader
              title={offSeason ? 'Latest activities' : 'Upcoming events'}
              subtitle={offSeason ? 'Season 2025/26 recap · new dates soon' : 'This month at EPI Sousse'}
              accent="primary"
              actionLabel="See all"
              onAction={() => router.push('/events')}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {others.length
                ? others.map((event, index) => (
                    <Stagger key={event.id} index={index} direction="right">
                      <CompactEventCard event={event} />
                    </Stagger>
                  ))
                : showcase
                  ? null
                  : [1, 2, 3].map((key) => <SkeletonCard key={key} />)}
            </ScrollView>
          </YStack>
        </Reveal>

        {summary ? (
          <Reveal delay={120}>
            <YStack paddingHorizontal={16}>
              <LevelCard
                tier={summary.tier}
                xp={summary.xp ?? summary.points}
                xpGoal={summary.xpGoal ?? 0}
                nextTier={summary.nextTier}
                eventsAttended={summary.eventsAttended}
                labsCompleted={summary.labsCompleted}
                streakDays={summary.streakDays}
                badges={summary.badgesUnlocked}
              />
            </YStack>
          </Reveal>
        ) : (
          <YStack paddingHorizontal={16}>
            <Skeleton height={120} radius={12} />
          </YStack>
        )}

        <Reveal delay={140}>
          <YStack paddingHorizontal={16}>
            <CompeteRow />
          </YStack>
        </Reveal>

        <Reveal delay={150}>
          <YStack paddingHorizontal={16}>
            <VoiceRow />
          </YStack>
        </Reveal>

        <Reveal delay={150}>
          <YStack gap={12}>
            <YStack paddingHorizontal={16}>
              <SectionHeader title="Memories" subtitle="Moments from past seasons" accent="warning" actionLabel="See all" onAction={() => router.push('/memories' as never)} />
            </YStack>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}>
              {memories.slice(0, 6).map((memory) => (
                <PressableScale key={memory.id} onPress={() => router.push('/memories' as never)} accessibilityLabel={`Open memories: ${memory.caption}`} style={{ width: 150, height: 190, borderRadius: theme.radius.card, overflow: 'hidden', backgroundColor: theme.colors.surfaceContainer }}>
                  <Image source={memory.source} contentFit="cover" style={{ width: '100%', height: '100%' }} />
                </PressableScale>
              ))}
            </ScrollView>
          </YStack>
        </Reveal>

        {activity?.length ? (
          <Reveal delay={160}>
            <YStack paddingHorizontal={16} gap={12}>
              <SectionHeader
                title="Community pulse"
                subtitle="What's happening now"
                accent="tertiary"
                actionLabel="Community"
                onAction={() => router.push('/community')}
              />
              {activity.slice(0, 3).map((item, index) => (
                <Stagger key={item.id} index={index}>
                  <ActivityCard item={item} />
                </Stagger>
              ))}
            </YStack>
          </Reveal>
        ) : null}

        {resources?.length ? (
          <Reveal delay={200}>
            <YStack paddingHorizontal={16} gap={12}>
              <SectionHeader
                title="Continue learning"
                subtitle="Recommended by leads"
                accent="secondary"
                actionLabel="All resources"
                onAction={() => router.push('/resources')}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {resources.slice(0, 4).map((resource, index) => (
                  <Stagger key={resource.id} index={index} direction="right">
                    <ResourceCard resource={resource} horizontal />
                  </Stagger>
                ))}
              </ScrollView>
            </YStack>
          </Reveal>
        ) : null}
      </ScrollView>
    </YStack>
  );
}

/** Entry points into the engagement surfaces (squads, quests & the daily quiz). */
function CompeteRow() {
  const theme = useTheme();
  const tiles = [
    { icon: 'groups' as const, label: 'Squads', hint: 'Track teams', route: '/squads', color: 'tertiary' as const },
    { icon: 'flag' as const, label: 'Quests', hint: 'Earn XP', route: '/quests', color: 'warning' as const },
    { icon: 'help' as const, label: 'Daily quiz', hint: 'Keep a streak', route: '/quiz', color: 'primary' as const },
  ];
  return (
    <XStack gap={12}>
      {tiles.map((tile) => (
        <PressableScale
          key={tile.route}
          onPress={() => router.push(tile.route as never)}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: theme.radius.card,
            backgroundColor: theme.colors.surfaceContainerLowest,
            borderWidth: 1,
            borderColor: theme.colors.outlineVariant,
            gap: 10,
          }}
        >
          <YStack
            width={40}
            height={40}
            borderRadius={12}
            alignItems="center"
            justifyContent="center"
            backgroundColor="surfaceContainerHigh"
          >
            <Icon name={tile.icon} size={20} color={tile.color} />
          </YStack>
          <YStack>
            <Text variant="labelLg" weight="bold">
              {tile.label}
            </Text>
            <Text variant="bodySm" muted>
              {tile.hint}
            </Text>
          </YStack>
        </PressableScale>
      ))}
    </XStack>
  );
}

/** Two-up entry point into member voice: ideas and important votes. */
function VoiceRow() {
  const theme = useTheme();
  const { can } = useAuth();
  const coreTiles = [
    { icon: 'howToVote' as const, label: 'Core votes', hint: 'Decide together', route: '/decisions', color: 'secondary' as const },
    { icon: 'taskAlt' as const, label: 'Event tasks', hint: 'Your board', route: '/tasks', color: 'primary' as const },
  ];
  const tiles = can('decisions.vote')
    ? coreTiles
    : [
        { icon: 'lightbulb' as const, label: 'Idea box', hint: 'Suggest & upvote', route: '/ideas', color: 'warning' as const },
        { icon: 'howToVote' as const, label: 'Decisions', hint: 'See outcomes', route: '/decisions', color: 'secondary' as const },
      ];
  return (
    <XStack gap={12}>
      {tiles.map((tile) => (
        <PressableScale
          key={tile.route}
          onPress={() => router.push(tile.route as never)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            borderRadius: theme.radius.card,
            backgroundColor: theme.colors.surfaceContainerLowest,
            borderWidth: 1,
            borderColor: theme.colors.outlineVariant,
          }}
        >
          <YStack
            width={36}
            height={36}
            borderRadius={11}
            alignItems="center"
            justifyContent="center"
            backgroundColor="surfaceContainerHigh"
          >
            <Icon name={tile.icon} size={18} color={tile.color} />
          </YStack>
          <YStack flex={1}>
            <Text variant="labelMd" weight="bold" numberOfLines={1}>
              {tile.label}
            </Text>
            <Text variant="bodyXs" muted numberOfLines={1}>
              {tile.hint}
            </Text>
          </YStack>
        </PressableScale>
      ))}
    </XStack>
  );
}

/** Four-colour Google marker used as a brand accent. */
function GDGDots({ size = 6 }: { size?: number }) {
  return (
    <XStack gap={2}>
      {GDG_DOTS.map((color) => (
        <YStack key={color} width={size} height={size} borderRadius={size / 2} backgroundColor={color} />
      ))}
    </XStack>
  );
}

function PressableBanner({ announcement }: { announcement: { title: string; body: string; tag?: string; deadline?: string } }) {
  return (
    <YStack marginHorizontal={16} borderRadius="card" overflow="hidden">
      <Gradient token="brand" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Orbs />
        <YStack padding={16} gap={8}>
          <XStack alignItems="center" gap={8}>
            <SolidPill label={announcement.tag ?? 'Announcement'} color="surfaceContainerLowest" onColor="primary" uppercase />
            <YStack flex={1} />
            <Icon name="campaign" size={16} color="#FFFFFF" />
            <Text variant="codeSm" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {formatDeadline(announcement.deadline)}
            </Text>
          </XStack>
          <Text variant="titleMd" weight="bold" style={{ color: '#FFFFFF' }}>
            {announcement.title}
          </Text>
          <Text variant="bodySm" numberOfLines={2} style={{ color: 'rgba(255,255,255,0.88)' }}>
            {announcement.body}
          </Text>
          <XStack alignItems="center" gap={4} marginTop={2}>
            <Text variant="labelMd" weight="semibold" style={{ color: '#FFFFFF' }}>
              Read more
            </Text>
            <Icon name="arrowForward" size={14} color="#FFFFFF" />
          </XStack>
        </YStack>
      </Gradient>
    </YStack>
  );
}

function formatDeadline(deadline?: string): string {
  if (!deadline) return 'Live now';
  return `Due ${new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function LevelCard({
  tier,
  xp,
  xpGoal,
  nextTier,
  eventsAttended,
  labsCompleted,
  streakDays,
  badges,
}: {
  tier: string;
  xp: number;
  xpGoal: number;
  nextTier: string;
  eventsAttended: number;
  labsCompleted: number;
  streakDays: number;
  badges: number;
}) {
  const theme = useTheme();
  const progress = xpGoal > 0 ? Math.min(1, xp / xpGoal) : 0;

  return (
    <SpotlightCard backgroundColor="transparent" glowColor="#FFFFFF" radius={165} style={{ borderRadius: theme.radius.card }}>
      <Gradient token="aurora" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Orbs />
        <YStack padding={16} gap={12}>
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap={8}>
              <YStack
                width={38}
                height={38}
                borderRadius={11}
                backgroundColor="rgba(255,255,255,0.18)"
                alignItems="center"
                justifyContent="center"
              >
                <Icon name="stars" size={21} color="#FFFFFF" />
              </YStack>
              <YStack>
                <Text variant="labelLg" weight="bold" style={{ color: '#FFFFFF' }}>
                  {tier} Builder
                </Text>
                <XStack alignItems="baseline" gap={3}>
                  <AnimatedNumber value={xp} variant="bodySm" style={{ color: 'rgba(255,255,255,0.85)' }} />
                  <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    XP · {badges} badges
                  </Text>
                </XStack>
              </YStack>
            </XStack>
            <YStack alignItems="flex-end">
              <XStack alignItems="baseline">
                <AnimatedNumber value={xp} variant="codeSm" weight="semibold" style={{ color: '#FFFFFF' }} />
                <Text variant="codeSm" weight="semibold" style={{ color: '#FFFFFF' }}>
                  /{xpGoal || '∞'} XP
                </Text>
              </XStack>
              <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Next: {nextTier ?? 'Season end'}
              </Text>
            </YStack>
          </XStack>

          {xpGoal > 0 ? (
            <YStack height={8} borderRadius={4} backgroundColor="rgba(255,255,255,0.24)" overflow="hidden">
              <YStack width={`${progress * 100}%`} height="100%" borderRadius={4} backgroundColor="#FFFFFF" />
            </YStack>
          ) : null}

          <XStack gap={8}>
            <Metric label="Events" value={eventsAttended} icon="calendarMonth" />
            <Metric label="Labs" value={labsCompleted} icon="terminal" />
            <Metric label="Streak" value={`${streakDays}d`} icon="fire" />
          </XStack>
        </YStack>
      </Gradient>
    </SpotlightCard>
  );
}

function Metric({ label, value, icon }: { label: string; value: number | string; icon: 'calendarMonth' | 'terminal' | 'fire' }) {
  return (
    <XStack
      flex={1}
      alignItems="center"
      gap={6}
      padding={10}
      borderRadius={10}
      backgroundColor="rgba(255,255,255,0.14)"
    >
      <Icon name={icon} size={16} color="#FFFFFF" />
      <YStack>
        {typeof value === 'number' ? (
          <AnimatedNumber value={value} variant="labelLg" weight="bold" style={{ lineHeight: 18, color: '#FFFFFF' }} />
        ) : (
          <Text variant="labelLg" weight="bold" style={{ lineHeight: 18, color: '#FFFFFF' }}>
            {value}
          </Text>
        )}
        <Text variant="bodySm" style={{ lineHeight: 14, color: 'rgba(255,255,255,0.82)' }}>
          {label}
        </Text>
      </YStack>
    </XStack>
  );
}
