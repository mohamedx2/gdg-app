import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { api, queryKeys } from '@/lib/api';
import { APP_BUNDLED, UI_BUNDLED, type AppMeta, type UiConfig } from '@/constants/content';
import { TAXONOMY_BUNDLED, type TaxonomyConfig } from '@/constants/taxonomy';
import { MEMORIES, MEMORY_ASSETS, type Memory, type MemoryRecord } from '@/constants/memories';

const BUNDLED_MEMORY_RECORDS: MemoryRecord[] = MEMORIES.map((memory, index) => ({
  id: memory.id,
  imageUrl: '',
  caption: memory.caption,
  portrait: memory.portrait,
  sortOrder: index,
}));

/**
 * Server-driven config, shallow-merged over the bundled defaults so screens
 * always have a value (and keep working offline / before the seed runs).
 */
export function useAppConfig(): { app: AppMeta; taxonomy: TaxonomyConfig; ui: UiConfig } {
  const { data } = useQuery({
    queryKey: queryKeys.appConfig,
    queryFn: () => api.content.config(),
  });

  return useMemo(
    () => ({
      app: { ...APP_BUNDLED, ...(data?.app ?? {}) },
      taxonomy: { ...TAXONOMY_BUNDLED, ...(data?.taxonomy ?? {}) },
      ui: { ...UI_BUNDLED, ...(data?.ui ?? {}) },
    }),
    [data],
  );
}

export function useAppMeta(): AppMeta {
  return useAppConfig().app;
}

export function useTaxonomy(): TaxonomyConfig {
  return useAppConfig().taxonomy;
}

export function useUiConfig(): UiConfig {
  return useAppConfig().ui;
}

/** Gallery photos, resolved to a bundled asset when the API has no image URL. */
export function useMemories(): Memory[] {
  const { data } = useQuery({
    queryKey: queryKeys.memories,
    queryFn: () => api.content.memories(),
  });

  const records = data && data.length > 0 ? data : BUNDLED_MEMORY_RECORDS;
  return useMemo(
    () =>
      records.map((memory) => ({
        id: memory.id,
        source: memory.imageUrl ? { uri: memory.imageUrl } : MEMORY_ASSETS[memory.id],
        caption: memory.caption,
        portrait: memory.portrait,
      })),
    [records],
  );
}
