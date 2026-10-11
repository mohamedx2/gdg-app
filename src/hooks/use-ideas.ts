import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { CreateIdeaInput, Idea, IdeaStatus } from '@/types';

export function useIdeas(): UseQueryResult<Idea[]> {
  return useQuery({
    queryKey: queryKeys.ideas,
    queryFn: () => api.ideas.list(),
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation<Idea, unknown, CreateIdeaInput>({
    mutationFn: (input) => api.ideas.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ideas });
      void queryClient.invalidateQueries({ queryKey: queryKeys.achievementSummary });
      void queryClient.invalidateQueries({ queryKey: queryKeys.badges });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useToggleIdeaVote() {
  const queryClient = useQueryClient();

  return useMutation<Idea, unknown, string>({
    mutationFn: (id) => api.ideas.toggleVote(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ideas });
    },
  });
}

export function useUpdateIdeaStatus() {
  const queryClient = useQueryClient();

  return useMutation<Idea, unknown, { id: string; status: IdeaStatus; response?: string }>({
    mutationFn: ({ id, status, response }) => api.ideas.updateStatus(id, status, response),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ideas });
    },
  });
}
