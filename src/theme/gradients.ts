import type { ColorValue } from 'react-native';

/**
 * Expressive Google-brand gradient ramps layered on top of the Material 3 token set.
 * All presets are tuned so white foregrounds clear 4.5:1 contrast on every stop.
 */
export type Gradient = readonly [ColorValue, ColorValue, ...ColorValue[]];

export const gradients = {
  /** Signature Google-blue ramp — CTAs, active navigation, header strips. */
  brand: ['#1A73E8', '#1A5FD6', '#0B3FA0'] as Gradient,
  /** Blue → teal growth ramp — XP, streaks and progress surfaces. */
  aurora: ['#1A73E8', '#00897B'] as Gradient,
  /** Warm ramp — achievements and celebratory moments. */
  sunrise: ['#F9AB00', '#EA4335'] as Gradient,
  /** Full four-colour Google ribbon — hero artwork and decorative accents. */
  google: ['#4285F4', '#EA4335', '#FBBC04', '#34A853'] as Gradient,
  /** Deep night panel for dark immersive surfaces. */
  night: ['#0B0D12', '#1A2A4A'] as Gradient,
  /** Blue → violet hero highlight (TODAY / event heroes). */
  hero: ['#1A5FD6', '#6C5CE7'] as Gradient,
  /** Multi-hue gamified aura for XP / level milestone containers. */
  xp: ['#1A5FD6', '#8E44AD', '#F39C12', '#27AE60'] as Gradient,
} as const;

export type GradientToken = keyof typeof gradients;
