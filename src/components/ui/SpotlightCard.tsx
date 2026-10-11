import React, { memo, useEffect, useId } from 'react';
import { GestureResponderEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import { PressableScale } from './PressableScale';

interface SpotlightCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  /** Spotlight colour — a theme token or any hex/`rgba` string. */
  glowColor?: ColorToken | string;
  /** Glow radius in px (diameter is twice this). */
  radius?: number;
  /** Card surface colour; pass `transparent` to layer over an existing fill. */
  backgroundColor?: ColorToken | 'transparent';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Aceternity-style spotlight card built on Reanimated + react-native-svg.
 * A soft radial glow tracks the finger while the card is touched and drifts
 * gently when idle. Fully static under reduced-motion.
 */
export const SpotlightCard = memo(function SpotlightCard({
  children,
  onPress,
  glowColor = 'primary',
  radius = 150,
  backgroundColor = 'surfaceContainerLowest',
  style,
  accessibilityLabel,
}: SpotlightCardProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();

  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const active = useSharedValue(0);
  const idle = useSharedValue(0.25);
  const w = useSharedValue(0);
  const h = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    idle.value = withRepeat(withTiming(1, { duration: 11000, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(idle);
  }, [idle, reduceMotion]);

  const glowStyle = useAnimatedStyle(() => {
    const orbitX = w.value * (0.5 + 0.16 * Math.sin(idle.value * Math.PI * 2));
    const orbitY = h.value * (0.24 + 0.12 * Math.cos(idle.value * Math.PI * 2));
    const cx = active.value > 0 ? sx.value : orbitX;
    const cy = active.value > 0 ? sy.value : orbitY;
    return {
      opacity: reduceMotion ? 0.5 : interpolate(active.value, [0, 1], [0.42, 0.95]),
      transform: [{ translateX: cx - radius }, { translateY: cy - radius }],
    };
  });

  const resolvedGlow =
    glowColor && glowColor in theme.colors ? theme.colors[glowColor as ColorToken] : (glowColor as string);
  const resolvedBg = backgroundColor === 'transparent' ? 'transparent' : theme.colors[backgroundColor];

  const rawId = useId();
  const gradientId = `spot-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  const setPoint = (event: GestureResponderEvent) => {
    sx.value = event.nativeEvent.locationX;
    sy.value = event.nativeEvent.locationY;
  };

  return (
    <View
      onLayout={(event) => {
        w.value = event.nativeEvent.layout.width;
        h.value = event.nativeEvent.layout.height;
      }}
      onTouchStart={(event) => {
        setPoint(event);
        active.value = 1;
      }}
      onTouchMove={setPoint}
      onTouchEnd={() => {
        active.value = 0;
      }}
      onTouchCancel={() => {
        active.value = 0;
      }}
      style={[
        { borderRadius: theme.radius.card, overflow: 'hidden', backgroundColor: resolvedBg },
        style,
      ]}
    >
      {onPress ? (
        <PressableScale onPress={onPress} accessibilityLabel={accessibilityLabel}>
          {children}
        </PressableScale>
      ) : (
        children
      )}

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, glowStyle]}>
        <Svg width={radius * 2} height={radius * 2}>
          <Defs>
            <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={resolvedGlow} stopOpacity={0.55} />
              <Stop offset="0.55" stopColor={resolvedGlow} stopOpacity={0.18} />
              <Stop offset="1" stopColor={resolvedGlow} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={radius * 2} height={radius * 2} fill={`url(#${gradientId})`} />
        </Svg>
      </Animated.View>
    </View>
  );
});
