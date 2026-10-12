import { ENV } from '@/constants/env';
import { ApiError } from '@/lib/api/errors';

type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin');

/** Thrown when the member closes the Google account picker — not an error to show. */
export class GoogleSignInCancelled extends Error {
  constructor() {
    super('Google sign-in was cancelled.');
    this.name = 'GoogleSignInCancelled';
  }
}

let nativeModule: GoogleSigninModule | null | undefined;
let configured = false;

/**
 * Loads the native module on first use. Expo Go does not ship `RNGoogleSignin`,
 * so a top-level import would crash the whole app there; loading lazily keeps
 * every other screen working and only this button reports it is unavailable.
 */
function loadModule(): GoogleSigninModule | null {
  if (nativeModule !== undefined) return nativeModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    nativeModule = require('@react-native-google-signin/google-signin') as GoogleSigninModule;
  } catch {
    nativeModule = null;
  }
  return nativeModule;
}

function requireModule(): GoogleSigninModule {
  const google = loadModule();
  if (!google) {
    throw new ApiError('Google sign-in needs the installed GDG EPI app (not Expo Go). Use email here.', 'auth', 501);
  }
  if (!configured) {
    if (!ENV.GOOGLE_WEB_CLIENT_ID) {
      throw new ApiError('Google sign-in is not set up in this build yet.', 'auth', 503);
    }
    // The Web client ID is the audience the server verifies the ID token against.
    google.GoogleSignin.configure({
      webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
      iosClientId: ENV.GOOGLE_IOS_CLIENT_ID || undefined,
    });
    configured = true;
  }
  return google;
}

/** Opens the Google account picker and returns the ID token for the API to verify. */
export async function getGoogleIdToken(): Promise<string> {
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = requireModule();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) throw new GoogleSignInCancelled();
    const { idToken } = response.data;
    if (!idToken) throw new ApiError('Google did not return an ID token. Check the Web client ID.', 'auth', 401);
    return idToken;
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === statusCodes.IN_PROGRESS) {
        throw new GoogleSignInCancelled();
      }
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
    await loadModule()?.GoogleSignin.signOut();
  } catch {
    // Not signed in with Google — nothing to clear.
  }
}
