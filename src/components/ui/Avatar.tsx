import { Image } from 'expo-image';
import React, { memo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { initials } from '@/utils/format';
import { Gradient } from './Gradient';
import { Text } from './Text';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  online?: boolean;
  /** `brand` wraps the avatar in a Google-blue gradient ring. */
  ring?: 'surface' | 'none' | 'brand';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Remote-photo avatar with an initials fallback (never renders broken images). */
export const Avatar = memo(function Avatar({
  uri,
  name,
  size = 48,
  online,
  ring = 'surface',
  style,
  accessibilityLabel,
}: AvatarProps) {
  const theme = useTheme();
  const fallbackBgVariants = [
    theme.colors.primaryFixed,
    theme.colors.secondaryFixed,
    theme.colors.tertiaryFixed,
    theme.colors.surfaceContainerHigh,
  ];
  const fallbackBg = fallbackBgVariants[(name.charCodeAt(0) ?? 0) % fallbackBgVariants.length];

  const core = (
    <View
      accessibilityLabel={accessibilityLabel ?? `Avatar of ${name}`}
      accessibilityRole="image"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fallbackBg,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        ring === 'brand' ? undefined : style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={120}
        />
      ) : (
        <Text
          weight="bold"
          size={Math.round(size * 0.4)}
          style={{ color: theme.colors.onPrimaryFixed }}
        >
          {initials(name)}
        </Text>
      )}
      {online ? (
        <View
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: Math.max(10, size * 0.22),
            height: Math.max(10, size * 0.22),
            borderRadius: 999,
            backgroundColor: theme.colors.tertiaryContainer,
            borderWidth: 2,
            borderColor: theme.colors.surfaceContainerLowest,
          }}
        />
      ) : null}
    </View>
  );

  if (ring === 'brand') {
    const outer = size + 4;
    return (
      <View
        style={[
          { width: outer, height: outer, borderRadius: outer / 2, padding: 2, overflow: 'hidden' },
          style,
        ]}
      >
        <Gradient token="brand" style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        {core}
      </View>
    );
  }

  return core;
});

interface AvatarStackProps {
  items: { name: string; avatar?: string }[];
  size?: number;
  max?: number;
}

export const AvatarStack = memo(function AvatarStack({ items, size = 28, max = 3 }: AvatarStackProps) {
  const theme = useTheme();
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;

  return (
    <View style={{ flexDirection: 'row' }}>
      {visible.map((item, index) => (
        <View key={item.name} style={{ marginLeft: index === 0 ? 0 : -8 }}>
          <Avatar
            uri={item.avatar}
            name={item.name}
            size={size}
            style={{ borderWidth: 2, borderColor: theme.colors.surfaceContainerLowest }}
          />
        </View>
      ))}
      {overflow > 0 ? (
        <View style={{ marginLeft: -8 }}>
          <Avatar name={`+${overflow}`} size={size} />
        </View>
      ) : null}
    </View>
  );
});
