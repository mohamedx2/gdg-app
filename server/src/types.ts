/** Domain models shared across the app. */

export type EventCategory = 'workshop' | 'talk' | 'hackathon' | 'meetup' | 'career';

export type Track = 'flutter' | 'aiml' | 'cloud' | 'web' | 'android' | 'general';

export type EventStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export type AttendanceStatus = 'none' | 'registered' | 'waitlist' | 'attended';

export interface Speaker {
  id: string;
  name: string;
  title: string;
  avatar: string;
  verified: boolean;
  track: Track;
}

export interface EventHighlight {
  label: string;
  value: string;
  icon: string;
}

export interface GdgEvent {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: EventCategory;
  track: Track;
  startsAt: string;
  endsAt: string;
  durationLabel: string;
  location: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  coverImage: string;
  speaker?: Speaker;
  featured: boolean;
  flagship: boolean;
  prize?: string;
  highlights: EventHighlight[];
  perks?: string[];
  agenda?: { time: string; title: string; speaker?: string }[];
  organizerNote?: string;
}

export interface Registration {
  eventId: string;
  status: AttendanceStatus;
  registeredAt: string;
  attendedAt?: string;
  /** Opaque, server-issued code that encodes the check-in QR payload. */
  token?: string;
}

/** Ticket QR payload a registered attendee presents at the door. */
export interface EventTicket {
  eventId: string;
  eventTitle: string;
  token: string;
  issuedAt: string;
  attendeeName: string;
}

export type CheckInStatus =
  | 'accepted'
  | 'already_checked_in'
  | 'invalid_ticket'
  | 'wrong_event'
  | 'not_registered';

export interface CheckInAttendee {
  name: string;
  avatar?: string;
  headline?: string;
}

/** Outcome of an organizer scanning an attendee's ticket QR. */
export interface CheckInResult {
  status: CheckInStatus;
  attendee?: CheckInAttendee;
  eventTitle?: string;
  pointsAwarded?: number;
  checkedInAt?: string;
}

export interface EventQuery {
  search?: string;
  category?: EventCategory | 'all';
  track?: Track | 'all';
  scope?: 'upcoming' | 'past';
  page?: number;
  pageSize?: number;
}

export type MemberRole = 'super-admin' | 'student' | 'core-team' | 'speaker' | 'alumni';

/** App access tier derived from a member's role. */
export type AccessLevel = 'super-admin' | 'core' | 'member';

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  stars: number;
  tech: string[];
  link?: string;
}

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  headline: string;
  bio: string;
  avatar: string;
  online: boolean;
  skills: string[];
  socials: SocialLinks;
  mutualEvents: number;
  projects: Project[];
  badges: number;
  points: number;
  eventsAttended: number;
}

export type ResourceType = 'codelab' | 'article' | 'video' | 'course';
export type ResourceDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ResourceProgress = 'none' | 'started' | 'completed';

export interface Resource {
  id: string;
  title: string;
  summary: string;
  description: string;
  type: ResourceType;
  category: string;
  difficulty: ResourceDifficulty;
  technologies: string[];
  durationMins: number;
  author: string;
  coverImage: string;
  url: string;
  points: number;
}

export interface ResourceQuery {
  search?: string;
  category?: string | 'all';
  type?: ResourceType | 'all';
  difficulty?: ResourceDifficulty | 'all';
  page?: number;
  pageSize?: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  tag: string;
  deadline?: string;
  createdAt: string;
  ctaLabel?: string;
  ctaLink?: string;
  pinned: boolean;
}

export type ActivityKind = 'rsvp' | 'badge' | 'project' | 'join';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  actor: string;
  action: string;
  target?: string;
  targetId?: string;
  meta?: string;
  stars?: number;
  createdAt: string;
}

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  rarity: BadgeRarity;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  progressLabel: string;
}

export interface AchievementSummary {
  points: number;
  tier: string;
  nextTier: string;
  xp: number;
  xpGoal: number;
  eventsAttended: number;
  labsCompleted: number;
  badgesUnlocked: number;
  badgesTotal: number;
  streakDays: number;
}

