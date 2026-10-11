import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { Paged, Resource, ResourceProgress, ResourceQuery } from '@/types';

export function useResources(query: ResourceQuery = {}): UseQueryResult<Paged<Resource>> {
  return useQuery({
    queryKey: queryKeys.resources(query as Record<string, unknown>),
    queryFn: () => api.resources.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useResource(id: string | undefined): UseQueryResult<Resource> {
  return useQuery({
    queryKey: queryKeys.resource(id ?? ''),
    queryFn: () => api.resources.get(id!),
    enabled: Boolean(id),
  });
}

export function useRecommendedResources(limit = 4): UseQueryResult<Resource[]> {
  return useQuery({
    queryKey: queryKeys.resources({ recommended: limit }),
    queryFn: () => api.resources.recommended(limit),
  });
}

export function useBookmarks(): UseQueryResult<Resource[]> {
  return useQuery({
    queryKey: queryKeys.bookmarks,
    queryFn: () => api.resources.bookmarks(),
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation<boolean, unknown, { resourceId: string; title: string }>({
    mutationFn: ({ resourceId }) => api.resources.toggleBookmark(resourceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
      void queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useResourceProgress(resourceId: string | undefined): UseQueryResult<ResourceProgress> {
  return useQuery({
    queryKey: ['resource-progress', resourceId],
    queryFn: () => api.resources.progress(resourceId!),
    enabled: Boolean(resourceId),
  });
}

export function useSetResourceProgress() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, { resourceId: string; progress: ResourceProgress }>({
    mutationFn: ({ resourceId, progress }) => api.resources.setProgress(resourceId, progress),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['resource-progress', variables.resourceId] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.achievementSummary });
      void queryClient.invalidateQueries({ queryKey: queryKeys.badges });
    },
  });
}
