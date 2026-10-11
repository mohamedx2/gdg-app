import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RequirePermission } from '@/components/RequirePermission';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { PressableScale } from '@/components/ui/PressableScale';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useUiConfig } from '@/hooks/use-content';
import { useCreateAnnouncement, useDeleteAnnouncement, useOrganizerStats } from '@/hooks/use-profile';
import { useAnnouncements } from '@/hooks/use-community';
import { useAuth } from '@/features/auth/auth-provider';
import { useUiStore } from '@/stores/ui.store';
import { formatCount } from '@/utils/format';
import { useTheme } from '@/theme';
import type { Announcement as AnnouncementType } from '@/types';

export default function AdminScreen() {
  return (
    <RequirePermission permission="admin.dashboard">
      <AdminScreenContent />
    </RequirePermission>
  );
}

function AdminScreenContent() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);
  const { adminStats: STATS } = useUiConfig();

  const { data: stats, isPending, isError, error, refetch } = useOrganizerStats();
  const { data: announcements } = useAnnouncements();
  const { can } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Organizer dashboard
          </Text>
        </View>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: theme.colors.primaryFixed, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="barChart" size={18} color="primary" />
        </View>
      </View>

      {isError ? (
        <View style={{ padding: 16 }}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </View>
      ) : null}

      {isPending || !stats ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={120} radius={12} />
          <Skeleton height={200} radius={12} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {STATS.map((stat) => {
              const value = stat.key === 'attendanceRate' ? `${stats[stat.key]}%` : formatCount(stats[stat.key]);
              return (
                <View
                  key={stat.key}
                  style={{
                    flexBasis: '47%',
                    flexGrow: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    padding: 14,
                    borderRadius: theme.radius.card,
                    backgroundColor: theme.colors.surfaceContainerLowest,
                    borderWidth: 1,
                    borderColor: theme.colors.outlineVariant,
                  }}
                >
                  <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: theme.colors.primaryFixed, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={stat.icon} size={18} color="primary" />
                  </View>
                  <View style={{ gap: 2 }}>
                    <Text variant="titleMd" weight="bold">{value}</Text>
                    <Text variant="codeSm" muted>{stat.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <AnnouncementComposer />

          <View style={{ gap: 10 }}>
            <Text variant="titleMd" weight="bold">Announcements</Text>
            {announcements && announcements.length > 0 ? (
              announcements.slice(0, 4).map((announcement) => (
                <View key={announcement.id} style={{ padding: 12, borderRadius: theme.radius.base, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {announcement.pinned ? (
                      <Icon name="pushPin" size={14} color="primary" />
                    ) : null}
                    <Text variant="labelLg" weight="semibold" numberOfLines={2} style={{ flex: 1 }}>
                      {announcement.title}
                    </Text>
                    <DeleteAnnouncementButton id={announcement.id} />
                  </View>
                  <Text variant="bodySm" muted numberOfLines={2}>{announcement.body}</Text>
                </View>
              ))
            ) : (
              <Text variant="bodySm" muted>No announcements yet.</Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Event tasks" icon="taskAlt" variant="container" onPress={() => router.push('/tasks')} />
            <Button label="Core votes" icon="howToVote" variant="container" onPress={() => router.push('/decisions')} />
          </View>

          {can('roles.manage') ? (
            <Button label="Roles & access" icon="shield" variant="container" onPress={() => router.push('/admin/roles' as never)} />
          ) : null}

          <Button label="Scan tickets at the door" icon="qrCodeScanner" onPress={() => router.push('/admin/check-in')} />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Create event" icon="add" variant="container" onPress={() => toast('Event builder coming soon', 'info')} />
            <Button label="Manage events" icon="editCalendar" onPress={() => toast('Open the Events tab to manage', 'info')} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function AnnouncementComposer() {
  const theme = useTheme();
  const toast = useUiStore((state) => state.toast);
  const { mutateAsync: create } = useCreateAnnouncement();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      toast('Add both a title and message', 'error');
      return;
    }
    setBusy(true);
    try {
      const announcement: AnnouncementType = {
        id: `ann-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        tag: 'ANNOUNCEMENT',
        createdAt: new Date().toISOString(),
        pinned: false,
      };
      await create(announcement);
      setTitle('');
      setBody('');
      toast('Announcement published', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not publish', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      <Text variant="titleMd" weight="bold">New announcement</Text>
      <View style={{ gap: 10, padding: 14, borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant }}>
        <Input value={title} onChangeText={setTitle} placeholder="Title" />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Message"
          placeholderTextColor={theme.colors.outline}
          multiline
          numberOfLines={3}
          style={{
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.outlineVariant,
            backgroundColor: theme.colors.surfaceContainerLow,
            padding: 12,
            minHeight: 76,
            color: theme.colors.onSurface,
            fontSize: 14,
            lineHeight: 20,
            fontFamily: theme.typography.bodyMd.fontFamily,
            textAlignVertical: 'top',
          }}
        />
        <Button label="Publish to community" icon="campaign" onPress={submit} loading={busy} />
      </View>
    </View>
  );
}

function DeleteAnnouncementButton({ id }: { id: string }) {
  const { mutateAsync: remove, isPending } = useDeleteAnnouncement();
  return (
    <PressableScale onPress={() => void remove(id)} disabled={isPending} style={{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="delete" size={15} color="error" />
    </PressableScale>
  );
}