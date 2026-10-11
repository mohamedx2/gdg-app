import type { ColorToken } from '@/theme/colors';
import type { IconName } from '@/components/ui/Icon';
import type { Permission } from '@/lib/auth/permissions';
import type { ThemePreference } from '@/stores/theme.store';
import type { NotificationPreferences, OrganizerStats } from '@/types';
import type { TaxonomyConfig } from './taxonomy';

export interface AppMeta {
  name: string;
  shortName: string;
  scheme: string;
  campus: string;
  tagline: string;
  communitySize: string;
  deepLinkExamples: string[];
}

export interface WelcomeSlide {
  badge: string;
  badgeBg: ColorToken;
  badgeText: ColorToken;
  title: string;
  body: string;
}

export interface ProfileMenuItem {
  icon: IconName;
  label: string;
  description: string;
  route: string;
  danger?: boolean;
  permission?: Permission;
}

export interface ProfileMenuGroup {
  group: string;
  items: ProfileMenuItem[];
}

export interface SettingsRow {
  icon: IconName;
  label: string;
  description: string;
  route: string;
}

export interface RoleFilter {
  key: string;
  label: string;
}

export interface AdminStat {
  key: keyof OrganizerStats;
  icon: IconName;
  label: string;
}

export interface NotificationPreferenceRow {
  key: keyof NotificationPreferences;
  icon: IconName;
  label: string;
  description: string;
}

export interface AppearanceOption {
  key: ThemePreference;
  icon: IconName;
  label: string;
  description: string;
}

export interface DecisionDuration {
  key: string;
  label: string;
  days: number;
}

/** Presentation config the API can override without an app release. */
export interface UiConfig {
  welcomeSlides: WelcomeSlide[];
  profileMenu: ProfileMenuGroup[];
  settingsRows: SettingsRow[];
  communityRoleFilters: RoleFilter[];
  resourcesDifficultyFilters: RoleFilter[];
  resourcesTypeFilters: RoleFilter[];
  adminStats: AdminStat[];
  notificationPreferences: NotificationPreferenceRow[];
  appearanceOptions: AppearanceOption[];
  decisionDurations: DecisionDuration[];
  presenceEtaOptions: number[];
}

/** Shape of `GET /content/config`. Every namespace is optional. */
export interface AppConfigSource {
  app?: Partial<AppMeta>;
  taxonomy?: Partial<TaxonomyConfig>;
  ui?: Partial<UiConfig>;
}

export const APP_BUNDLED: AppMeta = {
  name: 'GDG on Campus EPI',
  shortName: 'GDG EPI',
  scheme: 'gdgepi',
  campus: 'EPI Sousse, Tunisia',
  tagline: 'Google Developer Groups on Campus',
  communitySize: '240+',
  deepLinkExamples: ['gdgepi://event/1', 'gdgepi://resource/1'],
};

