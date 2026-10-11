import { router, type Href } from 'expo-router';
import React, { memo, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { SPACES, type SpaceKey } from '@/features/spaces/space-config';
import { useTheme } from '@/theme';
import type { ColorToken } from '@/theme/colors';

interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
  onSelectSpace: (key: SpaceKey) => void;
}

interface Command {
  id: string;
  icon: IconName;
  label: string;
  hint: string;
  run: () => void;
}

/**
 * "Jump to" overlay launched from the command bar: a search field over space
 * switches and the app's key destinations, filtered by permission.
 */
export const CommandPalette = memo(function CommandPalette({
  visible,
  onClose,
  onSelectSpace,
}: CommandPaletteProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { can, isOrganizer } = useAuth();
  const [query, setQuery] = useState('');

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href as Href);
    const list: Command[] = [
      ...SPACES.map((space) => ({
        id: `space-${space.key}`,
        icon: space.icon,
        label: space.title,
        hint: 'Space',
        run: () => onSelectSpace(space.key),
      })),
      { id: 'inbox', icon: 'chatBubble', label: 'Inbox', hint: 'Messages & alerts', run: go('/inbox') },
      { id: 'me', icon: 'person', label: 'Profile', hint: 'Account & settings', run: go('/me') },
      { id: 'achievements', icon: 'emojiEvents', label: 'Badges', hint: 'Arena · badges & XP', run: go('/?space=arena&segment=badges') },
      { id: 'squads', icon: 'groups', label: 'Squads', hint: 'Arena · podium', run: go('/?space=arena&segment=squads') },
      { id: 'quests', icon: 'flag', label: 'Quests', hint: 'Arena · missions', run: go('/?space=arena&segment=quests') },
      { id: 'quiz', icon: 'help', label: 'Daily quiz', hint: 'Keep your streak', run: go('/quiz') },
      { id: 'stats', icon: 'insights', label: 'Club stats', hint: 'Our impact', run: go('/stats') },
      { id: 'memories', icon: 'celebration', label: 'Memories', hint: 'Past chapter moments', run: go('/memories') },
      { id: 'ideas', icon: 'lightbulb', label: 'Idea box', hint: 'Voice · suggest & upvote', run: go('/?space=voice&segment=ideas') },
      { id: 'decisions', icon: 'howToVote', label: 'Decisions', hint: 'Voice · open votes', run: go('/?space=voice&segment=decisions') },
      { id: 'presence', icon: 'nearMe', label: "Who's around", hint: 'Opt-in status & ETAs', run: go('/presence') },
      { id: 'settings', icon: 'settings', label: 'Settings', hint: 'Appearance & notifications', run: go('/settings') },
    ];
    if (can('tasks.view')) {
      list.push({ id: 'tasks', icon: 'taskAlt', label: 'Event tasks', hint: 'Voice · task board', run: go('/?space=voice&segment=tasks') });
    }
    if (isOrganizer) {
      list.push({ id: 'admin', icon: 'barChart', label: 'Organizer dashboard', hint: 'Manage the chapter', run: go('/admin') });
    }
    return list;
  }, [can, isOrganizer, onSelectSpace]);

  const quickActions = useMemo<(Command & { tone: ColorToken })[]>(() => {
    const go = (href: string) => () => router.push(href as Href);
    return [
      { id: 'qa-quiz', icon: 'help', label: 'Daily Quiz', hint: 'Keep the streak', tone: 'secondaryContainer', run: go('/quiz') },
      { id: 'qa-explore', icon: 'event', label: 'Events', hint: 'Explore lineup', tone: 'primaryFixed', run: () => onSelectSpace('explore') },
      { id: 'qa-idea', icon: 'lightbulb', label: 'Pitch Idea', hint: 'Voice · ideas', tone: 'surfaceContainerHigh', run: go('/?space=voice&segment=ideas') },
      { id: 'qa-inbox', icon: 'chatBubble', label: 'Direct Inbox', hint: 'Messages & alerts', tone: 'tertiaryFixed', run: go('/inbox') },
    ];
  }, [onSelectSpace]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return commands;
    return commands.filter(
      (command) =>
        command.label.toLowerCase().includes(text) || command.hint.toLowerCase().includes(text),
    );
  }, [commands, query]);

  const run = (command: Command) => {
    onClose();
    setQuery('');
    // Defer so the modal closes before the navigation animates.
    requestAnimationFrame(() => command.run());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      onShow={() => setQuery('')}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: theme.colors.overlay }}
      >
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close command palette"
          style={{ flex: 1 }}
        />
        <View
          style={[
            {
              maxHeight: '86%',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              backgroundColor: theme.colors.surfaceContainerLowest,
              paddingBottom: insets.bottom + 12,
              overflow: 'hidden',
            },
            theme.shadow(3),
          ]}
        >
          <View style={{ alignItems: 'center', paddingTop: 10 }}>
            <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: theme.colors.outlineVariant }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
            <Text variant="headlineSm" weight="bold" style={{ flex: 1 }}>
              Jump to
            </Text>
            <PressableScale onPress={onClose} accessibilityLabel="Close command palette" hitSlop={8}>
              <Icon name="close" size={24} color="onSurfaceVariant" />
            </PressableScale>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginHorizontal: 16,
              paddingHorizontal: 14,
              height: 56,
              borderRadius: 18,
              backgroundColor: theme.colors.surfaceContainerLow,
            }}
          >
            <View style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryFixed }}>
              <Icon name="search" size={18} color="primary" />
            </View>
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Type a command or search…"
              placeholderTextColor={theme.colors.outline}
              returnKeyType="go"
              onSubmitEditing={() => filtered[0] && run(filtered[0])}
              style={{ flex: 1, color: theme.colors.onSurface, fontSize: 16, fontFamily: theme.typography.bodyMd.fontFamily }}
            />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 14 }}>
            {!query.trim() ? (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="codeSm" weight="bold" muted>
                    QUICK ACTIONS
                  </Text>
                  <Text variant="codeSm" weight="bold" primary>
                    ● READY
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {quickActions.map((action) => (
                    <PressableScale
                      key={action.id}
                      onPress={() => run(action)}
                      accessibilityLabel={action.label}
                      style={{ flexBasis: '47%', flexGrow: 1, padding: 14, gap: 12, borderRadius: 20, backgroundColor: theme.colors.surfaceContainerLow }}
                    >
                      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors[action.tone] }}>
                        <Icon name={action.icon} size={20} color="onSurface" />
                      </View>
                      <View>
                        <Text variant="titleSm" weight="bold">
                          {action.label}
                        </Text>
                        <Text variant="codeSm" muted numberOfLines={1}>
                          {action.hint}
                        </Text>
                      </View>
                    </PressableScale>
                  ))}
                </View>
                {isOrganizer ? (
                  <PressableScale
                    onPress={() => run({ id: 'gate', icon: 'qrCodeScanner', label: 'Gate Check-in', hint: '', run: () => router.push('/admin/check-in' as Href) })}
                    accessibilityLabel="Open gate check-in scanner"
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20, backgroundColor: theme.colors.inverseSurface }}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceContainerHigh }}>
                      <Icon name="qrCodeScanner" size={22} color="onSurface" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleSm" weight="bold" color="inverseOnSurface">
                        Gate Check-in
                      </Text>
                      <Text variant="codeSm" color="outline">
                        Staff scanner
                      </Text>
                    </View>
                    <Icon name="chevronRight" size={20} color="inverseOnSurface" />
                  </PressableScale>
                ) : null}
                <Text variant="codeSm" weight="bold" muted>
                  ALL DESTINATIONS
                </Text>
              </>
            ) : null}
            {filtered.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center', gap: 6 }}>
                <Icon name="manageSearch" size={26} color="secondary" />
                <Text variant="bodySm" muted>
                  Nothing matches “{query.trim()}”.
                </Text>
              </View>
            ) : (
              filtered.map((command) => (
                <PressableScale
                  key={command.id}
                  onPress={() => run(command)}
                  accessibilityLabel={command.label}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}
                >
                  <Icon name={command.icon} size={20} color="onSurfaceVariant" />
                  <View style={{ flex: 1 }}>
                    <Text variant="labelLg" weight="semibold">
                      {command.label}
                    </Text>
                    <Text variant="codeSm" muted>
                      {command.hint}
                    </Text>
                  </View>
                  <Icon name="arrowForward" size={16} color="onSurfaceVariant" />
                </PressableScale>
              ))
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

export default CommandPalette;
