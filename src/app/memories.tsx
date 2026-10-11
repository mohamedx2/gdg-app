import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Text } from '@/components/ui/Text';
import type { Memory } from '@/constants/memories';
import { useMemories } from '@/hooks/use-content';
import { useTheme } from '@/theme';

const GAP = 10;

export default function MemoriesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState<Memory | null>(null);
  const memories = useMemories();

  const columnWidth = (width - 32 - GAP) / 2;
  // Balance the two masonry columns by accumulated height.
  const columns: Memory[][] = [[], []];
  const heights = [0, 0];
  for (const memory of memories) {
    const tile = memory.portrait ? columnWidth * 1.33 : columnWidth * 0.75;
    const target = heights[0] <= heights[1] ? 0 : 1;
    columns[target].push(memory);
    heights[target] += tile + GAP;
  }

  return (
    <YStack flex={1} backgroundColor="background">
      <XStack paddingTop={insets.top + 8} paddingHorizontal={16} alignItems="center" gap={4}>
        <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
        <Text variant="headlineMd" weight="bold">
          Memories
        </Text>
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Reveal>
          <Text variant="bodyMd" muted>
            {memories.length} moments from the GDG On Campus EPI story — fairs, workshops and the people who made them.
          </Text>
        </Reveal>

        <XStack gap={GAP}>
          {columns.map((column, columnIndex) => (
            <YStack key={columnIndex} flex={1} gap={GAP}>
              {column.map((memory, index) => (
                <Reveal key={memory.id} delay={Math.min(index, 6) * 40}>
                  <PressableScale
                    onPress={() => setOpen(memory)}
                    accessibilityLabel={`Open photo: ${memory.caption}`}
                    style={{ borderRadius: theme.radius.card, overflow: 'hidden', backgroundColor: theme.colors.surfaceContainer }}
                  >
                    <Image
                      source={memory.source}
                      contentFit="cover"
                      transition={200}
                      style={{ width: '100%', height: memory.portrait ? columnWidth * 1.33 : columnWidth * 0.75 }}
                      accessibilityIgnoresInvertColors
                    />
                  </PressableScale>
                </Reveal>
              ))}
            </YStack>
          ))}
        </XStack>
      </ScrollView>

      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)} statusBarTranslucent>
        <Pressable
          onPress={() => setOpen(null)}
          accessibilityLabel="Close photo"
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          {open ? (
            <>
              <Image source={open.source} contentFit="contain" style={{ width: '100%', height: '78%' }} />
              <Text variant="titleSm" weight="semibold" style={{ color: '#FFFFFF', textAlign: 'center', marginTop: 16, paddingHorizontal: 24 }}>
                {open.caption}
              </Text>
            </>
          ) : null}
          <YStack position="absolute" top={insets.top + 12} right={16} width={44} height={44} borderRadius={22} alignItems="center" justifyContent="center" backgroundColor="rgba(255,255,255,0.14)">
            <Icon name="close" size={22} color="onPrimary" />
          </YStack>
        </Pressable>
      </Modal>
    </YStack>
  );
}
