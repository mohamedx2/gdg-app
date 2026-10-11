import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { VoiceIdeas } from '@/features/voice/VoiceIdeas';

export default function IdeasScreen() {
  const insets = useSafeAreaInsets();
  return (
    <YStack flex={1} backgroundColor="background">
      <XStack paddingTop={insets.top + 8} paddingHorizontal={16} alignItems="center" gap={4}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text variant="headlineMd" weight="bold">
          Idea box
        </Text>
      </XStack>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 20 }} showsVerticalScrollIndicator={false}>
        <VoiceIdeas />
      </ScrollView>
    </YStack>
  );
}
