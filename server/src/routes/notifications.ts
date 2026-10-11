import { Router } from 'express';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { requireAuth } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import { toNotification } from '../mappers';
import type { NotificationPreferencesRow, NotificationRow } from '../db-types';
import type { AppNotification, NotificationPreferences } from '../types';

export const notificationsRouter = Router();

async function visibleNotifications(memberId: string): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`member_id.is.null,member_id.eq.${memberId}`)
    .order('created_at', { ascending: false });
  if (error) throw HttpError.server(error.message);
  return (data ?? []) as NotificationRow[];
}

async function readIds(memberId: string): Promise<Set<string>> {
  const data = rows<{ notification_id: string }>(
    await supabase.from('notification_reads').select('notification_id').eq('member_id', memberId),
  );
  return new Set(data.map((row) => row.notification_id));
}

notificationsRouter.get(
  '/notifications',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const [notifications, read] = await Promise.all([
      visibleNotifications(member.id),
      readIds(member.id),
    ]);
    const list: AppNotification[] = notifications.map((row) =>
      toNotification(row, read.has(row.id)),
    );
    res.json(list);
  }),
);

notificationsRouter.get(
  '/notifications/unread-count',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const [notifications, read] = await Promise.all([
      visibleNotifications(member.id),
      readIds(member.id),
    ]);
    res.json(notifications.filter((row) => !read.has(row.id)).length);
  }),
);

notificationsRouter.post(
  '/notifications/read-all',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const notifications = await visibleNotifications(member.id);
    if (notifications.length > 0) {
      const { error } = await supabase.from('notification_reads').upsert(
        notifications.map((row) => ({
          member_id: member.id,
          notification_id: row.id,
          read_at: new Date().toISOString(),
        })),
        { onConflict: 'member_id,notification_id', ignoreDuplicates: true },
      );
      if (error) throw HttpError.server(error.message);
    }
    res.status(204).end();
  }),
);

notificationsRouter.get(
  '/notifications/preferences',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('member_id', member.id)
      .maybeSingle();
    if (error) throw HttpError.server(error.message);
    const row = data as NotificationPreferencesRow | null;
    const preferences: NotificationPreferences = row
      ? {
          eventReminders: row.event_reminders,
          registrationUpdates: row.registration_updates,
          announcements: row.announcements,
          communityUpdates: row.community_updates,
        }
      : {
          eventReminders: true,
          registrationUpdates: true,
          announcements: true,
          communityUpdates: true,
        };
    res.json(preferences);
  }),
);

notificationsRouter.put(
  '/notifications/preferences',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const body = (req.body ?? {}) as Partial<NotificationPreferences>;
    const { error } = await supabase.from('notification_preferences').upsert(
      {
        member_id: member.id,
        event_reminders: body.eventReminders ?? true,
        registration_updates: body.registrationUpdates ?? true,
        announcements: body.announcements ?? true,
        community_updates: body.communityUpdates ?? true,
      },
      { onConflict: 'member_id' },
    );
    if (error) throw HttpError.server(error.message);
    res.status(204).end();
  }),
);
