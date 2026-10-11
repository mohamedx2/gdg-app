import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { ClubStats } from '@/types';

export function useClubStats(): UseQueryResult<ClubStats> {
  return useQuery({
    queryKey: queryKeys.clubStats,
    queryFn: () => api.stats.club(),
  });
}
