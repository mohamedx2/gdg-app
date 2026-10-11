import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { likeTerm, pageParams, paged, text } from '../http/query';
import { toMember } from '../mappers';
import { currentMember } from '../auth/context';
import { requireAuth, requireSuperAdmin } from '../auth/middleware';
import { supabase } from '../supabase';
import type { MemberRow } from '../db-types';
import type { MemberRole } from '../types';

export const membersRouter = Router();

const ROLES: MemberRole[] = ['super-admin', 'student', 'core-team', 'speaker', 'alumni'];

membersRouter.get(
  '/members',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { page, pageSize, from, to } = pageParams(req, 20);
    let query = supabase.from('members').select('*', { count: 'exact' }).order('points', {
      ascending: false,
    });

    const role = text(req.query.role);
    if (role && role !== 'all') query = query.eq('role', role);

    const search = text(req.query.search);
    if (search) {
      const term = likeTerm(search);
      query = query.or(`name.ilike.%${term}%,headline.ilike.%${term}%,bio.ilike.%${term}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw HttpError.server(error.message);
    res.json(paged((data ?? []).map((row) => toMember(row as MemberRow)), count ?? 0, page, pageSize));
  }),
);

membersRouter.get(
  '/members/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) throw HttpError.server(error.message);
    if (!data) throw HttpError.notFound('This member profile is unavailable.');
    res.json(toMember(data as MemberRow));
  }),
);

membersRouter.post(
  '/members/:id/connection',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const targetId = req.params.id;
    if (targetId === member.id) throw HttpError.badRequest('You cannot connect with yourself.');

    const { data: existing, error: findError } = await supabase
      .from('member_connections')
      .select('*')
      .eq('member_id', member.id)
      .eq('connected_id', targetId)
      .maybeSingle();
    if (findError) throw HttpError.server(findError.message);

    if (existing) {
      await supabase
        .from('member_connections')
        .delete()
        .eq('member_id', member.id)
        .eq('connected_id', targetId);
      res.json(false);
      return;
    }

    const { error } = await supabase
      .from('member_connections')
      .insert({ member_id: member.id, connected_id: targetId });
    if (error) throw HttpError.server(error.message);
    res.json(true);
  }),
);

const roleSchema = z.object({
  role: z.enum(['super-admin', 'student', 'core-team', 'speaker', 'alumni']),
});

membersRouter.put(
  '/members/:id/role',
  requireAuth,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest('Pick a valid role.');
    const nextRole = parsed.data.role as MemberRole;
    if (!ROLES.includes(nextRole)) throw HttpError.badRequest('Pick a valid role.');

    const { data: target, error: targetError } = await supabase
      .from('members')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (targetError) throw HttpError.server(targetError.message);
    if (!target) throw HttpError.notFound('This member no longer exists.');

    if ((target as MemberRow).role === 'super-admin' && nextRole !== 'super-admin') {
      const supers = rows<{ id: string }>(
        await supabase.from('members').select('id').eq('role', 'super-admin'),
      );
      if (supers.length <= 1) {
        throw HttpError.badRequest('The chapter needs at least one super admin.');
      }
    }

    const { data, error } = await supabase
      .from('members')
      .update({ role: nextRole })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw HttpError.server(error.message);
    res.json(toMember(data as MemberRow));
  }),
);
