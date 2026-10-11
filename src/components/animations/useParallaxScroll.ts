import { useAnimatedRef, useScrollOffset } from 'react-native-reanimated';
import type { ScrollView } from 'react-native';

/** Pairs an animated ref with the live scroll offset for parallax effects. */
export function useParallaxScroll() {
  const ref = useAnimatedRef<ScrollView>();
  const scrollOffset = useScrollOffset(ref);
  return { ref, scrollOffset };
}
