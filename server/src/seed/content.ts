import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { MEDIA_BUCKET, publicUrl } from '../storage';
import { supabase } from '../supabase';

/**
 * Static app config, seeded into the `app_config` key/value store. Keeping it
 * server-side lets labels, ordering and copy change without shipping an update;
 * the client keeps a bundled copy as an offline/first-run fallback.
 */
export interface ConfigSeed {
  key: string;
  value: Record<string, unknown>;
}

export const seedAppConfig: ConfigSeed[] = [
  {
    key: 'app',
    value: {
      name: 'GDG on Campus EPI',
      shortName: 'GDG EPI',
      scheme: 'gdgepi',
      campus: 'EPI Sousse, Tunisia',
      tagline: 'Google Developer Groups on Campus',
      communitySize: '240+',
      deepLinkExamples: ['gdgepi://event/1', 'gdgepi://resource/1'],
    },
  },
  {
    key: 'taxonomy',
    value: {
      eventCategories: {
        workshop: { label: 'Workshops', icon: 'code', color: 'primary' },
        talk: { label: 'Talks', icon: 'campaign', color: 'secondary' },
        hackathon: { label: 'Hackathons', icon: 'emoji_events', color: 'error' },
        meetup: { label: 'Meetups', icon: 'groups', color: 'tertiary' },
        career: { label: 'Career', icon: 'work', color: 'warning' },
      },
      tracks: {
        flutter: { label: 'Flutter', color: 'primary' },
        aiml: { label: 'AI / ML', color: 'tertiary' },
        cloud: { label: 'Cloud', color: 'secondary' },
        web: { label: 'Web Dev', color: 'error' },
        android: { label: 'Android', color: 'success' },
        general: { label: 'General', color: 'info' },
      },
      trackFilters: ['flutter', 'aiml', 'cloud', 'web', 'android'],
      memberRoles: {
        'super-admin': { label: 'Super Admin', chipColor: 'errorContainer', chipText: 'onErrorContainer' },
        student: { label: 'Student', chipColor: 'surfaceContainerHigh', chipText: 'onSurfaceVariant' },
        'core-team': { label: 'Core Team', chipColor: 'secondaryFixed', chipText: 'onSecondaryFixedVariant' },
        speaker: { label: 'Speaker · GDE', chipColor: 'primaryFixed', chipText: 'onPrimaryFixedVariant' },
        alumni: { label: 'Alumni', chipColor: 'tertiaryFixed', chipText: 'onTertiaryFixedVariant' },
      },
      resourceTypes: {
        codelab: { label: 'Codelab', icon: 'terminal', color: 'primary' },
        article: { label: 'Article', icon: 'article', color: 'secondary' },
        video: { label: 'Video', icon: 'play_circle', color: 'error' },
        course: { label: 'Course', icon: 'school', color: 'tertiary' },
      },
      resourceCategories: ['All', 'Flutter', 'Android', 'AI / ML', 'Cloud', 'Web', 'Career'],
      difficulties: {
        beginner: { label: 'Beginner', color: 'tertiary' },
        intermediate: { label: 'Intermediate', color: 'warning' },
        advanced: { label: 'Advanced', color: 'error' },
      },
      presenceStatus: {
        in_transit: { label: 'On my way', icon: 'directionsCar', color: 'warning' },
        on_campus: { label: 'On campus', icon: 'locationCity', color: 'primary' },
        at_venue: { label: 'At the venue', icon: 'meetingRoom', color: 'tertiary' },
        club_room: { label: 'In the club room', icon: 'home', color: 'secondary' },
        off_campus: { label: 'Off campus', icon: 'publicIcon', color: 'outline' },
        busy: { label: 'Busy', icon: 'schedule', color: 'secondary' },
        exam_mode: { label: 'Exam mode', icon: 'school', color: 'error' },
      },
      presenceOrder: ['on_campus', 'at_venue', 'club_room', 'in_transit', 'busy', 'exam_mode', 'off_campus'],
      ideaCategories: {
        events: { label: 'Events', icon: 'event', color: 'primary' },
        workshops: { label: 'Workshops', icon: 'code', color: 'tertiary' },
        community: { label: 'Community', icon: 'groups', color: 'secondary' },
        campus: { label: 'Campus', icon: 'domain', color: 'info' },
        content: { label: 'Content', icon: 'article', color: 'warning' },
        other: { label: 'Other', icon: 'lightbulb', color: 'outline' },
      },
      ideaStatus: {
        new: { label: 'New', icon: 'lightbulb', color: 'info' },
        under_review: { label: 'Under review', icon: 'manageSearch', color: 'warning' },
        planned: { label: 'Planned', icon: 'eventNote', color: 'secondary' },
        in_progress: { label: 'In progress', icon: 'trendingUp', color: 'primary' },
        shipped: { label: 'Shipped', icon: 'checkCircle', color: 'success' },
        declined: { label: 'Not planned', icon: 'errorOutline', color: 'outline' },
      },
      ideaStatusOrder: ['new', 'under_review', 'planned', 'in_progress', 'shipped', 'declined'],
      homeTrackFilters: [
        { key: 'all', label: 'All Tracks', icon: 'tune' },
        { key: 'flutter', label: 'Flutter', dot: 'primary' },
        { key: 'aiml', label: 'AI / ML', dot: 'tertiary' },
        { key: 'cloud', label: 'Cloud', dot: 'secondary' },
        { key: 'web', label: 'Web Dev', dot: 'error' },
      ],
      taskStatus: {
        todo: { label: 'To do', icon: 'radioButtonUnchecked', color: 'outline' },
        'in-progress': { label: 'In progress', icon: 'schedule', color: 'warning' },
        done: { label: 'Done', icon: 'checkCircle', color: 'tertiary' },
      },
      taskStatusOrder: ['todo', 'in-progress', 'done'],
      taskPriority: {
        low: { label: 'Low', color: 'outline' },
        medium: { label: 'Medium', color: 'secondary' },
        high: { label: 'High', color: 'error' },
      },
    },
  },
  {
    key: 'ui',
    value: {
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
    },
  },
];

