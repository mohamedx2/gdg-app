import AsyncStorage from '@react-native-async-storage/async-storage';

import { TRACK_FILTERS } from '@/constants/taxonomy';
import type {
  MemberRole,
  Announcement,
  AppNotification,
  ArrivalEta,
  AttendanceStatus,
  Badge,
  ChatMessage,
  CheckInResult,
  ClubContributor,
  ClubStats,
  Conversation,
  CreateDecisionInput,
  CreateIdeaInput,
  CreateTaskInput,
  DailyQuiz,
  DailyQuizResult,
  Decision,
  EventTicket,
  GdgEvent,
  Idea,
  IdeaStatus,
  Member,
  MyPresence,
  NotificationPreferences,
  PresenceMember,
  PresenceOverview,
  Quest,
  QuizAnswer,
  QuizQuestion,
  QuizResultRow,
  Registration,
  Resource,
  ResourceProgress,
  Squad,
  Task,
  TaskStatus,
  UpdatePresenceInput,
  UserProfile,
} from '@/types';
import {
  seedActivity,
  seedAnnouncements,
  seedArrivals,
  seedBadges,
  seedConversations,
  seedDecisions,
  seedEvents,
  seedIdeas,
  seedMembers,
  seedMessages,
  seedNotifications,
  seedPresenceMembers,
  seedProfile,
  seedQuests,
  seedQuizQuestions,
  seedResources,
  seedSquads,
  seedTasks,
} from './seed';

const STORAGE_KEY = 'gdgepi.mock.state.v3';

/** Points awarded when an organizer scans an attendee in at the door. */
const CHECK_IN_POINTS = 50;

/** Decisions are voted by the core team only. */
const CORE_TEAM_SIZE = 15;

/** Opaque, unguessable ticket code — the payload encoded into the show-QR. */
function issueToken(eventId: string): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `GDGEPI-${eventId.toUpperCase()}-${stamp}${random}`;
}

/** JSON round-trip clone — deterministic and safe on every RN runtime. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export interface MockState {
  registrations: Registration[];
  bookmarkedResources: string[];
  resourceProgress: Record<string, ResourceProgress>;
  readNotificationIds: string[];
  connectedMemberIds: string[];
  /** Super-admin role changes keyed by member id. */
  roleOverrides: Record<string, MemberRole>;
  notificationPreferences: NotificationPreferences;
  profile: UserProfile;
  points: number;
  unlockedBadgeIds: string[];
  /** Squad the member has joined for the semester, if any. */
  squadId: string | null;
  /** Quests whose reward has been claimed. */
  claimedQuestIds: string[];
  /** Extra step completions keyed by quest id (e.g. joining a squad). */
  questStepDone: Record<string, string[]>;
  /** Opt-in presence sharing state (off until the member chooses to share). */
  presence: MyPresence;
  /** Current daily-quiz streak in days. */
  quizStreak: number;
  /** Whether today's quiz XP has already been granted. */
  quizAwarded: boolean;
  /** Whether the member has ever aced the daily quiz. */
  quizPerfect: boolean;
  /** Idea ids the member has upvoted. */
  ideaVotes: string[];
  /** Ideas submitted by the member in this demo session. */
  customIdeas: Idea[];
  /** Organizer roadmap overrides keyed by idea id (status + official response). */
  ideaStatus: Record<string, { status: IdeaStatus; response?: string; respondedAt?: string }>;
  /** My ballot per decision, keyed by decision id. */
  decisionVotes: Record<string, string>;
  /** Decisions created by an organizer in this demo session. */
  customDecisions: Decision[];
  /** Organizer status overrides per task, keyed by task id. */
  taskStatus: Record<string, TaskStatus>;
  /** Task ids whose completion reward has already been granted. */
  taskRewards: string[];
  /** Tasks created by an organizer in this demo session. */
  customTasks: Task[];
  /** Conversations the member has opened (unread cleared). */
  readConversationIds: string[];
  /** Messages the member sent in this demo session. */
  sentMessages: ChatMessage[];
}

