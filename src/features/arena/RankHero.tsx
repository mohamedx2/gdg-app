import { router } from 'expo-router';
import React from 'react';
import { XStack, YStack } from 'tamagui';

import { AnimatedNumber } from '@/components/animations';
import { Gradient } from '@/components/ui/Gradient';
import { Icon } from '@/components/ui/Icon';
import { Orbs } from '@/components/ui/Orbs';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useAchievementSummary } from '@/hooks/use-community';

/** XP needed per level — kept in one place so the hero and stats agree. */
export const XP_PER_LEVEL = 400;

export function levelFor(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

/** Dark rank card pinned above every Arena segment: level, streak, XP to next tier. */
export function RankHero() {
  const { data: summary } = useAchievementSummary();

  if (!summary) return <Skeleton height={190} radius={22} />;

  const xp = summary.xp ?? summary.points;
  const goal = summary.xpGoal ?? 0;
  const progress = goal > 0 ? Math.min(1, xp / goal) : 1;
  const level = levelFor(xp);

  return (
    <YStack borderRadius="card" overflow="hidden">
      <Gradient token="night" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Orbs />
        <YStack padding={18} gap={14}>
          <XStack alignItems="center" gap={8}>
            <XStack alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={4} borderRadius="full" borderWidth={1} borderColor="outlineVariant">
              <YStack width={6} height={6} borderRadius={3} backgroundColor="live" />
              <Text variant="codeSm" weight="bold" color="onNight">
                ARENA · SEASON
              </Text>
            </XStack>
            {summary.streakDays > 0 ? (
              <XStack alignItems="center" gap={4} paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="secondaryContainer">
                <Icon name="fire" size={13} color="warning" />
                <Text variant="codeSm" weight="bold" color="onSecondaryContainer">
                  {summary.streakDays}-day streak
                </Text>
              </XStack>
            ) : null}
            <YStack flex={1} />
            <YStack width={44} height={44} borderRadius={14} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
              <Icon name="militaryTech" size={22} color="gold" />
            </YStack>
          </XStack>

          <Text variant="headlineSm" weight="bold" color="onNight">
            LVL {level} • {summary.tier} Builder
          </Text>

          <YStack gap={6}>
            <XStack justifyContent="space-between" alignItems="baseline">
              <Text variant="bodySm" color="outline">
                Rank progression
              </Text>
              <XStack alignItems="baseline">
                <AnimatedNumber value={xp} variant="codeSm" weight="bold" color="onNight" />
                {goal > 0 ? (
                  <Text variant="codeSm" color="outline">
                    {' '}/ {goal.toLocaleString('en-US')} XP
                  </Text>
                ) : null}
              </XStack>
            </XStack>
            <YStack height={8} borderRadius={4} backgroundColor="surfaceContainerHigh" overflow="hidden">
              <YStack width={`${progress * 100}%`} height="100%" borderRadius={4} overflow="hidden">
                <Gradient token="google" start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
              </YStack>
            </YStack>
            <XStack justifyContent="space-between">
              <XStack alignItems="center" gap={4}>
                <Icon name="bolt" size={13} color="live" />
                <Text variant="codeSm" color="outline">
                  {Math.round(progress * 100)}% achieved
                </Text>
              </XStack>
              {goal > xp ? (
                <Text variant="codeSm" color="outline">
                  {goal - xp} XP to {summary.nextTier}
                </Text>
              ) : null}
            </XStack>
          </YStack>

          <XStack alignItems="center" justifyContent="space-between" gap={10}>
            <Text variant="bodySm" color="outline">
              {summary.badgesUnlocked}/{summary.badgesTotal} badges · {summary.eventsAttended} events
            </Text>
            <PressableScale onPress={() => router.push('/achievements' as never)} accessibilityLabel="View XP breakdown">
              <XStack alignItems="center" gap={6} height={40} paddingHorizontal={14} borderRadius="full" borderWidth={1} borderColor="outlineVariant">
                <Text variant="codeSm" weight="bold" color="onNight">
                  View breakdown
                </Text>
                <Icon name="arrowForward" size={14} color="onNight" />
              </XStack>
            </PressableScale>
          </XStack>
        </YStack>
      </Gradient>
    </YStack>
  );
}
