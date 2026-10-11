import Constants from 'expo-constants';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useUiConfig } from '@/hooks/use-content';
import { useTheme } from '@/theme';

type StackStyle = React.ComponentProps<typeof YStack>['style'];

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { settingsRows: ROWS } = useUiConfig();
  return (
    <YStack flex={1} backgroundColor="background">
      <XStack paddingTop={insets.top + 8} paddingHorizontal={16} alignItems="center" gap={4}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text variant="headlineMd" weight="bold">
          Settings
        </Text>
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }} showsVerticalScrollIndicator={false}>
        <YStack
          borderRadius="card"
          overflow="hidden"
          backgroundColor="surfaceContainerLowest"
          style={theme.shadow(1) as StackStyle}
        >
          {ROWS.map((row, index) => (
            <PressableScale
              key={row.route}
              onPress={() => router.push(row.route as never)}
              accessibilityRole="button"
              accessibilityLabel={row.label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: theme.colors.outlineVariant }}
            >
              <YStack width={36} height={36} borderRadius={10} backgroundColor="surfaceContainerLow" alignItems="center" justifyContent="center">
                <Icon name={row.icon} size={18} color="primary" />
              </YStack>
              <YStack flex={1} gap={2}>
                <Text variant="labelLg" weight="semibold">{row.label}</Text>
                <Text variant="bodySm" muted>{row.description}</Text>
              </YStack>
              <Icon name="chevronRight" size={18} color="secondary" />
            </PressableScale>
          ))}
        </YStack>
        <Text variant="codeSm" muted style={{ textAlign: 'center', marginTop: 8 }}>
          GDG on Campus EPI · v1.0.0 · Expo SDK {Constants.expoConfig?.sdkVersion ?? '57'}
        </Text>
      </ScrollView>
    </YStack>
  );
}
