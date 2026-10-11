import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '@/components/ui/Avatar';
import { Icon, IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { SearchBar } from '@/components/ui/SearchBar';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useMarkNotificationsRead, useNotifications } from '@/hooks/use-community';
import { useConversations } from '@/hooks/use-messages';
import { useTheme } from '@/theme';
import { formatRelativeTime } from '@/utils/date';
import type { AppNotification, Conversation } from '@/types';

type InboxTab = 'messages' | 'notifications';

const KIND_ICON: Record<string, IconName> = {
  event_reminder: 'event',
  registration: 'checkCircle',
  announcement: 'campaign',
  community: 'groups',
};

/** Unified inbox: messages and notifications behind one segmented screen. */
export default function InboxScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { segment } = useLocalSearchParams<{ segment?: string }>();
  const [tab, setTab] = useState<InboxTab>(segment === 'notifications' ? 'notifications' : 'messages');
  const [query, setQuery] = useState('');

  const conversations = useConversations();
  const notifications = useNotifications();
  const { mutateAsync: markRead } = useMarkNotificationsRead();

  const unreadMessages = (conversations.data ?? []).reduce((sum, item) => sum + item.unreadCount, 0);
  const unreadNotifications = (notifications.data ?? []).filter((item) => !item.read).length;

  const filteredConversations = useMemo(() => {
    const all = conversations.data ?? [];
    const text = query.trim().toLowerCase();
    if (!text) return all;
    return all.filter((conversation) => conversation.name.toLowerCase().includes(text));
  }, [conversations.data, query]);

  const openNotification = async (notification: AppNotification) => {
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
      <YStack paddingTop={insets.top + 8} paddingHorizontal={16} gap={14}>
        <XStack alignItems="center" gap={4}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold" style={{ flex: 1 }}>
            Inbox
          </Text>
        </XStack>
        <SegmentedControl<InboxTab>
          accessibilityLabel="Inbox sections"
          value={tab}
          onChange={setTab}
          segments={[
            { value: 'messages', label: 'Messages', count: unreadMessages || undefined },
            { value: 'notifications', label: 'Alerts', count: unreadNotifications || undefined },
          ]}
        />
        {tab === 'messages' ? (
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search conversations"
            accessibilityLabel="Search conversations"
          />
        ) : null}
      </YStack>

      {tab === 'messages' ? (
        <MessagesTab
          conversations={filteredConversations}
          isPending={conversations.isPending}
          isError={conversations.isError}
          errorMessage={conversations.error?.message}
          onRetry={() => void conversations.refetch()}
        />
      ) : (
        <NotificationsTab
          notifications={notifications.data ?? []}
          isPending={notifications.isPending}
          isError={notifications.isError}
          errorMessage={notifications.error?.message}
          isFetching={notifications.isFetching}
          onRetry={() => void notifications.refetch()}
          onPress={(notification) => void openNotification(notification)}
          tint={theme.colors.primary}
        />
      )}
    </YStack>
  );
}

function MessagesTab({
  conversations,
  isPending,
  isError,
  errorMessage,
  onRetry,
}: {
  conversations: Conversation[];
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
}) {
  if (isError) {
    return (
      <YStack padding={16}>
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </YStack>
    );
  }
  if (isPending && conversations.length === 0) {
    return (
      <YStack padding={16} gap={12}>
        {[1, 2, 3, 4].map((key) => (
          <Skeleton key={key} height={68} radius={14} />
        ))}
      </YStack>
    );
  }
  if (conversations.length === 0) {
    return (
      <EmptyState icon="chatBubble" title="No conversations" message="Chats with the club and event teams will appear here." />
    );
  }
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 8 }}
      showsVerticalScrollIndicator={false}
    >
      {conversations.map((conversation) => (
        <ConversationRow
          key={conversation.id}
          conversation={conversation}
          onPress={() => router.push(`/inbox/${conversation.id}` as never)}
        />
      ))}
    </ScrollView>
  );
}

function NotificationsTab({
  notifications,
  isPending,
  isError,
  errorMessage,
  isFetching,
  onRetry,
  onPress,
  tint,
}: {
  notifications: AppNotification[];
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  isFetching: boolean;
  onRetry: () => void;
  onPress: (notification: AppNotification) => void;
  tint: string;
}) {
  const theme = useTheme();
  if (isError) {
    return (
      <YStack padding={16}>
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </YStack>
    );
  }
  if (isPending) {
    return (
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
    );
  }
  if (notifications.length === 0) {
    return (
      <EmptyState icon="notificationsNone" title="All caught up" message="You're up to date. New activity will show up here." />
    );
  }
  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingTop: 12, gap: 8, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={onRetry} tintColor={tint} />
      }
      showsVerticalScrollIndicator={false}
    >
      {notifications.map((notification) => {
        const unread = !notification.read;
        return (
          <PressableScale
            key={notification.id}
            onPress={() => onPress(notification)}
            accessibilityLabel={notification.title}
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
            <YStack
              width={40}
              height={40}
              borderRadius={12}
              backgroundColor={unread ? 'primaryFixed' : 'surfaceContainerLow'}
              alignItems="center"
              justifyContent="center"
            >
              <Icon name={KIND_ICON[notification.type] ?? 'campaign'} size={18} color={unread ? 'primary' : 'secondary'} />
            </YStack>
            <YStack flex={1} gap={2}>
              <Text variant="bodyMd" weight={unread ? 'semibold' : 'medium'} numberOfLines={2}>
                {notification.title}
              </Text>
              {notification.body ? (
                <Text variant="bodySm" muted numberOfLines={2}>
                  {notification.body}
                </Text>
              ) : null}
              <Text variant="codeSm" muted>
                {notification.createdAt}
              </Text>
            </YStack>
            {unread ? <YStack width={8} height={8} borderRadius={4} backgroundColor="primary" /> : null}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

function ConversationRow({ conversation, onPress }: { conversation: Conversation; onPress: () => void }) {
  const theme = useTheme();
  const unread = conversation.unreadCount > 0;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={`Open conversation with ${conversation.name}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: unread ? theme.colors.primaryContainer : theme.colors.outlineVariant,
      }}
    >
      {conversation.avatar ? (
        <Avatar uri={conversation.avatar} name={conversation.name} size={48} online={conversation.online} />
      ) : (
        <YStack width={48} height={48} borderRadius={24} alignItems="center" justifyContent="center" backgroundColor="secondaryFixed">
          <Icon name="groups" size={22} color="onSecondaryFixedVariant" />
        </YStack>
      )}

      <YStack flex={1} gap={3}>
        <XStack alignItems="center" gap={6}>
          {conversation.pinned ? <Icon name="pushPin" size={12} color="onSurfaceVariant" /> : null}
          <Text variant="labelLg" weight={unread ? 'bold' : 'semibold'} style={{ flex: 1 }} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text variant="bodyXs" muted>
            {formatRelativeTime(conversation.lastMessageAt)}
          </Text>
        </XStack>
        <XStack alignItems="center" gap={8}>
          <Text variant="bodySm" muted={!unread} weight={unread ? 'medium' : 'regular'} style={{ flex: 1 }} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
          {unread ? (
            <YStack minWidth={20} height={20} paddingHorizontal={6} borderRadius={10} alignItems="center" justifyContent="center" backgroundColor="primary">
              <Text variant="bodyXs" weight="bold" color="onPrimary">
                {conversation.unreadCount}
              </Text>
            </YStack>
          ) : null}
        </XStack>
      </YStack>
    </PressableScale>
  );
}
