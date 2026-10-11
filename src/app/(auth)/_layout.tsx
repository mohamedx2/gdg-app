import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-provider';

export default function AuthLayout() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  // Guests may open sign-in / register to upgrade; only signed-in users skip auth.
  if (status === 'authenticated') return <Redirect href="/(spaces)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}