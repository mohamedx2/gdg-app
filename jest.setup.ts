/// <reference types="jest" />
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

require('react-native-reanimated').setUpTests();