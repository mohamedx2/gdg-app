import React, { memo } from 'react';
import { View } from 'react-native';

import { Icon, IconName } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export interface CommandBarAction {
  icon: IconName;
  label: string;
  onPress: () => void;
}

interface CommandBarProps {
  onOpen: () => void;
  actions?: readonly CommandBarAction[];
}

/** Floating quick-action pill that opens the command palette. */
export const CommandBar = memo(function CommandBar({ onOpen, actions = [] }: CommandBarProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          height: 48,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 8,
          borderRadius: 999,
          backgroundColor: theme.isDark
            ? theme.colors.surfaceContainerHigh
            : theme.colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        },
        theme.shadow(2),
      ]}
    >
      <PressableScale
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel="Open command palette"
        style={{
          flex: 1,
          height: 36,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          borderRadius: 999,
        }}
      >
        <Icon name="terminal" size={18} color="onSurfaceVariant" />
        <Text variant="codeSm" muted style={{ flex: 1 }} numberOfLines={1}>
          gdg://command search…
        </Text>
        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: theme.colors.surfaceContainerHigh }}>
          <Text variant="codeSm" weight="bold" muted>
            ⌘K
          </Text>
        </View>
      </PressableScale>
      {actions.map((action) => (
        <PressableScale
          key={action.label}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={{ width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name={action.icon} size={20} color="onSurfaceVariant" />
        </PressableScale>
      ))}
    </View>
  );
});
