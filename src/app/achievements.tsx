import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { AchievementBadge } from '@/components/ui/Badge';
import type { BadgeRarity as UiBadgeRarity } from '@/components/ui/Badge';
import { Icon, iconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useAchievementSummary, useBadges } from '@/hooks/use-community';
import type { Badge, BadgeRarity } from '@/types';

const RARITY_MAP: Record<BadgeRarity, UiBadgeRarity> = {
  common: 'bronze',
  rare: 'silver',
  epic: 'gold',
  legendary: 'platinum',
};

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { data: summary } = useAchievementSummary();
  const { data: badges, isPending, isError, error, refetch } = useBadges();

  return (
    <YStack flex={1} backgroundColor="background">
      <YStack paddingTop={insets.top + 8} paddingHorizontal={16}>
        <XStack alignItems="center" gap={4}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Achievements
          </Text>
        </XStack>
      </YStack>

      {summary ? (
        <YStack margin={16} marginTop={12} padding={16} borderRadius="card" backgroundColor="primaryFixed" gap={10} overflow="hidden">
          <XStack alignItems="center" justifyContent="space-between">
            <Text variant="titleMd" weight="bold" color="primary">
              {summary.xp} XP
            </Text>
            <Text variant="codeSm" weight="semibold" color="primary">
              {summary.badgesUnlocked}/{summary.badgesTotal} badges
            </Text>
          </XStack>
          <ProgressBar value={summary.xp / Math.max(summary.xpGoal, 1)} gradient="aurora" />
          <Text variant="bodySm" color="primary">
            {summary.eventsAttended} events attended · {summary.tier} Builder
          </Text>
        </YStack>
      ) : (
        <YStack margin={16}>
          <Skeleton height={110} radius={12} />
        </YStack>
      )}

      <YStack paddingHorizontal={16} paddingBottom={8}>
        <Text variant="titleMd" weight="bold">
          Badges
        </Text>
      </YStack>

      {isError ? (
        <YStack padding={16}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </YStack>
      ) : null}

      {isPending ? (
        <XStack paddingHorizontal={16} flexWrap="wrap" gap={12}>
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} width="31%" height={108} radius={12} />
          ))}
        </XStack>
      ) : null}

      {!isPending && badges && badges.length === 0 ? (
        <EmptyState icon="emojiEvents" title="No badges yet" message="Attend events and complete resources to unlock badges." />
      ) : null}

      {badges && badges.length > 0 ? (
        <FlashList
          data={badges}
          keyExtractor={(badge) => (badge as Badge).id}
          numColumns={3}
          contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 60, gap: 12 }}
          renderItem={({ item }) => <BadgeCell badge={item} />}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </YStack>
  );
}

function BadgeCell({ badge }: { badge: Badge }) {
  const locked = !badge.unlocked;
  const rarity = RARITY_MAP[badge.rarity];
  return (
    <YStack
      flex={1}
      minWidth="31%"
      alignItems="center"
      gap={6}
      paddingVertical={12}
      paddingHorizontal={6}
      borderRadius="card"
      backgroundColor="surfaceContainerLowest"
      borderWidth={1}
      borderColor={locked ? 'outlineVariant' : 'primaryContainer'}
    >
      <AchievementBadge name={badge.name} icon={iconName(badge.icon)} rarity={rarity} size={44} earned={!locked} />
      <Text variant="labelSm" weight="semibold" numberOfLines={1} style={{ textAlign: 'center' }}>
        {badge.name}
      </Text>
      <XStack alignItems="center" gap={3}>
        <Icon name="stars" size={11} color={locked ? 'secondary' : 'warning'} />
        <Text variant="codeSm" muted>{badge.points}</Text>
      </XStack>
    </YStack>
  );
}