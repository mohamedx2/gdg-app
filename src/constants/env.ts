type ApiMode = 'mock' | 'production';

const rawMode = process.env.EXPO_PUBLIC_API_MODE ?? 'mock';

export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? '',
  API_MODE: (rawMode === 'production' ? 'production' : 'mock') as ApiMode,
  API_TIMEOUT_MS: 10_000,
} as const;

export const isMockMode = ENV.API_MODE === 'mock';
