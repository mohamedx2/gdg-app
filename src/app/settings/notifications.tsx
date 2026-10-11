import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text variant="headlineMd" weight="bold">
          Notifications
        </Text>
      </View>

      {isError ? (
        <View style={{ padding: 16 }}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </View>
      ) : null}

      {isPending || !data ? (
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3, 4].map((key) => <Skeleton key={key} height={64} radius={12} />)}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {PREFERENCES.map((item) => {
            const enabled = data[item.key];
            return (
              <View
                key={item.key}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant }}
              >
                <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: enabled ? theme.colors.primaryFixed : theme.colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={item.icon} size={18} color={enabled ? 'primary' : 'secondary'} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="labelLg" weight="semibold">{item.label}</Text>
                  <Text variant="bodySm" muted>{item.description}</Text>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={(value) => void onToggle(item.key, value)}
                  disabled={saving}
                  trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primaryContainer }}
                  thumbColor={enabled ? theme.colors.primary : theme.colors.surfaceContainerHigh}
                />
              </View>
            );
          })}
          <Text variant="bodySm" muted style={{ paddingHorizontal: 4, paddingTop: 4 }}>
            Notification permission is managed by your device. System prompts appear the first time we need to notify you.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}