const defaultState: MockState = {
  registrations: [],
  bookmarkedResources: [],
  resourceProgress: {},
  readNotificationIds: ['ntf-3', 'ntf-4', 'ntf-5', 'ntf-6'],
  connectedMemberIds: [],
  roleOverrides: {},
  notificationPreferences: {
    eventReminders: true,
    registrationUpdates: true,
    announcements: true,
    communityUpdates: true,
  },
  profile: seedProfile,
  points: seedProfile.points,
  unlockedBadgeIds: seedBadges.filter((b) => b.unlocked).map((b) => b.id),
  squadId: null,
  claimedQuestIds: [],
  questStepDone: {},
  presence: {
    status: 'off_campus',
    scope: 'none',
    ghost: false,
    shareWithTeam: false,
  },
  quizStreak: 6,
  quizAwarded: false,
  quizPerfect: false,
  ideaVotes: ['idea-android-track'],
  customIdeas: [],
  ideaStatus: {},
  decisionVotes: {},
  customDecisions: [],
  taskStatus: {},
  taskRewards: [],
  customTasks: [],
  readConversationIds: [],
  sentMessages: [],
};

/** Mutable, persisted server-state stand-in used only in mock mode. */
class MockDatabase {
  readonly events: GdgEvent[] = [...seedEvents];
  /** Directory with super-admin role changes applied. */
  get members(): Member[] {
    return seedMembers.map((member) => {
      const role = this.state.roleOverrides[member.id];
      return role ? { ...member, role } : member;
    });
  }
  readonly resources: Resource[] = [...seedResources];
  readonly announcements: Announcement[] = [...seedAnnouncements];
  readonly notifications: AppNotification[] = [...seedNotifications];
  readonly activity = [...seedActivity];
  readonly badges: Badge[] = seedBadges.map((b) => ({ ...b }));

  state: MockState = clone(defaultState);
  private ready: Promise<void> | null = null;

  init(): Promise<void> {
    if (!this.ready) {
      this.ready = this.load();
    }
    return this.ready;
  }

