import { ApiError } from '../errors';
import type { AppApi } from '../contract';
import { mockDb } from './db';
import type {
  AchievementSummary,
  Announcement,
  Badge,
  EventQuery,
  GdgEvent,
  Member,
  OrganizerStats,
  Paged as PagedType,
  Resource,
  ResourceQuery,
} from '@/types';
import { matchQuery, percentage } from '@/utils/format';
import { isPast } from '@/utils/date';
import { APP_BUNDLED, UI_BUNDLED } from '@/constants/content';
import { TAXONOMY_BUNDLED } from '@/constants/taxonomy';
import { MEMORIES } from '@/constants/memories';

function delay<T>(value: T, min = 260, max = 620): Promise<T> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function fail<T>(error: unknown): Promise<T> {
  const ms = 250 + Math.random() * 250;
  return new Promise((_, reject) =>
    setTimeout(() => reject(error instanceof Error ? error : new Error(String(error))), ms),
  );
}

function paginate<T>(items: T[], page = 1, pageSize = 20): PagedType<T> {
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return { data, total: items.length, page, hasMore: start + data.length < items.length };
}

function filterEvents(query: EventQuery = {}): GdgEvent[] {
  const scope = query.scope ?? 'upcoming';
  let list = mockDb.events.filter((event) =>
    scope === 'past' ? isPast(event.endsAt) : !isPast(event.endsAt),
  );

  if (query.category && query.category !== 'all') {
    list = list.filter((event) => event.category === query.category);
  }
  if (query.track && query.track !== 'all') {
    list = list.filter((event) => event.track === query.track);
  }
  if (query.search?.trim()) {
    const term = query.search.trim();
    list = list.filter((event) =>
      matchQuery(
        `${event.title} ${event.summary} ${event.location} ${event.speaker?.name ?? ''}`,
        term,
      ),
    );
  }

  return list.sort((a, b) =>
    scope === 'past'
      ? new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
      : new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

function filterResources(query: ResourceQuery = {}): Resource[] {
  let list = [...mockDb.resources];
  if (query.category && query.category !== 'all') {
    list = list.filter((resource) => resource.category === query.category);
  }
  if (query.type && query.type !== 'all') {
    list = list.filter((resource) => resource.type === query.type);
  }
  if (query.difficulty && query.difficulty !== 'all') {
    list = list.filter((resource) => resource.difficulty === query.difficulty);
  }
  if (query.search?.trim()) {
    const term = query.search.trim();
    list = list.filter((resource) =>
      matchQuery(
        `${resource.title} ${resource.summary} ${resource.technologies.join(' ')} ${resource.category}`,
        term,
      ),
    );
  }
  return list;
}

async function assertEvent(id: string): Promise<GdgEvent> {
  const event = mockDb.events.find((e) => e.id === id);
  if (!event) throw ApiError.notFound('This event no longer exists.');
  return event;
}

export const mockApi: AppApi = {
  events: {
    async list(query = {}) {
      await mockDb.init();
      return delay(paginate(filterEvents(query), query.page ?? 1, query.pageSize ?? 20));
    },
    async get(id) {
      await mockDb.init();
      return delay(await assertEvent(id));
    },
    async getMany(ids) {
      await mockDb.init();
      const found = ids
        .map((id) => mockDb.events.find((event) => event.id === id))
        .filter((event): event is GdgEvent => Boolean(event));
      return delay(found);
    },
    async register(eventId) {
      await mockDb.init();
      try {
        const event = await assertEvent(eventId);
        if (mockDb.registrationFor(eventId)) {
          return delay(mockDb.registrationFor(eventId)!);
        }
        if (event.registeredCount >= event.capacity) {
          return fail(new ApiError('This session is full. You joined the waitlist.', 'validation'));
        }
        return delay(await mockDb.register(eventId));
      } catch (error) {
        return fail(error);
      }
    },
    async unregister(eventId) {
      await mockDb.init();
      await delay(null, 200, 400);
      await mockDb.unregister(eventId);
    },
    async attendance(eventId) {
      await mockDb.init();
      return delay(mockDb.attendanceFor(eventId), 120, 260);
    },
    async ticket(eventId) {
      await mockDb.init();
      try {
        return delay(await mockDb.ticketFor(eventId), 160, 320);
      } catch (error) {
        return fail(
          ApiError.notFound(error instanceof Error ? error.message : 'Ticket unavailable'),
        );
      }
    },
    async checkIn(eventId, token) {
      await mockDb.init();
      return delay(await mockDb.checkIn(eventId, token), 220, 420);
    },
    async upcoming(limit = 4) {
      await mockDb.init();
      return delay(filterEvents({ scope: 'upcoming' }).slice(0, limit));
    },
  },

  members: {
    async list(query = {}) {
      await mockDb.init();
      let list: Member[] = [...mockDb.members];
      if (query.role && query.role !== 'all') {
        list = list.filter((member) => member.role === query.role);
      }
      if (query.search?.trim()) {
        const term = query.search.trim();
        list = list.filter((member) =>
          matchQuery(`${member.name} ${member.headline} ${member.skills.join(' ')}`, term),
        );
      }
      return delay(paginate(list, query.page ?? 1, 20));
    },
    async get(id) {
      await mockDb.init();
      const member = mockDb.members.find((m) => m.id === id);
      if (!member) return fail(ApiError.notFound('This member profile is unavailable.'));
      return delay(member);
    },
    async toggleConnection(id) {
      await mockDb.init();
      return delay(await mockDb.toggleConnection(id), 300, 550);
    },
    async setRole(id, role) {
      await mockDb.init();
      try {
        return delay(await mockDb.setMemberRole(id, role), 250, 450);
      } catch (error) {
        return fail(error instanceof Error ? error : new Error('Could not change role'));
      }
    },
  },

  resources: {
    async list(query = {}) {
      await mockDb.init();
      return delay(paginate(filterResources(query), query.page ?? 1, query.pageSize ?? 20));
    },
    async get(id) {
      await mockDb.init();
      const resource = mockDb.resources.find((r) => r.id === id);
      if (!resource) return fail(ApiError.notFound('This resource is unavailable.'));
      return delay(resource);
    },
    async progress(id) {
      await mockDb.init();
      if (!mockDb.resources.some((r) => r.id === id)) {
        return fail(ApiError.notFound('This resource is unavailable.'));
      }
      return delay(mockDb.progressFor(id), 120, 260);
    },
    async bookmarks() {
      await mockDb.init();
      const list = mockDb.state.bookmarkedResources
        .map((id) => mockDb.resources.find((r) => r.id === id))
        .filter((r): r is Resource => Boolean(r));
      return delay(list, 150, 320);
    },
    async toggleBookmark(id) {
      await mockDb.init();
      return delay(await mockDb.toggleBookmark(id), 250, 450);
    },
    async setProgress(id, progress) {
      await mockDb.init();
      await delay(null, 200, 380);
      await mockDb.setResourceProgress(id, progress);
    },
    async recommended(limit = 4) {
      await mockDb.init();
      return delay(mockDb.resources.slice(0, limit), 150, 300);
    },
  },

  community: {
    async activity() {
      await mockDb.init();
      return delay([...mockDb.activity], 200, 420);
    },
    async announcements() {
      await mockDb.init();
      const sorted = [...mockDb.announcements].sort(
        (a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return delay(sorted, 200, 420);
    },
  },

  achievements: {
    async summary(): Promise<AchievementSummary> {
      await mockDb.init();
      const badges = await mockApi.achievements.badges();
      const unlocked = badges.filter((badge) => badge.unlocked).length;
      const summary: AchievementSummary = {
        points: mockDb.state.points,
        tier: mockDb.state.profile.tier,
        nextTier: 'Campus Champion',
        xp: Math.min(mockDb.state.points, 600),
        xpGoal: 600,
        eventsAttended: mockDb.state.profile.eventsAttended + mockDb.state.registrations.length,
        labsCompleted: Object.values(mockDb.state.resourceProgress).filter((p) => p === 'completed').length + 3,
        badgesUnlocked: unlocked,
        badgesTotal: badges.length,
        streakDays: 18,
      };
      return delay(summary, 180, 380);
    },
    async badges(): Promise<Badge[]> {
      await mockDb.init();
      const unlockedIds = mockDb.state.unlockedBadgeIds;
      const badges = mockDb.badges.map((badge) => ({
        ...badge,
        unlocked: unlockedIds.includes(badge.id),
      }));
      return delay(badges, 180, 380);
    },
    async evaluate() {
      await mockDb.init();
      return delay(await mockDb.evaluateBadges(), 150, 300);
    },
  },

  squads: {
    async list() {
      await mockDb.init();
      return delay(mockDb.squads(), 200, 420);
    },
    async mine() {
      await mockDb.init();
      return delay(mockDb.mySquad(), 160, 340);
    },
    async join(id) {
      await mockDb.init();
      try {
        return delay(await mockDb.joinSquad(id), 300, 550);
      } catch (error) {
        return fail(error instanceof Error ? error : new Error('Could not join squad'));
      }
    },
    async leave() {
      await mockDb.init();
      await delay(null, 200, 400);
      await mockDb.leaveSquad();
    },
  },

  quests: {
    async list() {
      await mockDb.init();
      return delay(mockDb.quests(), 200, 420);
    },
    async claim(id) {
      await mockDb.init();
      try {
        return delay(await mockDb.claimQuest(id), 300, 550);
      } catch (error) {
        return fail(error instanceof Error ? error : new Error('Could not claim quest'));
      }
    },
  },

  presence: {
    async mine() {
      await mockDb.init();
      return delay(mockDb.myPresence(), 120, 260);
    },
    async update(input) {
      await mockDb.init();
      return delay(await mockDb.setPresence(input), 200, 420);
    },
    async stop() {
      await mockDb.init();
      return delay(await mockDb.stopPresence(), 200, 400);
    },
    async overview() {
      await mockDb.init();
      return delay(mockDb.presenceOverview(), 160, 340);
    },
    async roster() {
      await mockDb.init();
      return delay(mockDb.presenceRoster(), 180, 360);
    },
    async arrivals(eventId) {
      await mockDb.init();
      return delay(mockDb.arrivals(eventId), 180, 360);
    },
  },

  quizzes: {
    async daily() {
      await mockDb.init();
      return delay(mockDb.dailyQuiz(), 160, 340);
    },
    async submit(answers) {
      await mockDb.init();
      return delay(await mockDb.submitQuiz(answers), 300, 560);
    },
  },

  ideas: {
    async list() {
      await mockDb.init();
      return delay(mockDb.ideas(), 200, 420);
    },
    async create(input) {
      await mockDb.init();
      try {
        return delay(await mockDb.createIdea(input), 300, 560);
      } catch (error) {
        return fail(error instanceof Error ? error : new Error('Could not submit idea'));
      }
    },
    async toggleVote(id) {
      await mockDb.init();
      try {
        return delay(await mockDb.toggleIdeaVote(id), 160, 340);
      } catch (error) {
        return fail(error instanceof Error ? error : new Error('Could not vote'));
      }
    },
    async updateStatus(id, status, response) {
      await mockDb.init();
      try {
        return delay(await mockDb.updateIdeaStatus(id, status, response), 200, 420);
      } catch (error) {
        return fail(error instanceof Error ? error : new Error('Could not update idea'));
      }
    },
  },

  decisions: {
    async list() {
      await mockDb.init();
      return delay(mockDb.decisions(), 200, 420);
    },
    async vote(id, optionId) {
      await mockDb.init();
      try {
        return delay(await mockDb.voteDecision(id, optionId), 220, 440);
      } catch (error) {
        return fail(error instanceof Error ? error : new Error('Could not record vote'));
      }
    },
    async create(input) {
      await mockDb.init();
      try {
        return delay(await mockDb.createDecision(input), 300, 560);
      } catch (error) {
        return fail(error instanceof Error ? error : new Error('Could not create decision'));
      }
    },
  },

  stats: {
    async club() {
      await mockDb.init();
      return delay(mockDb.clubStats(), 220, 440);
    },
  },

  tasks: {
    async list() {
      await mockDb.init();
      return delay(mockDb.tasks(), 200, 420);
    },
    async setStatus(id, status) {
      await mockDb.init();
      try {
        return delay(await mockDb.setTaskStatus(id, status), 220, 440);
      } catch (error) {
        return fail(error instanceof Error ? error : new Error('Could not update task'));
      }
    },
    async create(input) {
      await mockDb.init();
      try {
        return delay(await mockDb.createTask(input), 300, 560);
      } catch (error) {
        return fail(error instanceof Error ? error : new Error('Could not assign task'));
      }
    },
  },

  messages: {
    async conversations() {
      await mockDb.init();
      return delay(mockDb.conversations(), 200, 420);
    },
    async messages(conversationId) {
      await mockDb.init();
      return delay(mockDb.messages(conversationId), 160, 360);
    },
    async send(conversationId, body) {
      await mockDb.init();
      try {
        return delay(await mockDb.sendMessage(conversationId, body), 220, 420);
      } catch (error) {
        return fail(error instanceof Error ? error : new Error('Could not send message'));
      }
    },
    async markRead(conversationId) {
      await mockDb.init();
      return delay(await mockDb.markConversationRead(conversationId), 120, 260);
    },
  },

  notifications: {
    async list() {
      await mockDb.init();
      const list = mockDb.notifications.map((notification) => ({
        ...notification,
        read: mockDb.isNotificationRead(notification.id),
      }));
      return delay(
        [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        180,
        380,
      );
    },
    async unreadCount() {
      await mockDb.init();
      const unread = mockDb.notifications.filter((n) => !mockDb.isNotificationRead(n.id)).length;
      return delay(unread, 120, 240);
    },
    async markAllRead() {
      await mockDb.init();
      await delay(null, 200, 400);
      await mockDb.markAllNotificationsRead();
    },
    async preferences() {
      await mockDb.init();
      return delay(mockDb.state.notificationPreferences, 120, 260);
    },
    async setPreferences(preferences) {
      await mockDb.init();
      await delay(null, 200, 380);
      await mockDb.setNotificationPreferences(preferences);
    },
  },

  profile: {
    async get() {
      await mockDb.init();
      return delay(mockDb.state.profile, 200, 420);
    },
    async update(patch) {
      await mockDb.init();
      return delay(await mockDb.updateProfile(patch), 350, 650);
    },
  },

  admin: {
    async stats(): Promise<OrganizerStats> {
      await mockDb.init();
      const now = Date.now();
      const upcoming = mockDb.events.filter((e) => new Date(e.startsAt).getTime() > now);
      const registrations = mockDb.events.reduce((sum, e) => sum + e.registeredCount, 0);
      const capacity = mockDb.events.reduce((sum, e) => sum + e.capacity, 0);
      const stats: OrganizerStats = {
        totalEvents: mockDb.events.length,
        upcomingEvents: upcoming.length,
        totalRegistrations: registrations,
        activeMembers: mockDb.members.filter((m) => m.online).length * 18 + 42,
        announcementReach: 214,
        attendanceRate: percentage(registrations, capacity),
      };
      return delay(stats, 200, 400);
    },
    async createEvent(event) {
      await mockDb.init();
      return delay(await mockDb.createEvent(event), 400, 700);
    },
    async updateEvent(id, patch) {
      await mockDb.init();
      return delay(await mockDb.updateEvent(id, patch), 400, 700);
    },
    async deleteEvent(id) {
      await mockDb.init();
      await delay(null, 300, 550);
      await mockDb.deleteEvent(id);
    },
    async createAnnouncement(announcement) {
      await mockDb.init();
      return delay(await mockDb.createAnnouncement(announcement), 400, 700);
    },
    async deleteAnnouncement(id) {
      await mockDb.init();
      await delay(null, 300, 550);
      await mockDb.deleteAnnouncement(id);
    },
  },

  media: {
    async upload(input) {
      await mockDb.init();
      const folder = input.folder ?? 'misc';
      return delay({ url: input.uri, path: `mock/${folder}/${Date.now()}` }, 300, 600);
    },
  },

  content: {
    config: () => delay({ app: APP_BUNDLED, taxonomy: TAXONOMY_BUNDLED, ui: UI_BUNDLED }, 120, 260),
    memories: () =>
      delay(
        MEMORIES.map((memory, index) => ({
          id: memory.id,
          imageUrl: '',
          caption: memory.caption,
          portrait: memory.portrait,
          sortOrder: index,
        })),
        120,
        260,
      ),
  },
};

export type { Announcement };
