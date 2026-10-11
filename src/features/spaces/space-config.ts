import type { IconName } from '@/components/ui/Icon';

export interface SpaceDef {
  key: 'today' | 'explore' | 'arena' | 'voice';
  /** Monospaced switcher label. */
  label: string;
  /** TopBar title. */
  title: string;
  icon: IconName;
}

export const SPACES: readonly SpaceDef[] = [
  { key: 'today', label: 'TODAY', title: 'Today', icon: 'wbSunny' },
  { key: 'explore', label: 'EXPLORE', title: 'Explore', icon: 'manageSearch' },
  { key: 'arena', label: 'ARENA', title: 'Arena', icon: 'emojiEvents' },
  { key: 'voice', label: 'VOICE', title: 'Voice', icon: 'forum' },
];

export type SpaceKey = SpaceDef['key'];

export function spaceIndex(key: string | undefined | null): number {
  const found = SPACES.findIndex((space) => space.key === key);
  return found < 0 ? 0 : found;
}
