import { router, type Href } from 'expo-router';
import React, { memo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';

interface TopBarProps {
  title: string;
  avatarName?: string;
  avatarUri?: string | null;
  /** Combined messages + notifications unread count. */
  unread?: number;
  onPressAvatar?: () => void;
  onPressInbox?: () => void;
  onPressSearch?: () => void;
  right?: React.ReactNode;
}

/** Persistent spaces header: profile avatar · space title · inbox. */
export const TopBar = memo(function TopBar({
  title,
  avatarName = 'You',
  avatarUri,
  unread = 0,
  onPressAvatar,
  onPressInbox,
  onPressSearch,
  right,
}: TopBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
        }}
      >
        <PressableScale
          onPress={onPressAvatar ?? (() => router.push('/me' as Href))}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Avatar name={avatarName} uri={avatarUri} size={36} ring="none" />
        </PressableScale>
        <Text variant="headlineSm" weight="bold" numberOfLines={1} style={{ flex: 1 }}>
          {title}
        </Text>
        {right}
        {onPressSearch ? (
          <PressableScale
            onPress={onPressSearch}
            accessibilityRole="button"
            accessibilityLabel="Search and jump to"
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="search" size={22} color="onSurfaceVariant" />
          </PressableScale>
        ) : null}
        <PressableScale
          onPress={onPressInbox ?? (() => router.push('/inbox' as Href))}
          accessibilityRole="button"
          accessibilityLabel={unread > 0 ? `Inbox, ${unread} unread` : 'Inbox'}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="notifications" size={22} color="onSurfaceVariant" />
          {unread > 0 ? (
            <View
              style={{
                position: 'absolute',
                top: 3,
                right: 2,
                minWidth: 16,
                height: 16,
                paddingHorizontal: 4,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.error,
              }}
            >
              <Text
                weight="bold"
                style={{ color: theme.colors.onError, fontSize: 9, lineHeight: 11 }}
              >
                {unread > 99 ? '99+' : unread}
              </Text>
            </View>
          ) : null}
        </PressableScale>
      </View>
    </View>
  );
});

export default TopBar;
