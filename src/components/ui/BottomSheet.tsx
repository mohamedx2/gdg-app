/* eslint-disable react-hooks/immutability -- reanimated shared values are mutated inside worklets by design */
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { Modal, StyleProp, View, ViewStyle, DimensionValue } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Text } from './Text';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number | string;
  dismissible?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SHEET_RADIUS = 24;

export const BottomSheet = memo(function BottomSheet({
  visible,
  onClose,
  title,
  children,
  height = '54%',
  dismissible = true,
  style,
}: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);

  const closeAndReset = useCallback(() => {
    'worklet';
    translateY.value = withTiming(0);
    runOnJS(onClose)();
  }, [onClose, translateY]);

  useEffect(() => {
    if (visible) translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    return () => cancelAnimation(translateY);
  }, [visible, translateY]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(8)
        .failOffsetY(-12)
        .onUpdate((event) => {
          translateY.value = Math.max(0, event.translationY);
        })
        .onEnd((event) => {
          if (event.translationY > 120 || event.velocityY > 900) {
            closeAndReset();
          } else {
            translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
          }
        }),
    [closeAndReset, translateY],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        {dismissible ? (
          <View style={{ flex: 1 }} onTouchEnd={onClose} />
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <GestureDetector gesture={pan}>
          <Animated.View
            accessibilityViewIsModal
            style={[
              animatedStyle,
              {
                height: height as DimensionValue,
                borderTopLeftRadius: SHEET_RADIUS,
                borderTopRightRadius: SHEET_RADIUS,
                backgroundColor: theme.colors.surfaceContainerLow,
                paddingBottom: insets.bottom,
                overflow: 'hidden',
              },
              style,
            ]}
          >
            <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 2 }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.colors.outlineVariant,
                }}
              />
            </View>
            {title ? (
              <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
                <TextTitle title={title} />
              </View>
            ) : null}
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
});

function TextTitle({ title }: { title: string }) {
  return (
    <Text variant="titleMd" weight="bold">
      {title}
    </Text>
  );
}