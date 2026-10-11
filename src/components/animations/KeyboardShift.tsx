import React, { memo, useEffect } from 'react';
import { Keyboard, Platform, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface KeyboardShiftProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Extra padding added on top of the keyboard height. */
  offset?: number;
  enabled?: boolean;
}

/**
 * Animates bottom padding to the on-screen keyboard height.
 *
 * Reanimated 4 deprecated `useAnimatedKeyboard` (and it has no web support), so
 * this drives a shared value from React Native's {@link Keyboard} events. Only
 * active on iOS where the OS does not resize the window; Android handles it via
 * `adjustResize` and web via the browser.
 */
export const KeyboardShift = memo(function KeyboardShift({
  children,
  style,
  offset = 0,
  enabled = true,
}: KeyboardShiftProps) {
  const height = useSharedValue(0);

  useEffect(() => {
    if (!enabled || Platform.OS !== 'ios') return;

    const onChange = Keyboard.addListener('keyboardWillChangeFrame', (event) => {
      const kbHeight = event.endCoordinates.height;
      const next = kbHeight > 0 ? kbHeight + offset : 0;
      height.value = withTiming(next, {
        duration: event.duration ?? 250,
        easing: Easing.bezier(0.2, 0, 0, 1),
      });
    });
    const onHide = Keyboard.addListener('keyboardWillHide', (event) => {
      height.value = withTiming(0, { duration: event.duration ?? 250 });
    });

    return () => {
      onChange.remove();
      onHide.remove();
    };
  }, [enabled, height, offset]);

  const animatedStyle = useAnimatedStyle(() => ({ paddingBottom: height.value }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
});
