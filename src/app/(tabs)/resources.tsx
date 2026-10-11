import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { FilterChip } from '@/components/ui/Chip';
import { Reveal } from '@/components/ui/Reveal';
import { ScreenHeading } from '@/components/ui/Screen';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { SearchBar } from '@/components/ui/SearchBar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { ResourceCard } from '@/components/ResourceCard';
import { useDebouncedValue } from '@/hooks/use-misc';
import { useResources } from '@/hooks/use-resources';
import { useUiConfig } from '@/hooks/use-content';
import type { ResourceDifficulty, ResourceType } from '@/types';

export default function ResourcesScreen() {
  const insets = useSafeAreaInsets();
  const { resourcesDifficultyFilters: DIFFICULTIES, resourcesTypeFilters: TYPES } = useUiConfig();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  const debounced = useDebouncedValue(query, 250);

  const { data, isPending, isError, error, refetch } = useResources({
    search: debounced,
    difficulty: difficulty as ResourceDifficulty | 'all',
    type: type as ResourceType | 'all',
    page: 1,
  });

  const resources = data?.data ?? [];

  return (
    <YStack flex={1} backgroundColor="background">
      <YStack paddingTop={insets.top + 8} paddingHorizontal={16} gap={14}>
        <Reveal>
          <ScreenHeading
            title="Resources"
            subtitle="Codelabs, courses & talks"
            right={
              <Text variant="codeSm" muted>
                {data?.total ?? '…'} items
              </Text>
            }
          />
        </Reveal>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search codelabs, courses…" />
        <XStack gap={8} flexWrap="wrap">
          {DIFFICULTIES.map((item) => (
            <FilterChip key={item.key} label={item.label} active={difficulty === item.key} onPress={() => setDifficulty(item.key)} />
          ))}
        </XStack>
        <XStack gap={8} flexWrap="wrap">
          {TYPES.map((item) => (
            <FilterChip key={item.key} label={item.label} icon={item.key === 'codelab' ? 'terminal' : item.key === 'video' ? 'playCircle' : item.key === 'article' ? 'article' : 'school'} active={type === item.key} onPress={() => setType(item.key)} />
          ))}
        </XStack>
      </YStack>

      {isError ? (
        <YStack padding={16}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </YStack>
      ) : null}

      {isPending && resources.length === 0 ? (
        <YStack padding={16} gap={12}>
          {[1, 2].map((key) => <SkeletonCard key={key} />)}
        </YStack>
      ) : null}

      {!isPending && resources.length === 0 ? (
        <EmptyState
          icon="menuBook"
          title="No resources match"
          message="Try another keyword, level or type."
          actionLabel="Clear filters"
          onAction={() => {
            setQuery('');
            setDifficulty('all');
            setType('all');
          }}
        />
      ) : null}

      <FlashList
        data={resources}
        keyExtractor={(resource) => (resource as { id: string }).id}
        numColumns={2}
        contentContainerStyle={{ padding: 16, paddingBottom: 112, gap: 12 }}
        renderItem={({ item }) => <ResourceCard resource={item} />}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}