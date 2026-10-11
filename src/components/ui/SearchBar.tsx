import React, { memo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  filterActive?: boolean;
  accessibilityLabel?: string;
}

export const SearchBar = memo(function SearchBar({
  value,
  onChangeText,
  placeholder,
  onFilterPress,
  filterActive,
  accessibilityLabel,
}: SearchBarProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: focused ? theme.colors.primaryContainer : theme.colors.outlineVariant,
        paddingLeft: 14,
        paddingRight: 6,
        shadowColor: theme.colors.inverseSurface,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: focused ? 0.08 : 0.05,
        shadowRadius: 3,
        elevation: focused ? 2 : 1,
      }}
    >
      <Icon name="search" size={20} color={focused ? 'primary' : 'secondary'} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.outline}
        accessibilityLabel={accessibilityLabel ?? 'Search'}
        autoCorrect={false}
        returnKeyType="search"
        style={{
          flex: 1,
          height: '100%',
          paddingHorizontal: 10,
          fontFamily: theme.typography.bodyMd.fontFamily,
          fontSize: 14,
          color: theme.colors.onSurface,
        }}
      />
      {onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          accessibilityLabel="Filter options"
          accessibilityRole="button"
          hitSlop={8}
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: filterActive ? theme.colors.primaryFixed : theme.colors.surfaceContainer,
          }}
        >
          <Icon name="tune" size={20} color={filterActive ? 'primary' : 'secondary'} />
        </Pressable>
      ) : (
        <Text variant="codeSm" color="primary" style={{ paddingHorizontal: 10 }}>
          Sousse GMT+1
        </Text>
      )}
    </View>
  );
});