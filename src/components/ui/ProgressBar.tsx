import React, { memo } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import type { GradientToken } from '@/theme/gradients';
import { Gradient } from './Gradient';
import { Text } from './Text';

interface ProgressBarProps {
  value: number;
  label?: string;
  detail?: string;
  height?: number;
  track?: ColorToken;
  fill?: ColorToken;
  /** When set, overrides `fill` with a brand gradient ramp. */
  gradient?: GradientToken;
}

export const ProgressBar = memo(function ProgressBar({
  value,
  label,
  detail,
  height = 6,
  track = 'surfaceContainerHigh',
  fill = 'primaryContainer',
  gradient,
}: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="labelMd" weight="semibold">
            {label}
          </Text>
          <Text variant="codeSm" muted>
            {detail ?? `${Math.round(clamped * 100)}%`}
          </Text>
        </View>
      ) : null}
      <View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: theme.colors[track],
          overflow: 'hidden',
        }}
      >
        {gradient ? (
          <Gradient
            token={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${clamped * 100}%`, height: '100%' }}
          />
        ) : (
          <View
            style={{
              width: `${clamped * 100}%`,
              height: '100%',
              borderRadius: height / 2,
              backgroundColor: theme.colors[fill],
            }}
          />
        )}
      </View>
    </View>
  );
});

/** Thin 2px divider line. */
export const Divider = memo(function Divider({ color = 'outlineVariant', spacing = 12 }: { color?: ColorToken; spacing?: number }) {
  const theme = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.colors[color], marginVertical: spacing }} />;
});