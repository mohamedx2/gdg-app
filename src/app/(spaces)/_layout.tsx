import { Redirect, Slot } from 'expo-router';

import { useAuth } from '@/features/auth/auth-provider';

/** Spaces need a session or guest mode; first launch goes through the welcome flow. */
export default function SpacesLayout() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href="/(auth)/welcome" />;

  return <Slot />;
}
