import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Gradient } from '@/components/ui/Gradient';
import { Icon } from '@/components/ui/Icon';
import { Orbs } from '@/components/ui/Orbs';
import { Reveal } from '@/components/ui/Reveal';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { useAchievementSummary, useProfile } from '@/hooks/use-community';
import { useUiStore } from '@/stores/ui.store';
import { ACCESS_LEVELS } from '@/lib/auth/permissions';
import { useUiConfig } from '@/hooks/use-content';
import { useTheme } from '@/theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const { data: profile, isPending } = useProfile();
  const { data: summary } = useAchievementSummary();
  const { signOut, isOrganizer, access, can } = useAuth();
  const { profileMenu: MENU } = useUiConfig();
  const level = ACCESS_LEVELS[access];
  const menu = MENU.map((group) => ({ ...group, items: group.items.filter((item) => !item.permission || can(item.permission)) }))
    .filter((group) => group.items.length > 0)
    // Members already reach Decisions from "Have your say"; core sees it under Core team.
    .map((group) => (group.group === 'Have your say' && can('decisions.vote') ? { ...group, items: group.items.filter((item) => item.route !== '/decisions') } : group));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Reveal>
          <ProfileHero profile={profile} isPending={isPending} summary={summary} />
        </Reveal>

        <View style={{ padding: 16, gap: 20 }}>
          <Reveal delay={30}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: theme.radius.card, backgroundColor: access === 'member' ? theme.colors.surfaceContainerLow : theme.colors.primaryFixed }}>
              <Icon name={level.icon} size={20} color={access === 'member' ? 'onSurfaceVariant' : 'primary'} />
              <View style={{ flex: 1 }}>
                <Text variant="labelLg" weight="bold">{level.label}</Text>
                <Text variant="bodyXs" muted>{level.description}</Text>
              </View>
            </View>
          </Reveal>

          {isOrganizer ? (
            <Reveal delay={60}>
              <PressableScale
                onPress={() => router.push('/admin')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceContainerHigh }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="barChart" size={20} color="primary" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="labelLg" weight="bold">Organizer dashboard</Text>
                  <Text variant="bodySm" muted>Manage events, announcements & stats</Text>
                </View>
                <Icon name="chevronRight" size={18} color="secondary" />
              </PressableScale>
            </Reveal>
          ) : null}

          {menu.map((group, groupIndex) => (
            <Reveal key={group.group} delay={100 + groupIndex * 40}>
              <View style={{ gap: 8 }}>
                <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 4 }}>
                  {group.group}
                </Text>
                <View style={{ borderRadius: theme.radius.card, overflow: 'hidden', backgroundColor: theme.colors.surfaceContainerLowest, shadowColor: theme.colors.inverseSurface, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }}>
                  {group.items.map((item, index) => (
                    <PressableScale
                      key={item.route}
                      onPress={() => router.push(item.route as never)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: theme.colors.outlineVariant }}
                    >
                      <Icon name={item.icon} size={20} color={item.danger ? 'error' : 'secondary'} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="labelLg" weight="medium" color={item.danger ? 'error' : 'onSurface'}>
                          {item.label}
                        </Text>
                        <Text variant="bodySm" muted>{item.description}</Text>
                      </View>
                      <Icon name="chevronRight" size={18} color="secondary" />
                    </PressableScale>
                  ))}
                </View>
              </View>
            </Reveal>
          ))}

          <Reveal delay={200}>
            <PressableScale
              onPress={() => void signOut()}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 }}
            >
              <Icon name="logout" size={18} color="error" />
              <Text variant="labelLg" color="error" weight="semibold">
                Sign out
              </Text>
            </PressableScale>
          </Reveal>
        </View>
      </ScrollView>
    </View>
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
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);
  const progress = summary && summary.xpGoal > 0 ? Math.min(1, summary.xp / summary.xpGoal) : 0;

  return (
    <View style={{ borderBottomLeftRadius: theme.radius.xl, borderBottomRightRadius: theme.radius.xl, overflow: 'hidden' }}>
      <Gradient token="brand" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Orbs />

        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 22, gap: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="codeSm" weight="semibold" style={{ textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.85)' }}>
              My Profile
            </Text>
            <PressableScale
              onPress={() => router.push('/settings/appearance')}
              accessibilityLabel="Settings"
              style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)' }}
            >
              <Icon name="settings" size={20} color="#FFFFFF" />
            </PressableScale>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            {isPending || !profile ? (
              <>
                <Skeleton width={76} height={76} radius={38} />
                <View style={{ gap: 8, flex: 1 }}>
                  <Skeleton height={18} width="60%" />
                  <Skeleton height={12} width="80%" />
                </View>
              </>
            ) : (
              <>
                <View style={{ borderRadius: 42, borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)', overflow: 'hidden' }}>
                  <Avatar uri={profile.avatar} name={profile.name} size={72} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="headlineSm" weight="bold" style={{ color: '#FFFFFF' }} numberOfLines={1}>
                    {profile.name}
                  </Text>
                  <Text variant="bodySm" numberOfLines={2} style={{ color: 'rgba(255,255,255,0.86)' }}>
                    {profile.headline}
                  </Text>
                </View>
              </>
            )}
          </View>

          {summary ? (
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="stars" size={17} color="#FFFFFF" />
                  <Text variant="labelLg" weight="bold" style={{ color: '#FFFFFF' }}>
                    {summary.tier} Builder
                  </Text>
                </View>
                <Text variant="codeSm" weight="semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {summary.xp}/{summary.xpGoal || '∞'} XP
                </Text>
              </View>

              {summary.xpGoal > 0 ? (
                <View style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
                  <View style={{ width: `${progress * 100}%`, height: '100%', borderRadius: 4, backgroundColor: '#FFFFFF' }} />
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <HeroStat label="Events" value={summary.eventsAttended} />
                <HeroStat label="Badges" value={`${summary.badgesUnlocked}/${summary.badgesTotal}`} />
                <HeroStat label="Points" value={summary.points} />
              </View>

              <PressableScale
                onPress={() => router.push('/achievements')}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: theme.radius.base, backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                <Text variant="labelMd" weight="semibold" style={{ color: '#FFFFFF' }}>
                  View achievements
                </Text>
                <Icon name="chevronRight" size={16} color="#FFFFFF" />
              </PressableScale>
            </View>
          ) : (
            <PressableScale
              onPress={() => toast('Edit profile arriving soon', 'info')}
              style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, backgroundColor: 'rgba(255,255,255,0.18)' }}
            >
              <Text variant="labelSm" weight="semibold" style={{ color: '#FFFFFF' }}>
                Edit profile
              </Text>
            </PressableScale>
          )}
        </View>
      </Gradient>
    </View>
  );
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.14)', gap: 2 }}>
      <Text variant="labelLg" weight="bold" style={{ lineHeight: 18, color: '#FFFFFF' }}>
        {value}
      </Text>
      <Text variant="bodySm" style={{ lineHeight: 14, color: 'rgba(255,255,255,0.82)' }}>
        {label}
      </Text>
    </View>
  );
}
