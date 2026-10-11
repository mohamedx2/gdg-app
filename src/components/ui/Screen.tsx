import React, { memo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import type { ColorToken } from '@/theme/colors';
import type { GradientToken } from '@/theme/gradients';
import { Gradient } from './Gradient';
import { IconButton } from './IconButton';
import { Text } from './Text';

type StackStyle = React.ComponentProps<typeof YStack>['style'];

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionAccessibilityLabel?: string;
  /** Optional leading colour bar that anchors the section to a track or category. */
  accent?: ColorToken;
  style?: StyleProp<ViewStyle>;
}

export const SectionHeader = memo(function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionAccessibilityLabel,
  accent,
  style,
}: SectionHeaderProps) {
  return (
    <XStack alignItems="flex-end" justifyContent="space-between" gap={12} style={style as StackStyle}>
      <YStack flex={1} gap={2}>
        <XStack alignItems="center" gap={8}>
          {accent ? <YStack width={3} height={15} borderRadius={2} backgroundColor={accent} /> : null}
          <Text variant="titleMd" weight="bold">
            {title}
          </Text>
        </XStack>
        {subtitle ? (
          <Text variant="bodySm" muted>
            {subtitle}
          </Text>
        ) : null}
      </YStack>
      {actionLabel && onAction ? (
        <Text
          variant="labelMd"
          primary
          suppressHighlighting
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
        >
          {actionLabel}
        </Text>
      ) : null}
    </XStack>
  );
});

interface ScreenHeadingProps {
  title: string;
  subtitle?: string;
  /** Optional element pinned to the trailing edge (e.g. a counter). */
  right?: React.ReactNode;
  /** Brand ramp for the kicker accent bar. */
  gradient?: GradientToken;
  /** Hide the accent bar for utilities/legacy headers. */
  kicker?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Expressive screen title: a brand kicker bar over a large heading. */
export const ScreenHeading = memo(function ScreenHeading({
  title,
  subtitle,
  right,
  gradient = 'brand',
  kicker = true,
  style,
}: ScreenHeadingProps) {
  return (
    <YStack gap={8} style={style as StackStyle}>
      {kicker ? <Gradient token={gradient} style={{ width: 34, height: 4, borderRadius: 2 }} /> : null}
      <XStack alignItems="flex-end" justifyContent="space-between" gap={12}>
        <YStack flex={1} gap={2}>
          <Text variant="headlineLg" family="heading">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySm" muted>
              {subtitle}
            </Text>
          ) : null}
        </YStack>
        {right}
      </XStack>
    </YStack>
  );
});

interface ScreenProps {
  children: React.ReactNode;
  padded?: boolean;
  header?: {
    title?: string;
    onBack?: () => void;
    right?: React.ReactNode;
  };
  background?: ColorToken;
  style?: StyleProp<ViewStyle>;
}

/** Standard screen scaffold — safe area, gutters, optional app-bar header. */
export const Screen = memo(function Screen({
  children,
  padded = true,
  header,
  background = 'background',
  style,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <YStack flex={1} backgroundColor={background} style={style as StackStyle}>
      {header ? (
        <XStack
          alignItems="center"
          gap={4}
          paddingTop={insets.top}
          paddingBottom={8}
          paddingHorizontal={8}
          backgroundColor={background}
          borderBottomWidth={1}
          borderBottomColor="outlineVariant"
        >
          {header.onBack ? (
            <IconButton name="arrowBack" onPress={header.onBack} accessibilityLabel="Go back" color="onSurface" />
          ) : null}
          <YStack flex={1}>
            {header.title ? (
              <Text variant="titleMd" weight="bold" numberOfLines={1}>
                {header.title}
              </Text>
            ) : null}
          </YStack>
          {header.right}
        </XStack>
      ) : null}
      <YStack flex={1} paddingHorizontal={padded ? 16 : 0}>
        {children}
      </YStack>
    </YStack>
  );
});
