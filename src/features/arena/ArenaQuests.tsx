import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { XStack, YStack } from 'tamagui';

import { Stagger } from '@/components/animations';
import { Icon, iconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useAchievementSummary } from '@/hooks/use-community';
import { useClaimQuest, useQuests } from '@/hooks/use-quests';
import { useUiStore } from '@/stores/ui.store';
import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import type { Quest } from '@/types';

/** Quests segment — personal XP breakdown, then active and locked missions. */
export function ArenaQuests() {
  const toast = useUiStore((state) => state.toast);
  const { data: quests, isPending, isError, error, refetch } = useQuests();
  const claim = useClaimQuest();

  const active = quests?.filter((q) => q.status === 'active' || q.status === 'claimable') ?? [];
  const locked = quests?.filter((q) => q.status === 'locked') ?? [];
  const done = quests?.filter((q) => q.status === 'claimed') ?? [];

  const handleClaim = (id: string) => {
    claim.mutate(id, {
      onSuccess: (quest) => toast(`+${quest.reward} XP · ${quest.title}`, 'success'),
      onError: (err) => toast(err instanceof Error ? err.message : 'Could not claim quest', 'error'),
    });
  };

  return (
    <>
      <Reveal>
        <XpBreakdown />
      </Reveal>

      <YStack gap={12}>
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap={8}>
            <Text variant="titleMd" weight="bold">
              Active Missions
            </Text>
            {quests ? (
              <YStack minWidth={22} height={22} paddingHorizontal={6} borderRadius={11} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
                <Text variant="codeSm" weight="bold">
                  {active.length}
                </Text>
              </YStack>
            ) : null}
          </XStack>
          <Text variant="codeSm" muted>
            RESETS DAILY 00:00
          </Text>
        </XStack>

        {isError ? <ErrorState message={error?.message} onRetry={() => refetch()} /> : null}
        {isPending && !quests ? [1, 2, 3].map((key) => <Skeleton key={key} height={130} radius={22} />) : null}
        {quests && !active.length && !locked.length ? (
          <EmptyState icon="flag" title="No missions right now" message="New quests drop with every event and season." actionLabel="Refresh" onAction={() => refetch()} />
        ) : null}

        {[...active, ...locked, ...done].map((quest: Quest, index) => (
          <Stagger key={quest.id} index={Math.min(index, 6)}>
            <MissionCard quest={quest} onClaim={handleClaim} claiming={claim.isPending && claim.variables === quest.id} />
          </Stagger>
        ))}
      </YStack>
    </>
  );
}

const STATUS: Record<Quest['status'], { label: string; bg: ColorToken; fg: ColorToken; bar: ColorToken }> = {
  claimable: { label: 'COMPLETED', bg: 'tertiaryFixed', fg: 'onTertiaryFixedVariant', bar: 'tertiary' },
  active: { label: 'IN PROGRESS', bg: 'surfaceContainerHigh', fg: 'onSurfaceVariant', bar: 'primary' },
  claimed: { label: 'CLAIMED', bg: 'surfaceContainerHigh', fg: 'onSurfaceVariant', bar: 'outline' },
  locked: { label: 'LOCKED', bg: 'surfaceContainerHigh', fg: 'outline', bar: 'outlineVariant' },
};

