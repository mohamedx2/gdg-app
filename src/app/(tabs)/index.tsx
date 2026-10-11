import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { MEMORIES } from '@/constants/memories';
import { useEvents, useUpcomingEvents } from '@/hooks/use-events';
import { useConversations } from '@/hooks/use-messages';
import { useRecommendedResources } from '@/hooks/use-resources';
import { useTheme } from '@/theme';

const GDG_DOTS = ['#EA4335', '#4285F4', '#FBBC04', '#34A853'];

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

  const pinned = announcements?.find((item) => item.pinned) ?? announcements?.[0];
  // Between seasons there is nothing upcoming — fall back to the latest activities.
  const offSeason = upcoming !== undefined && upcoming.length === 0;
  const { data: recent } = useEvents({ scope: 'past', pageSize: 6 });
  const showcase = offSeason ? (recent?.data ?? []) : upcoming;
  const featured = showcase?.find((item) => item.featured) ?? showcase?.[0];
  const others = showcase?.filter((item) => item.id !== featured?.id) ?? [];

  const firstName = profile?.name?.split(' ')[0] ?? 'Builder';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {profile ? (
            <Avatar uri={profile.avatar} name={profile.name} size={40} ring="brand" />
          ) : (
            <Skeleton width={44} height={44} radius={22} />
          )}
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <GDGDots />
              <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                GDG on Campus
              </Text>
            </View>
            <Text variant="headlineMd" family="heading">
              Hello, {firstName}
            </Text>
          </View>
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
        </View>

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
      </View>

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
            <View style={{ paddingHorizontal: 16 }}>
              <FeaturedEventCard event={featured} />
            </View>
          </Reveal>
        ) : showcase ? null : (
          <View style={{ paddingHorizontal: 16 }}>
            <Skeleton height={190} radius={12} />
          </View>
        )}

        <Reveal delay={80}>
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
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
          </View>
        </Reveal>

        {summary ? (
          <Reveal delay={120}>
            <View style={{ paddingHorizontal: 16 }}>
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
            </View>
          </Reveal>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            <Skeleton height={120} radius={12} />
          </View>
        )}

        <Reveal delay={140}>
          <View style={{ paddingHorizontal: 16 }}>
            <CompeteRow />
          </View>
        </Reveal>

        <Reveal delay={150}>
          <View style={{ paddingHorizontal: 16 }}>
            <VoiceRow />
          </View>
        </Reveal>

        <Reveal delay={150}>
          <View style={{ gap: 12 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <SectionHeader title="Memories" subtitle="Moments from past seasons" accent="warning" actionLabel="See all" onAction={() => router.push('/memories' as never)} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}>
              {MEMORIES.slice(0, 6).map((memory) => (
                <PressableScale key={memory.id} onPress={() => router.push('/memories' as never)} accessibilityLabel={`Open memories: ${memory.caption}`} style={{ width: 150, height: 190, borderRadius: theme.radius.card, overflow: 'hidden', backgroundColor: theme.colors.surfaceContainer }}>
                  <Image source={memory.source} contentFit="cover" style={{ width: '100%', height: '100%' }} />
                </PressableScale>
              ))}
            </ScrollView>
          </View>
        </Reveal>

        {activity?.length ? (
          <Reveal delay={160}>
            <View style={{ paddingHorizontal: 16, gap: 12 }}>
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
            </View>
          </Reveal>
        ) : null}

        {resources?.length ? (
          <Reveal delay={200}>
            <View style={{ paddingHorizontal: 16, gap: 12 }}>
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
            </View>
          </Reveal>
        ) : null}
      </ScrollView>
    </View>
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
    <View style={{ flexDirection: 'row', gap: 12 }}>
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
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surfaceContainerHigh,
            }}
          >
            <Icon name={tile.icon} size={20} color={tile.color} />
          </View>
          <View>
            <Text variant="labelLg" weight="bold">
              {tile.label}
            </Text>
            <Text variant="bodySm" muted>
              {tile.hint}
            </Text>
          </View>
        </PressableScale>
      ))}
    </View>
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
    <View style={{ flexDirection: 'row', gap: 12 }}>
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
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surfaceContainerHigh,
            }}
          >
            <Icon name={tile.icon} size={18} color={tile.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="labelMd" weight="bold" numberOfLines={1}>
              {tile.label}
            </Text>
            <Text variant="bodyXs" muted numberOfLines={1}>
              {tile.hint}
            </Text>
          </View>
        </PressableScale>
      ))}
    </View>
  );
}

/** Four-colour Google marker used as a brand accent. */
function GDGDots({ size = 6 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {GDG_DOTS.map((color) => (
        <View key={color} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
      ))}
    </View>
  );
}

function PressableBanner({ announcement }: { announcement: { title: string; body: string; tag?: string; deadline?: string } }) {
  const theme = useTheme();
  return (
    <View style={{ marginHorizontal: 16, borderRadius: theme.radius.card, overflow: 'hidden' }}>
      <Gradient token="brand" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Orbs />
        <View style={{ padding: 16, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <SolidPill label={announcement.tag ?? 'Announcement'} color="surfaceContainerLowest" onColor="primary" uppercase />
            <View style={{ flex: 1 }} />
            <Icon name="campaign" size={16} color="#FFFFFF" />
            <Text variant="codeSm" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {formatDeadline(announcement.deadline)}
            </Text>
          </View>
          <Text variant="titleMd" weight="bold" style={{ color: '#FFFFFF' }}>
            {announcement.title}
          </Text>
          <Text variant="bodySm" numberOfLines={2} style={{ color: 'rgba(255,255,255,0.88)' }}>
            {announcement.body}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Text variant="labelMd" weight="semibold" style={{ color: '#FFFFFF' }}>
              Read more
            </Text>
            <Icon name="arrowForward" size={14} color="#FFFFFF" />
          </View>
        </View>
      </Gradient>
    </View>
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
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="stars" size={21} color="#FFFFFF" />
              </View>
              <View>
                <Text variant="labelLg" weight="bold" style={{ color: '#FFFFFF' }}>
                  {tier} Builder
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
                  <AnimatedNumber value={xp} variant="bodySm" style={{ color: 'rgba(255,255,255,0.85)' }} />
                  <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    XP · {badges} badges
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <AnimatedNumber value={xp} variant="codeSm" weight="semibold" style={{ color: '#FFFFFF' }} />
                <Text variant="codeSm" weight="semibold" style={{ color: '#FFFFFF' }}>
                  /{xpGoal || '∞'} XP
                </Text>
              </View>
              <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Next: {nextTier ?? 'Season end'}
              </Text>
            </View>
          </View>

          {xpGoal > 0 ? (
            <View style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.24)', overflow: 'hidden' }}>
              <View style={{ width: `${progress * 100}%`, height: '100%', borderRadius: 4, backgroundColor: '#FFFFFF' }} />
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Metric label="Events" value={eventsAttended} icon="calendarMonth" />
            <Metric label="Labs" value={labsCompleted} icon="terminal" />
            <Metric label="Streak" value={`${streakDays}d`} icon="fire" />
          </View>
        </View>
      </Gradient>
    </SpotlightCard>
  );
}

function Metric({ label, value, icon }: { label: string; value: number | string; icon: 'calendarMonth' | 'terminal' | 'fire' }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.14)',
      }}
    >
      <Icon name={icon} size={16} color="#FFFFFF" />
      <View>
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
      </View>
    </View>
  );
}
