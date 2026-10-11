import React, { memo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import type { GradientToken } from '@/theme/gradients';
import { Gradient } from './Gradient';
import { IconButton } from './IconButton';
import { Text } from './Text';

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
  const theme = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }, style]}>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {accent ? (
            <View style={{ width: 3, height: 15, borderRadius: 2, backgroundColor: theme.colors[accent] }} />
          ) : null}
          <Text variant="titleMd" weight="bold">
            {title}
          </Text>
        </View>
        {subtitle ? (
          <Text variant="bodySm" muted>
            {subtitle}
          </Text>
        ) : null}
      </View>
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
    </View>
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
    <View style={[{ gap: 8 }, style]}>
      {kicker ? <Gradient token={gradient} style={{ width: 34, height: 4, borderRadius: 2 }} /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headlineLg" family="heading">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySm" muted>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
    </View>
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
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[{ flex: 1, backgroundColor: theme.colors[background] }, style]}>
      {header ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingTop: insets.top,
            paddingBottom: 8,
            paddingHorizontal: 8,
            backgroundColor: theme.colors[background],
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outlineVariant,
          }}
        >
          {header.onBack ? (
            <IconButton name="arrowBack" onPress={header.onBack} accessibilityLabel="Go back" color="onSurface" />
          ) : null}
          <View style={{ flex: 1 }}>
            {header.title ? (
              <Text variant="titleMd" weight="bold" numberOfLines={1}>
                {header.title}
              </Text>
            ) : null}
          </View>
          {header.right}
        </View>
      ) : null}
      <View style={{ flex: 1, paddingHorizontal: padded ? 16 : 0 }}>{children}</View>
    </View>
  );
});