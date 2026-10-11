import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoSecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/** SecureStore has no web implementation; fall back to AsyncStorage for web previews only. */
const SecureStore =
  Platform.OS === 'web'
    ? {
        ...ExpoSecureStore,
        setItemAsync: (key: string, value: string, _options?: ExpoSecureStore.SecureStoreOptions) => AsyncStorage.setItem(key, value),
        getItemAsync: (key: string, _options?: ExpoSecureStore.SecureStoreOptions) => AsyncStorage.getItem(key),
        deleteItemAsync: (key: string, _options?: ExpoSecureStore.SecureStoreOptions) => AsyncStorage.removeItem(key),
      }
    : ExpoSecureStore;

export type SessionStatus = 'authenticated' | 'guest' | 'unauthenticated';

export interface Session {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  expiresAt?: number;
}

const TOKEN_KEY = 'gdgepi.session.accessToken';
const REFRESH_KEY = 'gdgepi.session.refreshToken';
const STATUS_KEY = 'gdgepi.session.status';
const PROFILE_KEY = 'gdgepi.session.profile';

const secureOptions: ExpoSecureStore.SecureStoreOptions = {
  keychainAccessible: ExpoSecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/** Tokens only ever live in the SecureStore / Keychain. */
export async function saveSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, session.accessToken, secureOptions);
  if (session.refreshToken) {
    await SecureStore.setItemAsync(REFRESH_KEY, session.refreshToken, secureOptions);
  }
  await AsyncStorage.setItem(STATUS_KEY, 'authenticated');
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY, secureOptions);
  } catch {
    return null;
  }
}

export async function getStatus(): Promise<SessionStatus> {
  try {
    const status = await AsyncStorage.getItem(STATUS_KEY);
    if (status === 'authenticated' || status === 'guest') {
      const token = await getAccessToken();
      if (status === 'authenticated' && !token) return 'unauthenticated';
      return status;
    }
    return 'unauthenticated';
  } catch {
    return 'unauthenticated';
  }
}

export async function setStatus(status: SessionStatus): Promise<void> {
  await AsyncStorage.setItem(STATUS_KEY, status);
}

/** Non-sensitive display data cached for instant first paint. */
export async function cacheProfile<T>(profile: T): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function readCachedProfile<T>(): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY, secureOptions);
  await SecureStore.deleteItemAsync(REFRESH_KEY, secureOptions);
  await AsyncStorage.removeItem(STATUS_KEY);
  await AsyncStorage.removeItem(PROFILE_KEY);
}
