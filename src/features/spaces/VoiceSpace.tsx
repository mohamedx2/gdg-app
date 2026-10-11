import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';

import { SPACE_BOTTOM_PADDING } from './SpaceScaffold';
import { VoiceDecisions } from '../voice/VoiceDecisions';
import { VoiceIdeas } from '../voice/VoiceIdeas';
import { VoiceTasks } from '../voice/VoiceTasks';

type VoiceSegment = 'ideas' | 'tasks' | 'decisions';

const SEGMENTS: readonly Segment<VoiceSegment>[] = [
  { value: 'ideas', label: 'Ideas' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'decisions', label: 'Votes' },
];

/** VOICE — ideas, tasks and core decisions behind a segmented control. */
export function VoiceSpace() {
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState<VoiceSegment>('ideas');

  return (
    <YStack flex={1}>
      <YStack paddingHorizontal={16} paddingTop={8} gap={12}>
        <Text variant="bodySm" muted>
          Suggest, organise, decide together
        </Text>
        <SegmentedControl<VoiceSegment>
          segments={SEGMENTS}
          value={segment}
          onChange={setSegment}
          size="sm"
          accessibilityLabel="Voice section"
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
        {segment === 'ideas' ? <VoiceIdeas /> : null}
        {segment === 'tasks' ? <VoiceTasks /> : null}
        {segment === 'decisions' ? <VoiceDecisions /> : null}
      </ScrollView>
    </YStack>
  );
}

export default VoiceSpace;
