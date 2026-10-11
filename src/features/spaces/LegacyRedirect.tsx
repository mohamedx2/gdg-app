import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

/**
 * Keeps pre-Spaces URLs and deep links (gdgepi://ideas, /squads, /events …)
 * working by forwarding them to their new home. `{id}` is filled from the route.
 */
export function LegacyRedirect({ to }: { to: string }) {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const href = id ? to.replace('{id}', encodeURIComponent(id)) : to;
  return <Redirect href={href as never} />;
}
