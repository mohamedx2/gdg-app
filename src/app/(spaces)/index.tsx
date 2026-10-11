import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommandBar } from '@/components/navigation/CommandBar';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { SpaceSwitcher } from '@/components/navigation/SpaceSwitcher';
import { TopBar } from '@/components/navigation/TopBar';
import { useAuth } from '@/features/auth/auth-provider';
import { SPACES, spaceIndex, type SpaceKey } from '@/features/spaces/space-config';
import { SpacesPager } from '@/features/spaces/SpacesPager';
import { useNotifications } from '@/hooks/use-community';
import { useConversations } from '@/hooks/use-messages';
import { useTheme } from '@/theme';

/**
 * Spaces shell: persistent TopBar over a horizontal pager of the four spaces,
 * with the floating command bar and space switcher docked above the safe area.
 */
export default function SpacesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ space?: string }>();

  const [index, setIndex] = useState(() => spaceIndex(params.space));
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Follow links that target a space while the shell is already mounted.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (params.space) setIndex(spaceIndex(params.space));
  }, [params.space]);

  const handleSelect = useCallback((key: SpaceKey) => {
    setIndex(spaceIndex(key));
  }, []);

  const active = SPACES[index] ?? SPACES[0];

  const { data: conversations } = useConversations();
  const { data: notifications } = useNotifications();
  const unread =
    (conversations ?? []).reduce((sum, item) => sum + item.unreadCount, 0) +
    (notifications ?? []).filter((item) => !item.read).length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TopBar
        title={active.title}
        avatarName={user?.name ?? 'You'}
        avatarUri={user?.avatar}
        unread={unread}
      />
      <SpacesPager index={index} onIndexChange={setIndex} />
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 10,
          gap: 10,
        }}
      >
        <CommandBar onOpen={() => setPaletteOpen(true)} />
        <SpaceSwitcher spaces={SPACES} value={active.key} onChange={handleSelect} />
      </View>
      <CommandPalette
        visible={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectSpace={handleSelect}
      />
    </View>
  );
}
