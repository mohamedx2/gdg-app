import { ApiError } from '@/lib/api/errors';

/** Thrown when the member closes the Google account picker — not an error to show. */
export class GoogleSignInCancelled extends Error {
  constructor() {
    super('Google sign-in was cancelled.');
    this.name = 'GoogleSignInCancelled';
  }
}

/** Native Google Sign-In has no web build; the web preview uses email sign-in. */
export async function getGoogleIdToken(): Promise<string> {
  throw new ApiError('Google sign-in is available in the Android app. Use email on the web.', 'auth', 501);
}

export async function signOutGoogle(): Promise<void> {}
