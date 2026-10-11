import type {
  MemberRole,
  AchievementSummary,
  ActivityItem,
  Announcement,
  AppNotification,
  ArrivalEta,
  AttendanceStatus,
  Badge,
  CheckInResult,
  ChatMessage,
  ClubStats,
  Conversation,
  CreateDecisionInput,
  CreateIdeaInput,
  CreateTaskInput,
  DailyQuiz,
  DailyQuizResult,
  Decision,
  EventQuery,
  EventTicket,
  GdgEvent,
  Idea,
  IdeaStatus,
  Member,
  MyPresence,
  NotificationPreferences,
  OrganizerStats,
  Paged,
  PresenceMember,
  PresenceOverview,
  Quest,
  QuizAnswer,
  Registration,
  Resource,
  ResourceProgress,
  ResourceQuery,
  Squad,
  Task,
  TaskStatus,
  UpdatePresenceInput,
  UserProfile,
} from '@/types';

export interface EventsService {
  list(query?: EventQuery): Promise<Paged<GdgEvent>>;
  get(id: string): Promise<GdgEvent>;
  getMany(ids: string[]): Promise<GdgEvent[]>;
  register(eventId: string): Promise<Registration>;
  unregister(eventId: string): Promise<void>;
  attendance(eventId: string): Promise<AttendanceStatus>;
  ticket(eventId: string): Promise<EventTicket>;
  checkIn(eventId: string, token: string): Promise<CheckInResult>;
  upcoming(limit?: number): Promise<GdgEvent[]>;
}

export interface MembersService {
  list(query?: { search?: string; role?: string; page?: number }): Promise<Paged<Member>>;
  get(id: string): Promise<Member>;
  toggleConnection(id: string): Promise<boolean>;
  /** Super-admin only: change a member's role. */
  setRole(id: string, role: MemberRole): Promise<Member>;
}

export interface ResourcesService {
  list(query?: ResourceQuery): Promise<Paged<Resource>>;
  get(id: string): Promise<Resource>;
  progress(id: string): Promise<ResourceProgress>;
  bookmarks(): Promise<Resource[]>;
  toggleBookmark(id: string): Promise<boolean>;
  setProgress(id: string, progress: ResourceProgress): Promise<void>;
  recommended(limit?: number): Promise<Resource[]>;
}

export interface CommunityService {
  activity(): Promise<ActivityItem[]>;
  announcements(): Promise<Announcement[]>;
}

export interface AchievementsService {
  summary(): Promise<AchievementSummary>;
  badges(): Promise<Badge[]>;
  evaluate(): Promise<Badge[]>;
}

export interface SquadsService {
  /** Full semester leaderboard with computed ranks. */
  list(): Promise<Squad[]>;
  /** The squad the member has joined, or null. */
  mine(): Promise<Squad | null>;
  join(id: string): Promise<Squad>;
  leave(): Promise<void>;
}

export interface QuestsService {
  list(): Promise<Quest[]>;
  claim(id: string): Promise<Quest>;
}

export interface DecisionsService {
  /** Important votes, priority first, with the member's ballot folded in. */
  list(): Promise<Decision[]>;
  /** Cast (or change) the member's ballot while the vote is open. */
  vote(id: string, optionId: string): Promise<Decision>;
  /** Organizer-only: open a new decision. */
  create(input: CreateDecisionInput): Promise<Decision>;
}

export interface IdeasService {
  /** Idea box with per-viewer vote state, sorted by popularity. */
  list(): Promise<Idea[]>;
  /** Submit a suggestion; anonymous submissions omit the author. */
  create(input: CreateIdeaInput): Promise<Idea>;
  /** Toggle the current member's upvote. */
  toggleVote(id: string): Promise<Idea>;
  /** Organizer-only: move an idea along the roadmap and answer it. */
  updateStatus(id: string, status: IdeaStatus, response?: string): Promise<Idea>;
}

export interface QuizzesService {
  /** Today's quiz (answers omitted from the payload). */
  daily(): Promise<DailyQuiz>;
  /** Submit answers; the score is computed server-side. */
  submit(answers: QuizAnswer[]): Promise<DailyQuizResult>;
}

export interface PresenceService {
  /** My own opt-in sharing state (off by default). */
  mine(): Promise<MyPresence>;
  /** Turn sharing on or update the shared status/scope. */
  update(input: UpdatePresenceInput): Promise<MyPresence>;
  /** Stop sharing immediately and clear the shared data. */
  stop(): Promise<MyPresence>;
  /** Crowd-level aggregate — safe for every member. */
  overview(): Promise<PresenceOverview>;
  /** Individual statuses — core team only (enforced server-side). */
  roster(): Promise<PresenceMember[]>;
  /** Arrival board for an event (organizers). */
  arrivals(eventId: string): Promise<ArrivalEta[]>;
}

export interface StatsService {
  /** Public, club-wide aggregates every member can see. */
  club(): Promise<ClubStats>;
}

export interface TasksService {
  /** Organizing tasks, active and mine first. */
  list(): Promise<Task[]>;
  /** Move a task between to-do, in-progress and done. */
  setStatus(id: string, status: TaskStatus): Promise<Task>;
  /** Organizer-only: assign a new task. */
  create(input: CreateTaskInput): Promise<Task>;
}

export interface MessagesService {
  /** Chat threads, pinned and most-recent first. */
  conversations(): Promise<Conversation[]>;
  /** Full message history for one thread, oldest first. */
  messages(conversationId: string): Promise<ChatMessage[]>;
  /** Send a message and return the stored copy. */
  send(conversationId: string, body: string): Promise<ChatMessage>;
  /** Clear a thread's unread count. */
  markRead(conversationId: string): Promise<Conversation[]>;
}

export interface NotificationsService {
  list(): Promise<AppNotification[]>;
  unreadCount(): Promise<number>;
  markAllRead(): Promise<void>;
  preferences(): Promise<NotificationPreferences>;
  setPreferences(preferences: NotificationPreferences): Promise<void>;
}

export interface ProfileService {
  get(): Promise<UserProfile>;
  update(patch: Partial<UserProfile>): Promise<UserProfile>;
}

export interface AdminService {
  stats(): Promise<OrganizerStats>;
  createEvent(event: GdgEvent): Promise<GdgEvent>;
  updateEvent(id: string, patch: Partial<GdgEvent>): Promise<GdgEvent>;
  deleteEvent(id: string): Promise<void>;
  createAnnouncement(announcement: Announcement): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;
}

export interface AppApi {
  events: EventsService;
  members: MembersService;
  resources: ResourcesService;
  community: CommunityService;
  achievements: AchievementsService;
  squads: SquadsService;
  quests: QuestsService;
  presence: PresenceService;
  quizzes: QuizzesService;
  ideas: IdeasService;
  decisions: DecisionsService;
  stats: StatsService;
  tasks: TasksService;
  messages: MessagesService;
  notifications: NotificationsService;
  profile: ProfileService;
  admin: AdminService;
}
