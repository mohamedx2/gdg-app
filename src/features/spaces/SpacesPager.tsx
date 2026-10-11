import React from 'react';
import { View } from 'react-native';

import { ArenaSpace } from './ArenaSpace';
import { ExploreSpace } from './ExploreSpace';
import { TodaySpace } from './TodaySpace';
import { VoiceSpace } from './VoiceSpace';

interface SpacesPagerProps {
  index: number;
  onIndexChange: (index: number) => void;
}

/**
 * Web fallback: `react-native-pager-view` is native-only, so on web we render
 * just the active space. Switching happens via the space switcher dock.
 */
export function SpacesPager({ index }: SpacesPagerProps) {
  const spaces = [TodaySpace, ExploreSpace, ArenaSpace, VoiceSpace];
  const Active = spaces[index] ?? TodaySpace;
  return (
    <View style={{ flex: 1 }}>
      <Active />
    </View>
  );
}
