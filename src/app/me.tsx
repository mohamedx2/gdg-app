import { router } from 'expo-router';
import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '@/components/ui/Avatar';
import { Gradient } from '@/components/ui/Gradient';
import { Icon } from '@/components/ui/Icon';
import { Orbs } from '@/components/ui/Orbs';
import { PressableScale } from '@/components/ui/PressableScale';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { useAchievementSummary, useProfile } from '@/hooks/use-community';
import { useUiConfig } from '@/hooks/use-content';
import { ACCESS_LEVELS } from '@/lib/auth/permissions';
import { useUiStore } from '@/stores/ui.store';
import { useTheme } from '@/theme';

/**
 * Profile bottom sheet (route `/me`, `transparentModal`). Presents the member
 * hero, access level, organizer shortcut and the server-driven profile menu
 * filtered through the user's permissions.
 */
export default function MeSheet() {
  const theme = useTheme();
  const { data: profile, isPending } = useProfile();
  const { data: summary } = useAchievementSummary();
  const { signOut, isOrganizer, access, can } = useAuth();
  const { profileMenu: MENU } = useUiConfig();
  const level = ACCESS_LEVELS[access];

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
    <Sheet contentContainerStyle={{ paddingBottom: 12 }}>
      <ProfileHero profile={profile} isPending={isPending} summary={summary} />

      <YStack padding={16} paddingTop={18} gap={20}>
        <XStack
          alignItems="center"
          gap={10}
          padding={12}
          borderRadius="card"
          backgroundColor={access === 'member' ? 'surfaceContainerLow' : 'primaryFixed'}
        >
          <Icon name={level.icon} size={20} color={access === 'member' ? 'onSurfaceVariant' : 'primary'} />
          <YStack flex={1}>
            <Text variant="labelLg" weight="bold">
              {level.label}
            </Text>
            <Text variant="bodyXs" muted>
              {level.description}
            </Text>
          </YStack>
        </XStack>

        {isOrganizer ? (
          <PressableScale
            onPress={() => router.push('/admin')}
            accessibilityLabel="Organizer dashboard"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 14,
              borderRadius: theme.radius.card,
              backgroundColor: theme.colors.surfaceContainerHigh,
            }}
          >
            <YStack
              width={40}
              height={40}
              borderRadius={12}
              backgroundColor="surfaceContainerLowest"
              alignItems="center"
              justifyContent="center"
            >
              <Icon name="barChart" size={20} color="primary" />
            </YStack>
            <YStack flex={1}>
              <Text variant="labelLg" weight="bold">
                Organizer dashboard
              </Text>
              <Text variant="bodySm" muted>
                Manage events, announcements & stats
              </Text>
            </YStack>
            <Icon name="chevronRight" size={18} color="secondary" />
          </PressableScale>
        ) : null}

        {menu.map((group) => (
          <YStack key={group.group} gap={8}>
            <Text
              variant="codeSm"
              muted
              style={{ textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 4 }}
            >
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
                  <Icon name={item.icon} size={20} color={item.danger ? 'error' : 'secondary'} />
                  <YStack flex={1} gap={2}>
                    <Text variant="labelLg" weight="medium" color={item.danger ? 'error' : 'onSurface'}>
                      {item.label}
                    </Text>
                    <Text variant="bodySm" muted>
                      {item.description}
                    </Text>
                  </YStack>
                  <Icon name="chevronRight" size={18} color="secondary" />
                </PressableScale>
              ))}
            </Surface>
          </YStack>
        ))}

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

