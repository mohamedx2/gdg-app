import React from 'react';
import { GuestGate } from '@/components/GuestGate';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';

import { ArenaBadges } from '../arena/ArenaBadges';
import { ArenaQuiz } from '../arena/ArenaQuiz';
import { ArenaQuests } from '../arena/ArenaQuests';
import { ArenaSquads } from '../arena/ArenaSquads';
import { ArenaStats } from '../arena/ArenaStats';
import { RankHero } from '../arena/RankHero';
import { SPACE_BOTTOM_PADDING } from './SpaceScaffold';
import { useRouteSegment } from './use-route-segment';

type ArenaSegment = 'quests' | 'squads' | 'quiz' | 'badges';

const SEGMENT_KEYS = ['quests', 'squads', 'quiz', 'badges'] as const;

const SEGMENTS: readonly Segment<ArenaSegment>[] = [
  { value: 'quests', label: 'Quests' },
  { value: 'squads', label: 'Squads' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'badges', label: 'Badges' },
];

/** ARENA — rank hero, then quests · squads · quiz · badges (club stats live under badges). */
export function ArenaSpace() {
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useRouteSegment<ArenaSegment>(SEGMENT_KEYS, 'quests');

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: 16,
        paddingTop: 8,
        paddingBottom: SPACE_BOTTOM_PADDING + insets.bottom,
        gap: 20,
      }}
    >
      <GuestGate reason="climb the arena, earn XP and join a squad" icon="emojiEvents">
      <RankHero />
      <SegmentedControl<ArenaSegment>
        segments={SEGMENTS}
        value={segment}
        onChange={setSegment}
        size="sm"
        accessibilityLabel="Arena section"
      />
      {segment === 'quests' ? <ArenaQuests /> : null}
      {segment === 'squads' ? <ArenaSquads /> : null}
      {segment === 'quiz' ? <ArenaQuiz /> : null}
      {segment === 'badges' ? (
        <>
          <ArenaBadges />
          <ArenaStats />
        </>
      ) : null}
      </GuestGate>
    </ScrollView>
  );
}

export default ArenaSpace;
