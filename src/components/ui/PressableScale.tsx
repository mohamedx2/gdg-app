import React, { memo, useEffect } from 'react';
import { AccessibilityRole, Insets, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface PressableScaleProps {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  pressedScale?: number;
  testID?: string;
  /** Expands the tap area of visually small controls toward the 44pt minimum. */
  hitSlop?: number | Insets;
  /** Exposed to screen readers, e.g. for radio-style options. */
  selected?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Shared press-feedback primitive: 96% scale + tint, no over-animation. */
export const PressableScale = memo(function PressableScale({
  onPress,
  onLongPress,
  disabled,
  style,
  children,
  accessibilityLabel,
  accessibilityRole = 'button',
  pressedScale = 0.96,
  hitSlop,
  selected,
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 260 });
  }, [disabled, scale]);

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      onPressIn={() => {
        if (!reduceMotion) scale.value = withSpring(pressedScale, { damping: 20, stiffness: 320 });
      }}
      onPressOut={() => {
        if (!reduceMotion) scale.value = withSpring(1, { damping: 18, stiffness: 260 });
      }}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onPress ? accessibilityRole : undefined}
      accessibilityState={{ disabled: !!disabled, selected }}
      hitSlop={hitSlop}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
});