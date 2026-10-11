import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { XStack, YStack } from 'tamagui';

import { GuestGate } from '@/components/GuestGate';
import { Avatar } from '@/components/ui/Avatar';
import { Gradient } from '@/components/ui/Gradient';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Orbs } from '@/components/ui/Orbs';
import { PressableScale } from '@/components/ui/PressableScale';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { useAchievementSummary, useProfile } from '@/hooks/use-community';
import { useMemories, useUiConfig } from '@/hooks/use-content';
import { ACCESS_LEVELS } from '@/lib/auth/permissions';
import { useThemeStore, type ThemePreference } from '@/stores/theme.store';
import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';

const GOOGLE_DOTS: ColorToken[] = ['error', 'info', 'warning', 'success'];

/**
 * Profile bottom sheet (route `/me`, `transparentModal`): identity hero, stats,
 * organizer console, memories, the server-driven profile menu and appearance.
 */
export default function MeSheet() {
  const theme = useTheme();
  const { data: profile, isPending } = useProfile();
  const { data: summary } = useAchievementSummary();
  const { signOut, isOrganizer, access, can, isGuest } = useAuth();
  const { profileMenu: MENU } = useUiConfig();
  const memories = useMemories();
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  const level = ACCESS_LEVELS[access];

  if (isGuest) {
    return (
      <Sheet title="Profile" headerRight={<IconButton name="close" onPress={() => router.back()} accessibilityLabel="Close profile" />}>
        <YStack paddingHorizontal={16} paddingBottom={24}>
          <GuestGate reason="save your profile, XP, badges and tickets" icon="person">
            {null}
          </GuestGate>
        </YStack>
      </Sheet>
    );
  }

  const menu = MENU.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || can(item.permission)),
  }))
    .filter((group) => group.items.length > 0)
    // Members already reach Decisions from "Have your say"; core sees it under Core team.
    .map((group) =>
      group.group === 'Have your say' && can('decisions.vote')
        ? { ...group, items: group.items.filter((item) => item.route !== '/decisions') }
        : group,
    );

  return (
    <Sheet
      title="Profile"
      headerRight={<IconButton name="close" onPress={() => router.back()} accessibilityLabel="Close profile" />}
      contentContainerStyle={{ paddingBottom: 12 }}
    >
      <YStack paddingHorizontal={16} gap={16}>
        <YStack borderRadius="card" overflow="hidden">
          <Gradient token="brand" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Orbs />
            <YStack padding={16} gap={14}>
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="overlay">
                  <XStack gap={3}>
                    {GOOGLE_DOTS.map((color) => (
                      <YStack key={color} width={6} height={6} borderRadius={3} backgroundColor={color} />
                    ))}
                  </XStack>
                  <Text variant="codeSm" weight="bold" color="onPrimary">
                    {level.label.toUpperCase()}
                  </Text>
                </XStack>
                <YStack paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="overlay">
                  <Text variant="codeSm" weight="bold" color="onPrimary">
                    EPI SOUSSE
                  </Text>
                </YStack>
              </XStack>

              <XStack alignItems="center" gap={14}>
                {isPending || !profile ? (
                  <>
                    <Skeleton width={76} height={76} radius={38} />
                    <YStack gap={8} flex={1}>
                      <Skeleton height={18} width="60%" />
                      <Skeleton height={12} width="80%" />
                    </YStack>
                  </>
                ) : (
                  <>
                    <YStack>
                      <YStack borderRadius={42} borderWidth={3} borderColor="onPrimary" overflow="hidden">
                        <Avatar uri={profile.avatar} name={profile.name} size={72} />
                      </YStack>
                      <YStack position="absolute" right={-2} bottom={-2} width={26} height={26} borderRadius={13} alignItems="center" justifyContent="center" backgroundColor="secondaryContainer" borderWidth={2} borderColor="onPrimary">
                        <Icon name={level.icon} size={13} color="onSecondaryContainer" />
                      </YStack>
                    </YStack>
                    <YStack flex={1} gap={4}>
                      <Text variant="headlineSm" weight="bold" color="onPrimary" numberOfLines={1}>
                        {profile.name}
                      </Text>
                      <Text variant="bodySm" color="onPrimary" numberOfLines={2}>
                        {profile.headline}
                      </Text>
                    </YStack>
                  </>
                )}
              </XStack>

              <XStack alignSelf="flex-start" alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="tertiaryFixed">
                <YStack width={6} height={6} borderRadius={3} backgroundColor="live" />
                <Text variant="codeSm" weight="bold" color="onTertiaryFixedVariant">
                  {access === 'member' ? 'Member · Welcome aboard' : `${level.label} · Access granted`}
                </Text>
              </XStack>
            </YStack>
          </Gradient>
        </YStack>

        {summary ? (
          <PressableScale onPress={() => router.push('/achievements')} accessibilityLabel="View achievements">
            <XStack gap={10}>
              <StatTile value={String(summary.eventsAttended)} label="EVENTS" color="primary" />
              <StatTile value={`${summary.badgesUnlocked}/${summary.badgesTotal}`} label="BADGES" color="tertiary" />
              <StatTile value={summary.points.toLocaleString('en-US')} label="XP POINTS" color="warning" />
            </XStack>
          </PressableScale>
        ) : (
          <Skeleton height={76} radius={18} />
        )}

        {isOrganizer ? (
          <PressableScale onPress={() => router.push('/admin')} accessibilityLabel="Open organizer console">
            <YStack borderRadius="card" overflow="hidden">
              <Gradient token="night" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <XStack alignItems="center" gap={12} padding={16}>
                  <YStack width={48} height={48} borderRadius={14} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
                    <Icon name="qrCodeScanner" size={22} color="inverseOnSurface" />
                  </YStack>
                  <YStack flex={1} gap={2}>
                    <XStack alignItems="center" gap={8}>
                      <Text variant="titleMd" weight="bold" color="inverseOnSurface">
                        Organizer Console
                      </Text>
                      <YStack paddingHorizontal={6} paddingVertical={1} borderRadius={6} backgroundColor="secondaryContainer">
                        <Text variant="codeSm" weight="bold" color="onSecondaryContainer">
                          {access === 'super-admin' ? 'ADMIN' : 'CORE'}
                        </Text>
                      </YStack>
                    </XStack>
                    <Text variant="bodySm" color="outline">
                      Manage events, QR gate scanner, broadcasts & members
                    </Text>
                  </YStack>
                  <YStack width={36} height={36} borderRadius={18} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
                    <Icon name="chevronRight" size={18} color="inverseOnSurface" />
                  </YStack>
                </XStack>
              </Gradient>
            </YStack>
          </PressableScale>
        ) : null}

        {memories.length ? (
          <PressableScale onPress={() => router.push('/memories' as never)} accessibilityLabel="Open campus memories">
            <YStack padding={14} gap={12} borderRadius="card" backgroundColor="surfaceContainerLow">
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap={8}>
                  <Icon name="autoAwesome" size={18} color="primary" />
                  <Text variant="titleSm" weight="bold">
                    Campus Memories
                  </Text>
                </XStack>
                <Text variant="codeSm" weight="bold" primary>
                  {memories.length} PHOTOS
                </Text>
              </XStack>
              <XStack gap={8}>
                {memories.slice(0, 3).map((memory) => (
                  <Image
                    key={memory.id}
                    source={memory.source}
                    contentFit="cover"
                    style={{ flex: 1, height: 72, borderRadius: 12, backgroundColor: theme.colors.surfaceContainer }}
                  />
                ))}
              </XStack>
            </YStack>
          </PressableScale>
        ) : null}

        {menu.map((group) => (
          <YStack key={group.group} gap={8}>
            <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 4 }}>
              {group.group}
            </Text>
            <Surface style={{ overflow: 'hidden' }}>
              {group.items.map((item, index) => (
                <PressableScale
                  key={item.route}
                  onPress={() => router.push(item.route as never)}
                  accessibilityLabel={item.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 14,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: theme.colors.outlineVariant,
                  }}
                >
                  <YStack width={40} height={40} borderRadius={12} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
                    <Icon name={item.icon} size={20} color={item.danger ? 'error' : 'onSurface'} />
                  </YStack>
                  <YStack flex={1} gap={2}>
                    <Text variant="labelLg" weight="bold" color={item.danger ? 'error' : 'onSurface'}>
                      {item.label}
                    </Text>
                    <Text variant="bodySm" muted>
                      {item.description}
                    </Text>
                  </YStack>
                  <Icon name="chevronRight" size={18} color="onSurfaceVariant" />
                </PressableScale>
              ))}
            </Surface>
          </YStack>
        ))}

        <Surface style={{ padding: 14, gap: 12 }}>
          <XStack alignItems="center" gap={12}>
            <YStack width={40} height={40} borderRadius={12} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
              <Icon name="palette" size={20} color="onSurface" />
            </YStack>
            <YStack flex={1}>
              <Text variant="labelLg" weight="bold">
                Appearance
              </Text>
              <Text variant="bodySm" muted>
                Theme preference
              </Text>
            </YStack>
          </XStack>
          <SegmentedControl<ThemePreference>
            segments={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            value={preference}
            onChange={setPreference}
            size="sm"
            accessibilityLabel="Theme preference"
          />
        </Surface>

        <PressableScale
          onPress={() => void signOut()}
          accessibilityLabel="Sign out"
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 }}
        >
          <Icon name="logout" size={18} color="error" />
          <Text variant="labelLg" color="error" weight="semibold">
            Sign out
          </Text>
        </PressableScale>
      </YStack>
    </Sheet>
  );
}

function StatTile({ value, label, color }: { value: string; label: string; color: ColorToken }) {
  return (
    <YStack flex={1} alignItems="center" paddingVertical={14} gap={4} borderRadius={18} backgroundColor="surfaceContainerLow">
      <Text variant="titleMd" weight="bold" color={color} style={{ fontFamily: 'JetBrainsMono_700Bold' }}>
        {value}
      </Text>
      <Text variant="codeSm" muted>
        {label}
      </Text>
    </YStack>
  );
}
