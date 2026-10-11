import React, { memo, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import type { SpaceDef, SpaceKey } from '@/features/spaces/space-config';
import { useTheme } from '@/theme';

interface SpaceSwitcherProps {
  spaces: readonly SpaceDef[];
  value: SpaceKey;
  onChange: (key: SpaceKey) => void;
}

const PAD = 6;
const HEIGHT = 56;

/**
 * Floating dock that drives the space pager: four monospaced labels with an
 * animated internal pill indicator. Tap-only (swipe is owned by the pager).
 */
export const SpaceSwitcher = memo(function SpaceSwitcher({
  spaces,
  value,
  onChange,
}: SpaceSwitcherProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const index = Math.max(
    0,
    spaces.findIndex((space) => space.key === value),
  );
  const trackWidth = Math.max(0, width - PAD * 2);
  const segmentWidth = spaces.length > 0 ? trackWidth / spaces.length : 0;

  const translateX = useSharedValue(0);
  const measured = useRef(false);
  useEffect(() => {
    if (segmentWidth <= 0) return;
    const target = index * segmentWidth;
    // Snap on first measurement (e.g. opened via ?space=arena); spring afterwards.
    translateX.value = measured.current ? withSpring(target, { damping: 22, stiffness: 240 }) : target;
    measured.current = true;
  }, [index, segmentWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: translateX.value }],
  }));

  const containerBg = theme.isDark
    ? theme.colors.surfaceContainerHigh
    : theme.colors.inverseSurface;
  const indicatorBg = theme.isDark ? theme.colors.primaryContainer : theme.colors.inverseOnSurface;
  const activeText = theme.isDark ? theme.colors.onPrimaryContainer : theme.colors.inverseSurface;
  const inactiveText = theme.isDark ? theme.colors.onSurfaceVariant : theme.colors.inverseOnSurface;

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessibilityRole="tablist"
      accessibilityLabel="Spaces"
      style={[
        {
          height: HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: PAD,
          borderRadius: 999,
          backgroundColor: containerBg,
        },
        theme.shadow(3),
      ]}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: PAD,
              top: PAD,
              height: HEIGHT - PAD * 2,
              borderRadius: 999,
              backgroundColor: indicatorBg,
            },
            indicatorStyle,
          ]}
        />
      ) : null}
      {spaces.map((space) => {
        const active = space.key === value;
        return (
          <PressableScale
            key={space.key}
            onPress={() => onChange(space.key)}
            accessibilityRole="tab"
            accessibilityLabel={space.title}
            selected={active}
            style={{
              flex: 1,
              height: HEIGHT - PAD * 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              variant="codeSm"
              weight="semibold"
              style={{
                color: active ? activeText : inactiveText,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                opacity: active ? 1 : 0.7,
              }}
            >
              {space.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
});
