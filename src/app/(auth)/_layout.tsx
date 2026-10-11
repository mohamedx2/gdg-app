import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-provider';

export default function AuthLayout() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'authenticated' || status === 'guest') return <Redirect href="/(spaces)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}