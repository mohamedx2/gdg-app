import React, { memo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { FadeIn } from './FadeIn';
import type { EnterDirection } from './motion';

interface StaggerProps {
  children: React.ReactNode;
  /** Zero-based position in the list; drives the entrance delay. */
  index: number;
  /** Per-item delay increment in ms. */
  step?: number;
  /** Flat base delay added before the index offset. */
  base?: number;
  direction?: EnterDirection;
  exit?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Staggered list-item entrance built on {@link FadeIn}. */
export const Stagger = memo(function Stagger({
  children,
  index,
  step = 60,
  base = 0,
  direction = 'down',
  exit,
  style,
}: StaggerProps) {
  return (
    <FadeIn direction={direction} delay={base + index * step} exit={exit} style={style}>
      {children}
    </FadeIn>
  );
});
