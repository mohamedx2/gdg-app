import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { QuestCard } from '@/components/QuestCard';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Screen';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useClaimQuest, useQuests } from '@/hooks/use-quests';
import { useUiStore } from '@/stores/ui.store';
import type { Quest } from '@/types';

export default function QuestsScreen() {
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);
  const { data: quests, isPending, isError, error, refetch } = useQuests();
  const claim = useClaimQuest();

  const active = quests?.filter((q) => q.status === 'active' || q.status === 'claimable') ?? [];
  const locked = quests?.filter((q) => q.status === 'locked') ?? [];
  const readyCount = quests?.filter((q) => q.status === 'claimable').length ?? 0;
  const earned = quests?.filter((q) => q.claimed).reduce((sum, q) => sum + q.reward, 0) ?? 0;

  const handleClaim = (id: string) => {
    claim.mutate(id, {
      onSuccess: (quest) => toast(`+${quest.reward} XP · ${quest.title}`, 'success'),
      onError: (err) => toast(err instanceof Error ? err.message : 'Could not claim quest', 'error'),
    });
  };

  return (
    <YStack flex={1} backgroundColor="background">
      <YStack paddingTop={insets.top + 8} paddingHorizontal={16}>
        <XStack alignItems="center" gap={4}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Quests
          </Text>
        </XStack>
      </YStack>

      {isError ? (
        <YStack padding={16}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </YStack>
      ) : isPending && !quests ? (
        <YStack padding={16} gap={12}>
          <Skeleton height={72} radius={14} />
          {[1, 2].map((key) => (
            <Skeleton key={key} height={200} radius={14} />
          ))}
        </YStack>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Reveal>
            <XStack gap={8}>
              <SummaryTile label="Active" value={active.length} icon="flag" />
              <SummaryTile label="Ready" value={readyCount} icon="stars" highlight={readyCount > 0} />
              <SummaryTile label="XP earned" value={earned} icon="bolt" />
            </XStack>
          </Reveal>

          <YStack gap={12}>
            <SectionHeader title="In progress" subtitle="Finish every step to unlock the reward" accent="primary" />
            {active.map((quest: Quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onClaim={handleClaim}
                claiming={claim.isPending && claim.variables === quest.id}
              />
            ))}
          </YStack>

          {locked.length > 0 ? (
            <YStack gap={12}>
              <SectionHeader title="Locked" subtitle="Unlock as your streak and level grow" accent="secondary" />
              {locked.map((quest: Quest) => (
                <QuestCard key={quest.id} quest={quest} onClaim={handleClaim} claiming={false} />
              ))}
            </YStack>
          ) : null}
        </ScrollView>
      )}
    </YStack>
  );
}

function SummaryTile({ label, value, icon, highlight }: { label: string; value: number; icon: 'flag' | 'stars' | 'bolt'; highlight?: boolean }) {
  return (
    <YStack
      flex={1}
      padding={12}
      borderRadius="card"
      backgroundColor={highlight ? 'primaryFixed' : 'surfaceContainerLowest'}
      borderWidth={1}
      borderColor={highlight ? 'primaryContainer' : 'outlineVariant'}
      gap={4}
    >
      <Icon name={icon} size={18} color={highlight ? 'primary' : 'secondary'} />
      <Text variant="titleMd" weight="bold" color={highlight ? 'primary' : 'onSurface'}>
        {value}
      </Text>
      <Text variant="bodyXs" muted>
        {label}
      </Text>
    </YStack>
  );
}