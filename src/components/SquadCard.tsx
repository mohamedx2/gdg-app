import React, { memo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { hexToRgba } from '@/components/ui/Chip';
import { Icon, iconName } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useTheme } from '@/theme';
import type { Squad } from '@/types';

interface SquadCardProps {
  squad: Squad;
  /** Highest squad XP on the board — scales the momentum bar. */
  maxXp: number;
  /** When provided, a join/switch action is rendered for non-current squads. */
  onJoin?: (id: string) => void;
  joining?: boolean;
}

export const SquadCard = memo(function SquadCard({ squad, maxXp, onJoin, joining }: SquadCardProps) {
  const theme = useTheme();
  const taxonomy = useTaxonomy();
  const track = taxonomy.tracks[squad.track];
  const accent = theme.colors[track.color];
  const showAction = Boolean(onJoin) && !squad.isMine;

  return (
    <View
      style={{
        padding: 12,
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderWidth: squad.isMine ? 1.5 : 1,
        borderColor: squad.isMine ? theme.colors.primaryContainer : theme.colors.outlineVariant,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: squad.rank === 1 ? hexToRgba(theme.colors.warning, 0.18) : theme.colors.surfaceContainerHigh,
          }}
        >
          <Text variant="codeSm" weight="bold" color={squad.rank === 1 ? 'warning' : 'onSurfaceVariant'}>
            {squad.rank}
          </Text>
        </View>

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
          <Icon name={iconName(squad.emblem)} size={22} color={track.color} />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="labelLg" weight="bold" numberOfLines={1}>
              {squad.name}
            </Text>
            {squad.isMine ? (
              <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, backgroundColor: theme.colors.primaryFixed }}>
                <Text variant="codeSm" weight="semibold" color="primary">
                  You
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="bodySm" muted numberOfLines={1}>
            {squad.memberCount} members · +{squad.weekXp} XP this week
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="labelMd" weight="bold" color={track.color}>
            {squad.squadXp.toLocaleString()}
          </Text>
          <Text variant="bodyXs" muted>
            squad XP
          </Text>
        </View>
      </View>

      <ProgressBar value={maxXp > 0 ? squad.squadXp / maxXp : 0} fill={track.color} height={6} />

      {showAction ? (
        <Button
          label={onJoin ? 'Join squad' : 'Switch'}
          variant="container"
          compact
          icon="groupAdd"
          loading={joining}
          onPress={() => onJoin?.(squad.id)}
        />
      ) : null}
    </View>
  );
});
