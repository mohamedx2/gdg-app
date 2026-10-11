import { accessLevelOf, hasPermission } from '@/lib/auth/permissions';

describe('permissions', () => {
  it('maps roles to the three access tiers', () => {
    expect(accessLevelOf('super-admin')).toBe('super-admin');
    expect(accessLevelOf('core-team')).toBe('core');
    expect(accessLevelOf('student')).toBe('member');
    expect(accessLevelOf('alumni')).toBe('member');
    expect(accessLevelOf(null)).toBe('member');
  });

  it('lets only the core team vote, run tasks and move ideas', () => {
    for (const permission of ['decisions.vote', 'tasks.manage', 'ideas.manage'] as const) {
      expect(hasPermission('core', permission)).toBe(true);
      expect(hasPermission('super-admin', permission)).toBe(true);
      expect(hasPermission('member', permission)).toBe(false);
    }
  });

  it('reserves role management for super admins', () => {
    expect(hasPermission('super-admin', 'roles.manage')).toBe(true);
    expect(hasPermission('core', 'roles.manage')).toBe(false);
  });
});
