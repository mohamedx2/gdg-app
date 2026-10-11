import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { Stagger } from '@/components/animations';
import { ResourceCard } from '@/components/ResourceCard';
import { Avatar } from '@/components/ui/Avatar';
import { FilterChip } from '@/components/ui/Chip';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { SearchBar } from '@/components/ui/SearchBar';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { useTaxonomy, useUiConfig } from '@/hooks/use-content';
import { useAttendance, useEvents } from '@/hooks/use-events';
import { useMembers, useToggleConnection } from '@/hooks/use-members';
import { useDebouncedValue } from '@/hooks/use-misc';
import { useResources } from '@/hooks/use-resources';
import { useUiStore } from '@/stores/ui.store';
import type { ColorToken } from '@/theme/colors';
import type { GdgEvent, Member, ResourceDifficulty, ResourceType, Track } from '@/types';
import { formatTime, isPast, parseDate } from '@/utils/date';

import { SPACE_BOTTOM_PADDING } from './SpaceScaffold';
import { useRouteSegment } from './use-route-segment';

type ExploreSegment = 'events' | 'people' | 'learn';

const SEGMENT_KEYS = ['events', 'people', 'learn'] as const;

const SEGMENTS: readonly Segment<ExploreSegment>[] = [
  { value: 'events', label: 'Events' },
  { value: 'people', label: 'People' },
  { value: 'learn', label: 'Learn' },
];

const MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const GOOGLE_DOTS: ColorToken[] = ['error', 'info', 'warning', 'success'];

/** EXPLORE — one search surface over events, people and learning resources. */
export function ExploreSpace() {
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useRouteSegment<ExploreSegment>(SEGMENT_KEYS, 'events');
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 250);

  const placeholder =
    segment === 'events'
      ? 'Search events, tracks, speakers…'
      : segment === 'people'
        ? 'Search student devs, leads, alumni, skills…'
        : 'Search codelabs, courses, videos…';

  return (
    <YStack flex={1}>
      <YStack paddingHorizontal={16} paddingTop={6} gap={12}>
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={5} borderRadius="full" backgroundColor="surfaceContainerHigh">
            <GoogleDots />
            <Text variant="codeSm" weight="bold" muted>
              SOUSSE HUB
            </Text>
          </XStack>
          <XStack alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={5} borderRadius="full" backgroundColor="tertiaryFixed">
            <YStack width={6} height={6} borderRadius={3} backgroundColor="live" />
            <Text variant="codeSm" weight="bold" color="onTertiaryFixedVariant">
              SEASON ACTIVE
            </Text>
          </XStack>
        </XStack>
        <SearchBar value={query} onChangeText={setQuery} placeholder={placeholder} />
        <SegmentedControl<ExploreSegment> segments={SEGMENTS} value={segment} onChange={setSegment} accessibilityLabel="Explore section" />
      </YStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 14, paddingBottom: SPACE_BOTTOM_PADDING + insets.bottom, gap: 14 }}
      >
        {segment === 'events' ? <EventsSegment search={debounced} /> : null}
        {segment === 'people' ? <PeopleSegment search={debounced} /> : null}
        {segment === 'learn' ? <LearnSegment search={debounced} /> : null}
      </ScrollView>
    </YStack>
  );
}

function GoogleDots() {
  return (
    <XStack gap={3}>
      {GOOGLE_DOTS.map((color) => (
        <YStack key={color} width={6} height={6} borderRadius={3} backgroundColor={color} />
      ))}
    </XStack>
  );
}

// ── Events ──────────────────────────────────────────────────────────

