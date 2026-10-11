import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { requireAuth } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import { toProfile } from '../mappers';
import type { MemberRow } from '../db-types';

export const profileRouter = Router();

profileRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(toProfile(currentMember(req)));
  }),
);

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  skills: z.array(z.string()).optional(),
  socials: z
    .object({
      github: z.string().optional(),
      linkedin: z.string().optional(),
      portfolio: z.string().optional(),
    })
    .optional(),
});

profileRouter.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest(parsed.error.issues[0]?.message ?? 'That profile update is invalid.');
    const input = parsed.data;

    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name.trim();
    if (input.headline !== undefined) patch.headline = input.headline;
    if (input.bio !== undefined) patch.bio = input.bio;
    if (input.avatar !== undefined) patch.avatar = input.avatar;
    if (input.skills !== undefined) patch.skills = input.skills;
    if (input.socials !== undefined) patch.socials = input.socials;

    const { data, error } = await supabase
      .from('members')
      .update(patch)
      .eq('id', currentMember(req).id)
      .select('*')
      .single();
    if (error) throw HttpError.server(error.message);
    res.json(toProfile(data as MemberRow));
  }),
);
