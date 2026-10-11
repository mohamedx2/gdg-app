import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const BAND = 90;

interface SheenProps {
  /** Delay before the one-shot sweep, in ms. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** One-shot diagonal light sweep for hero imagery; disabled under reduced motion. */
export const Sheen = memo(function Sheen({ delay = 600, style }: SheenProps) {
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || width === 0) return;
    progress.value = 0;
    const timer = setTimeout(() => {
      progress.value = withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) });
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimation(progress);
    };
  }, [delay, progress, reduceMotion, width]);

  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateX: -BAND + progress.value * (width + BAND * 2) }, { rotate: '18deg' }],
  }));

  if (reduceMotion) return null;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.clip, style]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.band, sweep]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.28)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  band: { position: 'absolute', top: -60, bottom: -60, width: BAND },
});
