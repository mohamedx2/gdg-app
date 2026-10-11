type ApiMode = 'mock' | 'production';

/** Deployed backend, used whenever `EXPO_PUBLIC_API_URL` is not set. */
const DEFAULT_API_URL = 'https://gdg-app.onrender.com/api/v1';

const rawMode = process.env.EXPO_PUBLIC_API_MODE ?? 'production';

export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL,
  API_MODE: (rawMode === 'mock' ? 'mock' : 'production') as ApiMode,
  // Generous timeout: the free-tier backend can cold-start (~30-60s) after sleeping.
  API_TIMEOUT_MS: 45_000,
} as const;

export const isMockMode = ENV.API_MODE === 'mock';
