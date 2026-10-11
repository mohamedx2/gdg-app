import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { ArrivalEta, MyPresence, PresenceMember, PresenceOverview, UpdatePresenceInput } from '@/types';

export function useMyPresence(): UseQueryResult<MyPresence> {
  return useQuery({
    queryKey: queryKeys.presenceMine,
    queryFn: () => api.presence.mine(),
  });
}

export function usePresenceOverview(): UseQueryResult<PresenceOverview> {
  return useQuery({
    queryKey: queryKeys.presenceOverview,
    queryFn: () => api.presence.overview(),
  });
}

/** Individual statuses are core-team only — pass `enabled: false` for members. */
export function usePresenceRoster(enabled = true): UseQueryResult<PresenceMember[]> {
  return useQuery({
    queryKey: queryKeys.presenceRoster,
    queryFn: () => api.presence.roster(),
    enabled,
  });
}

export function useArrivals(eventId: string, enabled = true): UseQueryResult<ArrivalEta[]> {
  return useQuery({
    queryKey: queryKeys.presenceArrivals(eventId),
    queryFn: () => api.presence.arrivals(eventId),
    enabled: enabled && Boolean(eventId),
  });
}

export function useUpdatePresence() {
  const queryClient = useQueryClient();

  return useMutation<MyPresence, unknown, UpdatePresenceInput>({
    mutationFn: (input) => api.presence.update(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.presenceMine });
      void queryClient.invalidateQueries({ queryKey: queryKeys.presenceOverview });
      void queryClient.invalidateQueries({ queryKey: ['presence', 'arrivals'] });
    },
  });
}

export function useStopPresence() {
  const queryClient = useQueryClient();

  return useMutation<MyPresence, unknown, void>({
    mutationFn: () => api.presence.stop(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.presenceMine });
      void queryClient.invalidateQueries({ queryKey: queryKeys.presenceOverview });
      void queryClient.invalidateQueries({ queryKey: ['presence', 'arrivals'] });
    },
  });
}
