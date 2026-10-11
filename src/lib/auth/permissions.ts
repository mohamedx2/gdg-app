import type { AccessLevel, MemberRole } from '@/types';

/**
 * Three access tiers:
 * - super-admin: everything, plus managing member roles.
 * - core: core team — votes on decisions, owns event tasks, moves ideas along the roadmap.
 * - member: browses, registers, suggests and upvotes ideas, sees decision outcomes.
 */
export function accessLevelOf(role: MemberRole | null | undefined): AccessLevel {
  if (role === 'super-admin') return 'super-admin';
  if (role === 'core-team') return 'core';
  return 'member';
}

export type Permission =
  | 'admin.dashboard'
  | 'admin.checkIn'
  | 'roles.manage'
  | 'decisions.vote'
  | 'decisions.create'
  | 'tasks.view'
  | 'tasks.manage'
  | 'ideas.manage'
  | 'presence.roster';

const CORE: Permission[] = [
  'admin.dashboard',
  'admin.checkIn',
  'decisions.vote',
  'decisions.create',
  'tasks.view',
  'tasks.manage',
  'ideas.manage',
  'presence.roster',
];

const GRANTS: Record<AccessLevel, ReadonlySet<Permission>> = {
  'super-admin': new Set<Permission>([...CORE, 'roles.manage']),
  core: new Set<Permission>(CORE),
  member: new Set<Permission>(),
};

export function hasPermission(level: AccessLevel, permission: Permission): boolean {
  return GRANTS[level].has(permission);
}

export const ACCESS_LEVELS: Record<AccessLevel, { label: string; description: string; icon: 'shield' | 'verifiedUser' | 'person' }> = {
  'super-admin': { label: 'Super Admin', description: 'Full access and role management', icon: 'shield' },
  core: { label: 'Core Team', description: 'Votes, event tasks and idea roadmap', icon: 'verifiedUser' },
  member: { label: 'Member', description: 'Events, learning, ideas and community', icon: 'person' },
};

/** Roles a super admin can hand out from the role manager. */
export const ASSIGNABLE_ROLES: MemberRole[] = ['super-admin', 'core-team', 'student'];
