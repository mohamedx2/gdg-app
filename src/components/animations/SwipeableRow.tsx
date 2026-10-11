import React, { memo, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface SwipeableRowProps {
  children: React.ReactNode;
  /** Rendered behind the row on the left (revealed by swiping right). */
  renderLeftActions?: () => React.ReactNode;
  /** Rendered behind the row on the right (revealed by swiping left). */
  renderRightActions?: () => React.ReactNode;
  /** Fired on a quick left swipe when no right actions are provided. */
  onSwipeLeft?: () => void;
  /** Fired on a quick right swipe when no left actions are provided. */
  onSwipeRight?: () => void;
  actionWidth?: number;
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SPRING = { damping: 20, stiffness: 220, overshootClamping: true };

/** Swipe-to-reveal / swipe-to-act row built on Gesture Handler + Reanimated. */
export const SwipeableRow = memo(function SwipeableRow({
  children,
  renderLeftActions,
  renderRightActions,
  onSwipeLeft,
  onSwipeRight,
  actionWidth = 88,
  enabled = true,
  style,
}: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const showLeft = Boolean(renderLeftActions);
  const showRight = Boolean(renderRightActions);
  const hasLeft = showLeft || Boolean(onSwipeRight);
  const hasRight = showRight || Boolean(onSwipeLeft);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled && (hasLeft || hasRight))
        .activeOffsetX([-12, 12])
        .failOffsetY([-10, 10])
        .onBegin(() => {
          startX.value = translateX.value;
        })
        .onUpdate((event) => {
          const raw = startX.value + event.translationX;
          const min = hasRight ? -actionWidth : -24;
          const max = hasLeft ? actionWidth : 24;
          translateX.value = Math.min(max, Math.max(min, raw));
        })
        .onEnd((event) => {
          const dx = event.translationX;
          const vx = event.velocityX;
          const openRight = hasRight && (dx < -actionWidth / 2 || vx < -500);
          const openLeft = hasLeft && (dx > actionWidth / 2 || vx > 500);

          if (openRight) {
            if (showRight) {
              translateX.value = withSpring(-actionWidth, SPRING);
            } else {
              runOnJS(onSwipeLeft!)();
              translateX.value = withSpring(0, SPRING);
            }
          } else if (openLeft) {
            if (showLeft) {
              translateX.value = withSpring(actionWidth, SPRING);
            } else {
              runOnJS(onSwipeRight!)();
              translateX.value = withSpring(0, SPRING);
            }
          } else {
            translateX.value = withSpring(0, SPRING);
          }
        }),
    [
      actionWidth,
      enabled,
      hasLeft,
      hasRight,
      onSwipeLeft,
      onSwipeRight,
      showLeft,
      showRight,
      startX,
      translateX,
    ],
  );

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, style]}>
      {showLeft ? (
        <View style={[styles.action, styles.left, { width: actionWidth }]}>
          {renderLeftActions!()}
        </View>
      ) : null}
      {showRight ? (
        <View style={[styles.action, styles.right, { width: actionWidth }]}>
          {renderRightActions!()}
        </View>
      ) : null}
      <GestureDetector gesture={pan}>
        <Animated.View style={contentStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  action: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' },
  left: { left: 0, alignItems: 'flex-start' },
  right: { right: 0, alignItems: 'flex-end' },
});
