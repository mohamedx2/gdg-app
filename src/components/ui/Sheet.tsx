import { router } from 'expo-router';
import React, { memo } from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Text } from './Text';

interface SheetProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Defaults to `router.back()` — the sheet owns dismissal. */
  onClose?: () => void;
  dismissible?: boolean;
  /** Wrap body in a vertical ScrollView (default) or render children directly. */
  scroll?: boolean;
  maxHeight?: number | `${number}%`;
  /** Optional trailing element in the header row (e.g. a close button). */
  headerRight?: React.ReactNode;
  /** Pinned below the scroll body (e.g. a primary action row). */
  footer?: React.ReactNode;
  /** Hide the grab handle for full-bleed hero sheets. */
  showHandle?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const CORNER = 24;

/**
 * Bottom sheet surfaced by an Expo Router `transparentModal` route.
 * Dismissal returns through the router so hardware back stays correct.
 */
export const Sheet = memo(function Sheet({
  title,
  subtitle,
  children,
  onClose,
  dismissible = true,
  scroll = true,
  maxHeight = '92%',
  headerRight,
  footer,
  showHandle = true,
  style,
  contentContainerStyle,
}: SheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const close = onClose ?? (() => router.back());
  const handleClose = dismissible ? close : undefined;

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Animated.View
        entering={FadeIn.duration(180)}
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
      >
        <Pressable
          onPress={handleClose}
          accessibilityRole={handleClose ? 'button' : undefined}
          accessibilityLabel={handleClose ? 'Close' : undefined}
          style={{ flex: 1 }}
        />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.duration(280)}
        accessibilityViewIsModal
        style={[
          {
            maxHeight,
            backgroundColor: theme.colors.surfaceContainerLow,
            borderTopLeftRadius: CORNER,
            borderTopRightRadius: CORNER,
            paddingBottom: Math.max(insets.bottom, 16),
            overflow: 'hidden',
          },
          style,
        ]}
      >
        {showHandle ? (
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
        ) : null}
        {title ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 20,
              paddingBottom: subtitle ? 10 : 12,
              paddingTop: 4,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="titleMd" weight="bold" numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text variant="bodySm" muted numberOfLines={2} style={{ marginTop: 2 }}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {headerRight}
          </View>
        ) : null}
        {scroll ? (
          <ScrollView
            style={{ flexShrink: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={contentContainerStyle}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
        {footer ? (
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: theme.colors.outlineVariant,
              backgroundColor: theme.colors.surfaceContainerLow,
            }}
          >
            {footer}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
});
