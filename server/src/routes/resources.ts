import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { likeTerm, pageParams, paged, text } from '../http/query';
import { toResource, toResourceProgress } from '../mappers';
import { currentMember } from '../auth/context';
import { requireAuth } from '../auth/middleware';
import { supabase } from '../supabase';
import { awardPoints } from '../services/points';
import type { ResourceRow } from '../db-types';
import type { ResourceProgress } from '../types';

export const resourcesRouter = Router();

resourcesRouter.get(
  '/resources',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { page, pageSize, from, to } = pageParams(req);
    let query = supabase.from('resources').select('*', { count: 'exact' }).order('title');

    const category = text(req.query.category);
    if (category && category !== 'all') query = query.eq('category', category);
    const type = text(req.query.type);
    if (type && type !== 'all') query = query.eq('type', type);
    const difficulty = text(req.query.difficulty);
    if (difficulty && difficulty !== 'all') query = query.eq('difficulty', difficulty);

    const search = text(req.query.search);
    if (search) {
      const term = likeTerm(search);
      query = query.or(`title.ilike.%${term}%,summary.ilike.%${term}%,category.ilike.%${term}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw HttpError.server(error.message);
    res.json(paged((data ?? []).map((row) => toResource(row as ResourceRow)), count ?? 0, page, pageSize));
  }),
);

resourcesRouter.get(
  '/resources/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) throw HttpError.server(error.message);
    if (!data) throw HttpError.notFound('This resource is unavailable.');
    res.json(toResource(data as ResourceRow));
  }),
);

resourcesRouter.get(
  '/resources/:id/progress',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const { data, error } = await supabase
      .from('resource_progress')
      .select('progress')
      .eq('member_id', member.id)
      .eq('resource_id', req.params.id)
      .maybeSingle();
    if (error) throw HttpError.server(error.message);
    res.json(toResourceProgress(data?.progress as string | undefined));
  }),
);

resourcesRouter.get(
  '/me/resource-bookmarks',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const bookmarks = rows<{ resource_id: string }>(
      await supabase.from('resource_bookmarks').select('resource_id').eq('member_id', member.id),
    );
    if (bookmarks.length === 0) {
      res.json([]);
      return;
    }
    const data = rows<ResourceRow>(
      await supabase
        .from('resources')
        .select('*')
        .in('id', bookmarks.map((bookmark) => bookmark.resource_id)),
    );
    res.json(data.map(toResource));
  }),
);

resourcesRouter.post(
  '/resources/:id/bookmark',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const resourceId = req.params.id;

    const { data: existing, error: findError } = await supabase
      .from('resource_bookmarks')
      .select('resource_id')
      .eq('member_id', member.id)
      .eq('resource_id', resourceId)
      .maybeSingle();
    if (findError) throw HttpError.server(findError.message);

    if (existing) {
      await supabase
        .from('resource_bookmarks')
        .delete()
        .eq('member_id', member.id)
        .eq('resource_id', resourceId);
      res.json(false);
      return;
    }

    const { error } = await supabase
      .from('resource_bookmarks')
      .insert({ member_id: member.id, resource_id: resourceId });
    if (error) throw HttpError.server(error.message);
    res.json(true);
  }),
);

const progressSchema = z.object({
  progress: z.enum(['none', 'started', 'completed']),
});

resourcesRouter.put(
  '/resources/:id/progress',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = progressSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest('Pick a valid progress state.');
    const member = currentMember(req);
    const resourceId = req.params.id;
    const next = parsed.data.progress as ResourceProgress;

    const { data: previous, error: findError } = await supabase
      .from('resource_progress')
      .select('progress')
      .eq('member_id', member.id)
      .eq('resource_id', resourceId)
      .maybeSingle();
    if (findError) throw HttpError.server(findError.message);

    const { error } = await supabase.from('resource_progress').upsert(
      {
        member_id: member.id,
        resource_id: resourceId,
        progress: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'member_id,resource_id' },
    );
    if (error) throw HttpError.server(error.message);

    const wasCompleted = (previous?.progress as string | undefined) === 'completed';
    if (next === 'completed' && !wasCompleted) {
      const { data: resource } = await supabase
        .from('resources')
        .select('points')
        .eq('id', resourceId)
        .maybeSingle();
      await awardPoints(member.id, (resource?.points as number | undefined) ?? 25);
    }

    res.status(204).end();
  }),
);
