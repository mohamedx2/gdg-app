import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { Squad } from '@/types';

export function useSquads(): UseQueryResult<Squad[]> {
  return useQuery({
    queryKey: queryKeys.squads,
    queryFn: () => api.squads.list(),
  });
}

export function useMySquad(): UseQueryResult<Squad | null> {
  return useQuery({
    queryKey: queryKeys.mySquad,
    queryFn: () => api.squads.mine(),
  });
}

export function useJoinSquad() {
  const queryClient = useQueryClient();

  return useMutation<Squad, unknown, string>({
    mutationFn: (id) => api.squads.join(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.squads });
      void queryClient.invalidateQueries({ queryKey: queryKeys.mySquad });
      void queryClient.invalidateQueries({ queryKey: queryKeys.quests });
      void queryClient.invalidateQueries({ queryKey: queryKeys.achievementSummary });
      void queryClient.invalidateQueries({ queryKey: queryKeys.badges });
    },
  });
}

export function useLeaveSquad() {
  const queryClient = useQueryClient();

  return useMutation<void>({
    mutationFn: () => api.squads.leave(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.squads });
      void queryClient.invalidateQueries({ queryKey: queryKeys.mySquad });
    },
  });
}
