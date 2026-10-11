import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { Text } from '@/components/ui/Text';

/** Clearance for the floating command bar + space switcher overlays. */
export const SPACE_BOTTOM_PADDING = 156;

interface SpaceScaffoldProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

/** Shared vertical scroll frame for a space page. */
export function SpaceScaffold({ title, description, children }: SpaceScaffoldProps) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: SPACE_BOTTOM_PADDING + insets.bottom }}
    >
      <YStack paddingHorizontal={16} gap={6}>
        <Text variant="headlineLg" family="heading">
          {title}
        </Text>
        <Text variant="bodyMd" muted>
          {description}
        </Text>
        {children}
      </YStack>
    </ScrollView>
  );
}
