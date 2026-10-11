import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { GdgEvent, UserProfile } from '@/types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<UserProfile, unknown, Partial<UserProfile>>({
    mutationFn: (patch) => api.profile.update(patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.profile, updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useOrganizerStats() {
  return useQuery({ queryKey: queryKeys.adminStats, queryFn: () => api.admin.stats() });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation<GdgEvent, unknown, GdgEvent>({
    mutationFn: (event) => api.admin.createEvent(event),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation<GdgEvent, unknown, { id: string; patch: Partial<GdgEvent> }>({
    mutationFn: ({ id, patch }) => api.admin.updateEvent(id, patch),
    onSuccess: (_event, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['events'] });
      void queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, string>({
    mutationFn: (id) => api.admin.deleteEvent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.admin.createAnnouncement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.announcements });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, string>({
    mutationFn: (id) => api.admin.deleteAnnouncement(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.announcements });
    },
  });
}