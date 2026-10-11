import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { requireAuth, requireOrganizer } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import { toIdea } from '../mappers';
import { awardPoints } from '../services/points';
import { evaluateBadges } from '../services/achievements';
import type { IdeaRow } from '../db-types';
import type { Idea, IdeaStatus } from '../types';

export const ideasRouter = Router();

const IDEA_STATUSES: IdeaStatus[] = [
  'new',
  'under_review',
  'planned',
  'in_progress',
  'shipped',
  'declined',
];

async function authorsById(ids: string[]): Promise<Map<string, { name: string; avatar: string }>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const data = rows<{ id: string; name: string; avatar: string }>(
    await supabase.from('members').select('id, name, avatar').in('id', unique),
  );
  return new Map(data.map((row) => [row.id, { name: row.name, avatar: row.avatar }]));
}

async function myVotes(memberId: string): Promise<Set<string>> {
  const data = rows<{ idea_id: string }>(
    await supabase.from('idea_votes').select('idea_id').eq('member_id', memberId),
  );
  return new Set(data.map((row) => row.idea_id));
}

async function listIdeas(memberId: string): Promise<Idea[]> {
  const ideaRows = rows<IdeaRow>(
    await supabase.from('ideas').select('*').order('base_votes', { ascending: false }),
  );
  const authors = await authorsById(ideaRows.map((row) => row.author_id ?? ''));
  const votes = await myVotes(memberId);

  return ideaRows.map((row) => {
    const author = row.author_id ? authors.get(row.author_id) : undefined;
    const hydrated: IdeaRow = {
      ...row,
      author_name: row.author_name ?? author?.name ?? null,
      author_avatar: row.author_avatar ?? author?.avatar ?? null,
    };
    return toIdea(hydrated, votes.has(row.id), row.author_id === memberId);
  });
}

ideasRouter.get(
  '/ideas',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await listIdeas(currentMember(req).id));
  }),
);

const createSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(3),
  category: z.enum(['events', 'workshops', 'community', 'campus', 'content', 'other']),
  anonymous: z.boolean().default(false),
});

ideasRouter.post(
  '/ideas',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest(parsed.error.issues[0]?.message ?? 'That idea is invalid.');
    const member = currentMember(req);
    const input = parsed.data;

    const { data, error } = await supabase
      .from('ideas')
      .insert({
        id: `idea-u-${Date.now().toString(36)}`,
        title: input.title.trim(),
        body: input.body.trim(),
        category: input.category,
        anonymous: input.anonymous,
        author_id: member.id,
        author_name: input.anonymous ? null : member.name,
        author_avatar: input.anonymous ? null : member.avatar,
        base_votes: 0,
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw HttpError.server(error.message);

    await awardPoints(member.id, 10);
    await evaluateBadges(member.id);

    res.status(201).json(toIdea(data as IdeaRow, false, true));
  }),
);

ideasRouter.post(
  '/ideas/:id/vote',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const ideaId = req.params.id;

    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .maybeSingle();
    if (ideaError) throw HttpError.server(ideaError.message);
    if (!idea) throw HttpError.notFound('This idea no longer exists.');

    const { data: existing } = await supabase
      .from('idea_votes')
      .select('idea_id')
      .eq('member_id', member.id)
      .eq('idea_id', ideaId)
      .maybeSingle();

    if (existing) {
      await supabase.from('idea_votes').delete().eq('member_id', member.id).eq('idea_id', ideaId);
    } else {
      const { error } = await supabase
        .from('idea_votes')
        .insert({ member_id: member.id, idea_id: ideaId });
      if (error) throw HttpError.server(error.message);
    }

    const all = await listIdeas(member.id);
    res.json(all.find((item) => item.id === ideaId));
  }),
);

const statusSchema = z.object({
  status: z.enum(['new', 'under_review', 'planned', 'in_progress', 'shipped', 'declined']),
  response: z.string().optional(),
});

ideasRouter.patch(
  '/ideas/:id/status',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest('Pick a valid roadmap status.');
    const status = parsed.data.status as IdeaStatus;
    if (!IDEA_STATUSES.includes(status)) throw HttpError.badRequest('Pick a valid roadmap status.');

    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (ideaError) throw HttpError.server(ideaError.message);
    if (!idea) throw HttpError.notFound('This idea no longer exists.');

    const current = idea as IdeaRow;
    const response = parsed.data.response?.trim() || current.response;
    const { error } = await supabase
      .from('ideas')
      .update({
        status,
        response,
        responded_at: response ? new Date().toISOString() : current.responded_at,
      })
      .eq('id', req.params.id);
    if (error) throw HttpError.server(error.message);

    const all = await listIdeas(currentMember(req).id);
    res.json(all.find((item) => item.id === req.params.id));
  }),
);