function MissionCard({ quest, onClaim, claiming }: { quest: Quest; onClaim: (id: string) => void; claiming: boolean }) {
  const status = STATUS[quest.status];
  const doneSteps = quest.steps.filter((step) => step.done).length;
  const next = quest.steps.find((step) => !step.done) ?? quest.steps[quest.steps.length - 1];
  const muted = quest.status === 'locked' || quest.status === 'claimed';

  return (
    <YStack padding={16} gap={12} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor={quest.status === 'claimable' ? 'tertiary' : 'outlineVariant'} opacity={muted ? 0.7 : 1}>
      <XStack gap={12}>
        <YStack width={48} height={48} borderRadius={14} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
          <Icon name={quest.status === 'locked' ? 'lock' : iconName(quest.icon)} size={22} color={status.bar} />
        </YStack>
        <YStack flex={1} gap={6}>
          <XStack gap={6} flexWrap="wrap">
            <Badge label={status.label} bg={status.bg} fg={status.fg} />
            <Badge label={`+${quest.reward} XP`} bg="tertiaryFixed" fg="onTertiaryFixedVariant" />
          </XStack>
          <Text variant="titleSm" weight="bold" numberOfLines={1}>
            {quest.title}
          </Text>
        </YStack>
      </XStack>

      <YStack gap={6}>
        <XStack justifyContent="space-between" gap={8}>
          <Text variant="codeSm" muted numberOfLines={1} style={{ flexShrink: 1 }}>
            {next?.label ?? quest.description}
          </Text>
          <Text variant="codeSm" weight="bold" color={status.bar}>
            {doneSteps}/{quest.steps.length}
          </Text>
        </XStack>
        <YStack height={6} borderRadius={3} backgroundColor="surfaceContainerHigh" overflow="hidden">
          <YStack width={`${Math.min(1, Math.max(0, quest.progress)) * 100}%`} height="100%" backgroundColor={status.bar} />
        </YStack>
      </YStack>

      {quest.status === 'claimable' ? (
        <PressableScale onPress={() => onClaim(quest.id)} disabled={claiming} accessibilityLabel={`Claim ${quest.reward} XP`}>
          <XStack height={48} alignItems="center" justifyContent="center" gap={8} borderRadius={14} backgroundColor="primary" opacity={claiming ? 0.6 : 1}>
            <Icon name="celebration" size={18} color="onPrimary" />
            <Text variant="labelLg" weight="bold" color="onPrimary">
              {claiming ? 'Claiming…' : `Claim +${quest.reward} XP`}
            </Text>
          </XStack>
        </PressableScale>
      ) : null}
    </YStack>
  );
}

function Badge({ label, bg, fg }: { label: string; bg: ColorToken; fg: ColorToken }) {
  return (
    <YStack paddingHorizontal={8} paddingVertical={2} borderRadius={6} backgroundColor={bg}>
      <Text variant="codeSm" weight="bold" color={fg}>
        {label}
      </Text>
    </YStack>
  );
}

/** "Arena Stats": donut of where your XP came from (events · labs · badges). */
function XpBreakdown() {
  const theme = useTheme();
  const { data: summary } = useAchievementSummary();
  if (!summary) return <Skeleton height={190} radius={22} />;

  const parts: { label: string; value: number; color: ColorToken }[] = [
    { label: 'Events', value: summary.eventsAttended, color: 'info' },
    { label: 'Labs', value: summary.labsCompleted, color: 'warning' },
    { label: 'Badges', value: summary.badgesUnlocked, color: 'success' },
  ];
  const total = parts.reduce((sum, part) => sum + part.value, 0) || 1;
  const xp = summary.xp ?? summary.points;
  const size = 112;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <YStack padding={16} gap={14} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
      <XStack alignItems="center" gap={10}>
        <YStack width={36} height={36} borderRadius={12} alignItems="center" justifyContent="center" backgroundColor="primaryFixed">
          <Icon name="insights" size={18} color="primary" />
        </YStack>
        <YStack flex={1}>
          <Text variant="titleSm" weight="bold">
            Arena Stats
          </Text>
          <Text variant="codeSm" muted>
            EPI ENGINEERING CAMPUS
          </Text>
        </YStack>
      </XStack>

      <XStack alignItems="center" gap={18} padding={14} borderRadius={18} backgroundColor="surfaceContainerLow">
        <YStack width={size} height={size} alignItems="center" justifyContent="center">
          <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.colors.surfaceContainerHigh} strokeWidth={stroke} fill="none" />
            {parts.map((part) => {
              const length = (part.value / total) * circumference;
              const dash = (
                <Circle
                  key={part.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke={theme.colors[part.color]}
                  strokeWidth={stroke}
                  fill="none"
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return dash;
            })}
          </Svg>
          <Text variant="titleMd" weight="bold" style={{ fontFamily: theme.typography.codeMd.fontFamily }}>
            {xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp}
          </Text>
          <Text variant="codeSm" muted>
            XP
          </Text>
        </YStack>
        <YStack flex={1} gap={10}>
          {parts.map((part) => (
            <XStack key={part.label} alignItems="center" gap={8}>
              <YStack width={10} height={10} borderRadius={5} backgroundColor={part.color} />
              <Text variant="bodySm" style={{ flex: 1 }}>
                {part.label}
              </Text>
              <Text variant="codeSm" muted>
                {Math.round((part.value / total) * 100)}%
              </Text>
            </XStack>
          ))}
        </YStack>
      </XStack>
    </YStack>
  );
}

export default ArenaQuests;
