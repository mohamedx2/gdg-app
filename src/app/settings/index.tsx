import Constants from 'expo-constants';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useUiConfig } from '@/hooks/use-content';
import { useTheme } from '@/theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { settingsRows: ROWS } = useUiConfig();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text variant="headlineMd" weight="bold">
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }} showsVerticalScrollIndicator={false}>
        <View style={{ borderRadius: theme.radius.card, overflow: 'hidden', backgroundColor: theme.colors.surfaceContainerLowest, shadowColor: theme.colors.inverseSurface, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }}>
          {ROWS.map((row, index) => (
            <PressableScale
              key={row.route}
              onPress={() => router.push(row.route as never)}
              accessibilityRole="button"
              accessibilityLabel={row.label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: theme.colors.outlineVariant }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={row.icon} size={18} color="primary" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="labelLg" weight="semibold">{row.label}</Text>
                <Text variant="bodySm" muted>{row.description}</Text>
              </View>
              <Icon name="chevronRight" size={18} color="secondary" />
            </PressableScale>
          ))}
        </View>
        <Text variant="codeSm" muted style={{ textAlign: 'center', marginTop: 8 }}>
          GDG on Campus EPI · v1.0.0 · Expo SDK {Constants.expoConfig?.sdkVersion ?? '57'}
        </Text>
      </ScrollView>
    </View>
  );
}