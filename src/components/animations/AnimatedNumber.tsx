import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text, type TextProps } from '@/components/ui/Text';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  /** Custom formatter; receives the animated value. Overrides prefix/decimals. */
  format?: (value: number) => string;
  variant?: TextProps['variant'];
  color?: TextProps['color'];
  weight?: TextProps['weight'];
  style?: StyleProp<TextStyle>;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/** Counts up/down to `value` on the UI thread; jumps instantly under reduced motion. */
export const AnimatedNumber = memo(function AnimatedNumber({
  value,
  duration = 700,
  format,
  variant = 'headlineSm',
  color,
  weight = 'bold',
  style,
  prefix = '',
  suffix = '',
  decimals = 0,
}: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? value : 0);
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  const formatRef = useRef(format);
  formatRef.current = format;

  useEffect(() => {
    if (reduceMotion) {
      progress.value = value;
      setDisplay(value);
      return;
    }
    progress.value = 0;
    progress.value = withTiming(value, { duration });
  }, [duration, progress, reduceMotion, value]);

  useAnimatedReaction(
    () => progress.value,
    (current, previous) => {
      if (current === value) {
        runOnJS(setDisplay)(value);
        return;
      }
      if (previous === null || Math.round(current) !== Math.round(previous)) {
        runOnJS(setDisplay)(current);
      }
    },
  );

  const formatted =
    formatRef.current?.(display) ??
    `${prefix}${display.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;

  return (
    <Text variant={variant} color={color} weight={weight} style={style}>
      {formatted}
    </Text>
  );
});
