import { Platform, ViewStyle } from 'react-native';

/**
 * Structural contours with ambient tonal lifts.
 * Dark mode relies on surface color shifts instead of heavy shadows.
 */
export type ShadowLevel = 0 | 1 | 2 | 3;

const lightShadows: Record<ShadowLevel, ViewStyle> = {
  0: {},
  1: {
    shadowColor: '#1A1C22',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  2: {
    shadowColor: '#1A1C22',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  3: {
    shadowColor: '#1A1C22',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 12,
  },
};

const darkShadows: Record<ShadowLevel, ViewStyle> = {
  0: {},
  1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const shadows = {
  light: lightShadows,
  dark: darkShadows,
};

export function getShadow(level: ShadowLevel, mode: 'light' | 'dark' = 'light'): ViewStyle {
  return mode === 'dark' ? darkShadows[level] : lightShadows[level];
}

/**
 * Chromatic edge glows from the dark design system — low-radius luminous
 * radiance used on focal interactive elements and live status surfaces.
 */
export type GlowToken = 'blue' | 'green' | 'red' | 'spark';

const glows: Record<GlowToken, ViewStyle> = {
  blue: {
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 0,
  },
  green: {
    shadowColor: '#34A853',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 0,
  },
  red: {
    shadowColor: '#EA4335',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 0,
  },
  spark: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 0,
  },
};

export function getGlow(token: GlowToken): ViewStyle {
  return glows[token];
}

export const hairline = Platform.select({ ios: 0.5, android: 0.5, default: 1 });
