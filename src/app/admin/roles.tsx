import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RequirePermission } from '@/components/RequirePermission';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { FilterChip, Pill } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ModalSheet } from '@/components/ui/Modal';
import { PressableScale } from '@/components/ui/PressableScale';
import { SearchBar } from '@/components/ui/SearchBar';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useMembers, useSetMemberRole } from '@/hooks/use-members';
import { ACCESS_LEVELS, accessLevelOf, ASSIGNABLE_ROLES } from '@/lib/auth/permissions';
import { useUiStore } from '@/stores/ui.store';
import { useTheme } from '@/theme';
import type { AccessLevel, Member, MemberRole } from '@/types';

const LEVEL_FILTERS: { key: AccessLevel | 'all'; label: string }[] = [
  { key: 'all', label: 'Everyone' },
  { key: 'super-admin', label: 'Super admins' },
  { key: 'core', label: 'Core team' },
  { key: 'member', label: 'Members' },
];

export default function RolesScreen() {
  return (
    <RequirePermission permission="roles.manage" message="Only super admins can manage roles.">
      <RolesManager />
    </RequirePermission>
  );
}

function RolesManager() {
  const theme = useTheme();
  const { memberRoles: MEMBER_ROLES } = useTaxonomy();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<AccessLevel | 'all'>('all');
  const [editing, setEditing] = useState<Member | null>(null);
  const { data, isPending, isError, error, refetch } = useMembers({ search });

  const members = useMemo(() => data?.data ?? [], [data]);
  const counts = useMemo(() => {
    const result: Record<AccessLevel, number> = { 'super-admin': 0, core: 0, member: 0 };
    for (const member of members) result[accessLevelOf(member.role)] += 1;
    return result;
  }, [members]);
  const visible = level === 'all' ? members : members.filter((member) => accessLevelOf(member.role) === level);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text variant="headlineMd" weight="bold">
          Roles & access
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(Object.keys(ACCESS_LEVELS) as AccessLevel[]).map((key) => (
            <View key={key} style={{ flex: 1, gap: 4, padding: 12, borderRadius: theme.radius.base, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant }}>
              <Icon name={ACCESS_LEVELS[key].icon} size={16} color="primary" />
              <Text variant="titleLg" weight="bold">{counts[key]}</Text>
              <Text variant="bodyXs" muted numberOfLines={1}>{ACCESS_LEVELS[key].label}</Text>
            </View>
          ))}
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Search members" />

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {LEVEL_FILTERS.map((item) => (
            <FilterChip key={item.key} label={item.label} active={level === item.key} onPress={() => setLevel(item.key)} />
          ))}
        </View>

        {isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : isPending && !data ? (
          [1, 2, 3, 4].map((key) => <Skeleton key={key} height={64} radius={12} />)
        ) : (
          <View style={{ borderRadius: theme.radius.card, overflow: 'hidden', backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant }}>
            {visible.map((member, index) => {
              const meta = MEMBER_ROLES[member.role];
              return (
                <PressableScale
                  key={member.id}
                  onPress={() => setEditing(member)}
                  accessibilityLabel={`Change role for ${member.name}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: theme.colors.outlineVariant }}
                >
                  <Avatar uri={member.avatar} name={member.name} size={40} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="labelLg" weight="semibold" numberOfLines={1}>{member.name}</Text>
                    <Text variant="bodyXs" muted numberOfLines={1}>{member.headline}</Text>
                  </View>
                  <Pill label={meta.label} color={meta.chipColor} dot />
                </PressableScale>
              );
            })}
            {visible.length === 0 ? (
              <Text variant="bodySm" muted style={{ padding: 16 }}>No members match.</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      <RoleSheet key={editing?.id ?? 'none'} member={editing} onClose={() => setEditing(null)} />
    </View>
  );
}

function RoleSheet({ member, onClose }: { member: Member | null; onClose: () => void }) {
  const theme = useTheme();
  const toast = useUiStore((state) => state.toast);
  const { memberRoles: MEMBER_ROLES } = useTaxonomy();
  const setRole = useSetMemberRole();
  const [role, setRoleValue] = useState<MemberRole | undefined>(member?.role);

  const save = () => {
    if (!member || !role || role === member.role) {
      onClose();
      return;
    }
    setRole.mutate(
      { memberId: member.id, role },
      {
        onSuccess: (updated) => {
          toast(`${updated.name} is now ${MEMBER_ROLES[updated.role].label}`, 'success');
          onClose();
        },
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not change role', 'error'),
      },
    );
  };

  return (
    <ModalSheet visible={!!member} onClose={onClose} title={member ? `Role · ${member.name}` : 'Role'}>
      <View style={{ gap: 10 }}>
        {ASSIGNABLE_ROLES.map((option) => {
          const access = ACCESS_LEVELS[accessLevelOf(option)];
          const active = role === option;
          return (
            <PressableScale
              key={option}
              onPress={() => setRoleValue(option)}
              accessibilityRole="radio"
              selected={active}
              accessibilityLabel={access.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                borderRadius: theme.radius.base,
                borderWidth: 1.5,
                borderColor: active ? theme.colors.primary : theme.colors.outlineVariant,
                backgroundColor: active ? theme.colors.primaryFixed : theme.colors.surfaceContainerLow,
              }}
            >
              <Icon name={access.icon} size={20} color={active ? 'primary' : 'onSurfaceVariant'} />
              <View style={{ flex: 1 }}>
                <Text variant="labelLg" weight="bold">{access.label}</Text>
                <Text variant="bodyXs" muted>{access.description}</Text>
              </View>
              <Icon name={active ? 'radioButtonChecked' : 'radioButtonUnchecked'} size={20} color={active ? 'primary' : 'outline'} />
            </PressableScale>
          );
        })}
        {member && !ASSIGNABLE_ROLES.includes(member.role) ? (
          <Text variant="bodyXs" muted>
            Currently {MEMBER_ROLES[member.role].label} — counts as a regular member.
          </Text>
        ) : null}
        <Button label="Save role" icon="check" loading={setRole.isPending} onPress={save} />
      </View>
    </ModalSheet>
  );
}
