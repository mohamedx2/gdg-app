import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import React, { memo } from 'react';

import { gradients, GradientToken } from '@/theme';

interface GradientProps extends Omit<LinearGradientProps, 'colors'> {
  /** Named brand ramp from the theme. Ignored when `colors` is provided. */
  token?: GradientToken;
  colors?: LinearGradientProps['colors'];
}

/** Brand gradient surface — defaults to a diagonal Google-blue ramp. */
export const Gradient = memo(function Gradient({
  token = 'brand',
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  ...rest
}: GradientProps) {
  return (
    <LinearGradient
      colors={colors ?? gradients[token]}
      start={start}
      end={end}
      style={style}
      {...rest}
    />
  );
});
