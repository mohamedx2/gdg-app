import React, { memo, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface Segment<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string = string> {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  /** `md` = 40px track, `sm` = 32px track. */
  size?: 'md' | 'sm';
  accessibilityLabel?: string;
}

const TRACK_PADDING = 4;

/**
 * Equal-width segmented control with an animated pill indicator.
 * Active segment inverts to `onSurface` for high-contrast scanning.
 */
function SegmentedControlBase<T extends string>({
  segments,
  value,
  onChange,
  size = 'md',
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const count = segments.length;
  const index = Math.max(
    0,
    segments.findIndex((segment) => segment.value === value),
  );
  const trackWidth = Math.max(0, width - TRACK_PADDING * 2);
  const segmentWidth = count > 0 ? trackWidth / count : 0;
  const height = size === 'sm' ? 32 : 40;
  const inner = height - TRACK_PADDING * 2;

  const translateX = useSharedValue(0);

  const measured = useRef(false);
  useEffect(() => {
    if (segmentWidth <= 0) return;
    const target = index * segmentWidth;
    // Snap on first measurement (segment opened from a link); animate afterwards.
    translateX.value = measured.current ? withTiming(target, { duration: 220 }) : target;
    measured.current = true;
  }, [index, segmentWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{
        height,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: TRACK_PADDING,
        borderRadius: 999,
        backgroundColor: theme.colors.surfaceContainerLow,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
      }}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: TRACK_PADDING,
              top: TRACK_PADDING,
              height: inner,
              borderRadius: 999,
              backgroundColor: theme.colors.onSurface,
            },
            indicatorStyle,
          ]}
        />
      ) : null}
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <PressableScale
            key={segment.value}
            onPress={() => onChange(segment.value)}
            accessibilityRole="tab"
            accessibilityLabel={segment.label}
            selected={active}
            style={{ flex: 1, height: inner, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text
              variant="labelMd"
              weight="semibold"
              numberOfLines={1}
              style={{ color: active ? theme.colors.background : theme.colors.onSurfaceVariant }}
            >
              {segment.label}
              {segment.count !== undefined ? ` (${segment.count})` : ''}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

/** Memoised while preserving the generic signature for callers. */
export const SegmentedControl = memo(SegmentedControlBase) as typeof SegmentedControlBase;
