import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { SquadCard } from '@/components/SquadCard';
import { Button } from '@/components/ui/Button';
import { SolidPill } from '@/components/ui/Chip';
import { Gradient } from '@/components/ui/Gradient';
import { Icon, iconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Orbs } from '@/components/ui/Orbs';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Screen';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useJoinSquad, useLeaveSquad, useMySquad, useSquads } from '@/hooks/use-squads';
import { useUiStore } from '@/stores/ui.store';
import type { Squad } from '@/types';

export default function SquadsScreen() {
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);
  const { data: squads, isPending, isError, error, refetch } = useSquads();
  const { data: mySquad } = useMySquad();
  const join = useJoinSquad();
  const leave = useLeaveSquad();

  const maxXp = squads?.reduce((max, squad) => Math.max(max, squad.squadXp), 0) ?? 0;

  const handleJoin = (id: string) => {
    join.mutate(id, {
      onSuccess: (squad) => toast(`Joined ${squad.name}`, 'success'),
      onError: (err) => toast(err instanceof Error ? err.message : 'Could not join squad', 'error'),
    });
  };

  const handleLeave = () => {
    leave.mutate(undefined, {
      onSuccess: () => toast('You left your squad', 'info'),
      onError: () => toast('Could not leave squad', 'error'),
    });
  };

  return (
    <YStack flex={1} backgroundColor="background">
      <YStack paddingTop={insets.top + 8} paddingHorizontal={16}>
        <XStack alignItems="center" gap={4}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Squads
          </Text>
        </XStack>
      </YStack>

      {isError ? (
        <YStack padding={16}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </YStack>
      ) : isPending && !squads ? (
        <YStack padding={16} gap={12}>
          <Skeleton height={190} radius={14} />
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} height={110} radius={14} />
          ))}
        </YStack>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {mySquad ? (
            <MySquadHero squad={mySquad} ahead={squads?.find((s) => s.rank === mySquad.rank - 1)} onLeave={handleLeave} leaving={leave.isPending} />
          ) : (
            <Reveal>
              <YStack padding={16} borderRadius="card" backgroundColor="surfaceContainerLow" gap={8} borderWidth={1} borderColor="outlineVariant">
                <XStack alignItems="center" gap={8}>
                  <Icon name="groups" size={20} color="primary" />
                  <Text variant="titleSm" weight="bold">
                    Pick your squad
                  </Text>
                </XStack>
                <Text variant="bodySm" muted>
                  Join a track team below. Every event, codelab and quest you finish adds XP to the squad — the team
                  with the most XP leads the semester board.
                </Text>
              </YStack>
            </Reveal>
          )}

          <YStack gap={12}>
            <SectionHeader title="Semester leaderboard" subtitle="Resets each semester · live standings" accent="tertiary" />
            {mySquad ? <Text variant="bodySm" muted style={{ marginTop: -4 }}>Join another squad to switch teams.</Text> : null}
            {squads?.map((squad: Squad) => (
              <SquadCard
                key={squad.id}
                squad={squad}
                maxXp={maxXp}
                onJoin={handleJoin}
                joining={join.isPending && join.variables === squad.id}
              />
            ))}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  );
}

function MySquadHero({
  squad,
  ahead,
  onLeave,
  leaving,
}: {
  squad: Squad;
  ahead?: Squad;
  onLeave: () => void;
    leaving: boolean;
}) {
  const { tracks: TRACKS } = useTaxonomy();
  const track = TRACKS[squad.track];

  return (
    <Reveal>
      <YStack borderRadius="card" overflow="hidden">
        <Gradient token="aurora" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Orbs />
          <YStack padding={16} gap={14}>
            <XStack alignItems="center" gap={12}>
              <YStack
                width={52}
                height={52}
                borderRadius={16}
                alignItems="center"
                justifyContent="center"
                backgroundColor="rgba(255,255,255,0.18)"
              >
                <Icon name={iconName(squad.emblem)} size={26} color="#FFFFFF" />
              </YStack>
              <YStack flex={1} gap={4}>
                <Text variant="codeSm" weight="semibold" style={{ textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.85)' }}>
                  Your squad
                </Text>
                <Text variant="titleLg" weight="bold" style={{ color: '#FFFFFF' }} numberOfLines={1}>
                  {squad.name}
                </Text>
                <SolidPill label={track.label} color={track.color} onColor="onPrimary" />
              </YStack>
            </XStack>

            <XStack gap={8}>
              <HeroStat label="Rank" value={`#${squad.rank}`} />
              <HeroStat label="Members" value={squad.memberCount} />
              <HeroStat label="Squad XP" value={squad.squadXp.toLocaleString()} />
            </XStack>

            <YStack gap={6}>
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap={6}>
                  <Icon name="trendingUp" size={15} color="#FFFFFF" />
                  <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    +{squad.weekXp} XP this week
                  </Text>
                </XStack>
                <Text variant="codeSm" weight="semibold" style={{ color: '#FFFFFF' }}>
                  {ahead ? `${squad.gapToNext} XP to #${ahead.rank}` : 'Leading the board 🏆'}
                </Text>
              </XStack>
            </YStack>

            <Button label="Leave squad" icon="logout" variant="outline" compact fullWidth={false} loading={leaving} onPress={onLeave} />
          </YStack>
        </Gradient>
      </YStack>
    </Reveal>
  );
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <YStack flex={1} padding={10} borderRadius={10} backgroundColor="rgba(255,255,255,0.14)" gap={2}>
      <Text variant="labelLg" weight="bold" style={{ lineHeight: 18, color: '#FFFFFF' }}>
        {value}
      </Text>
      <Text variant="bodySm" style={{ lineHeight: 14, color: 'rgba(255,255,255,0.82)' }}>
        {label}
      </Text>
    </YStack>
  );
}