  private async load(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<MockState>;
      this.state = { ...clone(defaultState), ...parsed };
    } catch {
      // Corrupt or missing persisted state — fall back to defaults.
    }
  }

  async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Persistence is best-effort in mock mode.
    }
  }

  reset(): void {
    this.state = clone(defaultState);
    void this.persist();
  }

  // ── Registrations ────────────────────────────────────────────────
  registrationFor(eventId: string): Registration | undefined {
    return this.state.registrations.find((r) => r.eventId === eventId);
  }

  attendanceFor(eventId: string): AttendanceStatus {
    return this.registrationFor(eventId)?.status ?? 'none';
  }

  async register(eventId: string): Promise<Registration> {
    const existing = this.registrationFor(eventId);
    if (existing) return existing;
    const event = this.events.find((e) => e.id === eventId);
    if (!event) throw new Error('Event not found');
    if (event.registeredCount >= event.capacity) {
      const registration: Registration = {
        eventId,
        status: 'waitlist',
        registeredAt: new Date().toISOString(),
      };
      this.state.registrations.push(registration);
      await this.persist();
      return registration;
    }
    const registration: Registration = {
      eventId,
      status: 'registered',
      registeredAt: new Date().toISOString(),
      token: issueToken(eventId),
    };
    this.state.registrations.push(registration);
    event.registeredCount += 1;
    this.state.points += 20;
    await this.persist();
    return registration;
  }

  async unregister(eventId: string): Promise<void> {
    const index = this.state.registrations.findIndex((r) => r.eventId === eventId);
    if (index === -1) return;
    const [removed] = this.state.registrations.splice(index, 1);
    const event = this.events.find((e) => e.id === eventId);
    if (event && removed.status === 'registered' && event.registeredCount > 0) {
      event.registeredCount -= 1;
    }
    await this.persist();
  }

  // ── Tickets & check-in ───────────────────────────────────────────
  async ticketFor(eventId: string): Promise<EventTicket> {
    const registration = this.registrationFor(eventId);
    if (!registration || registration.status === 'waitlist') {
      throw new Error('You do not have a ticket for this event yet.');
    }
    if (!registration.token) {
      registration.token = issueToken(eventId);
      await this.persist();
    }
    const event = this.events.find((e) => e.id === eventId);
    return {
      eventId,
      eventTitle: event?.title ?? 'GDG event',
      token: registration.token,
      issuedAt: registration.registeredAt,
      attendeeName: this.state.profile.name,
    };
  }

  async checkIn(eventId: string, token: string): Promise<CheckInResult> {
    const event = this.events.find((e) => e.id === eventId);
    const registration = this.registrationFor(eventId);

    const belongsElsewhere = this.state.registrations.some(
      (r) => r.token === token && r.eventId !== eventId,
    );
    if (belongsElsewhere) return { status: 'wrong_event', eventTitle: event?.title };

    if (!registration || registration.status === 'waitlist') {
      return { status: 'not_registered', eventTitle: event?.title };
    }
    if (!registration.token || registration.token !== token) {
      return { status: 'invalid_ticket', eventTitle: event?.title };
    }
    if (registration.status === 'attended') {
      return {
        status: 'already_checked_in',
        attendee: this.attendee(),
        eventTitle: event?.title,
        checkedInAt: registration.attendedAt,
      };
    }

    registration.status = 'attended';
    registration.attendedAt = new Date().toISOString();
    this.state.points += CHECK_IN_POINTS;
    await this.persist();
    await this.evaluateBadges();

    return {
      status: 'accepted',
      attendee: this.attendee(),
      eventTitle: event?.title,
      pointsAwarded: CHECK_IN_POINTS,
      checkedInAt: registration.attendedAt,
    };
  }

  private attendee() {
    return {
      name: this.state.profile.name,
      avatar: this.state.profile.avatar,
      headline: this.state.profile.headline,
    };
  }

  // ── Resources ────────────────────────────────────────────────────
  isBookmarked(resourceId: string): boolean {
    return this.state.bookmarkedResources.includes(resourceId);
  }

  progressFor(resourceId: string): ResourceProgress {
    return this.state.resourceProgress[resourceId] ?? 'none';
  }

  async toggleBookmark(resourceId: string): Promise<boolean> {
    const list = this.state.bookmarkedResources;
    const index = list.indexOf(resourceId);
    if (index >= 0) list.splice(index, 1);
    else list.push(resourceId);
    await this.persist();
    return index < 0;
  }

  async setResourceProgress(resourceId: string, progress: ResourceProgress): Promise<void> {
    const previous = this.progressFor(resourceId);
    this.state.resourceProgress[resourceId] = progress;
    if (progress === 'completed' && previous !== 'completed') {
      const resource = this.resources.find((r) => r.id === resourceId);
      this.state.points += resource?.points ?? 25;
    }
    await this.persist();
  }

  // ── Notifications & connections ──────────────────────────────────
  isNotificationRead(id: string): boolean {
    return this.state.readNotificationIds.includes(id);
  }

  async markAllNotificationsRead(): Promise<void> {
    this.state.readNotificationIds = this.notifications.map((n) => n.id);
    await this.persist();
  }

  isConnected(memberId: string): boolean {
    return this.state.connectedMemberIds.includes(memberId);
  }

  async setMemberRole(memberId: string, role: MemberRole): Promise<Member> {
    const member = this.members.find((m) => m.id === memberId);
    if (!member) throw new Error('This member no longer exists.');
    const supers = this.members.filter((m) => m.role === 'super-admin');
    if (member.role === 'super-admin' && role !== 'super-admin' && supers.length <= 1) {
      throw new Error('The chapter needs at least one super admin.');
    }
    this.state.roleOverrides[memberId] = role;
    await this.persist();
    return this.members.find((m) => m.id === memberId)!;
  }

  async toggleConnection(memberId: string): Promise<boolean> {
    const list = this.state.connectedMemberIds;
    const index = list.indexOf(memberId);
    if (index >= 0) list.splice(index, 1);
    else list.push(memberId);
    await this.persist();
    return index < 0;
  }

  async setNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    this.state.notificationPreferences = preferences;
    await this.persist();
  }

  async updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
    this.state.profile = { ...this.state.profile, ...patch };
    await this.persist();
    return this.state.profile;
  }

  // ── Achievements ─────────────────────────────────────────────────
  unlockedBadges(): Badge[] {
    return this.badges.map((badge) => {
      const unlocked = this.state.unlockedBadgeIds.includes(badge.id);
      return unlocked && !badge.unlocked ? { ...badge, unlocked: true, unlockedAt: new Date().toISOString() } : badge;
    });
  }

  async evaluateBadges(): Promise<Badge[]> {
    const events = this.state.registrations.length;
    const completedResources = Object.values(this.state.resourceProgress).filter(
      (p) => p === 'completed',
    ).length;
    const newlyUnlocked: string[] = [];
    if (events >= 1 && !this.state.unlockedBadgeIds.includes('bnd-first-rsvp')) {
      newlyUnlocked.push('bnd-first-rsvp');
    }
    if (completedResources >= 1 && !this.state.unlockedBadgeIds.includes('bnd-open-source')) {
      newlyUnlocked.push('bnd-open-source');
    }
    if (this.state.squadId && !this.state.unlockedBadgeIds.includes('bnd-squad-player')) {
      newlyUnlocked.push('bnd-squad-player');
    }
    if (
      this.state.claimedQuestIds.length >= 3 &&
      !this.state.unlockedBadgeIds.includes('bnd-quest-master')
    ) {
      newlyUnlocked.push('bnd-quest-master');
    }
    if (this.state.quizPerfect && !this.state.unlockedBadgeIds.includes('bnd-quiz-whiz')) {
      newlyUnlocked.push('bnd-quiz-whiz');
    }
    if (this.state.customIdeas.length >= 1 && !this.state.unlockedBadgeIds.includes('bnd-idea-starter')) {
      newlyUnlocked.push('bnd-idea-starter');
    }
    if (this.state.taskRewards.length >= 1 && !this.state.unlockedBadgeIds.includes('bnd-task-doer')) {
      newlyUnlocked.push('bnd-task-doer');
    }
    if (this.state.sentMessages.length >= 1 && !this.state.unlockedBadgeIds.includes('bnd-conversationalist')) {
      newlyUnlocked.push('bnd-conversationalist');
    }
    if (newlyUnlocked.length) {
      this.state.unlockedBadgeIds.push(...newlyUnlocked);
      await this.persist();
    }
    return this.unlockedBadges();
  }

  // ── Squads ───────────────────────────────────────────────────────
  /** Full leaderboard with computed rank, my-squad flag and gap to the team ahead. */
  squads(): Squad[] {
    const list: Squad[] = seedSquads.map((squad) => ({
      ...squad,
      rank: 0,
      gapToNext: 0,
      isMine: this.state.squadId === squad.id,
    }));
    const ranked = [...list].sort((a, b) => b.squadXp - a.squadXp);
    return ranked.map((squad, index) => {
      const ahead = ranked[index - 1];
      return {
        ...squad,
        rank: index + 1,
        gapToNext: ahead ? Math.max(0, ahead.squadXp - squad.squadXp + 1) : 0,
      };
    });
  }

  mySquad(): Squad | null {
    return this.squads().find((squad) => squad.isMine) ?? null;
  }

  async joinSquad(id: string): Promise<Squad> {
    if (!seedSquads.some((squad) => squad.id === id)) {
      throw new Error('This squad does not exist.');
    }
    this.state.squadId = id;
    this.markQuestStep('qst-community-starter', 'join-a-squad');
    await this.persist();
    await this.evaluateBadges();
    return this.mySquad()!;
  }

  async leaveSquad(): Promise<void> {
    this.state.squadId = null;
    await this.persist();
  }

  // ── Quests ───────────────────────────────────────────────────────
  /** Quests with derived step completion, status and progress. */
  quests(): Quest[] {
    return seedQuests.map((quest) => {
      const extra = this.state.questStepDone[quest.id] ?? [];
      const steps = quest.steps.map((step) => ({
        ...step,
        done: step.done || extra.includes(step.id),
      }));
      const doneCount = steps.filter((step) => step.done).length;
      const progress = steps.length ? doneCount / steps.length : 0;
      const claimed = this.state.claimedQuestIds.includes(quest.id);
      const status: Quest['status'] = quest.locked
        ? 'locked'
        : claimed
          ? 'claimed'
          : steps.length > 0 && doneCount === steps.length
            ? 'claimable'
            : 'active';
      return { ...quest, steps, status, claimed, progress };
    });
  }

  private markQuestStep(questId: string, stepId: string): void {
    const done = this.state.questStepDone[questId] ?? [];
    if (!done.includes(stepId)) {
      this.state.questStepDone[questId] = [...done, stepId];
    }
  }

  async claimQuest(id: string): Promise<Quest> {
    const quest = this.quests().find((q) => q.id === id);
    if (!quest) throw new Error('This quest no longer exists.');
    if (quest.status !== 'claimable') {
      throw new Error('This quest is not ready to claim yet.');
    }
    this.state.claimedQuestIds.push(id);
    this.state.points += quest.reward;
    await this.persist();
    await this.evaluateBadges();
    return this.quests().find((q) => q.id === id)!;
  }

  // ── Presence ─────────────────────────────────────────────────────
  /** Current sharing state, with an expired time window treated as off. */
  myPresence(): MyPresence {
    const me = this.state.presence;
    if (me.scope === 'window' && me.expiresAt && new Date(me.expiresAt).getTime() <= Date.now()) {
      return { ...me, scope: 'none', ghost: false, etaMins: undefined };
    }
    return me;
  }

  async setPresence(input: UpdatePresenceInput): Promise<MyPresence> {
    const previous = this.myPresence();
    this.state.presence = {
      ...previous,
      ...input,
      ghost: input.ghost ?? previous.ghost,
      shareWithTeam: input.shareWithTeam ?? previous.shareWithTeam,
      updatedAt: new Date().toISOString(),
    };
    await this.persist();
    return this.state.presence;
  }

  async stopPresence(): Promise<MyPresence> {
    this.state.presence = {
      status: 'off_campus',
      scope: 'none',
      ghost: false,
      shareWithTeam: false,
      updatedAt: new Date().toISOString(),
    };
    await this.persist();
    return this.state.presence;
  }

  /** Crowd-level aggregate — what a regular member is allowed to see. */
  presenceOverview(): PresenceOverview {
    const visible = seedPresenceMembers.filter((member) => member.status !== 'off_campus');
    return {
      sharing: visible.length,
      onCampus: visible.filter((member) => member.status === 'on_campus').length,
      atVenue: visible.filter((member) => member.status === 'at_venue').length,
      inTransit: visible.filter((member) => member.status === 'in_transit').length,
      clubRoom: visible.filter((member) => member.status === 'club_room').length,
    };
  }

  /** Individual statuses — the server only returns these to the core team. */
  presenceRoster(): PresenceMember[] {
    return seedPresenceMembers.filter((m) => m.role === 'core-team' || m.role === 'super-admin');
  }

  /** Organizer arrival board for an event, including my own ETA if I'm en route. */
  arrivals(eventId: string): ArrivalEta[] {
    if (!this.events.some((event) => event.id === eventId)) return [];
    const list = [...seedArrivals];
    const me = this.myPresence();
    if (me.scope !== 'none' && !me.ghost && me.status === 'in_transit' && me.etaMins != null) {
      list.unshift({
        memberId: this.state.profile.id,
        name: `${this.state.profile.name} (you)`,
        avatar: this.state.profile.avatar,
        etaMins: me.etaMins,
      });
    }
    return list.sort((a, b) => a.etaMins - b.etaMins);
  }

  // ── Quizzes ──────────────────────────────────────────────────────
  private dailyQuestions(): QuizQuestion[] {
    return seedQuizQuestions.slice(0, 5);
  }

  dailyQuiz(): DailyQuiz {
    return {
      id: 'quiz-daily',
      title: 'Daily campus quiz',
      date: new Date().toISOString().slice(0, 10),
      questions: this.dailyQuestions(),
      reward: 30,
      streak: this.state.quizStreak,
      completed: this.state.quizAwarded,
    };
  }

  async submitQuiz(answers: QuizAnswer[]): Promise<DailyQuizResult> {
    const questions = this.dailyQuestions();
    const results: QuizResultRow[] = questions.map((question) => {
      const selected = answers.find((answer) => answer.questionId === question.id)?.selected ?? -1;
      return {
        questionId: question.id,
        selected,
        correct: selected === question.answer,
        correctIndex: question.answer,
        explanation: question.explanation,
      };
    });
    const score = results.filter((row) => row.correct).length;
    const firstToday = !this.state.quizAwarded;
    let reward = 0;
    if (firstToday) {
      reward = this.dailyQuiz().reward;
      this.state.quizAwarded = true;
      this.state.quizStreak += 1;
      if (score === questions.length) this.state.quizPerfect = true;
      this.state.points += reward;
    }
    await this.persist();
    await this.evaluateBadges();
    return {
      quizId: 'quiz-daily',
      score,
      total: questions.length,
      reward,
      streak: this.state.quizStreak,
      results,
    };
  }

  // ── Ideas ────────────────────────────────────────────────────────
  /** Merged idea box: seeds plus the member's own, with votes and roadmap applied. */
  ideas(): Idea[] {
    const seeds: Idea[] = seedIdeas.map((seed) => ({ ...seed, voted: false, isMine: false }));
    const all = [...this.state.customIdeas, ...seeds];
    return all
      .map((idea) => {
        const override = this.state.ideaStatus[idea.id];
        const voted = this.state.ideaVotes.includes(idea.id);
        return {
          ...idea,
          status: override?.status ?? idea.status,
          response: override?.response ?? idea.response,
          respondedAt: override?.respondedAt ?? idea.respondedAt,
          votes: idea.votes + (voted && !idea.isMine ? 1 : 0),
          voted,
        };
      })
      .sort((a, b) => b.votes - a.votes);
  }

  private findIdea(id: string): Idea | undefined {
    return this.ideas().find((idea) => idea.id === id);
  }

  async createIdea(input: CreateIdeaInput): Promise<Idea> {
    const profile = this.state.profile;
    const idea: Idea = {
      id: `idea-u-${Date.now().toString(36)}`,
      title: input.title.trim(),
      body: input.body.trim(),
      category: input.category,
      anonymous: input.anonymous,
      authorName: input.anonymous ? undefined : profile.name,
      authorAvatar: input.anonymous ? undefined : profile.avatar,
      votes: 0,
      voted: false,
      status: 'new',
      createdAt: new Date().toISOString(),
      isMine: true,
    };
    this.state.customIdeas.unshift(idea);
    this.state.points += 10;
    await this.persist();
    await this.evaluateBadges();
    return idea;
  }

  async toggleIdeaVote(id: string): Promise<Idea> {
    if (!this.findIdea(id)) throw new Error('This idea no longer exists.');
    const votes = this.state.ideaVotes;
    this.state.ideaVotes = votes.includes(id) ? votes.filter((vote) => vote !== id) : [...votes, id];
    await this.persist();
    return this.findIdea(id)!;
  }

  async updateIdeaStatus(id: string, status: IdeaStatus, response?: string): Promise<Idea> {
    if (!this.findIdea(id)) throw new Error('This idea no longer exists.');
    const previous = this.state.ideaStatus[id];
    const text = response?.trim() || previous?.response;
    this.state.ideaStatus[id] = {
      status,
      response: text,
      respondedAt: text ? new Date().toISOString() : previous?.respondedAt,
    };
    await this.persist();
    return this.findIdea(id)!;
  }

  // ── Decisions ────────────────────────────────────────────────────
  /** Important votes with my ballot and turnout folded in, priority first. */
  decisions(): Decision[] {
    const seeds: Decision[] = seedDecisions.map(({ showResults, ...seed }) => ({
      ...seed,
      totalVotes: seed.options.reduce((sum, option) => sum + option.votes, 0),
      resultsVisible: showResults,
    }));
    const all = [...this.state.customDecisions, ...seeds].map((decision) => {
      const myVoteOptionId = this.state.decisionVotes[decision.id];
      const options = decision.options.map((option) => ({
        ...option,
        votes: option.votes + (myVoteOptionId === option.id ? 1 : 0),
      }));
      return {
        ...decision,
        options,
        totalVotes: decision.totalVotes + (myVoteOptionId ? 1 : 0),
        myVoteOptionId,
        resultsVisible: decision.resultsVisible || decision.status === 'closed' || !!myVoteOptionId,
      };
    });
    return all.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
      if (a.important !== b.important) return a.important ? -1 : 1;
      return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
    });
  }

  private findDecision(id: string): Decision | undefined {
    return this.decisions().find((decision) => decision.id === id);
  }

  async voteDecision(id: string, optionId: string): Promise<Decision> {
    const decision = this.decisions().find((item) => item.id === id);
    if (!decision) throw new Error('This vote no longer exists.');
    if (decision.status !== 'open') throw new Error('This vote has closed.');
    if (!decision.options.some((option) => option.id === optionId)) {
      throw new Error('Pick one of the available options.');
    }
    this.state.decisionVotes[id] = optionId;
    await this.persist();
    return this.findDecision(id)!;
  }

  async createDecision(input: CreateDecisionInput): Promise<Decision> {
    const decision: Decision = {
      id: `dec-u-${Date.now().toString(36)}`,
      title: input.title.trim(),
      description: input.description.trim(),
      options: input.options.map((label, index) => ({
        id: `opt-${Date.now().toString(36)}-${index}`,
        label: label.trim(),
        votes: 0,
      })),
      status: 'open',
      closesAt: input.closesAt,
      quorum: input.quorum,
      totalVotes: 0,
      eligibleVoters: CORE_TEAM_SIZE,
      resultsVisible: input.resultsVisible,
      important: input.important,
      createdAt: new Date().toISOString(),
    };
    this.state.customDecisions.unshift(decision);
    await this.persist();
    return this.findDecision(decision.id)!;
  }

  // ── Tasks ────────────────────────────────────────────────────────
  /** Active-first, mine-first, priority-sorted organizing tasks. */
  tasks(): Task[] {
    const me = this.state.profile.name;
    const seeds: Task[] = seedTasks.map((seed) => ({ ...seed, isMine: seed.assigneeName === me }));
    const priorityRank: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };
    return [...this.state.customTasks, ...seeds]
      .map((task) => ({ ...task, status: this.state.taskStatus[task.id] ?? task.status }))
      .sort((a, b) => {
        const doneA = a.status === 'done' ? 1 : 0;
        const doneB = b.status === 'done' ? 1 : 0;
        if (doneA !== doneB) return doneA - doneB;
        const mineA = a.isMine ? 0 : 1;
        const mineB = b.isMine ? 0 : 1;
        if (mineA !== mineB) return mineA - mineB;
        if (priorityRank[a.priority] !== priorityRank[b.priority]) {
          return priorityRank[a.priority] - priorityRank[b.priority];
        }
        return new Date(a.dueAt ?? a.createdAt).getTime() - new Date(b.dueAt ?? b.createdAt).getTime();
      });
  }

  private findTask(id: string): Task | undefined {
    return this.tasks().find((task) => task.id === id);
  }

  async setTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = this.findTask(id);
    if (!task) throw new Error('This task no longer exists.');
    this.state.taskStatus[id] = status;
    if (status === 'done' && !this.state.taskRewards.includes(id)) {
      this.state.taskRewards.push(id);
      this.state.points += task.points;
    }
    await this.persist();
    await this.evaluateBadges();
    return this.findTask(id)!;
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const assignee = input.assigneeName?.trim();
    const linked = input.eventId ? this.events.find((event) => event.id === input.eventId) : undefined;
    const task: Task = {
      id: `task-u-${Date.now().toString(36)}`,
      title: input.title.trim(),
      description: input.description.trim(),
      status: 'todo',
      priority: input.priority,
      points: input.points ?? 20,
      dueAt: input.dueAt,
      eventId: linked?.id,
      eventTitle: linked?.title,
      assigneeName: assignee || this.state.profile.name,
      assigneeAvatar: !assignee || assignee === this.state.profile.name ? this.state.profile.avatar : undefined,
      isMine: !assignee || assignee === this.state.profile.name,
      createdAt: new Date().toISOString(),
    };
    this.state.customTasks.unshift(task);
    await this.persist();
    return task;
  }

  // ── Messages ─────────────────────────────────────────────────────
  /** Threads with my latest message folded in, pinned first, newest first. */
  conversations(): Conversation[] {
    const latest = new Map<string, ChatMessage>();
    for (const message of this.state.sentMessages) {
      const current = latest.get(message.conversationId);
      if (!current || new Date(message.sentAt).getTime() > new Date(current.sentAt).getTime()) {
        latest.set(message.conversationId, message);
      }
    }
    return seedConversations
      .map((conversation) => {
        const mine = latest.get(conversation.id);
        const useMine =
          !!mine && new Date(mine.sentAt).getTime() > new Date(conversation.lastMessageAt).getTime();
        const read = this.state.readConversationIds.includes(conversation.id);
        return {
          ...conversation,
          lastMessage: useMine ? (conversation.isGroup ? `You: ${mine!.body}` : mine!.body) : conversation.lastMessage,
          lastMessageAt: useMine ? mine!.sentAt : conversation.lastMessageAt,
          unreadCount: read ? 0 : conversation.unreadCount,
        };
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
  }

  private findConversation(id: string): Conversation | undefined {
    return this.conversations().find((conversation) => conversation.id === id);
  }

  messages(conversationId: string): ChatMessage[] {
    const seeds = seedMessages[conversationId] ?? [];
    const sent = this.state.sentMessages.filter((message) => message.conversationId === conversationId);
    return [...seeds, ...sent].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }

  async sendMessage(conversationId: string, body: string): Promise<ChatMessage> {
    if (!this.findConversation(conversationId)) throw new Error('This conversation no longer exists.');
    const text = body.trim();
    if (!text) throw new Error('Write a message first.');
    const message: ChatMessage = {
      id: `msg-u-${Date.now().toString(36)}`,
      conversationId,
      authorName: this.state.profile.name,
      authorAvatar: this.state.profile.avatar,
      body: text,
      sentAt: new Date().toISOString(),
      isMine: true,
      delivery: 'sent',
    };
    this.state.sentMessages.push(message);
    await this.persist();
    await this.evaluateBadges();
    return message;
  }

  async markConversationRead(conversationId: string): Promise<Conversation[]> {
    if (!this.state.readConversationIds.includes(conversationId)) {
      this.state.readConversationIds.push(conversationId);
      await this.persist();
    }
    return this.conversations();
  }

  // ── Club stats ───────────────────────────────────────────────────
  /** Public, club-wide aggregates anyone in the chapter can see. */
  clubStats(): ClubStats {
    const events = this.events;
    const totalRegistrations = events.reduce((sum, event) => sum + event.registeredCount, 0);
    const capacity = events.reduce((sum, event) => sum + event.capacity, 0);
    const topContributors: ClubContributor[] = [...this.members]
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map((member, index) => ({
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        role: member.role,
        points: member.points,
        rank: index + 1,
      }));
    return {
      eventsHosted: events.length,
      totalRegistrations,
      activeMembers: 180,
      resourcesPublished: this.resources.length,
      labCompletions: Object.values(this.state.resourceProgress).filter((p) => p === 'completed').length + 312,
      projectsShipped: this.members.reduce((sum, member) => sum + member.projects.length, 0) + 21,
      badgesEarned: this.members.reduce((sum, member) => sum + member.badges, 0) + this.state.unlockedBadgeIds.length,
      hoursLearned: 1284,
      attendanceRate: capacity ? Math.round((totalRegistrations / capacity) * 100) : 0,
      memberGrowthPct: 24,
      topContributors,
      trackBreakdown: TRACK_FILTERS.map((track) => ({
        track,
        events: events.filter((event) => event.track === track).length,
      })),
    };
  }

  // ── Admin ────────────────────────────────────────────────────────
  async createEvent(event: GdgEvent): Promise<GdgEvent> {
    this.events.unshift(event);
    return event;
  }

  async updateEvent(id: string, patch: Partial<GdgEvent>): Promise<GdgEvent> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Event not found');
    this.events[index] = { ...this.events[index], ...patch };
    return this.events[index];
  }

  async deleteEvent(id: string): Promise<void> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index >= 0) this.events.splice(index, 1);
  }

  async createAnnouncement(announcement: Announcement): Promise<Announcement> {
    this.announcements.unshift(announcement);
    return announcement;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    const index = this.announcements.findIndex((a) => a.id === id);
    if (index >= 0) this.announcements.splice(index, 1);
  }
}

export const mockDb = new MockDatabase();
