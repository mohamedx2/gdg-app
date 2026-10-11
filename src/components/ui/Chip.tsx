import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';
import { Gradient } from './Gradient';
import { Icon, IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

interface ChipProps {
  label: string;
  icon?: IconName;
  dot?: ColorToken;
  active?: boolean;
  onPress?: () => void;
  count?: number;
  accessibilityLabel?: string;
}

/** Selectable filter chip — active state swaps to the primary container. */
export const FilterChip = memo(function FilterChip({
  label,
  icon,
  dot,
  active,
  onPress,
  count,
  accessibilityLabel,
}: ChipProps) {
  const theme = useTheme();
  const backgroundColor = active ? 'transparent' : theme.colors.surfaceContainerLowest;
  const textColor = active ? '#FFFFFF' : theme.colors.secondary;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={onPress ? 'button' : undefined}
      pressedScale={0.96}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        height: 34,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor,
        borderWidth: 1,
        borderColor: active ? 'transparent' : theme.colors.outlineVariant,
        minHeight: 34,
      }}
    >
      {active ? (
        <Gradient token="brand" style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
      ) : null}
      {active ? <Icon name="check" size={16} color={textColor} /> : null}
      {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors[dot] }} /> : null}
      {icon ? <Icon name={icon} size={16} color={textColor} /> : null}
      <Text variant="labelMd" style={{ color: textColor }} numberOfLines={1}>
        {label}
        {count !== undefined ? ` (${count})` : ''}
      </Text>
    </PressableScale>
  );
});

interface PillProps {
  label: string;
  color: ColorToken;
  dot?: boolean;
  icon?: IconName;
  uppercase?: boolean;
}

/** Status / category pill — mono type on a 10%-opacity tinted track. */
export const Pill = memo(function Pill({ label, color, dot, icon, uppercase }: PillProps) {
  const theme = useTheme();
  const tint = theme.colors[color];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: hexToRgba(tint, 0.1),
        alignSelf: 'flex-start',
      }}
    >
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tint }} /> : null}
      {icon ? <Icon name={icon} size={13} color={color} /> : null}
      <Text
        variant="codeSm"
        color={color}
        weight="semibold"
        style={uppercase ? { textTransform: 'uppercase', letterSpacing: 0.4 } : undefined}
      >
        {label}
      </Text>
    </View>
  );
});

/** Fully filled pill — tinted track, solid on-colour text. */
export const SolidPill = memo(function SolidPill({
  label,
  color = 'primaryContainer',
  onColor = 'onPrimary',
  icon,
  uppercase,
}: {
  label: string;
  color?: ColorToken;
  onColor?: ColorToken;
  icon?: IconName;
  uppercase?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 5,
        backgroundColor: theme.colors[color],
        alignSelf: 'flex-start',
      }}
    >
      {icon ? <Icon name={icon} size={13} color={onColor} /> : null}
      <Text
        variant="codeSm"
        color={onColor}
        weight="semibold"
        style={uppercase ? { textTransform: 'uppercase', letterSpacing: 0.4 } : undefined}
      >
        {label}
      </Text>
    </View>
  );
});

/** Tinted track pill — 10% background with matching solid text. */
export const TagPill = memo(function TagPill({
  label,
  color,
  dot,
  filled,
  radius = 'base',
}: {
  label: string;
  color: ColorToken;
  dot?: boolean;
  filled?: boolean;
  radius?: 'base' | 'full';
}) {
  const theme = useTheme();
  const tint = theme.colors[color];
  const bg = filled ? tint : hexToRgba(tint, 0.1);
  const text = filled ? theme.colors.onPrimary : tint;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius === 'full' ? 999 : theme.radius.base,
        backgroundColor: bg,
        alignSelf: 'flex-start',
      }}
    >
      {dot ? (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tint }} />
      ) : null}
      <Text variant="codeSm" style={{ color: text }} weight="medium">
        {label}
      </Text>
    </View>
  );
});

function hexToRgba(hex: string, alpha: number): string {
  if (!hex.startsWith('#')) return hex;
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export { hexToRgba };