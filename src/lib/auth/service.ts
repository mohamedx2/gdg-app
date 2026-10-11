import AsyncStorage from '@react-native-async-storage/async-storage';

import { isMockMode } from '@/constants/env';
import { request } from '@/lib/api/http';
import { ApiError } from '@/lib/api/errors';
import { mockDb } from '@/lib/api/mock/db';
import type { MemberRole, UserProfile } from '@/types';

export interface AuthAccount {
  email: string;
  password: string;
  role: MemberRole;
  name: string;
}

export interface AuthResult {
  token: string;
  user: UserProfile;
}

export const DEMO_ACCOUNTS: AuthAccount[] = [
  {
    email: 'admin@epi.dev',
    password: 'gdgepi2026',
    role: 'super-admin',
    name: 'Maram Belgacem',
  },
  {
    email: 'member@epi.dev',
    password: 'gdgepi2026',
    role: 'student',
    name: 'Mohamed Salah',
  },
  {
    email: 'organizer@epi.dev',
    password: 'gdgepi2026',
    role: 'core-team',
    name: 'Meriem Trabelsi',
  },
];

const ROLE_KEY = 'gdgepi.session.role';

export async function readStoredRole(): Promise<MemberRole | null> {
  return (await AsyncStorage.getItem(ROLE_KEY)) as MemberRole | null;
}

export async function storeRole(role: MemberRole): Promise<void> {
  await AsyncStorage.setItem(ROLE_KEY, role);
}

export async function clearRole(): Promise<void> {
  await AsyncStorage.removeItem(ROLE_KEY);
}

function mockToken(userId: string): string {
  return `mock.${btoa(`${userId}:${Date.now()}`)}`;
}

async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const account = DEMO_ACCOUNTS.find(
    (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!account || account.password !== password) {
    throw new ApiError(
      'We could not sign you in with those credentials. Try a demo account below.',
      'auth',
      401,
    );
  }

  await mockDb.init();
  const base = mockDb.state.profile;
  const user: UserProfile = { ...base, name: account.name, email: account.email, role: account.role };
  await mockDb.updateProfile({ name: account.name, email: account.email, role: account.role });
  return { token: mockToken(account.email), user };
}

async function signUp(name: string, email: string, password: string): Promise<AuthResult> {
  await mockDb.init();
  const user: UserProfile = {
    ...mockDb.state.profile,
    name: name.trim(),
    email: email.trim(),
    role: 'student',
    points: 0,
    eventsAttended: 0,
    workshops: 0,
    badges: 0,
    joinedAt: new Date().toISOString(),
  };
  await mockDb.updateProfile(user);
  return { token: mockToken(user.email), user };
}

async function signInWithGoogle(): Promise<AuthResult> {
  await mockDb.init();
  const user: UserProfile = { ...mockDb.state.profile, email: 'mohamed.salah@gmail.com' };
  await mockDb.updateProfile({ email: user.email });
  return { token: mockToken('google-oauth'), user };
}

async function httpSignIn(email: string, password: string): Promise<AuthResult> {
  return request<AuthResult>('/auth/login', { method: 'POST', body: { email, password }, skipAuth: true });
}

async function httpSignUp(name: string, email: string, password: string): Promise<AuthResult> {
  return request<AuthResult>('/auth/register', {
    method: 'POST',
    body: { name, email, password },
    skipAuth: true,
  });
}

async function httpGoogle(): Promise<AuthResult> {
  return request<AuthResult>('/auth/google', { method: 'POST', skipAuth: true });
}

export const authService = {
  signIn: (email: string, password: string) =>
    isMockMode ? signInWithPassword(email, password) : httpSignIn(email, password),
  signUp: (name: string, email: string, password: string) =>
    isMockMode ? signUp(name, email, password) : httpSignUp(name, email, password),
  google: () => (isMockMode ? signInWithGoogle() : httpGoogle()),
};
