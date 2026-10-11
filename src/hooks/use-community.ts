import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { AchievementSummary, ActivityItem, Announcement, AppNotification, Badge, NotificationPreferences, UserProfile } from '@/types';

export function useActivity(): UseQueryResult<ActivityItem[]> {
  return useQuery({
    queryKey: queryKeys.activity,
    queryFn: () => api.community.activity(),
  });
}

export function useAnnouncements(): UseQueryResult<Announcement[]> {
  return useQuery({
    queryKey: queryKeys.announcements,
    queryFn: () => api.community.announcements(),
  });
}

export function useAchievementSummary(): UseQueryResult<AchievementSummary> {
  return useQuery({
    queryKey: queryKeys.achievementSummary,
    queryFn: () => api.achievements.summary(),
  });
}

export function useBadges(): UseQueryResult<Badge[]> {
  return useQuery({
    queryKey: queryKeys.badges,
    queryFn: () => api.achievements.badges(),
  });
}

export function useNotifications(): UseQueryResult<AppNotification[]> {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => api.notifications.list(),
  });
}

export function useUnreadCount(): UseQueryResult<number> {
  return useQuery({
    queryKey: queryKeys.notificationUnread,
    queryFn: () => api.notifications.unreadCount(),
    refetchInterval: 60_000,
  });
}

export function useNotificationPreferences(): UseQueryResult<NotificationPreferences> {
  return useQuery({
    queryKey: queryKeys.notificationPreferences,
    queryFn: () => api.notifications.preferences(),
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation<void>({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnread });
    },
  });
}

export function useSetNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, NotificationPreferences>({
    mutationFn: (preferences) => api.notifications.setPreferences(preferences),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationPreferences });
    },
  });
}

export function useProfile(): UseQueryResult<UserProfile> {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => api.profile.get(),
  });
}
