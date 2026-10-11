import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AchievementBadge } from '@/components/ui/Badge';
import type { BadgeRarity as UiBadgeRarity } from '@/components/ui/Badge';
import { Icon, iconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useAchievementSummary, useBadges } from '@/hooks/use-community';
import { useTheme } from '@/theme';
import type { Badge, BadgeRarity } from '@/types';

const RARITY_MAP: Record<BadgeRarity, UiBadgeRarity> = {
  common: 'bronze',
  rare: 'silver',
  epic: 'gold',
  legendary: 'platinum',
};

export default function AchievementsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data: summary } = useAchievementSummary();
  const { data: badges, isPending, isError, error, refetch } = useBadges();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Achievements
          </Text>
        </View>
      </View>

      {summary ? (
        <View style={{ margin: 16, marginTop: 12, padding: 16, borderRadius: theme.radius.card, backgroundColor: theme.colors.primaryFixed, gap: 10, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="titleMd" weight="bold" color="primary">
              {summary.xp} XP
            </Text>
            <Text variant="codeSm" weight="semibold" color="primary">
              {summary.badgesUnlocked}/{summary.badgesTotal} badges
            </Text>
          </View>
          <ProgressBar value={summary.xp / Math.max(summary.xpGoal, 1)} gradient="aurora" />
          <Text variant="bodySm" color="primary">
            {summary.eventsAttended} events attended · {summary.tier} Builder
          </Text>
        </View>
      ) : (
        <View style={{ margin: 16 }}>
          <Skeleton height={110} radius={12} />
        </View>
      )}

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text variant="titleMd" weight="bold">
          Badges
        </Text>
      </View>

      {isError ? (
        <View style={{ padding: 16 }}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </View>
      ) : null}

      {isPending ? (
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} width="31%" height={108} radius={12} />
          ))}
        </View>
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
    </View>
  );
}

function BadgeCell({ badge }: { badge: Badge }) {
  const theme = useTheme();
  const locked = !badge.unlocked;
  const rarity = RARITY_MAP[badge.rarity];
  return (
    <View
      style={{
        flex: 1,
        minWidth: '31%',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 12,
        paddingHorizontal: 6,
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: locked ? theme.colors.outlineVariant : theme.colors.primaryContainer,
      }}
    >
      <AchievementBadge name={badge.name} icon={iconName(badge.icon)} rarity={rarity} size={44} earned={!locked} />
      <Text variant="labelSm" weight="semibold" numberOfLines={1} style={{ textAlign: 'center' }}>
        {badge.name}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        <Icon name="stars" size={11} color={locked ? 'secondary' : 'warning'} />
        <Text variant="codeSm" muted>{badge.points}</Text>
      </View>
    </View>
  );
}