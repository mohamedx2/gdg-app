import React, { memo } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import { Icon, IconName } from './Icon';

interface IconButtonProps {
  name: IconName;
  onPress?: () => void;
  color?: ColorToken;
  size?: number;
  backgroundColor?: ColorToken;
  badge?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  radius?: number;
}

/** Always respects the 44×44 minimum touch target. */
export const IconButton = memo(function IconButton({
  name,
  onPress,
  color = 'onSurfaceVariant',
  size = 24,
  backgroundColor,
  badge,
  disabled,
  accessibilityLabel,
  radius = 999,
}: IconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={6}
      style={[
        {
          width: 44,
          height: 44,
          borderRadius: radius,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          backgroundColor: backgroundColor ? theme.colors[backgroundColor] : 'transparent',
        },
      ]}
    >
      {badge ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 7,
            right: 7,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.primaryContainer,
          }}
        />
      ) : null}
      <Icon name={name} size={size} color={color} />
    </Pressable>
  );
});