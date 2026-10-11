import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { Icon, IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useMarkNotificationsRead, useNotifications } from '@/hooks/use-community';
import { useTheme } from '@/theme';
import type { AppNotification } from '@/types';

const KIND_ICON: Record<string, IconName> = {
  event_reminder: 'event',
  registration: 'checkCircle',
  announcement: 'campaign',
  community: 'groups',
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, error, refetch, isFetching } = useNotifications();
  const { mutateAsync: markRead } = useMarkNotificationsRead();

  const onPress = async (notification: AppNotification) => {
    if (!notification.read) {
      try {
        await markRead();
      } catch {
        // non-fatal
      }
    }
    if (notification.deepLink && notification.deepLink.startsWith('/')) {
      router.push(notification.deepLink as never);
    }
  };

  return (
    <YStack flex={1} backgroundColor="background">
      <XStack paddingTop={insets.top + 8} paddingHorizontal={16} alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap={4}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Notifications
          </Text>
        </XStack>
        <Icon
          name="campaign"
          size={22}
          color={data?.some((notification) => !notification.read) ? 'primary' : 'secondary'}
        />
      </XStack>

      {isError ? (
        <YStack padding={16}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </YStack>
      ) : null}

      {isPending ? (
        <YStack padding={16} paddingTop={20} gap={12}>
          {[1, 2, 3, 4].map((key) => (
            <XStack key={key} gap={10}>
              <Skeleton width={40} height={40} radius={12} />
              <YStack flex={1} gap={6}>
                <Skeleton height={13} width="70%" />
                <Skeleton height={10} width="40%" />
              </YStack>
            </XStack>
          ))}
        </YStack>
      ) : null}

      {!isPending && data && data.length === 0 ? (
        <EmptyState icon="notificationsNone" title="All caught up" message="You're up to date. New activity will show up here." />
      ) : null}

      {data && data.length > 0 ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingTop: 12, gap: 8, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} tintColor={theme.colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {data.map((notification) => {
            const unread = !notification.read;
            return (
              <PressableScale
                key={notification.id}
                onPress={() => void onPress(notification)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: theme.radius.card,
                  backgroundColor: unread ? theme.colors.surfaceContainerHigh : theme.colors.surfaceContainerLowest,
                  borderWidth: 1,
                  borderColor: unread ? theme.colors.primaryContainer : theme.colors.outlineVariant,
                }}
              >
                <YStack width={40} height={40} borderRadius={12} backgroundColor={unread ? 'primaryFixed' : 'surfaceContainerLow'} alignItems="center" justifyContent="center">
                  <Icon name={KIND_ICON[notification.type] ?? 'campaign'} size={18} color={unread ? 'primary' : 'secondary'} />
                </YStack>
                <YStack flex={1} gap={2}>
                  <Text variant="bodyMd" weight={unread ? 'semibold' : 'medium'} numberOfLines={2}>
                    {notification.title}
                    {notification.body ? (
                      <Text variant="bodySm" weight="regular" color="onSurface" muted>
                        {'  '}{notification.body}
                      </Text>
                    ) : null}
                  </Text>
                  <Text variant="codeSm" muted>
                    {notification.createdAt}
                  </Text>
                </YStack>
                {unread ? <YStack width={8} height={8} borderRadius={4} backgroundColor="primary" /> : null}
              </PressableScale>
            );
          })}
        </ScrollView>
      ) : null}
    </YStack>
  );
}