import { Router } from 'express';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { requireAuth } from '../auth/middleware';
import { supabase } from '../supabase';
import { toActivity, toAnnouncement } from '../mappers';
import type { ActivityRow, AnnouncementRow } from '../db-types';

export const communityRouter = Router();

communityRouter.get(
  '/community/activity',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const data = rows<ActivityRow>(
      await supabase.from('activity').select('*').order('created_at', { ascending: false }),
    );
    res.json(data.map(toActivity));
  }),
);

communityRouter.get(
  '/announcements',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw HttpError.server(error.message);
    res.json((data ?? []).map((row) => toAnnouncement(row as AnnouncementRow)));
  }),
);
