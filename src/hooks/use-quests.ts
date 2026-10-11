import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { Quest } from '@/types';

export function useQuests(): UseQueryResult<Quest[]> {
  return useQuery({
    queryKey: queryKeys.quests,
    queryFn: () => api.quests.list(),
  });
}

export function useClaimQuest() {
  const queryClient = useQueryClient();

  return useMutation<Quest, unknown, string>({
    mutationFn: (id) => api.quests.claim(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.quests });
      void queryClient.invalidateQueries({ queryKey: queryKeys.achievementSummary });
      void queryClient.invalidateQueries({ queryKey: queryKeys.badges });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}
