import { router } from 'expo-router';
import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Stagger } from '@/components/animations';
import { Icon, iconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useJoinSquad, useLeaveSquad, useMySquad, useSquads } from '@/hooks/use-squads';
import { useUiStore } from '@/stores/ui.store';
import type { ColorToken } from '@/theme/colors';
import type { Squad } from '@/types';

/** Squads segment — your squad, the top-3 podium and the challenger division. */
export function ArenaSquads() {
  const toast = useUiStore((state) => state.toast);
  const { data: squads, isPending, isError, error, refetch } = useSquads();
  const { data: mySquad } = useMySquad();
  const join = useJoinSquad();
  const leave = useLeaveSquad();

  const ranked = [...(squads ?? [])].sort((a, b) => a.rank - b.rank);
  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);

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

  if (isError) return <ErrorState message={error?.message} onRetry={() => refetch()} />;

  if (isPending && !squads) {
    return (
      <YStack gap={12}>
        <Skeleton height={200} radius={22} />
        <Skeleton height={240} radius={22} />
        {[1, 2].map((key) => (
          <Skeleton key={key} height={68} radius={18} />
        ))}
      </YStack>
    );
  }

  return (
    <>
      <Reveal>
        {mySquad ? (
          <MySquadCard squad={mySquad} onLeave={handleLeave} leaving={leave.isPending} />
        ) : (
          <YStack padding={16} gap={8} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
            <XStack alignItems="center" gap={8}>
              <Icon name="groups" size={20} color="primary" />
              <Text variant="titleSm" weight="bold">
                Pick your squad
              </Text>
            </XStack>
            <Text variant="bodySm" muted>
              Join a track team below. Events, codelabs and quests you finish add XP to your squad — the top team leads the semester podium.
            </Text>
          </YStack>
        )}
      </Reveal>

      {podium.length ? (
        <YStack gap={14}>
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap={6}>
              <Text variant="titleMd" weight="bold">
                EPI Arena Podium
              </Text>
              <Icon name="trophy" size={18} color="gold" />
            </XStack>
            <Text variant="codeSm" muted>
              SEMESTER BOARD
            </Text>
          </XStack>
          <Podium squads={podium} />
        </YStack>
      ) : null}

      {rest.length ? (
        <YStack gap={10}>
          <XStack alignItems="center" justifyContent="space-between">
            <Text variant="codeSm" weight="bold" muted>
              CHALLENGER DIVISION (RANKS 4–{3 + rest.length})
            </Text>
            <XStack alignItems="center" gap={4}>
              <Text variant="codeSm" primary>
                Live
              </Text>
              <YStack width={6} height={6} borderRadius={3} backgroundColor="live" />
            </XStack>
          </XStack>
          {rest.map((squad, index) => (
            <Stagger key={squad.id} index={Math.min(index, 6)}>
              <ChallengerRow squad={squad} canJoin={!squad.isMine} joining={join.isPending && join.variables === squad.id} onJoin={handleJoin} />
            </Stagger>
          ))}
        </YStack>
      ) : null}

      {!mySquad && podium.length ? (
        <YStack gap={10}>
          <Text variant="codeSm" weight="bold" muted>
            JOIN A PODIUM SQUAD
          </Text>
          {podium.map((squad) => (
            <ChallengerRow key={squad.id} squad={squad} canJoin joining={join.isPending && join.variables === squad.id} onJoin={handleJoin} />
          ))}
        </YStack>
      ) : null}

      <PressableScale onPress={() => router.push('/(spaces)?space=arena&segment=quests' as never)} accessibilityLabel="Open squad quests">
        <XStack alignItems="center" gap={12} padding={16} borderRadius="card" backgroundColor="surfaceContainerLow">
          <YStack width={44} height={44} borderRadius={22} alignItems="center" justifyContent="center" backgroundColor="tertiaryFixed">
            <Icon name="rocketLaunch" size={20} color="onTertiaryFixedVariant" />
          </YStack>
          <YStack flex={1}>
            <Text variant="labelLg" weight="bold">
              Squad missions
            </Text>
            <Text variant="bodySm" muted numberOfLines={1}>
              Every quest you finish boosts your squad’s XP
            </Text>
          </YStack>
          <Icon name="chevronRight" size={20} color="onSurfaceVariant" />
        </XStack>
      </PressableScale>
    </>
  );
}

