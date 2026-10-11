import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type {
  AttendanceStatus,
  CheckInResult,
  EventQuery,
  EventTicket,
  GdgEvent,
  Paged,
  Registration,
} from '@/types';

export function useEvents(query: EventQuery = {}): UseQueryResult<Paged<GdgEvent>> {
  return useQuery({
    queryKey: queryKeys.events(query as Record<string, unknown>),
    queryFn: () => api.events.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useEvent(id: string | undefined): UseQueryResult<GdgEvent> {
  return useQuery({
    queryKey: queryKeys.event(id ?? ''),
    queryFn: () => api.events.get(id!),
    enabled: Boolean(id),
  });
}

export function useUpcomingEvents(limit = 4): UseQueryResult<GdgEvent[]> {
  return useQuery({
    queryKey: queryKeys.events({ scope: 'upcoming', limit }),
    queryFn: () => api.events.upcoming(limit),
  });
}

export function useAttendance(eventId: string | undefined): UseQueryResult<AttendanceStatus> {
  return useQuery({
    queryKey: queryKeys.attendance(eventId ?? ''),
    queryFn: () => api.events.attendance(eventId!),
    enabled: Boolean(eventId),
  });
}

/** Fetches the signed ticket/QR payload for the current user's registration. */
export function useEventTicket(
  eventId: string | undefined,
  enabled = true,
): UseQueryResult<EventTicket> {
  return useQuery({
    queryKey: queryKeys.ticket(eventId ?? ''),
    queryFn: () => api.events.ticket(eventId!),
    enabled: Boolean(eventId) && enabled,
  });
}

/** Organizer-side scan: validates a token and marks the attendee present. */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation<CheckInResult, unknown, { eventId: string; token: string }>({
    mutationFn: ({ eventId, token }) => api.events.checkIn(eventId, token),
    onSuccess: (_result, { eventId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance(eventId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.event(eventId) });
      void queryClient.invalidateQueries({ queryKey: ['events'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.achievementSummary });
      void queryClient.invalidateQueries({ queryKey: queryKeys.badges });
    },
  });
}

interface RegisterContext {
  previousAttendance: AttendanceStatus | undefined;
  previousEvent: GdgEvent | undefined;
}

/**
 * Optimistic registration: the button flips instantly, the attendee counter
 * increments, and everything rolls back if the server rejects it.
 */
export function useRegisterEvent() {
  const queryClient = useQueryClient();

  return useMutation<Registration, unknown, { event: GdgEvent }, RegisterContext>({
    mutationFn: ({ event }) => api.events.register(event.id),
    onMutate: async ({ event }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.attendance(event.id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.event(event.id) });

      const previousAttendance = queryClient.getQueryData<AttendanceStatus>(
        queryKeys.attendance(event.id),
      );
      const previousEvent = queryClient.getQueryData<GdgEvent>(queryKeys.event(event.id));

      queryClient.setQueryData<AttendanceStatus>(queryKeys.attendance(event.id), 'registered');
      if (previousEvent) {
        queryClient.setQueryData<GdgEvent>(queryKeys.event(event.id), {
          ...previousEvent,
          registeredCount: previousEvent.registeredCount + 1,
        });
      }

      return { previousAttendance, previousEvent };
    },
    onError: (_error, { event }, context) => {
      if (context?.previousAttendance !== undefined) {
        queryClient.setQueryData(queryKeys.attendance(event.id), context.previousAttendance);
      }
      if (context?.previousEvent) {
        queryClient.setQueryData(queryKeys.event(event.id), context.previousEvent);
      }
    },
    onSettled: (_data, _error, { event }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance(event.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.event(event.id) });
      void queryClient.invalidateQueries({ queryKey: ['events'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.achievementSummary });
    },
  });
}

export function useUnregisterEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { event: GdgEvent }, RegisterContext>({
    mutationFn: ({ event }) => api.events.unregister(event.id),
    onMutate: async ({ event }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.attendance(event.id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.event(event.id) });

      const previousAttendance = queryClient.getQueryData<AttendanceStatus>(
        queryKeys.attendance(event.id),
      );
      const previousEvent = queryClient.getQueryData<GdgEvent>(queryKeys.event(event.id));

      queryClient.setQueryData<AttendanceStatus>(queryKeys.attendance(event.id), 'none');
      if (previousEvent) {
        queryClient.setQueryData<GdgEvent>(queryKeys.event(event.id), {
          ...previousEvent,
          registeredCount: Math.max(0, previousEvent.registeredCount - 1),
        });
      }

      return { previousAttendance, previousEvent };
    },
    onError: (_error, { event }, context) => {
      if (context?.previousAttendance !== undefined) {
        queryClient.setQueryData(queryKeys.attendance(event.id), context.previousAttendance);
      }
      if (context?.previousEvent) {
        queryClient.setQueryData(queryKeys.event(event.id), context.previousEvent);
      }
    },
    onSettled: (_data, _error, { event }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance(event.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.event(event.id) });
      void queryClient.invalidateQueries({ queryKey: ['events'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.achievementSummary });
    },
  });
}
