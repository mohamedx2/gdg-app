import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useConversations, useMarkConversationRead, useMessages, useSendMessage } from '@/hooks/use-messages';
import { useUiStore } from '@/stores/ui.store';
import { useTheme } from '@/theme';
import { formatTime } from '@/utils/date';
import type { ChatMessage } from '@/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id ?? '';
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);

  const { data: conversations } = useConversations();
  const { data: messages, isPending, isError, error, refetch } = useMessages(conversationId);
  const send = useSendMessage(conversationId);
  const markRead = useMarkConversationRead();

  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');

  const conversation = useMemo(
    () => (conversations ?? []).find((item) => item.id === conversationId),
    [conversations, conversationId],
  );

  useEffect(() => {
    if (conversationId) markRead.mutate(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    send.mutate(body, {
      onError: (err) => {
        setDraft(body);
        toast(err instanceof Error ? err.message : 'Could not send message', 'error');
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <XStack
        paddingTop={insets.top + 8}
        paddingBottom={10}
        paddingHorizontal={16}
        alignItems="center"
        gap={10}
        borderBottomWidth={1}
        borderBottomColor="outlineVariant"
      >
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        {conversation?.avatar ? (
          <Avatar uri={conversation.avatar} name={conversation.name} size={36} online={conversation.online} />
        ) : (
          <YStack width={36} height={36} borderRadius={18} alignItems="center" justifyContent="center" backgroundColor="secondaryFixed">
            <Icon name="groups" size={18} color="onSecondaryFixedVariant" />
          </YStack>
        )}
        <YStack flex={1}>
          <Text variant="titleSm" weight="bold" numberOfLines={1}>
            {conversation?.name ?? 'Conversation'}
          </Text>
          <Text variant="bodyXs" muted numberOfLines={1}>
            {conversation?.online ? 'Online now' : conversation?.context ?? ''}
          </Text>
        </YStack>
      </XStack>

      {isError ? (
        <YStack padding={16}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </YStack>
      ) : isPending && !messages ? (
        <YStack padding={16} gap={12}>
          <Skeleton height={48} radius={16} style={{ alignSelf: 'flex-start', width: '70%' }} />
          <Skeleton height={48} radius={16} style={{ alignSelf: 'flex-end', width: '60%' }} />
          <Skeleton height={48} radius={16} style={{ alignSelf: 'flex-start', width: '55%' }} />
        </YStack>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <YStack alignItems="center" paddingVertical={8}>
            <Text variant="bodyXs" muted>
              {conversation?.context ?? 'Direct message'}
            </Text>
          </YStack>
          {(messages ?? []).map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isGroup={!!conversation?.isGroup}
            />
          ))}
        </ScrollView>
      )}

      <XStack
        alignItems="flex-end"
        gap={8}
        paddingHorizontal={16}
        paddingTop={8}
        paddingBottom={insets.bottom + 8}
        borderTopWidth={1}
        borderTopColor="outlineVariant"
        backgroundColor="surface"
      >
        <YStack
          flex={1}
          borderRadius="lg"
          borderWidth={1}
          borderColor="outlineVariant"
          backgroundColor="surfaceContainerLowest"
          paddingHorizontal={14}
          minHeight={44}
          justifyContent="center"
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={theme.colors.outline}
            multiline
            style={{ maxHeight: 120, paddingVertical: 10, color: theme.colors.onSurface, fontSize: 15, lineHeight: 20, fontFamily: theme.typography.bodyMd.fontFamily }}
          />
        </YStack>
        <PressableScale
          onPress={submit}
          disabled={!draft.trim() || send.isPending}
          accessibilityLabel="Send message"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: draft.trim() ? theme.colors.primary : theme.colors.surfaceContainerHigh,
          }}
        >
          <Icon name="send" size={20} color={draft.trim() ? 'onPrimary' : 'onSurfaceVariant'} />
        </PressableScale>
      </XStack>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, isGroup }: { message: ChatMessage; isGroup: boolean }) {
  const theme = useTheme();
  const mine = message.isMine;

  if (message.system) {
    return (
      <YStack alignItems="center" paddingVertical={4}>
        <Text variant="bodyXs" muted style={{ textAlign: 'center' }}>
          {message.body}
        </Text>
      </YStack>
    );
  }

  const bubbleBackground = mine ? theme.colors.primary : theme.colors.surfaceContainerLow;

  return (
    <XStack justifyContent={mine ? 'flex-end' : 'flex-start'} gap={8}>
      {!mine && isGroup ? (
        <Avatar uri={message.authorAvatar} name={message.authorName} size={28} ring="none" />
      ) : null}
      <YStack maxWidth="78%" gap={3}>
        {!mine && isGroup ? (
          <Text variant="bodyXs" muted style={{ marginLeft: 4 }}>
            {message.authorName}
          </Text>
        ) : null}
        <View
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 18,
            borderTopRightRadius: mine ? 6 : 18,
            borderTopLeftRadius: mine ? 18 : 6,
            backgroundColor: bubbleBackground,
          }}
        >
          <Text variant="bodyMd" color={mine ? 'onPrimary' : 'onSurface'}>
            {message.body}
          </Text>
        </View>
        <XStack alignItems="center" gap={4} alignSelf={mine ? 'flex-end' : 'flex-start'} marginHorizontal={4}>
          <Text variant="bodyXs" muted>
            {formatTime(message.sentAt)}
          </Text>
          {mine ? <Icon name="check" size={12} color="onSurfaceVariant" /> : null}
        </XStack>
      </YStack>
    </XStack>
  );
}
