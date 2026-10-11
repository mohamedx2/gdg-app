import type {
  EventCategory,
  IdeaCategory,
  IdeaStatus,
  MemberRole,
  NotificationType,
  PresenceScope,
  PresenceStatus,
  ResourceDifficulty,
  ResourceProgress,
  ResourceType,
  SocialLinks,
  Speaker,
  TaskPriority,
  TaskStatus,
  Track,
} from './types';

/** Row shapes as stored in Postgres (snake_case). */

export interface MemberRow {
  id: string;
  email: string;
  password_hash: string | null;
  name: string;
  role: MemberRole;
  headline: string;
  bio: string;
  avatar: string;
  online: boolean;
  skills: string[];
  socials: SocialLinks;
  mutual_events: number;
  projects: { id: string; title: string; description: string; stars: number; tech: string[]; link?: string }[];
  badges: number;
  points: number;
  events_attended: number;
  workshops: number;
  tier: string;
  joined_at: string;
  presence_status: PresenceStatus;
  presence_scope: PresenceScope;
  presence_event_id: string | null;
  presence_window_label: string | null;
  presence_expires_at: string | null;
  presence_ghost: boolean;
  presence_eta_mins: number | null;
  presence_share_team: boolean;
  presence_updated_at: string | null;
}

export interface EventRow {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: EventCategory;
  track: Track;
  starts_at: string;
  ends_at: string;
  duration_label: string;
  location: string;
  venue: string;
  capacity: number;
  registered_count: number;
  cover_image: string;
  speaker: Speaker | null;
  featured: boolean;
  flagship: boolean;
  prize: string | null;
  highlights: { label: string; value: string; icon: string }[];
  perks: string[] | null;
  agenda: { time: string; title: string; speaker?: string }[] | null;
  organizer_note: string | null;
}

export interface RegistrationRow {
  id: string;
  member_id: string;
  event_id: string;
  status: 'none' | 'registered' | 'waitlist' | 'attended';
  registered_at: string;
  attended_at: string | null;
  token: string | null;
}

export interface ResourceRow {
  id: string;
  title: string;
  summary: string;
  description: string;
  type: ResourceType;
  category: string;
  difficulty: ResourceDifficulty;
  technologies: string[];
  duration_mins: number;
  author: string;
  cover_image: string;
  url: string;
  points: number;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  tag: string;
  deadline: string | null;
  created_at: string;
  cta_label: string | null;
  cta_link: string | null;
  pinned: boolean;
}

export interface ActivityRow {
  id: string;
  kind: 'rsvp' | 'badge' | 'project' | 'join';
  actor: string;
  action: string;
  target: string | null;
  target_id: string | null;
  meta: string | null;
  stars: number | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  member_id: string | null;
  type: NotificationType;
  title: string;
  body: string;
  created_at: string;
  deep_link: string | null;
}

export interface BadgeRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  seed_unlocked: boolean;
  sort_order: number;
}

export interface SquadRow {
  id: string;
  name: string;
  track: Track;
  emblem: string;
  tagline: string;
  member_count: number;
  squad_xp: number;
  week_xp: number;
}

export interface QuestRow {
  id: string;
  title: string;
  description: string;
  icon: string;
  track: Track | null;
  reward: number;
  locked: boolean;
  sort_order: number;
}

export interface QuestStepRow {
  id: string;
  quest_id: string;
  label: string;
  seed_done: boolean;
  sort_order: number;
}

export interface ArrivalRow {
  id: string;
  member_id: string | null;
  name: string;
  avatar: string;
  eta_mins: number;
  seed: boolean;
}

export interface QuizQuestionRow {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  track: Track;
  difficulty: 'easy' | 'medium' | 'hard';
  sort_order: number;
}

export interface IdeaRow {
  id: string;
  title: string;
  body: string;
  category: IdeaCategory;
  anonymous: boolean;
  author_id: string | null;
  author_name: string | null;
  author_avatar: string | null;
  base_votes: number;
  status: IdeaStatus;
  response: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface DecisionRow {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed';
  closes_at: string;
  quorum: number;
  eligible_voters: number;
  results_visible: boolean;
  important: boolean;
  created_at: string;
}

export interface DecisionOptionRow {
  id: string;
  decision_id: string;
  label: string;
  base_votes: number;
  sort_order: number;
}

export interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  points: number;
  due_at: string | null;
  event_id: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ConversationRow {
  id: string;
  name: string;
  avatar: string | null;
  context: string | null;
  is_group: boolean;
  participants: number;
  online: boolean;
  pinned: boolean;
  last_message: string;
  last_message_at: string;
  base_unread: number;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  author_id: string | null;
  author_name: string;
  author_avatar: string | null;
  body: string;
  sent_at: string;
  delivery: string;
  system: boolean;
}

export interface NotificationPreferencesRow {
  member_id: string;
  event_reminders: boolean;
  registration_updates: boolean;
  announcements: boolean;
  community_updates: boolean;
}

export interface MemberQuizStateRow {
  member_id: string;
  streak: number;
  awarded_date: string | null;
  perfect: boolean;
  updated_at: string;
}

export interface AppConfigRow {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface MemoryRow {
  id: string;
  image_url: string;
  caption: string;
  portrait: boolean;
  sort_order: number;
}
