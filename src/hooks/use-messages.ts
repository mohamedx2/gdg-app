import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { ChatMessage, Conversation } from '@/types';

export function useConversations(): UseQueryResult<Conversation[]> {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => api.messages.conversations(),
  });
}

export function useMessages(conversationId: string): UseQueryResult<ChatMessage[]> {
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => api.messages.messages(conversationId),
    enabled: !!conversationId,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<ChatMessage, unknown, string>({
    mutationFn: (body) => api.messages.send(conversationId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation<Conversation[], unknown, string>({
    mutationFn: (conversationId) => api.messages.markRead(conversationId),
    onSuccess: (conversations) => {
      queryClient.setQueryData(queryKeys.conversations, conversations);
    },
  });
}
