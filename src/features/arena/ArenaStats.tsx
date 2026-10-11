import React from 'react';
import { XStack, YStack } from 'tamagui';

import { AnimatedNumber } from '@/components/animations';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Screen';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useClubStats } from '@/hooks/use-stats';
import type { ColorToken } from '@/theme/colors';

/** Club stats segment body — extracted from the former `/stats` screen. */
export function ArenaStats() {
  const { memberRoles: MEMBER_ROLES, tracks: TRACKS } = useTaxonomy();
  const { data: stats, isPending, isError, error, refetch } = useClubStats();

  const maxTrackEvents = stats ? Math.max(1, ...stats.trackBreakdown.map((item) => item.events)) : 1;

  if (isError) return <ErrorState message={error?.message} onRetry={() => refetch()} />;

  if (isPending || !stats) {
    return (
      <YStack gap={12}>
        <Skeleton height={120} radius={16} />
        <Skeleton height={200} radius={16} />
        <Skeleton height={200} radius={16} />
      </YStack>
    );
  }

  return (
    <>
      <Reveal>
        <YStack borderRadius="card" padding={20} backgroundColor="primaryContainer" gap={14}>
          <XStack alignItems="center" gap={8}>
            <Icon name="insights" size={20} color="onPrimaryContainer" />
            <Text variant="titleSm" weight="bold" color="onPrimaryContainer">
              GDG EPI in numbers
            </Text>
          </XStack>
          <XStack flexWrap="wrap" rowGap={16}>
            <HeroStat value={stats.activeMembers} label="Active members" color="onPrimaryContainer" />
            <HeroStat value={stats.eventsHosted} label="Events hosted" color="onPrimaryContainer" />
            <HeroStat value={stats.hoursLearned} label="Hours learned" color="onPrimaryContainer" />
            <HeroStat value={`${stats.memberGrowthPct}%`} label="Growth this year" color="onPrimaryContainer" />
          </XStack>
        </YStack>
      </Reveal>

      <YStack gap={12}>
        <SectionHeader title="Impact" subtitle="What the chapter has built together" accent="primary" />
        <XStack flexWrap="wrap" gap={12}>
          <StatTile icon="groups" color="primary" value={stats.totalRegistrations} label="Event registrations" />
          <StatTile icon="workspacePremium" color="tertiary" value={stats.badgesEarned} label="Badges earned" />
          <StatTile icon="menuBook" color="secondary" value={stats.resourcesPublished} label="Resources shared" />
          <StatTile icon="science" color="primary" value={stats.labCompletions} label="Labs completed" />
          <StatTile icon="rocketLaunch" color="tertiary" value={stats.projectsShipped} label="Projects shipped" />
          <StatTile icon="eventAvailable" color="secondary" value={`${stats.attendanceRate}%`} label="Average attendance" />
        </XStack>
      </YStack>

      <YStack gap={12}>
        <SectionHeader title="By track" subtitle="Where our events focus" accent="secondary" />
        <YStack gap={12} padding={16} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
          {stats.trackBreakdown.map((item) => (
            <YStack key={item.track} gap={6}>
              <XStack alignItems="center" gap={8}>
                <YStack width={8} height={8} borderRadius={4} backgroundColor={TRACKS[item.track].color} />
                <Text variant="labelMd" weight="medium" style={{ flex: 1 }}>
                  {TRACKS[item.track].label}
                </Text>
                <Text variant="bodySm" muted>
                  {item.events} {item.events === 1 ? 'event' : 'events'}
                </Text>
              </XStack>
              <ProgressBar value={item.events / maxTrackEvents} fill={TRACKS[item.track].color} />
            </YStack>
          ))}
        </YStack>
      </YStack>

      <YStack gap={12}>
        <SectionHeader title="Top contributors" subtitle="This semester's community leaders" accent="tertiary" />
        <YStack borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant" overflow="hidden">
          {stats.topContributors.map((person, index) => (
            <XStack
              key={person.id}
              alignItems="center"
              gap={12}
              padding={14}
              borderTopWidth={index === 0 ? 0 : 1}
              borderTopColor="outlineVariant"
            >
              <Text variant="titleSm" weight="bold" color={index === 0 ? 'tertiary' : 'onSurfaceVariant'} style={{ width: 24 }}>
                {person.rank}
              </Text>
              <Avatar uri={person.avatar} name={person.name} size={40} />
              <YStack flex={1}>
                <Text variant="labelLg" weight="bold">
                  {person.name}
                </Text>
                <Text variant="bodyXs" muted>
                  {MEMBER_ROLES[person.role].label}
                </Text>
              </YStack>
              <XStack alignItems="center" gap={4}>
                <Icon name="bolt" size={14} color="primary" />
                <Text variant="labelMd" weight="bold" primary>
                  {person.points.toLocaleString()}
                </Text>
              </XStack>
            </XStack>
          ))}
        </YStack>
      </YStack>
    </>
  );
}

function HeroStat({ value, label, color }: { value: number | string; label: string; color: ColorToken }) {
  return (
    <YStack width="50%" gap={2}>
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
    </YStack>
  );
}

function StatTile({ icon, color, value, label }: { icon: 'groups' | 'workspacePremium' | 'menuBook' | 'science' | 'rocketLaunch' | 'eventAvailable'; color: ColorToken; value: number | string; label: string }) {
  return (
    <YStack
      flexGrow={1}
      flexBasis="47%"
      gap={8}
      padding={14}
      borderRadius="card"
      backgroundColor="surfaceContainerLowest"
      borderWidth={1}
      borderColor="outlineVariant"
    >
      <YStack width={34} height={34} borderRadius={11} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
        <Icon name={icon} size={18} color={color} />
      </YStack>
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
    </YStack>
  );
}

export default ArenaStats;
