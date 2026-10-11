import { router } from 'expo-router';
import React from 'react';

import { EmptyState } from '@/components/ui/States';
import type { IconName } from '@/components/ui/Icon';
import { useAuth } from '@/features/auth/auth-provider';

interface GuestGateProps {
  /** What signing in unlocks, e.g. "track your XP and badges". */
  reason: string;
  icon?: IconName;
  children: React.ReactNode;
}

/**
 * Member-only content: guests see a sign-in prompt instead of an API error
 * (the backend answers 401 for every `/me` route without a session).
 */
export function GuestGate({ reason, icon = 'lock', children }: GuestGateProps) {
  const { isGuest, status } = useAuth();
  if (!isGuest && status === 'authenticated') return <>{children}</>;
  return (
    <EmptyState
      icon={icon}
      title="Sign in to unlock"
      message={`Join GDG on Campus EPI to ${reason}.`}
      actionLabel="Sign in"
      onAction={() => router.push('/(auth)/login' as never)}
    />
  );
}
