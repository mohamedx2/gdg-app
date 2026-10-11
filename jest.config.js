const preset = require('jest-expo/jest-preset');

const babelTransform = [
  'babel-jest',
  {
    root: __dirname,
    babelrcRoots: __dirname,
    babelrc: true,
    configFile: true,
    presets: [require.resolve('expo/internal/babel-preset')],
    caller: { name: 'metro', bundler: 'metro', platform: 'ios' },
  },
];

module.exports = {
  ...preset,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  transform: {
    ...preset.transform,
    '^.+\\.mjs$': babelTransform,
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|tamagui|@tamagui))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
};
