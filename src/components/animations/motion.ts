import {
  BaseAnimationBuilder,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';

export type EnterDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export const motion = {
  duration: { fast: 180, base: 260, slow: 420 },
  easing: {
    standard: Easing.bezier(0.2, 0, 0, 1),
    emphasized: Easing.bezier(0.05, 0.7, 0.1, 1),
  },
} as const;

export function enterFrom(direction: EnterDirection = 'down', delay = 0): BaseAnimationBuilder {
  switch (direction) {
    case 'up':
      return FadeInUp.delay(delay).springify().damping(18).stiffness(180);
    case 'left':
      return FadeInLeft.delay(delay).springify().damping(18).stiffness(180);
    case 'right':
      return FadeInRight.delay(delay).springify().damping(18).stiffness(180);
    case 'none':
      return FadeIn.delay(delay).duration(motion.duration.base);
    case 'down':
    default:
      return FadeInDown.delay(delay).springify().damping(18).stiffness(180);
  }
}
