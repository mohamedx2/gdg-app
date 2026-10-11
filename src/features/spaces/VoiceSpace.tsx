import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { GuestGate } from '@/components/GuestGate';
import { Icon } from '@/components/ui/Icon';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { useDecisions } from '@/hooks/use-decisions';
import { useIdeas } from '@/hooks/use-ideas';
import { useTasks } from '@/hooks/use-tasks';

import { SPACE_BOTTOM_PADDING } from './SpaceScaffold';
import { useRouteSegment } from './use-route-segment';
import { VoiceDecisions } from '../voice/VoiceDecisions';
import { VoiceIdeas } from '../voice/VoiceIdeas';
import { VoiceTasks } from '../voice/VoiceTasks';

type VoiceSegment = 'ideas' | 'decisions' | 'tasks';

const SEGMENT_KEYS = ['ideas', 'decisions', 'tasks'] as const;

/** VOICE — community header, then ideas · decisions · tasks. */
export function VoiceSpace() {
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useRouteSegment<VoiceSegment>(SEGMENT_KEYS, 'ideas');
  const { can } = useAuth();
  const { data: ideas } = useIdeas();
  const { data: decisions } = useDecisions();
  const { data: tasks } = useTasks();

  const openPolls = decisions?.filter((item) => item.status === 'open').length;
  const openTasks = can('tasks.view') ? tasks?.filter((item) => item.status !== 'done').length : undefined;
  const segments: readonly Segment<VoiceSegment>[] = [
    { value: 'ideas', label: 'Ideas', count: ideas?.length },
    { value: 'decisions', label: 'Decisions', count: openPolls },
    { value: 'tasks', label: 'Tasks', count: openTasks },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: SPACE_BOTTOM_PADDING + insets.bottom, gap: 20 }}
    >
      <YStack padding={16} gap={10} borderRadius="card" backgroundColor="surfaceContainerLow">
        <XStack alignItems="flex-start" gap={12}>
          <YStack flex={1} gap={4}>
            <XStack alignItems="center" gap={6}>
              <YStack width={6} height={6} borderRadius={3} backgroundColor="live" />
              <Text variant="codeSm" weight="bold" color="tertiary">
                CAMPUS CONSENSUS ENGINE
              </Text>
            </XStack>
            <Text variant="headlineSm" weight="bold">
              Community Voice
            </Text>
            <Text variant="bodySm" muted>
              Shape events, vote on the roadmap and take on campus tasks.
            </Text>
          </YStack>
          <YStack width={48} height={48} borderRadius={14} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerLowest">
            <Icon name="howToVote" size={22} color="primary" />
          </YStack>
        </XStack>
        <XStack gap={8} flexWrap="wrap">
          <CountChip label="Ideas" value={ideas?.length} />
          <CountChip label="Open Polls" value={openPolls} />
          {openTasks !== undefined ? <CountChip label="Micro-Tasks" value={openTasks} /> : null}
        </XStack>
      </YStack>

      <SegmentedControl<VoiceSegment> segments={segments} value={segment} onChange={setSegment} accessibilityLabel="Voice section" />

      <GuestGate reason="suggest ideas, follow decisions and pick up tasks" icon="forum">
        {segment === 'ideas' ? <VoiceIdeas /> : null}
        {segment === 'decisions' ? <VoiceDecisions /> : null}
        {segment === 'tasks' ? <VoiceTasks /> : null}
      </GuestGate>
    </ScrollView>
  );
}

function CountChip({ label, value }: { label: string; value?: number }) {
  return (
    <YStack paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="surfaceContainerLowest">
      <Text variant="codeSm" weight="bold">
        {value ?? '–'} {label}
      </Text>
    </YStack>
  );
}

export default VoiceSpace;
