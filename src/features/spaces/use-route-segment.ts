import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

/**
 * Segment state that also follows the `segment` route param, so links like
 * `/?space=voice&segment=tasks` open the right section. Values that don't belong
 * to this screen are ignored, letting every space share the same param.
 */
export function useRouteSegment<T extends string>(valid: readonly T[], fallback: T) {
  const { segment } = useLocalSearchParams<{ segment?: string }>();
  const fromRoute = valid.find((value) => value === segment);
  const [value, setValue] = useState<T>(fromRoute ?? fallback);

  useEffect(() => {
    // Mirror external navigation; local taps keep working in between.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fromRoute) setValue(fromRoute);
  }, [fromRoute]);

  return [value, setValue] as const;
}
