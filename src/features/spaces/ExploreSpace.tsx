import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { EventCard } from '@/components/EventCard';
import { ResourceCard } from '@/components/ResourceCard';
import { Avatar } from '@/components/ui/Avatar';
import { FilterChip, Pill } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { SearchBar } from '@/components/ui/SearchBar';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useTaxonomy, useUiConfig } from '@/hooks/use-content';
import { useEvents } from '@/hooks/use-events';
import { useMembers } from '@/hooks/use-members';
import { useDebouncedValue } from '@/hooks/use-misc';
import { useResources } from '@/hooks/use-resources';
import { useTheme } from '@/theme';
import type { GdgEvent, Member, ResourceDifficulty, ResourceType, Track } from '@/types';

import { SPACE_BOTTOM_PADDING } from './SpaceScaffold';

type ExploreSegment = 'events' | 'people' | 'learn';

const SEGMENTS: readonly Segment<ExploreSegment>[] = [
  { value: 'events', label: 'Events' },
  { value: 'people', label: 'People' },
  { value: 'learn', label: 'Learn' },
];

/** EXPLORE — a single search surface over events, people and resources. */
export function ExploreSpace() {
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState<ExploreSegment>('events');
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 250);

  const placeholder =
    segment === 'events'
      ? 'Search workshops, talks, hackathons…'
      : segment === 'people'
        ? 'Search members…'
        : 'Search codelabs, courses…';

  return (
    <YStack flex={1}>
      <YStack paddingHorizontal={16} paddingTop={8} gap={12}>
        <Text variant="bodySm" muted>
          Sousse Hub · Season ’25
        </Text>
        <SearchBar value={query} onChangeText={setQuery} placeholder={placeholder} />
        <SegmentedControl<ExploreSegment>
          segments={SEGMENTS}
          value={segment}
          onChange={setSegment}
          accessibilityLabel="Explore section"
        />
      </YStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: SPACE_BOTTOM_PADDING + insets.bottom,
          gap: 12,
        }}
      >
        {segment === 'events' ? <EventsSegment search={debounced} /> : null}
        {segment === 'people' ? <PeopleSegment search={debounced} /> : null}
        {segment === 'learn' ? <LearnSegment search={debounced} /> : null}
      </ScrollView>
    </YStack>
  );
}

function EventsSegment({ search }: { search: string }) {
  const { homeTrackFilters: HOME_TRACK_FILTERS } = useTaxonomy();
  const [track, setTrack] = useState<'all' | Track>('all');
  const [showPast, setShowPast] = useState(false);
  const { data, isPending, isError, error, refetch } = useEvents({
    search,
    track,
    scope: showPast ? 'past' : 'upcoming',
    page: 1,
  });
  const events = data?.data ?? [];

  return (
    <Reveal>
      <YStack gap={12}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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

        {isError ? <ErrorState message={error?.message} onRetry={() => refetch()} /> : null}
        {isPending && events.length === 0 ? [1, 2, 3, 4].map((key) => <SkeletonCard key={key} />) : null}
        {!isPending && events.length === 0 ? (
          <EmptyState
            icon={showPast ? 'history' : 'eventNote'}
            title={showPast ? 'No past events yet' : 'No events match'}
            message="Try clearing the search or picking another track."
            actionLabel="Clear filters"
            onAction={() => setTrack('all')}
          />
        ) : null}
        {events.map((event: GdgEvent) => (
          <EventCard key={event.id} event={event} />
        ))}
      </YStack>
    </Reveal>
  );
}

