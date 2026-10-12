import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { RequirePermission } from '@/components/RequirePermission';
import { Button } from '@/components/ui/Button';
import { Gradient } from '@/components/ui/Gradient';
import { Icon, type IconName } from '@/components/ui/Icon';
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
import type { ColorToken } from '@/theme/colors';
import type { Announcement as AnnouncementType } from '@/types';

export default function AdminScreen() {
  return (
    <RequirePermission permission="admin.dashboard">
      <AdminScreenContent />
    </RequirePermission>
  );
}

function AdminScreenContent() {
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);
  const { adminStats: STATS } = useUiConfig();

  const { data: stats, isPending, isError, error, refetch } = useOrganizerStats();
  const { data: announcements } = useAnnouncements();
  const { can } = useAuth();

  return (
    <YStack flex={1} backgroundColor="background">
      <XStack paddingTop={insets.top + 8} paddingHorizontal={16} alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap={4}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Organizer Console
          </Text>
        </XStack>
        <YStack width={34} height={34} borderRadius={10} backgroundColor="primaryFixed" alignItems="center" justifyContent="center">
          <Icon name="barChart" size={18} color="primary" />
        </YStack>
      </XStack>

      {isError ? (
        <YStack padding={16}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </YStack>
      ) : null}

      {isPending || !stats ? (
        <YStack padding={16} gap={12}>
          <Skeleton height={120} radius={12} />
          <Skeleton height={200} radius={12} />
        </YStack>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
          <XStack gap={8} flexWrap="wrap">
            <XStack alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="tertiaryFixed">
              <YStack width={6} height={6} borderRadius={3} backgroundColor="live" />
              <Text variant="codeSm" weight="bold" color="onTertiaryFixedVariant">
                ONLINE · SOUSSE, TN
              </Text>
            </XStack>
            <YStack paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="primaryFixed">
              <Text variant="codeSm" weight="bold" color="onPrimaryFixedVariant">
                {can('roles.manage') ? 'SUPER ADMIN' : 'CORE TEAM'}
              </Text>
            </YStack>
          </XStack>

          <XStack flexWrap="wrap" gap={10}>
            {STATS.map((stat, index) => {
              const value = stat.key === 'attendanceRate' ? `${stats[stat.key]}%` : formatCount(stats[stat.key]);
              return (
                <YStack key={stat.key} flexBasis="30%" flexGrow={1} padding={12} gap={4} borderRadius={18} backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
                  <Text variant="codeSm" muted numberOfLines={1}>
                    {stat.label.toUpperCase()}
                  </Text>
                  <Text variant="headlineSm" weight="bold" color={STAT_TONES[index % STAT_TONES.length]} style={{ fontFamily: 'JetBrainsMono_700Bold' }}>
                    {value}
                  </Text>
                </YStack>
              );
            })}
          </XStack>

          <PressableScale onPress={() => router.push('/admin/check-in')} accessibilityLabel="Open the gate scanner">
            <YStack borderRadius="card" overflow="hidden">
              <Gradient token="night" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <YStack padding={16} gap={14}>
                  <XStack alignItems="center" justifyContent="space-between">
                    <XStack alignItems="center" gap={8}>
                      <Icon name="qrCodeScanner" size={22} color="live" />
                      <Text variant="titleMd" weight="bold" color="onNight">
                        Gate Scanner
                      </Text>
                    </XStack>
                    <XStack alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="surfaceContainerHigh">
                      <YStack width={6} height={6} borderRadius={3} backgroundColor="live" />
                      <Text variant="codeSm" weight="bold">
                        CAM READY
                      </Text>
                    </XStack>
                  </XStack>
                  <YStack height={110} borderRadius={16} borderWidth={1} borderStyle="dashed" borderColor="outline" alignItems="center" justifyContent="center" gap={6}>
                    <Icon name="qrCode" size={34} color="onNight" />
                    <Text variant="codeSm" color="outline">
                      TAP TO SCAN TICKETS AT THE DOOR
                    </Text>
                  </YStack>
                </YStack>
              </Gradient>
            </YStack>
          </PressableScale>

          <ConsoleCard icon="editCalendar" tone="primaryFixed" title="Event Management" badge="CORE" body="Event task board and the core team's open votes.">
            <XStack gap={8} flexWrap="wrap">
              <Button label="Event tasks" icon="taskAlt" variant="container" compact fullWidth={false} onPress={() => router.push('/?space=voice&segment=tasks' as never)} />
              <Button label="Core votes" icon="howToVote" variant="container" compact fullWidth={false} onPress={() => router.push('/?space=voice&segment=decisions' as never)} />
              <Button label="Create event" icon="add" variant="ghost" compact fullWidth={false} onPress={() => toast('Event builder coming soon', 'info')} />
            </XStack>
          </ConsoleCard>

          <ConsoleCard icon="campaign" tone="secondaryContainer" title="Campus Broadcast" badge="PUSH" body="Publish an announcement to every member's feed.">
            <AnnouncementComposer />
            {announcements && announcements.length > 0 ? (
              <YStack gap={8}>
                <Text variant="codeSm" weight="bold" muted>
                  RECENT BROADCASTS
                </Text>
                {announcements.slice(0, 4).map((announcement) => (
                  <XStack key={announcement.id} alignItems="center" gap={8} padding={10} borderRadius={14} backgroundColor="surfaceContainerLow">
                    {announcement.pinned ? <Icon name="pushPin" size={14} color="primary" /> : null}
                    <YStack flex={1}>
                      <Text variant="labelMd" weight="semibold" numberOfLines={1}>
                        {announcement.title}
                      </Text>
                      <Text variant="bodySm" muted numberOfLines={1}>
                        {announcement.body}
                      </Text>
                    </YStack>
                    <DeleteAnnouncementButton id={announcement.id} />
                  </XStack>
                ))}
              </YStack>
            ) : (
              <Text variant="bodySm" muted>
                No announcements yet.
              </Text>
            )}
          </ConsoleCard>

          {can('roles.manage') ? (
            <ConsoleCard icon="shield" tone="surfaceContainerHigh" title="Roles & Squads" badge="ADMIN" body="Promote members, manage the core team and squad leads.">
              <Button label="Roles & access" icon="shield" variant="container" compact fullWidth={false} onPress={() => router.push('/admin/roles' as never)} />
            </ConsoleCard>
          ) : null}
        </ScrollView>
      )}
    </YStack>
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
    <YStack gap={10}>
      <Text variant="titleMd" weight="bold">New announcement</Text>
      <YStack gap={10} padding={14} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
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
      </YStack>
    </YStack>
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
const STAT_TONES = ['onSurface', 'primary', 'warning', 'tertiary', 'error', 'onSurface'] as const;

function ConsoleCard({
  icon,
  tone,
  title,
  badge,
  body,
  children,
}: {
  icon: IconName;
  tone: ColorToken;
  title: string;
  badge: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <YStack padding={16} gap={12} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
      <XStack gap={12}>
        <YStack width={48} height={48} borderRadius={14} alignItems="center" justifyContent="center" backgroundColor={tone}>
          <Icon name={icon} size={22} color="onSurface" />
        </YStack>
        <YStack flex={1} gap={2}>
          <XStack alignItems="center" justifyContent="space-between" gap={8}>
            <Text variant="titleMd" weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
              {title}
            </Text>
            <YStack paddingHorizontal={6} paddingVertical={1} borderRadius={6} backgroundColor="primaryFixed">
              <Text variant="codeSm" weight="bold" color="onPrimaryFixedVariant">
                {badge}
              </Text>
            </YStack>
          </XStack>
          <Text variant="bodySm" muted>
            {body}
          </Text>
        </YStack>
      </XStack>
      {children}
    </YStack>
  );
}
