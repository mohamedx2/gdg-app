import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import type { PressableProps } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gradient } from '@/components/ui/Gradient';
import { Icon, IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { useTheme } from '@/theme';

const TAB_META: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Home', icon: 'home' },
  events: { label: 'Events', icon: 'event' },
  community: { label: 'Community', icon: 'groups' },
  resources: { label: 'Resources', icon: 'terminal' },
  profile: { label: 'Profile', icon: 'account' },
};

interface WritableTabBarProps {
  state: { index: number; routes: { key: string; name: string; params?: unknown }[] };
  descriptors: Record<string, { options: Record<string, unknown> }>;
  navigation: {
    emit: (event: {
      type: 'tabPress' | 'tabLongPress';
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: unknown) => void;
  };
}

export default function TabsLayout() {
  const theme = useTheme();
  const { status } = useAuth();

  // Wait for the stored session before deciding; guests may browse the tabs.
  if (status === 'loading') return null;
  if (status === 'unauthenticated') {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      tabBar={(props) => <DockTabBar {...(props as unknown as WritableTabBarProps)} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="resources" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

function DockTabBar({ state, descriptors, navigation }: WritableTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: insets.bottom + 10,
        flexDirection: 'row',
        backgroundColor: theme.isDark ? theme.colors.surfaceContainerHigh : theme.colors.inverseSurface,
        borderRadius: theme.radius.full,
        paddingVertical: 8,
        paddingHorizontal: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      {state.routes.map((route, index) => {
        const meta = TAB_META[route.name] ?? { label: route.name, icon: 'home' as IconName };
        const isFocused = state.index === index;
        const options = descriptors[route.key]?.options ?? {};

        const onPress: PressableProps['onPress'] = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={(options.tabBarAccessibilityLabel as string | undefined) ?? meta.label}
            style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 }}
          >
            <View
              style={{
                width: 52,
                height: 34,
                borderRadius: theme.radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {isFocused ? (
                <Gradient token="brand" style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              ) : null}
              <Icon name={meta.icon} size={22} color={isFocused ? '#FFFFFF' : 'outline'} />
            </View>
            <Text
              variant="labelSm"
              color={isFocused ? (theme.isDark ? 'onSurface' : 'inverseOnSurface') : 'outline'}
              weight={isFocused ? 'semibold' : 'regular'}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}