import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { FilterChip, Pill } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { ScreenHeading } from '@/components/ui/Screen';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { SearchBar } from '@/components/ui/SearchBar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { MEMBER_ROLES } from '@/constants/taxonomy';
import { useDebouncedValue } from '@/hooks/use-misc';
import { useMembers } from '@/hooks/use-members';
import { useTheme } from '@/theme';
import type { Member } from '@/types';
import { PressableScale } from '@/components/ui/PressableScale';

const ROLE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'core-team', label: 'Core Team' },
  { key: 'speaker', label: 'Speakers · GDE' },
  { key: 'alumni', label: 'Alumni' },
  { key: 'student', label: 'Students' },
] as const;

export default function CommunityScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<string>('all');
  const debounced = useDebouncedValue(query, 250);

  const { data, isPending, isError, error, refetch } = useMembers({ search: debounced, role });

  const members = data?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, gap: 14 }}>
        <Reveal>
          <ScreenHeading
            title="Community"
            subtitle="The builders of EPI Sousse"
            right={
              <Text variant="codeSm" muted>
                {data?.total ?? '…'} builders
              </Text>
            }
          />
        </Reveal>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search members…" />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {ROLE_FILTERS.map((item) => (
            <FilterChip key={item.key} label={item.label} active={role === item.key} onPress={() => setRole(item.key)} />
          ))}
        </View>
      </View>

      {isError ? (
        <View style={{ padding: 16 }}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </View>
      ) : null}

      {isPending && members.length === 0 ? (
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2].map((key) => <SkeletonCard key={key} />)}
        </View>
      ) : null}

      {!isPending && members.length === 0 ? (
        <EmptyState
          icon="people"
          title="No members found"
          message="Try a different keyword or role filter."
          actionLabel="Clear search"
          onAction={() => {
            setQuery('');
            setRole('all');
          }}
        />
      ) : null}

      <FlashList
        data={members}
        keyExtractor={(member) => (member as Member).id}
        numColumns={2}
        contentContainerStyle={{ padding: 16, paddingBottom: 112, gap: 12 }}
        renderItem={({ item }) => <MemberCard member={item} onPress={() => router.push(`/community/${item.id}`)} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function MemberCard({ member, onPress }: { member: Member; onPress: () => void }) {
  const theme = useTheme();
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
      onPress={onPress}
      style={{
        flex: 1,
        minWidth: '47%',
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderRadius: theme.radius.card,
        padding: 14,
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
        shadowColor: theme.colors.inverseSurface,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Avatar
          uri={member.avatar}
          name={member.name}
          size={52}
          online={member.online}
          style={{ borderWidth: 2, borderColor: theme.colors[accent] }}
        />
        <Icon name="arrowForward" size={16} color="outline" />
      </View>
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