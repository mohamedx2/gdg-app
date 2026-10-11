import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';

import { ArenaBadges } from '../arena/ArenaBadges';
import { ArenaQuests } from '../arena/ArenaQuests';
import { ArenaSquads } from '../arena/ArenaSquads';
import { ArenaStats } from '../arena/ArenaStats';
import { SPACE_BOTTOM_PADDING } from './SpaceScaffold';

type ArenaSegment = 'quests' | 'squads' | 'badges' | 'stats';

const SEGMENTS: readonly Segment<ArenaSegment>[] = [
  { value: 'quests', label: 'Quests' },
  { value: 'squads', label: 'Squads' },
  { value: 'badges', label: 'Badges' },
  { value: 'stats', label: 'Stats' },
];

/** ARENA — quests, squads, badges and club stats behind a segmented control. */
export function ArenaSpace() {
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState<ArenaSegment>('quests');

  return (
    <YStack flex={1}>
      <YStack paddingHorizontal={16} paddingTop={8} gap={12}>
        <Text variant="bodySm" muted>
          Compete, climb the board, earn XP
        </Text>
        <SegmentedControl<ArenaSegment>
          segments={SEGMENTS}
          value={segment}
          onChange={setSegment}
          size="sm"
          accessibilityLabel="Arena section"
        />
      </YStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: SPACE_BOTTOM_PADDING + insets.bottom,
          gap: 20,
        }}
      >
        {segment === 'quests' ? <ArenaQuests /> : null}
        {segment === 'squads' ? <ArenaSquads /> : null}
        {segment === 'badges' ? <ArenaBadges /> : null}
        {segment === 'stats' ? <ArenaStats /> : null}
      </ScrollView>
    </YStack>
  );
}

export default ArenaSpace;
