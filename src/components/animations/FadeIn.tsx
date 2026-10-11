import React, { memo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeOut, useReducedMotion } from 'react-native-reanimated';

import { enterFrom, motion, type EnterDirection } from './motion';

interface FadeInProps {
  children: React.ReactNode;
  direction?: EnterDirection;
  delay?: number;
  exit?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Configurable entrance (and optional exit) wrapper; static under reduced motion. */
export const FadeIn = memo(function FadeIn({
  children,
  direction = 'down',
  delay = 0,
  exit,
  style,
}: FadeInProps) {
  const reduceMotion = useReducedMotion();
  return (
    <Animated.View
      style={style}
      entering={reduceMotion ? undefined : enterFrom(direction, delay)}
      exiting={!reduceMotion && exit ? FadeOut.duration(motion.duration.base) : undefined}
    >
      {children}
    </Animated.View>
  );
});
