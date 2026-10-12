import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { analytics } from '@/lib/analytics';
import { ApiError } from '@/lib/api/errors';
import { api } from '@/lib/api';
import { getAccessToken, cacheProfile, clearSession, getStatus, readCachedProfile, saveSession, SessionStatus, setStatus } from '@/lib/auth/session';
import { signOutGoogle } from '@/lib/auth/google';
import { authService, clearRole, readStoredRole, storeRole } from '@/lib/auth/service';
import { configureApiAuth } from '@/lib/api/http';
import { accessLevelOf, hasPermission, Permission } from '@/lib/auth/permissions';
import type { AccessLevel, MemberRole, UserProfile } from '@/types';

export type AuthStatus = 'loading' | SessionStatus;

interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  role: MemberRole | null;
  isGuest: boolean;
  access: AccessLevel;
  isSuperAdmin: boolean;
  /** Core team or super admin. */
  isOrganizer: boolean;
  can: (permission: Permission) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatusValue] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<MemberRole | null>(null);

  useEffect(() => {
    configureApiAuth(getAccessToken);
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      const stored = await getStatus();
      const storedRole = await readStoredRole();
      setRole(storedRole);

      if (stored === 'authenticated') {
        const cached = await readCachedProfile<UserProfile>();
        if (cached) setUser(cached);
        setStatusValue('authenticated');
        analytics.track('session_restore');
        const fresh = await api.profile.get();
        setUser(fresh);
        await cacheProfile(fresh);
      } else if (stored === 'guest') {
        setStatusValue('guest');
        analytics.track('session_restore', { mode: 'guest' });
      } else {
        setStatusValue('unauthenticated');
      }
    } catch {
      // Never block launch on a failed profile refresh — cached state wins.
      setStatusValue((current) => (current === 'loading' ? 'unauthenticated' : current));
    }
  }, []);

  useEffect(() => {
    // Async session restore waits on awaited storage reads before touching state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void bootstrap();
  }, [bootstrap]);

  const finishSignIn = useCallback(async (result: { token: string; user: UserProfile }, memberRole: MemberRole) => {
    await saveSession({ accessToken: result.token, userId: result.user.id });
    await storeRole(memberRole);
    await cacheProfile(result.user);
    setUser(result.user);
    setRole(memberRole);
    setStatusValue('authenticated');
    analytics.identify(result.user.id, { role: memberRole });
  }, []);

  const signIn = useCallback<AuthContextValue['signIn']>(
    async (email, password) => {
      const result = await authService.signIn(email, password);
      await finishSignIn(result, result.user.role);
      analytics.track('login', { method: 'password' });
    },
    [finishSignIn],
  );

  const signUp = useCallback<AuthContextValue['signUp']>(
    async (name, email, password) => {
      const result = await authService.signUp(name, email, password);
      await finishSignIn(result, 'student');
      analytics.track('signup', { method: 'email' });
    },
    [finishSignIn],
  );

  const signInWithGoogle = useCallback(async () => {
    const result = await authService.google();
    await finishSignIn(result, result.user.role);
    analytics.track('login', { method: 'google' });
  }, [finishSignIn]);

  const continueAsGuest = useCallback(async () => {
    await setStatus('guest');
    await clearRole();
    setUser(null);
    setRole(null);
    setStatusValue('guest');
    analytics.track('guest_continue');
  }, []);

  const signOut = useCallback(async () => {
    await signOutGoogle();
    await clearSession();
    await clearRole();
    setUser(null);
    setRole(null);
    setStatusValue('unauthenticated');
    analytics.track('logout');
  }, []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(async (patch) => {
    const updated = await api.profile.update(patch);
    const nextRole = updated.role ?? role;
    setUser(updated);
    setRole(nextRole);
    await cacheProfile(updated);
    await storeRole(nextRole);
    return updated;
  }, [role]);

  const access = status === 'authenticated' ? accessLevelOf(role) : 'member';
  const can = useCallback((permission: Permission) => hasPermission(access, permission), [access]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      role,
      isGuest: status === 'guest',
      access,
      isSuperAdmin: access === 'super-admin',
      isOrganizer: access !== 'member',
      can,
      signIn,
      signUp,
      signInWithGoogle,
      continueAsGuest,
      signOut,
      updateProfile,
    }),
    [status, user, role, access, can, signIn, signUp, signInWithGoogle, continueAsGuest, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

export function useOrganizer(): boolean {
  return useAuth().isOrganizer;
}

export function useCan(permission: Permission): boolean {
  return useAuth().can(permission);
}

export { ApiError };
