import React, { useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  StyleProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Indeterminate shimmer placeholder — respects reduced-motion-friendly duration. */
export const Skeleton = function Skeleton({ width = '100%', height, radius = 8, style }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.surfaceContainerHigh,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Compact loading card matching event/resource row proportions. */
export const SkeletonCard = function SkeletonCard({
  lines = 3,
  showAvatar = true,
  style,
}: SkeletonCardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: 12,
          padding: 14,
          borderRadius: theme.radius.card,
          backgroundColor: theme.colors.surfaceContainerLowest,
        },
        style,
      ]}
    >
      {showAvatar ? (
        <Skeleton width={showAvatar ? 52 : undefined} height={52} radius={26} />
      ) : null}
      <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
        <Skeleton width="45%" height={12} />
        <Skeleton height={14} />
        <Skeleton width="70%" height={12} />
        {lines > 3 ? <Skeleton height={12} /> : null}
      </View>
    </View>
  );
};

export type { StyleProps };