export const UI_BUNDLED: UiConfig = {
  welcomeSlides: [
    {
      badge: 'GDG ON CAMPUS',
      badgeBg: 'primaryFixed',
      badgeText: 'onPrimaryFixed',
      title: 'Build. Learn. Connect.',
      body: 'Join a vibrant community of students and developers passionate about Google technologies, AI, and scalable software at EPI Sousse.',
    },
    {
      badge: 'HANDS-ON PRACTICE',
      badgeBg: 'secondaryContainer',
      badgeText: 'onSecondaryContainer',
      title: 'Ship Code. Win Global Stages.',
      body: 'Transform classroom theory into production applications. Join workshops mentored by Google Developer Experts and senior alumni.',
    },
    {
      badge: 'ECOSYSTEM ACCESS',
      badgeBg: 'tertiaryFixed',
      badgeText: 'onTertiaryFixed',
      title: 'Your Launchpad from Sousse.',
      body: 'Connect with tech founders, participate in cross-university summit hackathons, and kickstart your career with international opportunities.',
    },
  ],
  profileMenu: [
    {
      group: 'Core team',
      items: [
        { icon: 'taskAlt', label: 'Event tasks', description: 'Task board grouped by event', route: '/tasks', permission: 'tasks.view' },
        { icon: 'howToVote', label: 'Core votes', description: 'Decide on chapter matters', route: '/decisions', permission: 'decisions.vote' },
        { icon: 'shield', label: 'Roles & access', description: 'Promote members, manage the core team', route: '/admin/roles', permission: 'roles.manage' },
      ],
    },
    {
      group: 'Compete',
      items: [
        { icon: 'groups', label: 'Squads', description: 'Join a track team this semester', route: '/squads' },
        { icon: 'flag', label: 'Quests', description: 'Multi-step goals & XP rewards', route: '/quests' },
        { icon: 'help', label: 'Daily quiz', description: 'Keep your streak and earn XP', route: '/quiz' },
        { icon: 'emojiEvents', label: 'Achievements', description: 'Badges, XP and your level', route: '/achievements' },
      ],
    },
    {
      group: 'Campus',
      items: [
        { icon: 'chatBubble', label: 'Messages', description: 'Chat with the club & event teams', route: '/messages' },
        { icon: 'nearMe', label: "Who's around", description: 'Opt-in status & arrival ETAs', route: '/presence' },
        { icon: 'celebration', label: 'Memories', description: 'Photos from past chapter moments', route: '/memories' },
        { icon: 'insights', label: 'Club stats', description: 'Our impact, tracks & top contributors', route: '/stats' },
      ],
    },
    {
      group: 'Have your say',
      items: [
        { icon: 'lightbulb', label: 'Idea box', description: 'Suggest & upvote what we build next', route: '/ideas' },
        { icon: 'howToVote', label: 'Decisions', description: 'What the core team is deciding', route: '/decisions' },
      ],
    },
    {
      group: 'Settings',
      items: [
        { icon: 'notifications', label: 'Notifications', description: 'Reminders & preferences', route: '/settings/notifications' },
        { icon: 'wbSunny', label: 'Appearance', description: 'Theme & accent', route: '/settings/appearance' },
      ],
    },
  ],
  settingsRows: [
    { icon: 'palette', label: 'Appearance', description: 'Theme & accent', route: '/settings/appearance' },
    { icon: 'notifications', label: 'Notifications', description: 'Reminders & preferences', route: '/settings/notifications' },
    { icon: 'autoAwesome', label: 'Motion kit', description: 'Animation showcase', route: '/animations' },
  ],
  communityRoleFilters: [
    { key: 'all', label: 'All' },
    { key: 'core-team', label: 'Core Team' },
    { key: 'speaker', label: 'Speakers · GDE' },
    { key: 'alumni', label: 'Alumni' },
    { key: 'student', label: 'Students' },
  ],
  resourcesDifficultyFilters: [
    { key: 'all', label: 'All levels' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' },
  ],
  resourcesTypeFilters: [
    { key: 'all', label: 'All types' },
    { key: 'codelab', label: 'Codelabs' },
    { key: 'video', label: 'Videos' },
    { key: 'article', label: 'Articles' },
    { key: 'course', label: 'Courses' },
  ],
  adminStats: [
    { key: 'totalEvents', icon: 'event', label: 'Events' },
    { key: 'upcomingEvents', icon: 'schedule', label: 'Upcoming' },
    { key: 'totalRegistrations', icon: 'personAdd', label: 'Registrations' },
    { key: 'activeMembers', icon: 'groups', label: 'Members' },
    { key: 'announcementReach', icon: 'campaign', label: 'Reach' },
    { key: 'attendanceRate', icon: 'trendingUp', label: 'Attendance' },
  ],
  notificationPreferences: [
    { key: 'eventReminders', icon: 'alarm', label: 'Event reminders', description: '15 min before an event you registered for' },
    { key: 'registrationUpdates', icon: 'checkCircle', label: 'Seat confirmations', description: 'Approved registrations & waitlists' },
    { key: 'announcements', icon: 'campaign', label: 'Announcements', description: 'New events & campus-wide updates' },
    { key: 'communityUpdates', icon: 'groups', label: 'Community updates', description: 'New members, spots & connections' },
  ],
  appearanceOptions: [
    { key: 'system', icon: 'phoneIphone', label: 'System', description: 'Match device appearance' },
    { key: 'light', icon: 'lightMode', label: 'Light', description: 'Always light' },
    { key: 'dark', icon: 'darkMode', label: 'Dark', description: 'Always dark' },
  ],
  decisionDurations: [
    { key: '3d', label: '3 days', days: 3 },
    { key: '1w', label: '1 week', days: 7 },
    { key: '2w', label: '2 weeks', days: 14 },
    { key: '1m', label: '1 month', days: 30 },
  ],
  presenceEtaOptions: [5, 10, 15, 20, 30],
};
