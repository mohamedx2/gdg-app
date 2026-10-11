import type { ColorToken } from '@/theme/colors';
import type { EventCategory, IdeaCategory, IdeaStatus, MemberRole, PresenceStatus, ResourceDifficulty, ResourceType, TaskPriority, TaskStatus, Track } from '@/types';

export interface CategoryMeta {
  label: string;
  icon: string;
  color: ColorToken;
}

export const EVENT_CATEGORIES: Record<EventCategory, CategoryMeta> = {
  workshop: { label: 'Workshops', icon: 'code', color: 'primary' },
  talk: { label: 'Talks', icon: 'campaign', color: 'secondary' },
  hackathon: { label: 'Hackathons', icon: 'emoji_events', color: 'error' },
  meetup: { label: 'Meetups', icon: 'groups', color: 'tertiary' },
  career: { label: 'Career', icon: 'work', color: 'warning' },
};

export const TRACKS: Record<Track, { label: string; color: ColorToken }> = {
  flutter: { label: 'Flutter', color: 'primary' },
  aiml: { label: 'AI / ML', color: 'tertiary' },
  cloud: { label: 'Cloud', color: 'secondary' },
  web: { label: 'Web Dev', color: 'error' },
  android: { label: 'Android', color: 'success' },
  general: { label: 'General', color: 'info' },
};

export const TRACK_FILTERS: Track[] = ['flutter', 'aiml', 'cloud', 'web', 'android'];

export const MEMBER_ROLES: Record<MemberRole, { label: string; chipColor: ColorToken; chipText: ColorToken }> = {
  'super-admin': { label: 'Super Admin', chipColor: 'errorContainer', chipText: 'onErrorContainer' },
  student: { label: 'Student', chipColor: 'surfaceContainerHigh', chipText: 'onSurfaceVariant' },
  'core-team': { label: 'Core Team', chipColor: 'secondaryFixed', chipText: 'onSecondaryFixedVariant' },
  speaker: { label: 'Speaker · GDE', chipColor: 'primaryFixed', chipText: 'onPrimaryFixedVariant' },
  alumni: { label: 'Alumni', chipColor: 'tertiaryFixed', chipText: 'onTertiaryFixedVariant' },
};

export const RESOURCE_TYPES: Record<ResourceType, { label: string; icon: string; color: ColorToken }> = {
  codelab: { label: 'Codelab', icon: 'terminal', color: 'primary' },
  article: { label: 'Article', icon: 'article', color: 'secondary' },
  video: { label: 'Video', icon: 'play_circle', color: 'error' },
  course: { label: 'Course', icon: 'school', color: 'tertiary' },
};

export const RESOURCE_CATEGORIES = [
  'All',
  'Flutter',
  'Android',
  'AI / ML',
  'Cloud',
  'Web',
  'Career',
] as const;

export const DIFFICULTIES: Record<ResourceDifficulty, { label: string; color: ColorToken }> = {
  beginner: { label: 'Beginner', color: 'tertiary' },
  intermediate: { label: 'Intermediate', color: 'warning' },
  advanced: { label: 'Advanced', color: 'error' },
};

/** Coarse, opt-in presence states members can share. Never an exact pin. */
export const PRESENCE_STATUS: Record<PresenceStatus, CategoryMeta> = {
  in_transit: { label: 'On my way', icon: 'directionsCar', color: 'warning' },
  on_campus: { label: 'On campus', icon: 'locationCity', color: 'primary' },
  at_venue: { label: 'At the venue', icon: 'meetingRoom', color: 'tertiary' },
  club_room: { label: 'In the club room', icon: 'home', color: 'secondary' },
  off_campus: { label: 'Off campus', icon: 'publicIcon', color: 'outline' },
  busy: { label: 'Busy', icon: 'schedule', color: 'secondary' },
  exam_mode: { label: 'Exam mode', icon: 'school', color: 'error' },
};

/** Order shown in the presence status picker. */
export const PRESENCE_ORDER: PresenceStatus[] = [
  'on_campus',
  'at_venue',
  'club_room',
  'in_transit',
  'busy',
  'exam_mode',
  'off_campus',
];

export const IDEA_CATEGORIES: Record<IdeaCategory, CategoryMeta> = {
  events: { label: 'Events', icon: 'event', color: 'primary' },
  workshops: { label: 'Workshops', icon: 'code', color: 'tertiary' },
  community: { label: 'Community', icon: 'groups', color: 'secondary' },
  campus: { label: 'Campus', icon: 'domain', color: 'info' },
  content: { label: 'Content', icon: 'article', color: 'warning' },
  other: { label: 'Other', icon: 'lightbulb', color: 'outline' },
};

