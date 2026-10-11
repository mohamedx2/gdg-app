import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { ActivityCard } from '@/components/ActivityCard';
import { AnimatedNumber, Stagger } from '@/components/animations';
import { CompactEventCard, FeaturedEventCard } from '@/components/EventCard';
import { ResourceCard } from '@/components/ResourceCard';
import { Gradient } from '@/components/ui/Gradient';
import { Icon } from '@/components/ui/Icon';
import { Orbs } from '@/components/ui/Orbs';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Screen';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { SolidPill } from '@/components/ui/Chip';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { useMemories } from '@/hooks/use-content';
import {
  useAchievementSummary,
  useActivity,
  useAnnouncements,
} from '@/hooks/use-community';
import { useEvents, useUpcomingEvents } from '@/hooks/use-events';
import { useRecommendedResources } from '@/hooks/use-resources';
import { useTheme } from '@/theme';

import { SPACE_BOTTOM_PADDING } from './SpaceScaffold';

/** TODAY — next event, level progress, quick actions, memories and pulse. */
export function TodaySpace() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data: announcements } = useAnnouncements();
  const { data: upcoming } = useUpcomingEvents(6);
  const { data: summary } = useAchievementSummary();
  const { data: resources } = useRecommendedResources(4);
  const { data: activity } = useActivity();
  const memories = useMemories();

  const pinned = announcements?.find((item) => item.pinned) ?? announcements?.[0];
  const offSeason = upcoming !== undefined && upcoming.length === 0;
  const { data: recent } = useEvents({ scope: 'past', pageSize: 6 });
  const showcase = offSeason ? (recent?.data ?? []) : upcoming;
  const featured = showcase?.find((item) => item.featured) ?? showcase?.[0];
  const others = showcase?.filter((item) => item.id !== featured?.id) ?? [];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 8,
        paddingBottom: SPACE_BOTTOM_PADDING + insets.bottom,
        gap: 22,
      }}
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
            title={offSeason ? 'Latest activities' : 'Happening this week'}
            subtitle={offSeason ? 'Season recap · new dates soon' : 'This month at EPI Sousse'}
            accent="primary"
            actionLabel="See all"
            onAction={() => router.push('/(spaces)?space=explore')}
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
        <YStack paddingHorizontal={16} gap={12}>
          <SectionHeader title="Daily actions" subtitle="Quick wins to keep your streak" accent="warning" />
          <DailyActions />
        </YStack>
      </Reveal>

      <Reveal delay={150}>
        <YStack gap={12}>
          <YStack paddingHorizontal={16}>
            <SectionHeader
              title="Campus memories"
              subtitle="Moments from past seasons"
              accent="warning"
              actionLabel="See all"
              onAction={() => router.push('/memories' as never)}
            />
          </YStack>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}>
            {memories.slice(0, 6).map((memory) => (
              <PressableScale
                key={memory.id}
                onPress={() => router.push('/memories' as never)}
                accessibilityLabel={`Open memories: ${memory.caption}`}
                style={{
                  width: 150,
                  height: 190,
                  borderRadius: theme.radius.card,
                  overflow: 'hidden',
                  backgroundColor: theme.colors.surfaceContainer,
                }}
              >
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
              actionLabel="Explore"
              onAction={() => router.push('/(spaces)?space=explore')}
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
              onAction={() => router.push('/(spaces)?space=explore')}
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
  );
}

/** Quick-action tiles — quiz, squad quest and the open core vote. */
function DailyActions() {
  const theme = useTheme();
  const { can } = useAuth();
  const tiles = [
    { icon: 'help' as const, label: 'Daily quiz', hint: 'Keep a streak', route: '/quiz', color: 'primary' as const },
    { icon: 'flag' as const, label: 'Squad quest', hint: 'Earn XP', route: '/quests', color: 'warning' as const },
    can('decisions.vote')
      ? { icon: 'howToVote' as const, label: 'Open vote', hint: 'Cast yours', route: '/decisions', color: 'secondary' as const }
      : { icon: 'lightbulb' as const, label: 'Idea box', hint: 'Suggest', route: '/ideas', color: 'secondary' as const },
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
            <Text variant="labelLg" weight="bold" numberOfLines={1}>
              {tile.label}
            </Text>
            <Text variant="bodySm" muted numberOfLines={1}>
              {tile.hint}
            </Text>
          </YStack>
        </PressableScale>
      ))}
    </XStack>
  );
}

function PressableBanner({
  announcement,
}: {
  announcement: { title: string; body: string; tag?: string; deadline?: string };
}) {
  return (
    <YStack marginHorizontal={16} borderRadius="card" overflow="hidden">
      <Gradient token="brand" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Orbs />
        <YStack padding={16} gap={8}>
          <XStack alignItems="center" gap={8}>
            <SolidPill
              label={announcement.tag ?? 'Announcement'}
              color="surfaceContainerLowest"
              onColor="primary"
              uppercase
            />
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
    <XStack flex={1} alignItems="center" gap={6} padding={10} borderRadius={10} backgroundColor="rgba(255,255,255,0.14)">
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

export default TodaySpace;
