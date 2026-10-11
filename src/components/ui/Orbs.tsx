import React, { memo, useEffect } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface OrbsProps {
  style?: StyleProp<ViewStyle>;
}

/** Decorative drifting light-orbs for gradient surfaces; static under reduced motion. */
export const Orbs = memo(function Orbs({ style }: OrbsProps) {
  const reduceMotion = useReducedMotion();
  const drift = useSharedValue(0.5);

  useEffect(() => {
    if (reduceMotion) return;
    drift.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(drift);
  }, [drift, reduceMotion]);

  const orbA = useAnimatedStyle(() => ({
    transform: [{ translateX: (drift.value - 0.5) * 20 }, { translateY: (drift.value - 0.5) * 16 }],
  }));
  const orbB = useAnimatedStyle(() => ({
    transform: [{ translateX: (0.5 - drift.value) * 26 }, { translateY: (0.5 - drift.value) * 12 }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Animated.View style={[styles.orb, styles.orbA, orbA]} />
      <Animated.View style={[styles.orb, styles.orbB, orbB]} />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  orb: { position: 'absolute', borderRadius: 999 },
  orbA: { top: -40, right: -24, width: 140, height: 140, backgroundColor: 'rgba(255,255,255,0.12)' },
  orbB: { bottom: -48, left: -20, width: 112, height: 112, backgroundColor: 'rgba(255,255,255,0.08)' },
});
