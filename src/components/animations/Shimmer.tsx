import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const BAND = 120;

interface ShimmerProps {
  style?: StyleProp<ViewStyle>;
  duration?: number;
  color?: string;
}

/** Looping diagonal light sweep; renders nothing under reduced motion. */
export const Shimmer = memo(function Shimmer({
  style,
  duration = 1400,
  color = 'rgba(255,255,255,0.22)',
}: ShimmerProps) {
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || width === 0) return;
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [duration, progress, reduceMotion, width]);

  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateX: -BAND + progress.value * (width + BAND * 2) }, { rotate: '12deg' }],
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
          colors={['transparent', color, 'transparent']}
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
  band: { position: 'absolute', top: -80, bottom: -80, width: BAND },
});
