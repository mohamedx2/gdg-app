import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useUiConfig } from '@/hooks/use-content';
import { useNotificationPreferences, useSetNotificationPreferences } from '@/hooks/use-community';
import { useUiStore } from '@/stores/ui.store';
import { useTheme } from '@/theme';
import type { NotificationPreferences } from '@/types';

export default function NotificationSettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { notificationPreferences: PREFERENCES } = useUiConfig();
  const toast = useUiStore((state) => state.toast);
  const { data, isPending, isError, error, refetch } = useNotificationPreferences();
  const { mutateAsync: setPreferences } = useSetNotificationPreferences();
  const [saving, setSaving] = useState(false);

  const onToggle = async (key: keyof NotificationPreferences, enabled: boolean) => {
    if (saving || !data) return;
    setSaving(true);
    try {
      await setPreferences({ ...data, [key]: enabled });
      if (!enabled && key === 'eventReminders') {
        toast('Reminders paused — registered events remain on your calendar', 'neutral');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save preference', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <YStack flex={1} backgroundColor="background">
      <XStack paddingTop={insets.top + 8} paddingHorizontal={16} alignItems="center" gap={4}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text variant="headlineMd" weight="bold">
          Notifications
        </Text>
      </XStack>

      {isError ? (
        <YStack padding={16}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </YStack>
      ) : null}

      {isPending || !data ? (
        <YStack padding={16} gap={12}>
          {[1, 2, 3, 4].map((key) => <Skeleton key={key} height={64} radius={12} />)}
        </YStack>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {PREFERENCES.map((item) => {
            const enabled = data[item.key];
            return (
              <XStack
                key={item.key}
                alignItems="center"
                gap={12}
                padding={14}
                borderRadius="card"
                backgroundColor="surfaceContainerLowest"
                borderWidth={1}
                borderColor="outlineVariant"
              >
                <YStack width={38} height={38} borderRadius={11} backgroundColor={enabled ? 'primaryFixed' : 'surfaceContainerLow'} alignItems="center" justifyContent="center">
                  <Icon name={item.icon} size={18} color={enabled ? 'primary' : 'secondary'} />
                </YStack>
                <YStack flex={1} gap={2}>
                  <Text variant="labelLg" weight="semibold">{item.label}</Text>
                  <Text variant="bodySm" muted>{item.description}</Text>
                </YStack>
                <Switch
                  value={enabled}
                  onValueChange={(value) => void onToggle(item.key, value)}
                  disabled={saving}
                  trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primaryContainer }}
                  thumbColor={enabled ? theme.colors.primary : theme.colors.surfaceContainerHigh}
                />
              </XStack>
            );
          })}
          <Text variant="bodySm" muted style={{ paddingHorizontal: 4, paddingTop: 4 }}>
            Notification permission is managed by your device. System prompts appear the first time we need to notify you.
          </Text>
        </ScrollView>
      )}
    </YStack>
  );
}
