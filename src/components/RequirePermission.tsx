import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import type { Permission } from '@/lib/auth/permissions';
import { useTheme } from '@/theme';

/** Renders children only when the signed-in member holds `permission`. */
export function RequirePermission({
  permission,
  message = 'This area is reserved for the core team.',
  children,
}: {
  permission: Permission;
  message?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { can } = useAuth();

  if (can(permission)) return <>{children}</>;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: 32, paddingTop: insets.top + 32, gap: 12 }}>
      <View style={{ width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceContainerHigh }}>
        <Icon name="lock" size={26} color="onSurfaceVariant" />
      </View>
      <Text variant="titleMd" weight="bold">
        Access restricted
      </Text>
      <Text variant="bodySm" muted style={{ textAlign: 'center' }}>
        {message}
      </Text>
      <Button label="Go back" icon="arrowBack" variant="container" onPress={() => router.back()} />
    </View>
  );
}
