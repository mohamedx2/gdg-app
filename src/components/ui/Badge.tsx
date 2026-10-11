import React, { memo } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import { initials } from '@/utils/format';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'platinum';

interface AchievementBadgeProps {
  name: string;
  icon?: IconName;
  rarity: BadgeRarity;
  earned?: boolean;
  description?: string;
  size?: number;
}

const rarityColors: Record<BadgeRarity, { bg: ColorToken; ring: ColorToken; fg: ColorToken }> = {
  bronze: { bg: 'tertiaryFixed', ring: 'tertiary', fg: 'onTertiaryFixed' },
  silver: { bg: 'surfaceContainerHigh', ring: 'outlineVariant', fg: 'onSurfaceVariant' },
  gold: { bg: 'secondaryFixed', ring: 'secondary', fg: 'onSecondaryFixed' },
  platinum: { bg: 'primaryFixed', ring: 'primary', fg: 'onPrimaryFixed' },
};

/** Achievement medallion — earned shows full colour, missing one greys to a lock. */
export const AchievementBadge = memo(function AchievementBadge({
  name,
  icon,
  rarity = 'silver',
  earned = true,
  description,
  size = 72,
}: AchievementBadgeProps) {
  const theme = useTheme();
  const tokens = rarityColors[rarity];

  return (
    <View style={{ alignItems: 'center', width: size + 24, gap: 6 }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tokens.bg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: earned ? theme.colors[tokens.ring] : theme.colors.outlineVariant,
          opacity: earned ? 1 : 0.55,
        }}
      >
        {icon ? (
          <Icon name={icon} size={size * 0.5} color={earned ? tokens.fg : 'outline'} />
        ) : (
          <Text weight="bold" size={size * 0.4} style={{ color: earned ? theme.colors[tokens.fg] : theme.colors.outline }}>
            {initials(name)}
          </Text>
        )}
      </View>
      <Text variant="labelSm" weight="semibold" style={{ textAlign: 'center' }} numberOfLines={2}>
        {name}
        {!earned ? ' · locked' : ''}
      </Text>
      {description ? (
        <Text variant="bodyXs" muted style={{ textAlign: 'center' }} numberOfLines={2}>
          {description}
        </Text>
      ) : null}
    </View>
  );
});