import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { CreateDecisionInput, Decision } from '@/types';

export function useDecisions(): UseQueryResult<Decision[]> {
  return useQuery({
    queryKey: queryKeys.decisions,
    queryFn: () => api.decisions.list(),
  });
}

export function useVoteDecision() {
  const queryClient = useQueryClient();

  return useMutation<Decision, unknown, { id: string; optionId: string }>({
    mutationFn: ({ id, optionId }) => api.decisions.vote(id, optionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.decisions });
    },
  });
}

export function useCreateDecision() {
  const queryClient = useQueryClient();

  return useMutation<Decision, unknown, CreateDecisionInput>({
    mutationFn: (input) => api.decisions.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.decisions });
    },
  });
}
