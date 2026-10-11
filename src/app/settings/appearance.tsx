import { router } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

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
    <YStack flex={1} backgroundColor="background">
      <XStack paddingTop={insets.top + 8} paddingHorizontal={16} alignItems="center" gap={4}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text variant="headlineMd" weight="bold">
          Appearance
        </Text>
      </XStack>

      <YStack padding={16} gap={8}>
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
                borderWidth: 1.5,
                borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
              }}
            >
              <YStack width={38} height={38} borderRadius={11} backgroundColor={selected ? 'primaryFixed' : 'surfaceContainerLow'} alignItems="center" justifyContent="center">
                <Icon name={option.icon} size={18} color={selected ? 'primary' : 'secondary'} />
              </YStack>
              <YStack flex={1} gap={2}>
                <Text variant="labelLg" weight="semibold">{option.label}</Text>
                <Text variant="bodySm" muted>{option.description}</Text>
              </YStack>
              <YStack width={22} height={22} borderRadius={11} borderWidth={2} borderColor={selected ? 'primary' : 'outlineVariant'} alignItems="center" justifyContent="center">
                {selected ? <YStack width={12} height={12} borderRadius={6} backgroundColor="primary" /> : null}
              </YStack>
            </PressableScale>
          );
        })}
      </YStack>
    </YStack>
  );
}
