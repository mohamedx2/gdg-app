import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '@/components/ui/Avatar';
import { FilterChip, Pill } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { ScreenHeading } from '@/components/ui/Screen';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { SearchBar } from '@/components/ui/SearchBar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTaxonomy, useUiConfig } from '@/hooks/use-content';
import { useDebouncedValue } from '@/hooks/use-misc';
import { useMembers } from '@/hooks/use-members';
import { useTheme } from '@/theme';
import type { Member } from '@/types';
import { PressableScale } from '@/components/ui/PressableScale';

export default function CommunityScreen() {
  const { communityRoleFilters: ROLE_FILTERS } = useUiConfig();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<string>('all');
  const debounced = useDebouncedValue(query, 250);

  const { data, isPending, isError, error, refetch } = useMembers({ search: debounced, role });

  const members = data?.data ?? [];

  return (
    <YStack flex={1} backgroundColor="background">
      <YStack paddingTop={insets.top + 8} paddingHorizontal={16} gap={14}>
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
        <XStack gap={8} flexWrap="wrap">
          {ROLE_FILTERS.map((item) => (
            <FilterChip key={item.key} label={item.label} active={role === item.key} onPress={() => setRole(item.key)} />
          ))}
        </XStack>
      </YStack>

      {isError ? (
        <YStack padding={16}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </YStack>
      ) : null}

      {isPending && members.length === 0 ? (
        <YStack padding={16} gap={12}>
          {[1, 2].map((key) => <SkeletonCard key={key} />)}
        </YStack>
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
    </YStack>
  );
}

function MemberCard({ member, onPress }: { member: Member; onPress: () => void }) {
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