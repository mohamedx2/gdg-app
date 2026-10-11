import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { EventCard } from '@/components/EventCard';
import { FilterChip } from '@/components/ui/Chip';
import { Reveal } from '@/components/ui/Reveal';
import { ScreenHeading } from '@/components/ui/Screen';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { SearchBar } from '@/components/ui/SearchBar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useDebouncedValue } from '@/hooks/use-misc';
import { useEvents } from '@/hooks/use-events';
import type { GdgEvent, Track } from '@/types';

export default function EventsScreen() {
  const { homeTrackFilters: HOME_TRACK_FILTERS } = useTaxonomy();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ search?: string }>();
  const [query, setQuery] = useState(params.search ?? '');
  const [track, setTrack] = useState<'all' | Track>('all');
  const [showPast, setShowPast] = useState(false);
  const debounced = useDebouncedValue(query, 250);

  const { data, isPending, isError, error, refetch } = useEvents({
    search: debounced,
    track,
    scope: showPast ? 'past' : 'upcoming',
    page: 1,
  });

  const events = data?.data ?? [];

  return (
    <YStack flex={1} backgroundColor="background">
      <YStack paddingTop={insets.top + 8} paddingHorizontal={16} gap={14}>
        <Reveal>
          <ScreenHeading
            title="Events"
            subtitle="Workshops, talks & hackathons"
            right={
              <Text variant="codeSm" muted>
                {events.length} {showPast ? 'past' : 'upcoming'}
              </Text>
            }
          />
        </Reveal>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search workshops, talks, hackathons…" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          {HOME_TRACK_FILTERS.map((item) => (
            <FilterChip
              key={item.key}
              label={item.label}
              active={track === item.key}
              onPress={() => setTrack(item.key as 'all' | Track)}
            />
          ))}
          <FilterChip
            label={showPast ? 'Hide past' : 'Past events'}
            icon="history"
            active={showPast}
            onPress={() => setShowPast(!showPast)}
          />
        </ScrollView>
      </YStack>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 112, gap: 12 }} showsVerticalScrollIndicator={false}>
        <XStack alignItems="center" justifyContent="space-between">
          <Text variant="labelMd" weight="semibold" muted style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {showPast ? 'Previously at GDG EPI' : 'Upcoming events'}
          </Text>
          <Text variant="codeSm" muted>
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </Text>
        </XStack>

        {isError ? <ErrorState message={error?.message} onRetry={() => refetch()} /> : null}

        {isPending && events.length === 0
          ? [1, 2, 3, 4].map((key) => <SkeletonCard key={key} />)
          : null}

        {!isPending && events.length === 0 ? (
          <EmptyState
            icon={showPast ? 'history' : 'eventNote'}
            title={showPast ? 'No past events yet' : 'No events match'}
            message="Try clearing the search or picking another track."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('');
              setTrack('all');
            }}
          />
        ) : null}

        {events.map((event: GdgEvent) => (
          <EventCard key={event.id} event={event} />
        ))}
      </ScrollView>
    </YStack>
  );
}