function EventsSegment({ search }: { search: string }) {
  const { homeTrackFilters, tracks } = useTaxonomy();
  const [track, setTrack] = useState<'all' | Track>('all');
  const [showPast, setShowPast] = useState(false);
  const { data, isPending, isError, error, refetch } = useEvents({ search, track, scope: showPast ? 'past' : 'upcoming', page: 1 });
  const events = data?.data ?? [];

  return (
    <YStack gap={14}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {homeTrackFilters.map((item) => (
          <FilterChip
            key={item.key}
            label={item.key === 'all' ? 'All' : item.label}
            dot={item.key === 'all' ? undefined : tracks[item.key as Track]?.color}
            count={item.key === 'all' && data ? data.total : undefined}
            active={track === item.key}
            onPress={() => setTrack(item.key as 'all' | Track)}
          />
        ))}
        <FilterChip label={showPast ? 'Upcoming' : 'Past'} icon="history" active={showPast} onPress={() => setShowPast(!showPast)} />
      </ScrollView>

      <XStack paddingHorizontal={16} alignItems="flex-end" justifyContent="space-between">
        <XStack alignItems="baseline" gap={8}>
          <Text variant="headlineSm" weight="bold">
            {showPast ? 'Past Lineup' : 'Upcoming Lineup'}
          </Text>
          <Text variant="codeSm" muted>
            {showPast ? 'Season recap' : `Season ’${String(new Date().getFullYear()).slice(2)}`}
          </Text>
        </XStack>
        {data ? (
          <Text variant="codeSm" weight="bold" primary>
            {data.total} {showPast ? 'HELD' : 'READY'}
          </Text>
        ) : null}
      </XStack>

      <YStack paddingHorizontal={16} gap={14}>
        {isError ? <ErrorState message={error?.message} onRetry={() => refetch()} /> : null}
        {isPending && events.length === 0 ? [1, 2, 3].map((key) => <Skeleton key={key} height={200} radius={22} />) : null}
        {!isPending && !isError && events.length === 0 ? (
          <EmptyState
            icon={showPast ? 'history' : 'eventNote'}
            title={showPast ? 'No past events yet' : 'No upcoming events'}
            message={showPast ? 'Try another track or keyword.' : 'New dates are coming — browse past events meanwhile.'}
            actionLabel={showPast || track !== 'all' ? 'Clear filters' : 'See past events'}
            onAction={() => (showPast || track !== 'all' ? (setTrack('all'), setShowPast(false)) : setShowPast(true))}
          />
        ) : null}
        {events.map((event: GdgEvent, index) => (
          <Stagger key={event.id} index={Math.min(index, 6)}>
            <LineupCard event={event} />
          </Stagger>
        ))}
        {events.length ? <CallToAction icon="campaign" title="Got a talk to share?" body="Submit a talk for the next community session at EPI." label="Suggest" onPress={() => router.push('/(spaces)?space=voice&segment=ideas' as never)} /> : null}
      </YStack>
    </YStack>
  );
}

function LineupCard({ event }: { event: GdgEvent }) {
  const { tracks, eventCategories } = useTaxonomy();
  const { data: attendance } = useAttendance(event.id);
  const start = parseDate(event.startsAt);
  const ended = isPast(event.endsAt);
  const going = attendance === 'registered' || attendance === 'attended';
  const left = Math.max(0, event.capacity - event.registeredCount);
  const online = /ligne|online|meet/i.test(`${event.location} ${event.venue}`);
  const track = tracks[event.track];
  const open = () => router.push(`/events/${event.id}` as never);

  return (
    <PressableScale onPress={open} accessibilityLabel={`Open ${event.title}`}>
      <YStack padding={16} gap={14} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
        <XStack gap={14}>
          <YStack width={64} height={80} borderRadius={16} alignItems="center" justifyContent="center" backgroundColor="inverseSurface">
            <Text variant="codeSm" weight="bold" color="inversePrimary">
              {MONTH[start.getMonth()]}
            </Text>
            <Text variant="headlineMd" weight="bold" color="inverseOnSurface" style={{ fontFamily: 'JetBrainsMono_700Bold' }}>
              {String(start.getDate()).padStart(2, '0')}
            </Text>
            <Text variant="codeSm" color="outline">
              {DAY[start.getDay()]}
            </Text>
          </YStack>
          <YStack flex={1} gap={6}>
            <XStack gap={6} flexWrap="wrap">
              <Tag label={track?.label ?? event.track} dot={track?.color ?? 'primary'} />
              <Tag label={eventCategories[event.category]?.label ?? event.category} />
              {event.flagship ? <Tag label="Flagship" tone="gold" /> : null}
            </XStack>
            <Text variant="titleMd" weight="bold" numberOfLines={3}>
              {event.title}
            </Text>
            <MetaRow icon={online ? 'language' : 'location'} label={event.venue || event.location} />
            <MetaRow icon="schedule" label={`${formatTime(event.startsAt)} – ${formatTime(event.endsAt)} GMT+1`} mono />
          </YStack>
        </XStack>

        {event.speaker ? (
          <XStack alignItems="center" gap={10} padding={10} borderRadius={14} backgroundColor="surfaceContainerLow">
            <Avatar uri={event.speaker.avatar} name={event.speaker.name} size={32} />
            <YStack flex={1}>
              <Text variant="labelMd" weight="bold" numberOfLines={1}>
                {event.speaker.name}
              </Text>
              <Text variant="codeSm" muted numberOfLines={1}>
                {event.speaker.title}
              </Text>
            </YStack>
          </XStack>
        ) : null}

        <XStack alignItems="center" justifyContent="space-between" gap={10}>
          <YStack>
            <Text variant="codeSm" weight="bold">
              {event.registeredCount} / {event.capacity} {ended ? 'attended' : 'spots'}
            </Text>
            {!ended ? (
              <Text variant="codeSm" weight="bold" color={left <= 10 ? 'error' : 'tertiary'}>
                {left > 0 ? `${left} LEFT` : 'WAITLIST'}
              </Text>
            ) : null}
          </YStack>
          {ended ? (
            <ActionPill label="Recap" icon="chevronRight" onPress={open} />
          ) : going ? (
            <ActionPill label="Ticket" icon="qrCode" onPress={() => router.push(`/ticket/${event.id}` as never)} />
          ) : (
            <ActionPill label="RSVP Free" icon="arrowForward" primary onPress={open} />
          )}
        </XStack>
      </YStack>
    </PressableScale>
  );
}

