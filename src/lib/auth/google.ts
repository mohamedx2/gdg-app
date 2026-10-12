import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { ENV } from '@/constants/env';
import { ApiError } from '@/lib/api/errors';

/** Thrown when the member closes the Google account picker — not an error to show. */
export class GoogleSignInCancelled extends Error {
  constructor() {
    super('Google sign-in was cancelled.');
    this.name = 'GoogleSignInCancelled';
  }
}

let configured = false;

function configure(): void {
  if (configured) return;
  if (!ENV.GOOGLE_WEB_CLIENT_ID) {
    throw new ApiError('Google sign-in is not set up in this build yet.', 'auth', 503);
  }
  // The Web client ID is the audience the server verifies the ID token against.
  GoogleSignin.configure({ webClientId: ENV.GOOGLE_WEB_CLIENT_ID, iosClientId: ENV.GOOGLE_IOS_CLIENT_ID || undefined });
  configured = true;
}

/** Opens the Google account picker and returns a verified-by-server ID token. */
export async function getGoogleIdToken(): Promise<string> {
  configure();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) throw new GoogleSignInCancelled();
    const { idToken } = response.data;
    if (!idToken) throw new ApiError('Google did not return an ID token. Check the Web client ID.', 'auth', 401);
    return idToken;
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) throw new GoogleSignInCancelled();
      if (error.code === statusCodes.IN_PROGRESS) throw new GoogleSignInCancelled();
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new ApiError('Google Play Services is missing or out of date on this device.', 'auth', 503);
      }
    }
    throw error;
  }
}

/** Clears the cached Google account so the picker shows again next time. */
export async function signOutGoogle(): Promise<void> {
  if (!configured) return;
  try {
    await GoogleSignin.signOut();
  } catch {
    // Not signed in with Google — nothing to clear.
  }
}
