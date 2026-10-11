import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { useTheme } from '@/theme';
import type { ResourceDifficulty, ResourceType } from '@/types';

const DIFFICULTIES = [
  { key: 'all', label: 'All levels' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
] as const;

const TYPES = [
  { key: 'all', label: 'All types' },
  { key: 'codelab', label: 'Codelabs' },
  { key: 'video', label: 'Videos' },
  { key: 'article', label: 'Articles' },
  { key: 'course', label: 'Courses' },
] as const;

export default function ResourcesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, gap: 14 }}>
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
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {DIFFICULTIES.map((item) => (
            <FilterChip key={item.key} label={item.label} active={difficulty === item.key} onPress={() => setDifficulty(item.key)} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {TYPES.map((item) => (
            <FilterChip key={item.key} label={item.label} icon={item.key === 'codelab' ? 'terminal' : item.key === 'video' ? 'playCircle' : item.key === 'article' ? 'article' : 'school'} active={type === item.key} onPress={() => setType(item.key)} />
          ))}
        </View>
      </View>

      {isError ? (
        <View style={{ padding: 16 }}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </View>
      ) : null}

      {isPending && resources.length === 0 ? (
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2].map((key) => <SkeletonCard key={key} />)}
        </View>
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
    </View>
  );
}