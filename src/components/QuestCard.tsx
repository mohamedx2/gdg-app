import React, { memo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { hexToRgba, Pill } from '@/components/ui/Chip';
import { Icon, iconName } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { TRACKS } from '@/constants/taxonomy';
import { useTheme } from '@/theme';
import type { Quest } from '@/types';

interface QuestCardProps {
  quest: Quest;
  onClaim: (id: string) => void;
  claiming?: boolean;
}

export const QuestCard = memo(function QuestCard({ quest, onClaim, claiming }: QuestCardProps) {
  const theme = useTheme();
  const track = quest.track ? TRACKS[quest.track] : undefined;
  const accent = track ? theme.colors[track.color] : theme.colors.primaryContainer;
  const accentToken = track?.color ?? 'primaryContainer';
  const locked = quest.status === 'locked';
  const doneCount = quest.steps.filter((step) => step.done).length;

  return (
    <View
      style={{
        padding: 14,
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: quest.status === 'claimable' ? theme.colors.primaryContainer : theme.colors.outlineVariant,
        gap: 12,
        opacity: locked ? 0.6 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: hexToRgba(accent, 0.14),
          }}
        >
          <Icon name={iconName(quest.icon)} size={22} color={accentToken} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text variant="titleSm" weight="bold" numberOfLines={1}>
            {quest.title}
          </Text>
          <Text variant="bodySm" muted numberOfLines={2}>
            {quest.description}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: hexToRgba(theme.colors.warning, 0.16),
          }}
        >
          <Icon name="stars" size={13} color="warning" />
          <Text variant="codeSm" weight="semibold" color="warning">
            {quest.reward}
          </Text>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        {quest.steps.map((step) => (
          <View key={step.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <Icon
              name={step.done ? 'checkCircle' : 'radioButtonUnchecked'}
              size={18}
              color={step.done ? accentToken : 'outline'}
            />
            <Text variant="bodyMd" color={step.done ? 'onSurface' : 'onSurfaceVariant'} style={{ flex: 1 }}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>

      <ProgressBar
        value={quest.progress}
        fill={accentToken}
        height={6}
        label="Progress"
        detail={`${doneCount} / ${quest.steps.length}`}
      />

      {quest.status === 'claimable' ? (
        <Button label={`Claim +${quest.reward} XP`} icon="stars" loading={claiming} onPress={() => onClaim(quest.id)} />
      ) : quest.status === 'claimed' ? (
        <Pill label="Reward claimed" color="tertiary" icon="checkCircle" />
      ) : quest.status === 'locked' ? (
        <Pill label="Locked" color="outline" icon="lock" />
      ) : (
        <Text variant="bodySm" muted>
          {quest.steps.length - doneCount} step{quest.steps.length - doneCount === 1 ? '' : 's'} to go
        </Text>
      )}
    </View>
  );
});
