import { TextStyle } from 'react-native';

/**
 * Type scale from the Stitch design system.
 * Headlines: Plus Jakarta Sans — Body/Controls: Inter — Developer metas: JetBrains Mono.
 */
export const fonts = {
  heading: 'PlusJakartaSans_600SemiBold',
  headingBold: 'PlusJakartaSans_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const typography = {
  headlineXl: {
    fontFamily: fonts.headingBold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.72,
    color: 'onSurface',
  },
  headlineXlMobile: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.56,
    color: 'onSurface',
  },
  headlineLg: {
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.36,
    color: 'onSurface',
  },
  headlineMd: {
    fontFamily: fonts.heading,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: 'onSurface',
  },
  headlineSm: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 24,
    color: 'onSurface',
  },
  titleLg: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    lineHeight: 26,
    color: 'onSurface',
  },
  titleMd: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 22,
    color: 'onSurface',
  },
  titleSm: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    lineHeight: 20,
    color: 'onSurface',
  },
  bodyLg: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 26,
    color: 'onSurfaceVariant',
  },
  bodyMd: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: 'onSurfaceVariant',
  },
  bodySm: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: 'onSurfaceVariant',
  },
  bodyXs: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
    color: 'onSurfaceVariant',
  },
  labelLg: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    lineHeight: 20,
    color: 'onSurface',
  },
  labelMd: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: 'onSurfaceVariant',
  },
  labelSm: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    lineHeight: 14,
    color: 'onSurfaceVariant',
  },
  codeMd: {
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 20,
    color: 'onSurface',
  },
  codeSm: {
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.22,
    color: 'onSurfaceVariant',
  },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
