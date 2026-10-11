import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useUiConfig } from '@/hooks/use-content';
import { useTheme } from '@/theme';
import { useThemeStore } from '@/stores/theme.store';

export default function AppearanceScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { appearanceOptions: OPTIONS } = useUiConfig();
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text variant="headlineMd" weight="bold">
          Appearance
        </Text>
      </View>

      <View style={{ padding: 16, gap: 8 }}>
        {OPTIONS.map((option) => {
          const selected = preference === option.key;
          return (
            <PressableScale
              key={option.key}
              onPress={() => setPreference(option.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                borderRadius: theme.radius.card,
                backgroundColor: theme.colors.surfaceContainerLowest,
                borderWidth: 1.5,
                borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
              }}
            >
              <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: selected ? theme.colors.primaryFixed : theme.colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={option.icon} size={18} color={selected ? 'primary' : 'secondary'} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="labelLg" weight="semibold">{option.label}</Text>
                <Text variant="bodySm" muted>{option.description}</Text>
              </View>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant, alignItems: 'center', justifyContent: 'center' }}>
                {selected ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary }} /> : null}
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}