function Tag({ label, dot, tone }: { label: string; dot?: ColorToken; tone?: 'gold' }) {
  return (
    <XStack alignItems="center" gap={5} paddingHorizontal={8} paddingVertical={3} borderRadius={8} backgroundColor={tone === 'gold' ? 'secondaryContainer' : 'surfaceContainerHigh'}>
      {dot ? <YStack width={6} height={6} borderRadius={3} backgroundColor={dot} /> : null}
      <Text variant="codeSm" weight="bold" color={tone === 'gold' ? 'onSecondaryContainer' : 'onSurfaceVariant'}>
        {label.toUpperCase()}
      </Text>
    </XStack>
  );
}

function MetaRow({ icon, label, mono }: { icon: IconName; label: string; mono?: boolean }) {
  return (
    <XStack alignItems="center" gap={6}>
      <Icon name={icon} size={15} color="onSurfaceVariant" />
      <Text variant={mono ? 'codeSm' : 'bodySm'} muted numberOfLines={1} style={{ flexShrink: 1 }}>
        {label}
      </Text>
    </XStack>
  );
}

function ActionPill({ label, icon, primary, onPress }: { label: string; icon: IconName; primary?: boolean; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label}>
      <XStack alignItems="center" gap={6} height={44} paddingHorizontal={16} borderRadius={14} backgroundColor={primary ? 'primary' : 'surfaceContainerHigh'}>
        <Text variant="labelLg" weight="bold" color={primary ? 'onPrimary' : 'onSurface'}>
          {label}
        </Text>
        <Icon name={icon} size={16} color={primary ? 'onPrimary' : 'onSurface'} />
      </XStack>
    </PressableScale>
  );
}

function CallToAction({ icon, title, body, label, onPress }: { icon: IconName; title: string; body: string; label: string; onPress: () => void }) {
  return (
    <XStack alignItems="center" gap={12} padding={16} borderRadius="card" backgroundColor="surfaceContainerLow">
      <YStack width={44} height={44} borderRadius={14} alignItems="center" justifyContent="center" backgroundColor="primaryFixed">
        <Icon name={icon} size={20} color="primary" />
      </YStack>
      <YStack flex={1}>
        <Text variant="labelLg" weight="bold">
          {title}
        </Text>
        <Text variant="bodySm" muted numberOfLines={2}>
          {body}
        </Text>
      </YStack>
      <ActionPill label={label} icon="arrowForward" onPress={onPress} />
    </XStack>
  );
}

// ── People ──────────────────────────────────────────────────────────

function PeopleSegment({ search }: { search: string }) {
  const { communityRoleFilters } = useUiConfig();
  const [role, setRole] = useState<string>('all');
  const { data, isPending, isError, error, refetch } = useMembers({ search, role });
  const members = data?.data ?? [];
  const online = members.filter((member) => member.online).length;

  return (
    <YStack gap={14}>
      <XStack paddingHorizontal={16} alignItems="flex-end" justifyContent="space-between">
        <YStack gap={2}>
          <XStack alignItems="center" gap={6}>
            <GoogleDots />
            <Text variant="codeSm" weight="bold" muted>
              DIRECTORY {new Date().getFullYear()}
            </Text>
          </XStack>
          <Text variant="headlineSm" weight="bold">
            Explore EPI
          </Text>
        </YStack>
        {data ? (
          <XStack alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={5} borderRadius="full" backgroundColor="tertiaryFixed">
            <Icon name="groups" size={14} color="onTertiaryFixedVariant" />
            <Text variant="codeSm" weight="bold" color="onTertiaryFixedVariant">
              {online || data.total} {online ? 'Online' : 'Members'}
            </Text>
          </XStack>
        ) : null}
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {communityRoleFilters.map((item) => (
          <FilterChip key={item.key} label={item.label} active={role === item.key} onPress={() => setRole(item.key)} />
        ))}
      </ScrollView>

      <YStack paddingHorizontal={16} gap={12}>
        {isError ? <ErrorState message={error?.message} onRetry={() => refetch()} /> : null}
        {isPending && members.length === 0 ? (
          <XStack gap={12}>
            {[1, 2].map((key) => (
              <YStack key={key} flex={1}>
                <Skeleton height={250} radius={22} />
              </YStack>
            ))}
          </XStack>
        ) : null}
        {!isPending && !isError && members.length === 0 ? (
          <EmptyState icon="people" title="No members found" message="Try a different keyword or role filter." actionLabel="Clear filter" onAction={() => setRole('all')} />
        ) : null}

        <XStack flexWrap="wrap" gap={12}>
          {members.map((member: Member, index) => (
            <YStack key={member.id} flexBasis="47%" flexGrow={1}>
              <Stagger index={Math.min(index, 6)}>
                <PersonCard member={member} />
              </Stagger>
            </YStack>
          ))}
        </XStack>

        {members.length ? (
          <CallToAction icon="rocketLaunch" title="Join a Tech Squad?" body="Weekly build cohorts, peer reviews & hack nights." label="Squads" onPress={() => router.push('/(spaces)?space=arena&segment=squads' as never)} />
        ) : null}
      </YStack>
    </YStack>
  );
}

