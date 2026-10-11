import React, { memo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

interface RevealProps {
  children: React.ReactNode;
  /** Stagger offset in milliseconds. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** Entrance animation for screen sections; disabled when reduced motion is on. */
export const Reveal = memo(function Reveal({ children, delay = 0, style }: RevealProps) {
  const reduceMotion = useReducedMotion();
  return (
    <Animated.View
      style={style}
      entering={reduceMotion ? undefined : FadeInDown.delay(delay).springify().damping(18).stiffness(180)}
    >
      {children}
    </Animated.View>
  );
});
