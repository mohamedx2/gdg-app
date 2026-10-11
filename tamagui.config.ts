import { defaultConfig } from '@tamagui/config/v6';
import { createFont, createTamagui } from 'tamagui';

import { dark, light } from './src/theme/colors';
import { radius } from './src/theme/radius';
import { spacing } from './src/theme/spacing';

const headingFont = createFont({
  ...defaultConfig.fonts.heading,
  family: 'PlusJakartaSans_700Bold',
});

const bodyFont = createFont({
  ...defaultConfig.fonts.body,
  family: 'Inter_400Regular',
});

const monoFont = createFont({
  ...defaultConfig.fonts.body,
  family: 'JetBrainsMono_500Medium',
});

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  fonts: {
    heading: headingFont,
    body: bodyFont,
    mono: monoFont,
  },
  tokens: {
    ...defaultConfig.tokens,
    space: { ...defaultConfig.tokens.space, ...spacing },
    radius: { ...defaultConfig.tokens.radius, ...radius },
  },
  themes: {
    ...defaultConfig.themes,
    light: { ...defaultConfig.themes.light, ...light, color: light.onSurface },
    dark: { ...defaultConfig.themes.dark, ...dark, color: dark.onSurface },
  },
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
  },
});

type OurConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends OurConfig {}
}

export default tamaguiConfig;
