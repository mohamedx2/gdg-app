import { defaultConfig } from '@tamagui/config/v6';
import { createFont, createTamagui } from 'tamagui';

const heading = createFont({
  family: 'PlusJakartaSans_700Bold',
  size: defaultConfig.fonts.heading.size,
  lineHeight: defaultConfig.fonts.heading.lineHeight,
  weight: defaultConfig.fonts.heading.weight,
  letterSpacing: defaultConfig.fonts.heading.letterSpacing,
});

const body = createFont({
  family: 'Inter_400Regular',
  size: defaultConfig.fonts.body.size,
  lineHeight: defaultConfig.fonts.body.lineHeight,
  weight: defaultConfig.fonts.body.weight,
  letterSpacing: defaultConfig.fonts.body.letterSpacing,
});

const mono = createFont({
  family: 'JetBrainsMono_500Medium',
  size: defaultConfig.fonts.body.size,
  lineHeight: defaultConfig.fonts.body.lineHeight,
  weight: defaultConfig.fonts.body.weight,
  letterSpacing: defaultConfig.fonts.body.letterSpacing,
});

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  fonts: { heading, body, mono },
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
