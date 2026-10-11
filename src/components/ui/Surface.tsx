import React, { memo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import type { ShadowLevel } from '@/theme/shadows';
import { PressableScale } from './PressableScale';

interface SurfaceProps {
  children?: React.ReactNode;
  surface?: ColorToken;
  radius?: number | 'card';
  shadow?: ShadowLevel | 'card';
  border?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Surface = memo(function Surface({
  children,
  surface = 'surfaceContainerLowest',
  radius = 'card',
  shadow = 1,
  border = false,
  style,
}: SurfaceProps) {
  const theme = useTheme();
  const resolvedRadius = radius === 'card' ? theme.radius.card : radius;
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors[surface],
          borderRadius: resolvedRadius,
          borderWidth: border ? 1 : 0,
          borderColor: theme.colors.outlineVariant,
        },
        shadow === 0 ? {} : theme.shadow(shadow === 'card' ? 1 : shadow),
        style,
      ]}
    >
      {children}
    </View>
  );
});

interface CardProps extends SurfaceProps {
  onPress?: () => void;
  pressedScale?: number;
}

export const Card = memo(function Card({ onPress, pressedScale, ...rest }: CardProps) {
  if (!onPress) return <Surface {...rest} />;
  return (
    <PressableScale onPress={onPress} pressedScale={pressedScale}>
      <Surface {...rest} />
    </PressableScale>
  );
});