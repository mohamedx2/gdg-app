/**
 * "GDG Bold" design tokens: warm neutrals, ink text, Google-colour accent blocks.
 * Google Developer Groups on Campus — EPI Sousse.
 */

export const googlePalette = {
  blue: '#1A73E8',
  blueDark: '#1557B0',
  blueLight: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC04',
  green: '#34A853',
} as const;

const lightColors = {
  background: '#FAFAF7',
  surface: '#FAFAF7',
  surfaceDim: '#E7E6DF',
  surfaceBright: '#FFFFFF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F3F2EC',
  surfaceContainer: '#EDECE5',
  surfaceContainerHigh: '#E6E5DD',
  surfaceContainerHighest: '#DEDDD4',
  surfaceVariant: '#EDECE5',

  onSurface: '#111318',
  onSurfaceVariant: '#4A4D57',
  onBackground: '#111318',

  outline: '#6E717C',
  outlineVariant: '#D9D8D0',
  divider: '#ECEBE4',

  primary: '#1A5FD6',
  onPrimary: '#FFFFFF',
  primaryContainer: '#1A73E8',
  onPrimaryContainer: '#FFFFFF',
  inversePrimary: '#A8C7FF',
  primaryFixed: '#DCE8FF',
  primaryFixedDim: '#B5CEFF',
  onPrimaryFixed: '#00184A',
  onPrimaryFixedVariant: '#0B4AB8',

  secondary: '#5B5E68',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#FFF1C2',
  onSecondaryContainer: '#5C4300',
  secondaryFixed: '#FFF1C2',
  secondaryFixedDim: '#FFE08A',
  onSecondaryFixed: '#2A1F00',
  onSecondaryFixedVariant: '#6B4E00',

  tertiary: '#137A3A',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#1E8E3E',
  onTertiaryContainer: '#FFFFFF',
  tertiaryFixed: '#CDF3D6',
  tertiaryFixedDim: '#9EE3B0',
  onTertiaryFixed: '#00210B',
  onTertiaryFixedVariant: '#0B5C2A',

  error: '#C5221F',
  onError: '#FFFFFF',
  errorContainer: '#FCDCD8',
  onErrorContainer: '#8A1210',

  inverseSurface: '#111318',
  inverseOnSurface: '#F3F2EC',
  terminal: '#0B0D12',

  success: '#1E8E3E',
  warning: '#E8A200',
  info: '#1A73E8',
  spark: '#6C5CE7',
  live: '#34A853',
  gold: '#FBBC04',

  overlay: 'rgba(15, 23, 42, 0.40)',
  skeleton: '#EDECE5',
  skeletonHighlight: '#F7F6F1',
} as const;

type ColorTokens = { [K in keyof typeof lightColors]: string };

const darkColors: ColorTokens = {
  background: '#0B0D12',
  surface: '#0B0D12',
  surfaceDim: '#07080C',
  surfaceBright: '#1C1F27',
  surfaceContainerLowest: '#15181F',
  surfaceContainerLow: '#12141A',
  surfaceContainer: '#1A1D25',
  surfaceContainerHigh: '#22262F',
  surfaceContainerHighest: '#2C303A',
  surfaceVariant: '#1A1D25',

  onSurface: '#F2F3F5',
  onSurfaceVariant: '#A3A7B3',
  onBackground: '#F2F3F5',

  outline: '#8A8E9A',
  outlineVariant: '#33373F',
  divider: '#1C1F27',

  primary: '#8AB4F8',
  onPrimary: '#0B1B33',
  primaryContainer: '#1A73E8',
  onPrimaryContainer: '#FFFFFF',
  inversePrimary: '#1A73E8',
  primaryFixed: '#132B55',
  primaryFixedDim: '#183563',
  onPrimaryFixed: '#DCE8FF',
  onPrimaryFixedVariant: '#A8C7FF',

  secondary: '#9AA0A6',
  onSecondary: '#0F172A',
  secondaryContainer: '#3A2E05',
  onSecondaryContainer: '#FFE08A',
  secondaryFixed: '#33290A',
  secondaryFixedDim: '#3A2E05',
  onSecondaryFixed: '#FFF1C2',
  onSecondaryFixedVariant: '#FDD663',

  tertiary: '#81C995',
  onTertiary: '#052E16',
  tertiaryContainer: '#137333',
  onTertiaryContainer: '#FFFFFF',
  tertiaryFixed: '#0F3520',
  tertiaryFixedDim: '#0C2C1A',
  onTertiaryFixed: '#CDF3D6',
  onTertiaryFixedVariant: '#81C995',

  error: '#F28B82',
  onError: '#4A0E0B',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',

  inverseSurface: '#E2E8F0',
  inverseOnSurface: '#1E293B',
  terminal: '#0B1120',

  success: '#81C995',
  warning: '#FDD663',
  info: '#8AB4F8',
  spark: '#B39DFF',
  live: '#6DDD81',
  gold: '#FDD663',

  overlay: 'rgba(2, 6, 23, 0.60)',
  skeleton: '#1A1D25',
  skeletonHighlight: '#232731',
};

export const light = lightColors;
export const dark = darkColors;

export type ColorToken = keyof ColorTokens;
export type Colors = ColorTokens;

export type ThemeMode = 'light' | 'dark';