function PeopleSegment({ search }: { search: string }) {
  const { communityRoleFilters: ROLE_FILTERS } = useUiConfig();
  const [role, setRole] = useState<string>('all');
  const { data, isPending, isError, error, refetch } = useMembers({ search, role });
  const members = data?.data ?? [];

  return (
    <YStack gap={12}>
      <XStack gap={8} flexWrap="wrap">
        {ROLE_FILTERS.map((item) => (
          <FilterChip key={item.key} label={item.label} active={role === item.key} onPress={() => setRole(item.key)} />
        ))}
      </XStack>

      {isError ? <ErrorState message={error?.message} onRetry={() => refetch()} /> : null}
      {isPending && members.length === 0 ? (
        <XStack gap={12}>
          <YStack flex={1}>
            <SkeletonCard />
          </YStack>
          <YStack flex={1}>
            <SkeletonCard />
          </YStack>
        </XStack>
      ) : null}
      {!isPending && members.length === 0 ? (
        <EmptyState
          icon="people"
          title="No members found"
          message="Try a different keyword or role filter."
          actionLabel="Clear filter"
          onAction={() => setRole('all')}
        />
      ) : null}

      <XStack flexWrap="wrap" gap={12}>
        {members.map((member: Member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </XStack>
    </YStack>
  );
}

function LearnSegment({ search }: { search: string }) {
  const { resourcesDifficultyFilters: DIFFICULTIES, resourcesTypeFilters: TYPES } = useUiConfig();
  const [difficulty, setDifficulty] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  const { data, isPending, isError, error, refetch } = useResources({
    search,
    difficulty: difficulty as ResourceDifficulty | 'all',
    type: type as ResourceType | 'all',
    page: 1,
  });
  const resources = data?.data ?? [];

  return (
    <YStack gap={12}>
      <XStack gap={8} flexWrap="wrap">
        {DIFFICULTIES.map((item) => (
          <FilterChip
            key={item.key}
            label={item.label}
            active={difficulty === item.key}
            onPress={() => setDifficulty(item.key)}
          />
        ))}
      </XStack>
      <XStack gap={8} flexWrap="wrap">
        {TYPES.map((item) => (
          <FilterChip
            key={item.key}
            label={item.label}
            icon={item.key === 'codelab' ? 'terminal' : item.key === 'video' ? 'playCircle' : item.key === 'article' ? 'article' : 'school'}
            active={type === item.key}
            onPress={() => setType(item.key)}
          />
        ))}
      </XStack>

      {isError ? <ErrorState message={error?.message} onRetry={() => refetch()} /> : null}
      {isPending && resources.length === 0 ? (
        <XStack gap={12}>
          <YStack flex={1}>
            <SkeletonCard />
          </YStack>
          <YStack flex={1}>
            <SkeletonCard />
          </YStack>
        </XStack>
      ) : null}
      {!isPending && resources.length === 0 ? (
        <EmptyState
          icon="menuBook"
          title="No resources match"
          message="Try another keyword, level or type."
          actionLabel="Clear filters"
          onAction={() => {
            setDifficulty('all');
            setType('all');
          }}
        />
      ) : null}

      <XStack flexWrap="wrap" gap={12}>
        {resources.map((resource) => (
          <YStack key={resource.id} flexBasis="47%" flexGrow={1}>
            <ResourceCard resource={resource} />
          </YStack>
        ))}
      </XStack>
    </YStack>
  );
}

function MemberCard({ member }: { member: Member }) {
  const theme = useTheme();
  const { memberRoles: MEMBER_ROLES } = useTaxonomy();
  const roleMeta = MEMBER_ROLES[member.role];
  const accent =
    member.role === 'core-team'
      ? 'secondary'
      : member.role === 'speaker'
        ? 'primary'
        : member.role === 'alumni'
          ? 'tertiary'
          : 'outline';
  return (
    <PressableScale
      onPress={() => router.push(`/community/${member.id}`)}
      accessibilityLabel={`Open ${member.name}'s profile`}
      style={{
        flexBasis: '47%',
        flexGrow: 1,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderRadius: theme.radius.card,
        padding: 14,
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
      }}
    >
      <XStack alignItems="center" justifyContent="space-between">
        <Avatar
          uri={member.avatar}
          name={member.name}
          size={52}
          online={member.online}
          style={{ borderWidth: 2, borderColor: theme.colors[accent] }}
        />
        <Icon name="arrowForward" size={16} color="outline" />
      </XStack>
      <Text variant="labelLg" weight="bold" numberOfLines={1}>
        {member.name}
      </Text>
      <Pill label={roleMeta.label} color={roleMeta.chipColor} dot />
      <Text variant="bodySm" muted numberOfLines={2}>
        {member.headline}
      </Text>
    </PressableScale>
  );
}

export default ExploreSpace;