function MySquadCard({ squad, onLeave, leaving }: { squad: Squad; onLeave: () => void; leaving: boolean }) {
  const { tracks } = useTaxonomy();
  const track = tracks[squad.track];
  return (
    <YStack padding={16} gap={14} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
      <XStack alignItems="center" gap={12}>
        <YStack width={52} height={52} borderRadius={16} alignItems="center" justifyContent="center" backgroundColor="primaryFixed">
          <Icon name={iconName(squad.emblem)} size={26} color="primary" />
        </YStack>
        <YStack flex={1} gap={2}>
          <XStack alignItems="center" gap={8}>
            <Text variant="titleMd" weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
              {squad.name}
            </Text>
            <YStack paddingHorizontal={6} paddingVertical={1} borderRadius={6} backgroundColor="primaryFixed">
              <Text variant="codeSm" weight="bold" color="onPrimaryFixedVariant">
                YOU
              </Text>
            </YStack>
          </XStack>
          <Text variant="bodySm" muted numberOfLines={1}>
            {track?.label ?? squad.track} · {squad.tagline}
          </Text>
        </YStack>
        <YStack paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="surfaceContainerHigh">
          <Text variant="codeSm" weight="bold">
            RANK #{squad.rank}
          </Text>
        </YStack>
      </XStack>

      <XStack alignItems="center" justifyContent="space-between" padding={12} borderRadius={14} backgroundColor="surfaceContainerLow">
        <YStack>
          <Text variant="codeSm" muted>
            SQUAD TOTAL
          </Text>
          <Text variant="titleMd" weight="bold" style={{ fontFamily: 'JetBrainsMono_700Bold' }}>
            {squad.squadXp.toLocaleString('en-US')} XP
          </Text>
        </YStack>
        <XStack alignItems="center" gap={4} paddingHorizontal={10} paddingVertical={5} borderRadius="full" backgroundColor="tertiaryFixed">
          <Icon name="bolt" size={13} color="onTertiaryFixedVariant" />
          <Text variant="codeSm" weight="bold" color="onTertiaryFixedVariant">
            +{squad.weekXp} this week
          </Text>
        </XStack>
      </XStack>

      <XStack alignItems="center" justifyContent="space-between" gap={10}>
        <Text variant="bodySm" muted style={{ flexShrink: 1 }}>
          {squad.memberCount} members · {squad.gapToNext > 0 ? `${squad.gapToNext.toLocaleString('en-US')} XP to #${squad.rank - 1}` : 'leading the board'}
        </Text>
        <PressableScale onPress={onLeave} disabled={leaving} accessibilityLabel="Leave squad">
          <XStack alignItems="center" gap={6} height={44} paddingHorizontal={14} borderRadius={14} backgroundColor="surfaceContainerHigh" opacity={leaving ? 0.6 : 1}>
            <Icon name="logout" size={16} color="onSurface" />
            <Text variant="labelMd" weight="bold">
              Leave
            </Text>
          </XStack>
        </PressableScale>
      </XStack>
    </YStack>
  );
}

const PODIUM_STYLE: Record<number, { height: number; bg: ColorToken; medal: ColorToken }> = {
  1: { height: 150, bg: 'secondaryContainer', medal: 'gold' },
  2: { height: 118, bg: 'surfaceContainerHigh', medal: 'outline' },
  3: { height: 92, bg: 'surfaceContainerHigh', medal: 'warning' },
};

