import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Stagger } from '@/components/animations';
import { Icon, iconName, type IconName } from '@/components/ui/Icon';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useBadges } from '@/hooks/use-community';
import type { ColorToken } from '@/theme/colors';
import type { Badge, BadgeRarity } from '@/types';

type Tier = 'gold' | 'silver' | 'bronze';

const TIER_OF: Record<BadgeRarity, Tier> = {
  legendary: 'gold',
  epic: 'gold',
  rare: 'silver',
  common: 'bronze',
};

const TIERS: { key: Tier; label: string; icon: IconName; tile: ColorToken; accent: ColorToken }[] = [
  { key: 'gold', label: 'GOLD TIER', icon: 'trophy', tile: 'secondaryContainer', accent: 'gold' },
  { key: 'silver', label: 'SILVER TIER', icon: 'stars', tile: 'surfaceContainerHigh', accent: 'primary' },
  { key: 'bronze', label: 'BRONZE TIER', icon: 'militaryTech', tile: 'surfaceContainerHigh', accent: 'warning' },
];

const MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function stamp(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return `${MONTH[date.getMonth()]} ${date.getFullYear()}`;
}

/** Badges showcase — unlocked badges by tier, then secret & locked ones. */
export function ArenaBadges() {
  const { data: badges, isPending, isError, error, refetch } = useBadges();
  const unlocked = badges?.filter((badge) => badge.unlocked) ?? [];
  const locked = badges?.filter((badge) => !badge.unlocked) ?? [];

  return (
    <YStack gap={16}>
      <XStack alignItems="flex-end" justifyContent="space-between">
        <YStack>
          <Text variant="titleMd" weight="bold">
            Badges Showcase
          </Text>
          <Text variant="bodySm" muted>
            Unlocked awards & verified credentials
          </Text>
        </YStack>
        {badges ? (
          <YStack paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="surfaceContainerHigh">
            <Text variant="codeSm" weight="bold">
              {unlocked.length} / {badges.length} UNLOCKED
            </Text>
          </YStack>
        ) : null}
      </XStack>

      {isError ? <ErrorState message={error?.message} onRetry={() => refetch()} /> : null}
      {isPending ? [1, 2, 3].map((key) => <Skeleton key={key} height={84} radius={18} />) : null}
      {!isPending && badges && badges.length === 0 ? (
        <EmptyState icon="emojiEvents" title="No badges yet" message="Attend events and complete resources to unlock badges." />
      ) : null}

      {TIERS.map((tier) => {
        const items = unlocked.filter((badge) => TIER_OF[badge.rarity] === tier.key);
        if (!items.length) return null;
        return (
          <YStack key={tier.key} gap={10}>
            <TierLabel icon={tier.icon} label={tier.label} color={tier.accent} />
            {tier.key === 'bronze' ? (
              <XStack flexWrap="wrap" gap={10}>
                {items.map((badge) => (
                  <YStack key={badge.id} flexBasis="47%" flexGrow={1} padding={14} gap={8} borderRadius={18} backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
                    <XStack alignItems="center" justifyContent="space-between">
                      <YStack width={40} height={40} borderRadius={12} alignItems="center" justifyContent="center" backgroundColor={tier.tile}>
                        <Icon name={iconName(badge.icon)} size={20} color={tier.accent} />
                      </YStack>
                      <Text variant="codeSm" weight="bold" color="tertiary">
                        UNLOCKED
                      </Text>
                    </XStack>
                    <Text variant="labelLg" weight="bold" numberOfLines={1}>
                      {badge.name}
                    </Text>
                    <Text variant="bodySm" muted numberOfLines={2}>
                      {badge.description}
                    </Text>
                    <Text variant="codeSm" muted>
                      +{badge.points} XP
                    </Text>
                  </YStack>
                ))}
              </XStack>
            ) : (
              items.map((badge, index) => (
                <Stagger key={badge.id} index={Math.min(index, 6)}>
                  <BadgeRow badge={badge} tile={tier.tile} accent={tier.accent} />
                </Stagger>
              ))
            )}
          </YStack>
        );
      })}

      {locked.length ? (
        <YStack gap={10}>
          <TierLabel icon="lock" label="SECRET & LOCKED" color="onSurfaceVariant" />
          {locked.map((badge) => (
            <XStack key={badge.id} alignItems="center" gap={12} padding={14} borderRadius={18} backgroundColor="surfaceContainerLow" opacity={0.75}>
              <YStack width={48} height={48} borderRadius={14} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
                <Icon name="lock" size={20} color="onSurfaceVariant" />
              </YStack>
              <YStack flex={1} gap={3}>
                <XStack alignItems="center" justifyContent="space-between" gap={8}>
                  <Text variant="labelLg" weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {badge.name}
                  </Text>
                  <YStack paddingHorizontal={6} paddingVertical={1} borderRadius={6} backgroundColor="surfaceContainerHigh">
                    <Text variant="codeSm" weight="bold" muted>
                      LOCKED
                    </Text>
                  </YStack>
                </XStack>
                <Text variant="bodySm" muted numberOfLines={1}>
                  {badge.progressLabel || badge.description}
                </Text>
                <YStack height={4} borderRadius={2} backgroundColor="surfaceContainerHigh" overflow="hidden">
                  <YStack width={`${Math.min(1, Math.max(0, badge.progress)) * 100}%`} height="100%" backgroundColor="outline" />
                </YStack>
                <Text variant="codeSm" muted>
                  REWARD: +{badge.points} XP
                </Text>
              </YStack>
            </XStack>
          ))}
        </YStack>
      ) : null}
    </YStack>
  );
}

function TierLabel({ icon, label, color }: { icon: IconName; label: string; color: ColorToken }) {
  return (
    <XStack alignItems="center" gap={6}>
      <Icon name={icon} size={14} color={color} />
      <Text variant="codeSm" weight="bold" muted>
        {label}
      </Text>
    </XStack>
  );
}

function BadgeRow({ badge, tile, accent }: { badge: Badge; tile: ColorToken; accent: ColorToken }) {
  const when = stamp(badge.unlockedAt);
  return (
    <XStack alignItems="center" gap={12} padding={14} borderRadius={18} backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
      <YStack width={52} height={52} borderRadius={16} alignItems="center" justifyContent="center" backgroundColor={tile}>
        <Icon name={iconName(badge.icon)} size={24} color={accent} />
      </YStack>
      <YStack flex={1} gap={3}>
        <XStack alignItems="center" justifyContent="space-between" gap={8}>
          <Text variant="titleSm" weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
            {badge.name}
          </Text>
          {when ? (
            <YStack paddingHorizontal={6} paddingVertical={1} borderRadius={6} backgroundColor={tile}>
              <Text variant="codeSm" weight="bold">
                {when}
              </Text>
            </YStack>
          ) : null}
        </XStack>
        <Text variant="bodySm" muted numberOfLines={2}>
          {badge.description}
        </Text>
        <XStack alignItems="center" gap={4}>
          <Icon name="verified" size={13} color={accent} />
          <Text variant="codeSm" weight="bold" color={accent}>
            +{badge.points} XP AWARDED
          </Text>
        </XStack>
      </YStack>
    </XStack>
  );
}

export default ArenaBadges;
