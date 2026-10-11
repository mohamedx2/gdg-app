import React from 'react';
import { XStack, YStack } from 'tamagui';

import { AchievementBadge } from '@/components/ui/Badge';
import type { BadgeRarity as UiBadgeRarity } from '@/components/ui/Badge';
import { Icon, iconName } from '@/components/ui/Icon';
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

/** Badges / achievements segment body — extracted from the former `/achievements` screen. */
export function ArenaBadges() {
  const { data: summary } = useAchievementSummary();
  const { data: badges, isPending, isError, error, refetch } = useBadges();

  return (
    <>
      {summary ? (
        <YStack padding={16} borderRadius="card" backgroundColor="primaryFixed" gap={10} overflow="hidden">
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
        <Skeleton height={110} radius={12} />
      )}

      <Text variant="titleMd" weight="bold" style={{ marginTop: 4 }}>
        Badges
      </Text>

      {isError ? <ErrorState message={error?.message} onRetry={() => refetch()} /> : null}

      {isPending ? (
        <XStack flexWrap="wrap" gap={12}>
          {[1, 2, 3].map((key) => (
            <YStack key={key} flexBasis="31%" flexGrow={1}>
              <Skeleton height={108} radius={12} />
            </YStack>
          ))}
        </XStack>
      ) : null}

      {!isPending && badges && badges.length === 0 ? (
        <EmptyState icon="emojiEvents" title="No badges yet" message="Attend events and complete resources to unlock badges." />
      ) : null}

      <XStack flexWrap="wrap" gap={12}>
        {badges?.map((badge: Badge) => (
          <BadgeCell key={badge.id} badge={badge} />
        ))}
      </XStack>
    </>
  );
}

function BadgeCell({ badge }: { badge: Badge }) {
  const locked = !badge.unlocked;
  const rarity = RARITY_MAP[badge.rarity];
  return (
    <YStack
      flexBasis="31%"
      flexGrow={1}
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

export default ArenaBadges;