export type NotificationType = 'event_reminder' | 'registration' | 'announcement' | 'community';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  deepLink?: string;
}

export interface NotificationPreferences {
  eventReminders: boolean;
  registrationUpdates: boolean;
  announcements: boolean;
  communityUpdates: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  headline: string;
  bio: string;
  avatar: string;
  role: MemberRole;
  skills: string[];
  socials: SocialLinks;
  points: number;
  tier: string;
  eventsAttended: number;
  workshops: number;
  badges: number;
  joinedAt: string;
}

export interface Paged<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  page: number;
}

export interface OrganizerStats {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  activeMembers: number;
  announcementReach: number;
  attendanceRate: number;
}

/** A contributor on the public club leaderboard. */
export interface ClubContributor {
  id: string;
  name: string;
  avatar: string;
  role: MemberRole;
  points: number;
  rank: number;
}

/** Public, club-wide stats every member can see. */
export interface ClubStats {
  eventsHosted: number;
  totalRegistrations: number;
  activeMembers: number;
  resourcesPublished: number;
  labCompletions: number;
  projectsShipped: number;
  badgesEarned: number;
  hoursLearned: number;
  attendanceRate: number;
  memberGrowthPct: number;
  topContributors: ClubContributor[];
  trackBreakdown: { track: Track; events: number }[];
}

/** A track-based team that competes for squad XP across a semester. */
export interface Squad {
  id: string;
  name: string;
  track: Track;
  /** Icon glyph key (see `iconName`). */
  emblem: string;
  tagline: string;
  memberCount: number;
  squadXp: number;
  /** XP earned by the squad in the current week — the momentum signal. */
  weekXp: number;
  /** Leaderboard position (1 = leading). */
  rank: number;
  isMine: boolean;
  /** Squad XP behind the team directly ahead; 0 when leading. */
  gapToNext: number;
}

export type QuestStatus = 'active' | 'claimable' | 'claimed' | 'locked';

export interface QuestStep {
  id: string;
  label: string;
  done: boolean;
}

/** Multi-step goal that pays out XP once every step is complete. */
export interface Quest {
  id: string;
  title: string;
  description: string;
  /** Icon glyph key (see `iconName`). */
  icon: string;
  track?: Track;
  reward: number;
  steps: QuestStep[];
  status: QuestStatus;
  claimed: boolean;
  progress: number;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

/** An organizing task, optionally tied to an event and assigned to a member. */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** Points granted once when the task is completed by the signed-in member. */
  points: number;
  dueAt?: string;
  eventId?: string;
  eventTitle?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  /** True when the task is assigned to the signed-in member. */
  isMine: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
  points?: number;
  dueAt?: string;
  assigneeName?: string;
  eventId?: string;
}

export type MessageDelivery = 'sending' | 'sent' | 'delivered' | 'read';

/** A direct or group chat thread in the club messenger. */
export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  /** Short context label, e.g. "HackNight team" or "Core team". */
  context?: string;
  isGroup: boolean;
  participants: number;
  online: boolean;
  pinned: boolean;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
  sentAt: string;
  isMine: boolean;
  delivery: MessageDelivery;
  system?: boolean;
}

/**
 * Coarse, opt-in presence. Location is never an exact pin — it is a label
 * ("on campus", "on the way") that a member chooses to share for a limited
 * window. Sharing is off by default.
 */
export type PresenceStatus =
  | 'in_transit'
  | 'on_campus'
  | 'at_venue'
  | 'club_room'
  | 'off_campus'
  | 'busy'
  | 'exam_mode';

/** Why sharing is on: tied to an event, a time window, or off entirely. */
export type PresenceScope = 'none' | 'event' | 'window';

