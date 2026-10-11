import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view';

import { ArenaSpace } from './ArenaSpace';
import { ExploreSpace } from './ExploreSpace';
import { TodaySpace } from './TodaySpace';
import { VoiceSpace } from './VoiceSpace';

interface SpacesPagerProps {
  index: number;
  onIndexChange: (index: number) => void;
}

/** Native pager: horizontal swipe between the four spaces. */
export function SpacesPager({ index, onIndexChange }: SpacesPagerProps) {
  const ref = useRef<PagerView>(null);

  useEffect(() => {
    ref.current?.setPage(index);
  }, [index]);

  const handlePageSelected = (event: PagerViewOnPageSelectedEvent) => {
    onIndexChange(event.nativeEvent.position);
  };

  return (
    <PagerView
      ref={ref}
      style={{ flex: 1 }}
      initialPage={index}
      onPageSelected={handlePageSelected}
      overdrag
    >
      <View key="today" style={{ flex: 1 }} collapsable={false}>
        <TodaySpace />
      </View>
      <View key="explore" style={{ flex: 1 }} collapsable={false}>
        <ExploreSpace />
      </View>
      <View key="arena" style={{ flex: 1 }} collapsable={false}>
        <ArenaSpace />
      </View>
      <View key="voice" style={{ flex: 1 }} collapsable={false}>
        <VoiceSpace />
      </View>
    </PagerView>
  );
}
