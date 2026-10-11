import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { SearchBar } from '@/components/ui/SearchBar';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useConversations } from '@/hooks/use-messages';
import { useTheme } from '@/theme';
import { formatRelativeTime } from '@/utils/date';
import type { Conversation } from '@/types';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { data: conversations, isPending, isError, error, refetch } = useConversations();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const all = conversations ?? [];
    const text = query.trim().toLowerCase();
    if (!text) return all;
    return all.filter((conversation) => conversation.name.toLowerCase().includes(text));
  }, [conversations, query]);

  const unreadTotal = (conversations ?? []).reduce((sum, item) => sum + item.unreadCount, 0);

  return (
    <YStack flex={1} backgroundColor="background">
      <YStack paddingTop={insets.top + 8} paddingHorizontal={16} gap={14}>
        <XStack alignItems="center" gap={4}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <YStack flex={1}>
            <Text variant="headlineMd" weight="bold">
              Messages
            </Text>
            {unreadTotal > 0 ? (
              <Text variant="bodySm" primary>
                {unreadTotal} unread
              </Text>
            ) : null}
          </YStack>
        </XStack>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search conversations" accessibilityLabel="Search conversations" />
      </YStack>

      {isError ? (
        <YStack padding={16}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </YStack>
      ) : isPending && !conversations ? (
        <YStack padding={16} gap={12}>
          {[1, 2, 3, 4].map((key) => (
            <Skeleton key={key} height={68} radius={14} />
          ))}
        </YStack>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              onPress={() => router.push(`/messages/${conversation.id}` as never)}
            />
          ))}
          {!filtered.length ? (
            <YStack alignItems="center" paddingVertical={40} gap={6}>
              <Icon name="chatBubble" size={28} color="secondary" />
              <Text variant="bodySm" muted>
                No conversations found.
              </Text>
            </YStack>
          ) : null}
        </ScrollView>
      )}
    </YStack>
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