/** The signed-in member's own sharing state. */
export interface MyPresence {
  status: PresenceStatus;
  scope: PresenceScope;
  eventId?: string;
  /** Human-readable window, e.g. "for the next hour". */
  windowLabel?: string;
  /** Sharing auto-expires at this time; storage is cleared afterwards. */
  expiresAt?: string;
  /** Ghost mode keeps the window running but hides you from everyone. */
  ghost: boolean;
  /** Minutes until arrival — only meaningful while 'in_transit'. */
  etaMins?: number;
  /** Share the coarse status with the core team. */
  shareWithTeam: boolean;
  updatedAt?: string;
}

/** A peer's coarse presence as visible to the viewer. */
export interface PresenceMember {
  id: string;
  name: string;
  avatar: string;
  role: MemberRole;
  status: PresenceStatus;
  venue?: string;
  etaMins?: number;
  updatedAt?: string;
}

/** Crowd-level aggregate — the only view regular members receive. */
export interface PresenceOverview {
  sharing: number;
  onCampus: number;
  atVenue: number;
  inTransit: number;
  clubRoom: number;
}

/** Organizer arrival board row: who is on the way, and when. */
export interface ArrivalEta {
  memberId: string;
  name: string;
  avatar: string;
  etaMins: number;
}

export interface UpdatePresenceInput {
  status: PresenceStatus;
  scope: PresenceScope;
  eventId?: string;
  windowLabel?: string;
  expiresAt?: string;
  ghost?: boolean;
  etaMins?: number;
  shareWithTeam?: boolean;
}

export type DecisionStatus = 'open' | 'closed';

export interface DecisionOption {
  id: string;
  label: string;
  votes: number;
}

/** An important vote the chapter runs — one ballot per member, with a deadline. */
export interface Decision {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
  status: DecisionStatus;
  closesAt: string;
  /** Minimum number of votes required for the result to be binding. */
  quorum: number;
  totalVotes: number;
  eligibleVoters: number;
  /** The option the current member picked, if any. */
  myVoteOptionId?: string;
  /** Whether results are visible before the vote closes. */
  resultsVisible: boolean;
  /** Flags the vote as high priority (pinned, badged). */
  important: boolean;
  createdAt: string;
}

export interface CreateDecisionInput {
  title: string;
  description: string;
  options: string[];
  closesAt: string;
  quorum: number;
  resultsVisible: boolean;
  important: boolean;
}

export type IdeaCategory = 'events' | 'workshops' | 'community' | 'campus' | 'content' | 'other';

export type IdeaStatus = 'new' | 'under_review' | 'planned' | 'in_progress' | 'shipped' | 'declined';

/** A member suggestion, optionally anonymous, with a public roadmap status. */
export interface Idea {
  id: string;
  title: string;
  body: string;
  category: IdeaCategory;
  anonymous: boolean;
  /** Omitted when `anonymous` — the API never returns the author identity then. */
  authorName?: string;
  authorAvatar?: string;
  votes: number;
  /** Whether the current member has upvoted. */
  voted: boolean;
  status: IdeaStatus;
  /** Official club response ("you said, we did"), shown once actioned. */
  response?: string;
  respondedAt?: string;
  createdAt: string;
  isMine: boolean;
}

export interface CreateIdeaInput {
  title: string;
  body: string;
  category: IdeaCategory;
  anonymous: boolean;
}

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

/** A single question in the bank. Answers are validated server-side. */
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Index of the correct option (server-only; not sent for live scoring). */
  answer: number;
  explanation: string;
  track: Track;
  difficulty: QuizDifficulty;
}

export interface QuizAnswer {
  questionId: string;
  selected: number;
}

/** Per-question outcome returned after submitting an attempt. */
export interface QuizResultRow {
  questionId: string;
  selected: number;
  correct: boolean;
  correctIndex: number;
  explanation: string;
}

/** Today's quiz payload. */
export interface DailyQuiz {
  id: string;
  title: string;
  date: string;
  questions: QuizQuestion[];
  reward: number;
  streak: number;
  /** Whether today's XP has already been earned. */
  completed: boolean;
}

/** Graded result for a submitted attempt. */
export interface DailyQuizResult {
  quizId: string;
  score: number;
  total: number;
  reward: number;
  streak: number;
  results: QuizResultRow[];
}
