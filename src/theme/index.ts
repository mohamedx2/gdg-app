import { useColorScheme } from 'react-native';

import { Colors, ThemeMode, dark, light } from './colors';
import { getShadow, ShadowLevel } from './shadows';
import { spacing, SpacingToken } from './spacing';
import { radius, RadiusToken } from './radius';
import { typography, TypographyToken } from './typography';
import { gradients, Gradient, GradientToken } from './gradients';
import { useThemeStore } from '@/stores/theme.store';

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  text: (token: TypographyToken) => (typeof typography)[TypographyToken];
  space: (token: SpacingToken) => number;
  round: (token: RadiusToken) => number;
  shadow: (level: ShadowLevel) => ReturnType<typeof getShadow>;
}

export type ThemePreference = 'system' | 'light' | 'dark';

function buildTheme(mode: ThemeMode): Theme {
  const colors = mode === 'dark' ? dark : light;
  return {
    mode,
    isDark: mode === 'dark',
    colors,
    spacing,
    radius,
    typography,
    text: (token) => typography[token],
    space: (token) => spacing[token],
    round: (token) => radius[token],
    shadow: (level) => getShadow(level, mode),
  };
}

/** Resolves the stored appearance preference against the system scheme. */
export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((s) => s.preference);
  const resolved: ThemeMode =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  return buildTheme(resolved);
}

export { light, dark, gradients };
export type {
  Colors,
  ThemeMode,
  ShadowLevel,
  TypographyToken,
  SpacingToken,
  RadiusToken,
  Gradient,
  GradientToken,
};