function PersonCard({ member }: { member: Member }) {
  const { memberRoles } = useTaxonomy();
  const { isGuest } = useAuth();
  const toast = useUiStore((state) => state.toast);
  const connect = useToggleConnection();
  const role = memberRoles[member.role];
  const first = member.name.split(' ')[0];

  const onConnect = () => {
    if (isGuest) {
      toast('Sign in to connect with members', 'info');
      return;
    }
    connect.mutate(
      { memberId: member.id },
      {
        onSuccess: (connected) => toast(connected ? `Connection request sent to ${first}` : 'Connection removed', connected ? 'success' : 'neutral'),
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not toggle connection', 'error'),
      },
    );
  };

  return (
    <PressableScale onPress={() => router.push(`/community/${member.id}` as never)} accessibilityLabel={`Open ${member.name}'s profile`}>
      <YStack padding={14} gap={8} alignItems="center" borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
        <Avatar uri={member.avatar} name={member.name} size={72} online={member.online} />
        <Text variant="titleSm" weight="bold" numberOfLines={1}>
          {member.name}
        </Text>
        <YStack paddingHorizontal={8} paddingVertical={2} borderRadius={8} backgroundColor={role?.chipColor ?? 'surfaceContainerHigh'}>
          <Text variant="codeSm" weight="bold" color={role?.chipText ?? 'onSurfaceVariant'} numberOfLines={1}>
            {(role?.label ?? member.role).toUpperCase()}
          </Text>
        </YStack>
        <Text variant="bodySm" muted numberOfLines={1} style={{ textAlign: 'center' }}>
          {member.headline}
        </Text>
        {member.skills.length ? (
          <XStack gap={6} justifyContent="center" flexWrap="wrap" height={22} overflow="hidden">
            {member.skills.slice(0, 2).map((skill) => (
              <YStack key={skill} paddingHorizontal={6} paddingVertical={2} borderRadius={6} backgroundColor="surfaceContainerHigh">
                <Text variant="codeSm" primary numberOfLines={1}>
                  #{skill.replace(/\s+/g, '')}
                </Text>
              </YStack>
            ))}
          </XStack>
        ) : null}
        <PressableScale onPress={onConnect} disabled={connect.isPending} accessibilityLabel={`Connect with ${member.name}`} style={{ alignSelf: 'stretch' }}>
          <XStack height={44} alignItems="center" justifyContent="center" gap={6} borderRadius={14} backgroundColor="primary" opacity={connect.isPending ? 0.6 : 1}>
            <Icon name="personAdd" size={16} color="onPrimary" />
            <Text variant="labelLg" weight="bold" color="onPrimary">
              Connect
            </Text>
          </XStack>
        </PressableScale>
      </YStack>
    </PressableScale>
  );
}

// ── Learn ───────────────────────────────────────────────────────────

function LearnSegment({ search }: { search: string }) {
  const { resourcesDifficultyFilters, resourcesTypeFilters } = useUiConfig();
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {resourcesTypeFilters.map((item) => (
          <FilterChip
            key={item.key}
            label={item.label}
            icon={item.key === 'codelab' ? 'terminal' : item.key === 'video' ? 'playCircle' : item.key === 'article' ? 'article' : item.key === 'all' ? undefined : 'school'}
            active={type === item.key}
            onPress={() => setType(item.key)}
          />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {resourcesDifficultyFilters.map((item) => (
          <FilterChip key={item.key} label={item.label} active={difficulty === item.key} onPress={() => setDifficulty(item.key)} />
        ))}
      </ScrollView>

      <YStack paddingHorizontal={16} gap={12}>
        {isError ? <ErrorState message={error?.message} onRetry={() => refetch()} /> : null}
        {isPending && resources.length === 0 ? (
          <XStack gap={12}>
            {[1, 2].map((key) => (
              <YStack key={key} flex={1}>
                <SkeletonCard />
              </YStack>
            ))}
          </XStack>
        ) : null}
        {!isPending && !isError && resources.length === 0 ? (
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
    </YStack>
  );
}

export default ExploreSpace;