/** Public roadmap states for a member suggestion. */
export const IDEA_STATUS: Record<IdeaStatus, CategoryMeta> = {
  new: { label: 'New', icon: 'lightbulb', color: 'info' },
  under_review: { label: 'Under review', icon: 'manageSearch', color: 'warning' },
  planned: { label: 'Planned', icon: 'eventNote', color: 'secondary' },
  in_progress: { label: 'In progress', icon: 'trendingUp', color: 'primary' },
  shipped: { label: 'Shipped', icon: 'checkCircle', color: 'success' },
  declined: { label: 'Not planned', icon: 'errorOutline', color: 'outline' },
};

/** Order shown on the idea roadmap and in the organizer status picker. */
export const IDEA_STATUS_ORDER: IdeaStatus[] = [
  'new',
  'under_review',
  'planned',
  'in_progress',
  'shipped',
  'declined',
];

export const HOME_TRACK_FILTERS = [
  { key: 'all', label: 'All Tracks', icon: 'tune' },
  { key: 'flutter', label: 'Flutter', dot: 'primary' },
  { key: 'aiml', label: 'AI / ML', dot: 'tertiary' },
  { key: 'cloud', label: 'Cloud', dot: 'secondary' },
  { key: 'web', label: 'Web Dev', dot: 'error' },
] as const;

export const TASK_STATUS: Record<TaskStatus, CategoryMeta> = {
  todo: { label: 'To do', icon: 'radioButtonUnchecked', color: 'outline' },
  'in-progress': { label: 'In progress', icon: 'schedule', color: 'warning' },
  done: { label: 'Done', icon: 'checkCircle', color: 'tertiary' },
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['todo', 'in-progress', 'done'];

export const TASK_PRIORITY: Record<TaskPriority, { label: string; color: ColorToken }> = {
  low: { label: 'Low', color: 'outline' },
  medium: { label: 'Medium', color: 'secondary' },
  high: { label: 'High', color: 'error' },
};

export interface HomeTrackFilter {
  key: string;
  label: string;
  icon?: string;
  dot?: ColorToken;
}

/** The full taxonomy payload the API serves (and the client bundles as a fallback). */
export interface TaxonomyConfig {
  eventCategories: Record<EventCategory, CategoryMeta>;
  tracks: Record<Track, { label: string; color: ColorToken }>;
  trackFilters: Track[];
  memberRoles: Record<MemberRole, { label: string; chipColor: ColorToken; chipText: ColorToken }>;
  resourceTypes: Record<ResourceType, { label: string; icon: string; color: ColorToken }>;
  resourceCategories: readonly string[];
  difficulties: Record<ResourceDifficulty, { label: string; color: ColorToken }>;
  presenceStatus: Record<PresenceStatus, CategoryMeta>;
  presenceOrder: PresenceStatus[];
  ideaCategories: Record<IdeaCategory, CategoryMeta>;
  ideaStatus: Record<IdeaStatus, CategoryMeta>;
  ideaStatusOrder: IdeaStatus[];
  homeTrackFilters: readonly HomeTrackFilter[];
  taskStatus: Record<TaskStatus, CategoryMeta>;
  taskStatusOrder: TaskStatus[];
  taskPriority: Record<TaskPriority, { label: string; color: ColorToken }>;
}

/** Bundled defaults; the API value is shallow-merged on top at runtime. */
export const TAXONOMY_BUNDLED: TaxonomyConfig = {
  eventCategories: EVENT_CATEGORIES,
  tracks: TRACKS,
  trackFilters: TRACK_FILTERS,
  memberRoles: MEMBER_ROLES,
  resourceTypes: RESOURCE_TYPES,
  resourceCategories: RESOURCE_CATEGORIES,
  difficulties: DIFFICULTIES,
  presenceStatus: PRESENCE_STATUS,
  presenceOrder: PRESENCE_ORDER,
  ideaCategories: IDEA_CATEGORIES,
  ideaStatus: IDEA_STATUS,
  ideaStatusOrder: IDEA_STATUS_ORDER,
  homeTrackFilters: HOME_TRACK_FILTERS,
  taskStatus: TASK_STATUS,
  taskStatusOrder: TASK_STATUS_ORDER,
  taskPriority: TASK_PRIORITY,
};
