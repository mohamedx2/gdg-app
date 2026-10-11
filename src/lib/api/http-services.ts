import { request } from './http';
import type { AppApi } from './contract';

function toQuery(params: Record<string, unknown> = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === 'all') continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** Thin REST implementation — swap in when EXPO_PUBLIC_API_MODE=production. */
export const httpApi: AppApi = {
  events: {
    list: (query = {}) => request(`/events${toQuery(query as Record<string, unknown>)}`),
    get: (id) => request(`/events/${encodeURIComponent(id)}`),
    getMany: (ids) => request(`/events?ids=${ids.map(encodeURIComponent).join(',')}`),
    register: (eventId) => request(`/events/${encodeURIComponent(eventId)}/registration`, { method: 'POST' }),
    unregister: (eventId) => request(`/events/${encodeURIComponent(eventId)}/registration`, { method: 'DELETE' }),
    attendance: (eventId) => request(`/events/${encodeURIComponent(eventId)}/attendance`),
    ticket: (eventId) => request(`/events/${encodeURIComponent(eventId)}/ticket`),
    checkIn: (eventId, token) =>
      request(`/events/${encodeURIComponent(eventId)}/check-in`, { method: 'POST', body: { token } }),
    upcoming: (limit = 4) => request(`/events${toQuery({ scope: 'upcoming', pageSize: limit })}`),
  },
  members: {
    list: (query = {}) => request(`/members${toQuery(query as Record<string, unknown>)}`),
    get: (id) => request(`/members/${encodeURIComponent(id)}`),
    toggleConnection: (id) => request(`/members/${encodeURIComponent(id)}/connection`, { method: 'POST' }),
    setRole: (id, role) => request(`/members/${encodeURIComponent(id)}/role`, { method: 'PUT', body: { role } }),
  },
  resources: {
    list: (query = {}) => request(`/resources${toQuery(query as Record<string, unknown>)}`),
    get: (id) => request(`/resources/${encodeURIComponent(id)}`),
    progress: (id) => request(`/resources/${encodeURIComponent(id)}/progress`),
    bookmarks: () => request('/me/resource-bookmarks'),
    toggleBookmark: (id) => request(`/resources/${encodeURIComponent(id)}/bookmark`, { method: 'POST' }),
    setProgress: (id, progress) =>
      request(`/resources/${encodeURIComponent(id)}/progress`, { method: 'PUT', body: { progress } }),
    recommended: (limit = 4) => request(`/resources${toQuery({ pageSize: limit })}`),
  },
  community: {
    activity: () => request('/community/activity'),
    announcements: () => request('/announcements'),
  },
  achievements: {
    summary: () => request('/me/achievements/summary'),
    badges: () => request('/me/achievements/badges'),
    evaluate: () => request('/me/achievements/evaluate', { method: 'POST' }),
  },
  squads: {
    list: () => request('/squads'),
    mine: () => request('/me/squad'),
    join: (id) => request(`/squads/${encodeURIComponent(id)}/join`, { method: 'POST' }),
    leave: () => request('/me/squad', { method: 'DELETE' }),
  },
  quests: {
    list: () => request('/me/quests'),
    claim: (id) => request(`/me/quests/${encodeURIComponent(id)}/claim`, { method: 'POST' }),
  },
  presence: {
    mine: () => request('/me/presence'),
    update: (input) => request('/me/presence', { method: 'PUT', body: input }),
    stop: () => request('/me/presence', { method: 'DELETE' }),
    overview: () => request('/presence/overview'),
    roster: () => request('/presence/roster'),
    arrivals: (eventId) => request(`/events/${encodeURIComponent(eventId)}/arrivals`),
  },
  quizzes: {
    daily: () => request('/quizzes/daily'),
    submit: (answers) => request('/quizzes/daily/attempts', { method: 'POST', body: { answers } }),
  },
  ideas: {
    list: () => request('/ideas'),
    create: (input) => request('/ideas', { method: 'POST', body: input }),
    toggleVote: (id) => request(`/ideas/${encodeURIComponent(id)}/vote`, { method: 'POST' }),
    updateStatus: (id, status, response) =>
      request(`/ideas/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status, response } }),
  },
  decisions: {
    list: () => request('/decisions'),
    vote: (id, optionId) => request(`/decisions/${encodeURIComponent(id)}/ballot`, { method: 'POST', body: { optionId } }),
    create: (input) => request('/decisions', { method: 'POST', body: input }),
  },
  stats: {
    club: () => request('/stats/club'),
  },
  tasks: {
    list: () => request('/tasks'),
    setStatus: (id, status) => request(`/tasks/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } }),
    create: (input) => request('/tasks', { method: 'POST', body: input }),
  },
  messages: {
    conversations: () => request('/messages/conversations'),
    messages: (conversationId) => request(`/messages/conversations/${encodeURIComponent(conversationId)}`),
    send: (conversationId, body) =>
      request(`/messages/conversations/${encodeURIComponent(conversationId)}`, { method: 'POST', body: { body } }),
    markRead: (conversationId) =>
      request(`/messages/conversations/${encodeURIComponent(conversationId)}/read`, { method: 'POST' }),
  },
  notifications: {
    list: () => request('/notifications'),
    unreadCount: () => request('/notifications/unread-count'),
    markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
    preferences: () => request('/notifications/preferences'),
    setPreferences: (preferences) =>
      request('/notifications/preferences', { method: 'PUT', body: preferences }),
  },
  profile: {
    get: () => request('/me'),
    update: (patch) => request('/me', { method: 'PATCH', body: patch }),
  },
  admin: {
    stats: () => request('/admin/stats'),
    createEvent: (event) => request('/admin/events', { method: 'POST', body: event }),
    updateEvent: (id, patch) =>
      request(`/admin/events/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch }),
    deleteEvent: (id) => request(`/admin/events/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    createAnnouncement: (announcement) =>
      request('/admin/announcements', { method: 'POST', body: announcement }),
    deleteAnnouncement: (id) =>
      request(`/admin/announcements/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  },
};
