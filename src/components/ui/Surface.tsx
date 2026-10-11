import React, { memo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { YStack } from 'tamagui';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import type { ShadowLevel } from '@/theme/shadows';
import { PressableScale } from './PressableScale';

type StackStyle = React.ComponentProps<typeof YStack>['style'];

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
    <YStack
      backgroundColor={surface}
      borderRadius={resolvedRadius}
      borderWidth={border ? 1 : 0}
      borderColor="outlineVariant"
      style={[shadow === 0 ? {} : theme.shadow(shadow === 'card' ? 1 : shadow), style] as StackStyle}
    >
      {children}
    </YStack>
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
