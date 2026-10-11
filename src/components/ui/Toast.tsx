import React, { memo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { useUiStore } from '@/stores/ui.store';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

const toneConfig: Record<string, { icon: IconName; color: 'tertiaryContainer' | 'errorContainer' | 'primaryContainer' | 'surfaceContainerHigh' }> = {
  success: { icon: 'checkCircle', color: 'tertiaryContainer' },
  error: { icon: 'errorOutline', color: 'errorContainer' },
  info: { icon: 'info', color: 'primaryContainer' },
};

/** Floating toasts stacked above the tab bar. */
export const ToastProvider = memo(function ToastProvider() {
  const insets = useSafeAreaInsets();
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + 72,
        paddingHorizontal: 16,
        gap: 8,
        zIndex: 50,
      }}
    >
      {toasts.map((toast) => (
        <ToastRow key={toast.id} id={toast.id} message={toast.message} tone={toast.tone} onDismiss={dismissToast} />
      ))}
    </View>
  );
});

function ToastRow({
  id,
  message,
  tone,
  onDismiss,
}: {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info' | 'neutral';
  onDismiss: (id: number) => void;
}) {
  const theme = useTheme();
  const translateY = useSharedValue(24);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      30,
      withSequence(
        withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
        withDelay(2600, withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) })),
      ),
    );
    translateY.value = withSequence(
      withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) }),
      withDelay(2600, withTiming(12, { duration: 200 })),
    );
    const timer = setTimeout(() => onDismiss(id), 3100);
    return () => {
      clearTimeout(timer);
      cancelAnimation(opacity);
      cancelAnimation(translateY);
    };
  }, [id, onDismiss, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const cfg = toneConfig[tone] ?? { icon: 'info' as IconName, color: 'surfaceContainerHigh' as const };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: theme.radius.card,
          backgroundColor: theme.colors.inverseSurface,
        },
      ]}
    >
      <Icon name={cfg.icon} size={18} color={cfg.color} />
      <Text
        variant="bodyMd"
        weight="medium"
        style={{ color: theme.colors.inverseOnSurface, flex: 1 }}
        numberOfLines={2}
      >
        {message}
      </Text>
    </Animated.View>
  );
}