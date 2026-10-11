import { isMockMode } from '@/constants/env';
import type { AppApi } from './contract';
import { mockApi } from './mock/services';
import { httpApi } from './http-services';

/**
 * Single replaceable API surface. Components and hooks import `api` (or the
 * query helpers below) and never touch mock data directly.
 */
export const api: AppApi = isMockMode ? mockApi : httpApi;

export const queryKeys = {
  events: (params?: Record<string, unknown>) => ['events', params ?? {}] as const,
  event: (id: string) => ['event', id] as const,
  attendance: (id: string) => ['attendance', id] as const,
  ticket: (id: string) => ['ticket', id] as const,
  members: (params?: Record<string, unknown>) => ['members', params ?? {}] as const,
  member: (id: string) => ['member', id] as const,
  resources: (params?: Record<string, unknown>) => ['resources', params ?? {}] as const,
  resource: (id: string) => ['resource', id] as const,
  bookmarks: ['resources', 'bookmarks'] as const,
  activity: ['community', 'activity'] as const,
  announcements: ['community', 'announcements'] as const,
  badges: ['achievements', 'badges'] as const,
  achievementSummary: ['achievements', 'summary'] as const,
  squads: ['squads', 'list'] as const,
  mySquad: ['squads', 'mine'] as const,
  quests: ['quests', 'list'] as const,
  presenceMine: ['presence', 'mine'] as const,
  presenceOverview: ['presence', 'overview'] as const,
  presenceRoster: ['presence', 'roster'] as const,
  presenceArrivals: (eventId: string) => ['presence', 'arrivals', eventId] as const,
  dailyQuiz: ['quiz', 'daily'] as const,
  ideas: ['ideas', 'list'] as const,
  decisions: ['decisions', 'list'] as const,
  clubStats: ['stats', 'club'] as const,
  tasks: ['tasks', 'list'] as const,
  conversations: ['messages', 'conversations'] as const,
  messages: (conversationId: string) => ['messages', 'thread', conversationId] as const,
  notifications: ['notifications', 'list'] as const,
  notificationUnread: ['notifications', 'unread'] as const,
  notificationPreferences: ['notifications', 'preferences'] as const,
  profile: ['profile'] as const,
  adminStats: ['admin', 'stats'] as const,
};

export * from './errors';
export type * from './contract';