function ProfileHero({
  profile,
  isPending,
  summary,
}: {
  profile: { avatar?: string | null; name: string; headline?: string } | undefined;
  isPending: boolean;
  summary:
    | {
        tier: string;
        points: number;
        xp: number;
        xpGoal: number;
        badgesUnlocked: number;
        badgesTotal: number;
        eventsAttended: number;
      }
    | undefined;
}) {
  const theme = useTheme();
  const toast = useUiStore((state) => state.toast);
  const progress = summary && summary.xpGoal > 0 ? Math.min(1, summary.xp / summary.xpGoal) : 0;

  return (
    <YStack
      borderBottomLeftRadius={theme.radius.xl}
      borderBottomRightRadius={theme.radius.xl}
      overflow="hidden"
    >
      <Gradient token="brand" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Orbs />

        <YStack paddingTop={16} paddingHorizontal={16} paddingBottom={22} gap={18}>
          <XStack alignItems="center" justifyContent="space-between">
            <Text
              variant="codeSm"
              weight="semibold"
              style={{ textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.85)' }}
            >
              My Profile
            </Text>
            <PressableScale
              onPress={() => router.push('/settings/appearance')}
              accessibilityLabel="Appearance settings"
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.16)',
              }}
            >
              <Icon name="settings" size={20} color="onPrimaryContainer" />
            </PressableScale>
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
                <YStack borderRadius={42} borderWidth={3} borderColor="rgba(255,255,255,0.85)" overflow="hidden">
                  <Avatar uri={profile.avatar} name={profile.name} size={72} />
                </YStack>
                <YStack flex={1} gap={4}>
                  <Text variant="headlineSm" weight="bold" color="onPrimaryContainer" numberOfLines={1}>
                    {profile.name}
                  </Text>
                  <Text variant="bodySm" numberOfLines={2} style={{ color: 'rgba(255,255,255,0.86)' }}>
                    {profile.headline}
                  </Text>
                </YStack>
              </>
            )}
          </XStack>

          {summary ? (
            <YStack gap={12}>
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap={8}>
                  <Icon name="stars" size={17} color="onPrimaryContainer" />
                  <Text variant="labelLg" weight="bold" color="onPrimaryContainer">
                    {summary.tier} Builder
                  </Text>
                </XStack>
                <Text variant="codeSm" weight="semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {summary.xp}/{summary.xpGoal || '∞'} XP
                </Text>
              </XStack>

              {summary.xpGoal > 0 ? (
                <YStack height={8} borderRadius={4} backgroundColor="rgba(255,255,255,0.25)" overflow="hidden">
                  <YStack width={`${progress * 100}%`} height="100%" borderRadius={4} backgroundColor="#FFFFFF" />
                </YStack>
              ) : null}

              <XStack gap={8}>
                <HeroStat label="Events" value={summary.eventsAttended} />
                <HeroStat label="Badges" value={`${summary.badgesUnlocked}/${summary.badgesTotal}`} />
                <HeroStat label="Points" value={summary.points} />
              </XStack>

              <PressableScale
                onPress={() => router.push('/achievements')}
                accessibilityLabel="View achievements"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 11,
                  borderRadius: theme.radius.base,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                }}
              >
                <Text variant="labelMd" weight="semibold" color="onPrimaryContainer">
                  View achievements
                </Text>
                <Icon name="chevronRight" size={16} color="onPrimaryContainer" />
              </PressableScale>
            </YStack>
          ) : (
            <PressableScale
              onPress={() => toast('Edit profile arriving soon', 'info')}
              accessibilityLabel="Edit profile"
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: theme.radius.full,
                backgroundColor: 'rgba(255,255,255,0.18)',
              }}
            >
              <Text variant="labelSm" weight="semibold" color="onPrimaryContainer">
                Edit profile
              </Text>
            </PressableScale>
          )}
        </YStack>
      </Gradient>
    </YStack>
  );
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <YStack flex={1} padding={10} borderRadius={10} backgroundColor="rgba(255,255,255,0.14)" gap={2}>
      <Text variant="labelLg" weight="bold" color="onPrimaryContainer" style={{ lineHeight: 18 }}>
        {value}
      </Text>
      <Text variant="bodySm" style={{ lineHeight: 14, color: 'rgba(255,255,255,0.82)' }}>
        {label}
      </Text>
    </YStack>
  );
}
