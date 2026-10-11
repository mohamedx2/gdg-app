import React, { memo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Shimmer } from './Shimmer';

interface AnimatedSkeletonProps {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  duration?: number;
}

/** Shimmer placeholder that replaces the plain opacity-pulse {@link Skeleton}. */
export const AnimatedSkeleton = memo(function AnimatedSkeleton({
  width = '100%',
  height,
  radius = 8,
  style,
  duration,
}: AnimatedSkeletonProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: theme.colors.surfaceContainerHigh,
        },
        style,
      ]}
    >
      <Shimmer duration={duration} />
    </View>
  );
});
