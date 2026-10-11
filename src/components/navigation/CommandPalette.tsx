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
      { id: 'achievements', icon: 'emojiEvents', label: 'Achievements', hint: 'Badges, XP & level', run: go('/achievements') },
      { id: 'squads', icon: 'groups', label: 'Squads', hint: 'Track teams', run: go('/squads') },
      { id: 'quests', icon: 'flag', label: 'Quests', hint: 'Goals & XP rewards', run: go('/quests') },
      { id: 'quiz', icon: 'help', label: 'Daily quiz', hint: 'Keep your streak', run: go('/quiz') },
      { id: 'stats', icon: 'insights', label: 'Club stats', hint: 'Our impact', run: go('/stats') },
      { id: 'memories', icon: 'celebration', label: 'Memories', hint: 'Past chapter moments', run: go('/memories') },
      { id: 'ideas', icon: 'lightbulb', label: 'Idea box', hint: 'Suggest what we build next', run: go('/ideas') },
      { id: 'decisions', icon: 'howToVote', label: 'Decisions', hint: 'Chapter matters', run: go('/decisions') },
      { id: 'presence', icon: 'nearMe', label: "Who's around", hint: 'Opt-in status & ETAs', run: go('/presence') },
      { id: 'settings', icon: 'settings', label: 'Settings', hint: 'Appearance & notifications', run: go('/settings') },
    ];
    if (can('tasks.view')) {
      list.push({ id: 'tasks', icon: 'taskAlt', label: 'Event tasks', hint: 'Task board', run: go('/tasks') });
    }
    if (isOrganizer) {
      list.push({ id: 'admin', icon: 'barChart', label: 'Organizer dashboard', hint: 'Manage the chapter', run: go('/admin') });
    }
    return list;
  }, [can, isOrganizer, onSelectSpace]);

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
              marginHorizontal: 16,
              marginBottom: insets.bottom + 16,
              maxHeight: 460,
              borderRadius: theme.radius.card,
              backgroundColor: theme.colors.surfaceContainerLowest,
              borderWidth: 1,
              borderColor: theme.colors.outlineVariant,
              overflow: 'hidden',
            },
            theme.shadow(3),
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingHorizontal: 16,
              height: 52,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.outlineVariant,
            }}
          >
            <Icon name="search" size={20} color="onSurfaceVariant" />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Jump to…"
              placeholderTextColor={theme.colors.outline}
              returnKeyType="go"
              onSubmitEditing={() => filtered[0] && run(filtered[0])}
              style={{
                flex: 1,
                color: theme.colors.onSurface,
                fontSize: 16,
                fontFamily: theme.typography.bodyMd.fontFamily,
              }}
            />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.colors.surfaceContainerLow,
                    }}
                  >
                    <Icon name={command.icon} size={18} color="onSurfaceVariant" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="labelLg" weight="medium">
                      {command.label}
                    </Text>
                    <Text variant="bodyXs" muted>
                      {command.hint}
                    </Text>
                  </View>
                  <Icon name="arrowForward" size={16} color="secondary" />
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
