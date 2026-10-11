import React, { memo, useEffect, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface MarqueeProps {
  children: React.ReactNode;
  /** Scroll speed in px/second. */
  speed?: number;
  /** Gap between the repeated content copies, in px. */
  gap?: number;
  paused?: boolean;
  reverse?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Infinite horizontal marquee; static (no copy) under reduced motion. */
export const Marquee = memo(function Marquee({
  children,
  speed = 40,
  gap = 40,
  paused,
  reverse,
  style,
}: MarqueeProps) {
  const reduceMotion = useReducedMotion();
  const [contentWidth, setContentWidth] = useState(0);
  const offset = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || paused || contentWidth === 0) {
      cancelAnimation(offset);
      return;
    }
    const distance = contentWidth + gap;
    const duration = (distance / speed) * 1000;
    offset.value = reverse ? -distance : 0;
    offset.value = withRepeat(
      withTiming(reverse ? 0 : -distance, { duration, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(offset);
  }, [contentWidth, gap, offset, paused, reduceMotion, reverse, speed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  if (reduceMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <Animated.View style={[{ flexDirection: 'row' }, animatedStyle]}>
        <View
          style={{ flexDirection: 'row', gap }}
          onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
        >
          {children}
        </View>
        <View style={{ flexDirection: 'row', gap, marginLeft: gap }}>{children}</View>
      </Animated.View>
    </View>
  );
});