/** Curated gallery photos, in display order. `file` lives in assets/images/memories. */
export interface MemorySeed {
  id: string;
  file: string;
  caption: string;
  portrait: boolean;
}

export const seedMemories: MemorySeed[] = [
  { id: 'm01', file: 'memory-01.jpg', caption: 'Core team on campus', portrait: false },
  { id: 'm12', file: 'memory-12.jpg', caption: 'Our stand — and the award', portrait: false },
  { id: 'm06', file: 'memory-06.jpg', caption: 'The “Thank You” fingerprint board', portrait: true },
  { id: 'm03', file: 'memory-03.jpg', caption: 'Team day at EPI', portrait: false },
  { id: 'm05', file: 'memory-05.jpg', caption: 'GDG crew at the club fair', portrait: true },
  { id: 'm08', file: 'memory-08.jpg', caption: 'All together', portrait: true },
  { id: 'm04', file: 'memory-04.jpg', caption: 'Holding the trophy', portrait: false },
  { id: 'm02', file: 'memory-02.jpg', caption: 'One more selfie', portrait: false },
  { id: 'm07', file: 'memory-07.jpg', caption: 'Every fingerprint, a member', portrait: true },
  { id: 'm10', file: 'memory-10.jpg', caption: 'Club fair vibes', portrait: false },
  { id: 'm13', file: 'memory-13.jpg', caption: 'Badges on', portrait: false },
  { id: 'm11', file: 'memory-11.jpg', caption: 'The full stand team', portrait: true },
  { id: 'm09', file: 'memory-09.jpg', caption: 'Group photo', portrait: true },
];

/** Where the bundled gallery images live, relative to the repo. Override with MEMORY_IMAGE_DIR. */
const MEMORY_IMAGE_DIR =
  process.env.MEMORY_IMAGE_DIR ?? path.resolve(process.cwd(), '..', 'assets', 'images', 'memories');

/**
 * Uploads each gallery photo to the public media bucket and returns rows for
 * the `memories` table. If an image is missing the row keeps an empty
 * `image_url` and the client falls back to its bundled asset.
 */
export async function buildMemoryRows(): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  for (const [index, memory] of seedMemories.entries()) {
    let imageUrl = '';
    try {
      const buffer = await readFile(path.join(MEMORY_IMAGE_DIR, memory.file));
      const objectPath = `memories/${memory.file}`;
      const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(objectPath, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
      if (error) throw new Error(error.message);
      imageUrl = publicUrl(objectPath);
    } catch (error) {
      console.warn(
        `  memory ${memory.id}: image skipped (${error instanceof Error ? error.message : error})`,
      );
    }
    rows.push({
      id: memory.id,
      image_url: imageUrl,
      caption: memory.caption,
      portrait: memory.portrait,
      sort_order: index,
    });
  }
  return rows;
}