/** Classic 2 · 1 · 3 podium with emblem tiles above each step. */
function Podium({ squads }: { squads: Squad[] }) {
  const order = [squads[1], squads[0], squads[2]].filter(Boolean) as Squad[];
  return (
    <XStack alignItems="flex-end" gap={8}>
      {order.map((squad) => {
        const style = PODIUM_STYLE[squad.rank] ?? PODIUM_STYLE[3];
        const first = squad.rank === 1;
        return (
          <YStack key={squad.id} flex={1} alignItems="center" gap={6}>
            {first ? <Icon name="workspacePremium" size={22} color="gold" /> : null}
            <YStack width={first ? 60 : 50} height={first ? 60 : 50} borderRadius={16} alignItems="center" justifyContent="center" backgroundColor={first ? 'secondaryContainer' : 'surfaceContainerHigh'} borderWidth={squad.isMine ? 2 : 0} borderColor="primary">
              <Icon name={iconName(squad.emblem)} size={first ? 28 : 22} color={first ? 'onSecondaryContainer' : 'onSurfaceVariant'} />
            </YStack>
            <Text variant="labelLg" weight="bold" numberOfLines={1}>
              {squad.name}
            </Text>
            <Text variant="codeSm" primary>
              {squad.squadXp.toLocaleString('en-US')} XP
            </Text>
            <YStack alignSelf="stretch" height={style.height} borderTopLeftRadius={16} borderTopRightRadius={16} backgroundColor={style.bg} alignItems="center" justifyContent="space-between" paddingVertical={12}>
              <Text variant="titleMd" weight="bold" style={{ fontFamily: 'JetBrainsMono_700Bold' }}>
                #{squad.rank}
              </Text>
              {squad.isMine ? (
                <YStack paddingHorizontal={8} paddingVertical={2} borderRadius="full" backgroundColor="primaryFixed">
                  <Text variant="codeSm" weight="bold" color="onPrimaryFixedVariant">
                    YOU
                  </Text>
                </YStack>
              ) : (
                <Text variant="codeSm" muted>
                  {squad.memberCount} mbrs
                </Text>
              )}
            </YStack>
          </YStack>
        );
      })}
    </XStack>
  );
}

function ChallengerRow({ squad, canJoin, joining, onJoin }: { squad: Squad; canJoin: boolean; joining: boolean; onJoin: (id: string) => void }) {
  const { tracks } = useTaxonomy();
  return (
    <XStack alignItems="center" gap={12} padding={12} borderRadius={18} backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor={squad.isMine ? 'primary' : 'outlineVariant'}>
      <Text variant="titleSm" weight="bold" muted style={{ width: 30, fontFamily: 'JetBrainsMono_700Bold' }}>
        #{squad.rank}
      </Text>
      <YStack width={40} height={40} borderRadius={12} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
        <Icon name={iconName(squad.emblem)} size={20} color="onSurfaceVariant" />
      </YStack>
      <YStack flex={1}>
        <XStack alignItems="center" gap={6}>
          <Text variant="labelLg" weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
            {squad.name}
          </Text>
          <YStack paddingHorizontal={6} paddingVertical={1} borderRadius={6} backgroundColor="surfaceContainerHigh">
            <Text variant="codeSm" muted>
              {(tracks[squad.track]?.label ?? squad.track).toUpperCase()}
            </Text>
          </YStack>
        </XStack>
        <Text variant="bodySm" muted>
          {squad.memberCount} members
        </Text>
      </YStack>
      {canJoin && !squad.isMine ? (
        <PressableScale onPress={() => onJoin(squad.id)} disabled={joining} accessibilityLabel={`Join ${squad.name}`}>
          <YStack height={36} paddingHorizontal={12} borderRadius={12} alignItems="center" justifyContent="center" backgroundColor="primaryFixed" opacity={joining ? 0.6 : 1}>
            <Text variant="labelMd" weight="bold" color="onPrimaryFixedVariant">
              Join
            </Text>
          </YStack>
        </PressableScale>
      ) : (
        <Text variant="codeSm" weight="bold">
          {squad.squadXp.toLocaleString('en-US')} XP
        </Text>
      )}
    </XStack>
  );
}

export default ArenaSquads;
