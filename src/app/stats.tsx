import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedNumber } from '@/components/animations';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Screen';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useClubStats } from '@/hooks/use-stats';
import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';

export default function ClubStatsScreen() {
  const theme = useTheme();
  const { memberRoles: MEMBER_ROLES, tracks: TRACKS } = useTaxonomy();
  const insets = useSafeAreaInsets();
  const { data: stats, isPending, isError, error, refetch } = useClubStats();

  const maxTrackEvents = stats ? Math.max(1, ...stats.trackBreakdown.map((item) => item.events)) : 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text variant="headlineMd" weight="bold">
          Club stats
        </Text>
      </View>

      {isError ? (
        <View style={{ padding: 16 }}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </View>
      ) : isPending || !stats ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={120} radius={16} />
          <Skeleton height={200} radius={16} />
          <Skeleton height={200} radius={16} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Reveal>
            <View style={{ borderRadius: theme.radius.card, padding: 20, backgroundColor: theme.colors.primaryContainer, gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="insights" size={20} color="onPrimaryContainer" />
                <Text variant="titleSm" weight="bold" color="onPrimaryContainer">
                  GDG EPI in numbers
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 }}>
                <HeroStat value={stats.activeMembers} label="Active members" color="onPrimaryContainer" />
                <HeroStat value={stats.eventsHosted} label="Events hosted" color="onPrimaryContainer" />
                <HeroStat value={stats.hoursLearned} label="Hours learned" color="onPrimaryContainer" />
                <HeroStat value={`${stats.memberGrowthPct}%`} label="Growth this year" color="onPrimaryContainer" />
              </View>
            </View>
          </Reveal>

          <View style={{ gap: 12 }}>
            <SectionHeader title="Impact" subtitle="What the chapter has built together" accent="primary" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <StatTile icon="groups" color="primary" value={stats.totalRegistrations} label="Event registrations" />
              <StatTile icon="workspacePremium" color="tertiary" value={stats.badgesEarned} label="Badges earned" />
              <StatTile icon="menuBook" color="secondary" value={stats.resourcesPublished} label="Resources shared" />
              <StatTile icon="science" color="primary" value={stats.labCompletions} label="Labs completed" />
              <StatTile icon="rocketLaunch" color="tertiary" value={stats.projectsShipped} label="Projects shipped" />
              <StatTile icon="eventAvailable" color="secondary" value={`${stats.attendanceRate}%`} label="Average attendance" />
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <SectionHeader title="By track" subtitle="Where our events focus" accent="secondary" />
            <View style={{ gap: 12, padding: 16, borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant }}>
              {stats.trackBreakdown.map((item) => (
                <View key={item.track} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors[TRACKS[item.track].color] }} />
                    <Text variant="labelMd" weight="medium" style={{ flex: 1 }}>
                      {TRACKS[item.track].label}
                    </Text>
                    <Text variant="bodySm" muted>
                      {item.events} {item.events === 1 ? 'event' : 'events'}
                    </Text>
                  </View>
                  <ProgressBar value={item.events / maxTrackEvents} fill={TRACKS[item.track].color} />
                </View>
              ))}
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <SectionHeader title="Top contributors" subtitle="This semester's community leaders" accent="tertiary" />
            <View style={{ borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant, overflow: 'hidden' }}>
              {stats.topContributors.map((person, index) => (
                <View
                  key={person.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: theme.colors.outlineVariant,
                  }}
                >
                  <Text variant="titleSm" weight="bold" color={index === 0 ? 'tertiary' : 'onSurfaceVariant'} style={{ width: 24 }}>
                    {person.rank}
                  </Text>
                  <Avatar uri={person.avatar} name={person.name} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text variant="labelLg" weight="bold">
                      {person.name}
                    </Text>
                    <Text variant="bodyXs" muted>
                      {MEMBER_ROLES[person.role].label}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Icon name="bolt" size={14} color="primary" />
                    <Text variant="labelMd" weight="bold" primary>
                      {person.points.toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function HeroStat({ value, label, color }: { value: number | string; label: string; color: ColorToken }) {
  return (
    <View style={{ width: '50%', gap: 2 }}>
      {typeof value === 'number' ? (
        <AnimatedNumber value={value} variant="headlineSm" weight="bold" color={color} />
      ) : (
        <Text variant="headlineSm" weight="bold" color={color}>
          {value}
        </Text>
      )}
      <Text variant="bodySm" color={color} style={{ opacity: 0.8 }}>
        {label}
      </Text>
    </View>
  );
}

function StatTile({ icon, color, value, label }: { icon: 'groups' | 'workspacePremium' | 'menuBook' | 'science' | 'rocketLaunch' | 'eventAvailable'; color: ColorToken; value: number | string; label: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: '47%',
        gap: 8,
        padding: 14,
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
      }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceContainerHigh }}>
        <Icon name={icon} size={18} color={color} />
      </View>
      {typeof value === 'number' ? (
        <AnimatedNumber value={value} variant="headlineSm" weight="bold" />
      ) : (
        <Text variant="headlineSm" weight="bold">
          {value}
        </Text>
      )}
      <Text variant="bodySm" muted>
        {label}
      </Text>
    </View>
  );
}
