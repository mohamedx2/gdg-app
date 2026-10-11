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
          <Avatar uri={conversation.avatar} name={conversation.name} size={44} online={conversation.online} />
        ) : (
          <YStack width={44} height={44} borderRadius={22} alignItems="center" justifyContent="center" backgroundColor="tertiaryContainer">
            <Icon name="groups" size={20} color="onTertiaryContainer" />
          </YStack>
        )}
        <YStack flex={1} gap={3}>
          <XStack alignItems="center" gap={8}>
            <Text variant="titleMd" weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
              {conversation?.name ?? 'Conversation'}
            </Text>
            {conversation?.online ? (
              <YStack paddingHorizontal={6} paddingVertical={1} borderRadius={6} backgroundColor="tertiaryFixed">
                <Text variant="codeSm" weight="bold" color="onTertiaryFixedVariant">
                  ACTIVE
                </Text>
              </YStack>
            ) : null}
          </XStack>
          {conversation?.context ? (
            <YStack alignSelf="flex-start" paddingHorizontal={8} paddingVertical={2} borderRadius={8} backgroundColor="surfaceContainerHigh">
              <Text variant="codeSm" muted numberOfLines={1}>
                {conversation.context}
              </Text>
            </YStack>
          ) : null}
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
          <XStack alignItems="center" gap={10} paddingVertical={8}>
            <YStack flex={1} height={1} backgroundColor="outlineVariant" />
            <YStack paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="surfaceContainerHigh">
              <Text variant="codeSm" weight="bold" muted>
                {dayStamp(messages?.[0]?.sentAt)}
              </Text>
            </YStack>
            <YStack flex={1} height={1} backgroundColor="outlineVariant" />
          </XStack>
          {(messages ?? []).map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isGroup={!!conversation?.isGroup}
            />
          ))}
        </ScrollView>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}
      >
        {QUICK_REPLIES.map((reply) => (
          <PressableScale key={reply} onPress={() => setDraft(reply)} accessibilityLabel={`Quick reply: ${reply}`}>
            <YStack height={36} paddingHorizontal={14} borderRadius="full" justifyContent="center" backgroundColor="surfaceContainerHigh">
              <Text variant="labelMd" weight="semibold">
                {reply}
              </Text>
            </YStack>
          </PressableScale>
        ))}
      </ScrollView>

      <XStack alignItems="flex-end" gap={8} paddingHorizontal={16} paddingBottom={insets.bottom + 8}>
        <YStack
          flex={1}
          borderRadius="full"
          borderWidth={1}
          borderColor="outlineVariant"
          backgroundColor="surfaceContainerLowest"
          paddingHorizontal={18}
          minHeight={48}
          justifyContent="center"
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Message ${conversation?.name?.split(' ')[0] ?? ''}…`}
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
            width: 48,
            height: 48,
            borderRadius: 24,
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
      {!mine ? <Avatar uri={message.authorAvatar} name={message.authorName} size={28} ring="none" /> : null}
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
            borderRadius: 20,
            borderBottomRightRadius: mine ? 6 : 20,
            borderBottomLeftRadius: mine ? 20 : 6,
            backgroundColor: bubbleBackground,
          }}
        >
          <Text variant="bodyMd" color={mine ? 'onPrimary' : 'onSurface'}>
            {message.body}
          </Text>
        </View>
        <XStack alignItems="center" gap={4} alignSelf={mine ? 'flex-end' : 'flex-start'} marginHorizontal={4}>
          <Text variant="codeSm" muted>
            {formatTime(message.sentAt)}
          </Text>
          {mine ? (
            <Icon name={message.delivery === 'read' ? 'markChatRead' : 'check'} size={13} color={message.delivery === 'read' ? 'primary' : 'onSurfaceVariant'} />
          ) : null}
        </XStack>
      </YStack>
    </XStack>
  );
}

const QUICK_REPLIES = ['👍 Looks good', 'On my way!', 'Thanks!', 'See you there'];

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** "TODAY · FRI 28 MAR" style divider for the first message's day. */
function dayStamp(sentAt?: string): string {
  const date = sentAt ? new Date(sentAt) : new Date();
  const today = new Date().toDateString() === date.toDateString();
  return `${today ? 'TODAY · ' : ''}${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}
