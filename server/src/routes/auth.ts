import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { supabase } from '../supabase';
import { hashPassword, verifyPassword } from '../auth/password';
import { signToken } from '../auth/jwt';
import { toProfile } from '../mappers';
import type { MemberRow } from '../db-types';

export const authRouter = Router();

const avatarFor = (seed: string) => `https://i.pravatar.cc/240?u=${encodeURIComponent(seed)}`;

const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw HttpError.badRequest(result.error.issues[0]?.message ?? 'That request is invalid.');
  }
  return result.data;
}

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = parse(loginSchema, req.body);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .ilike('email', email.trim().toLowerCase())
      .maybeSingle();
    if (error) throw HttpError.server(error.message);

    const member = data as MemberRow | null;
    if (!member || !(await verifyPassword(password, member.password_hash))) {
      throw new HttpError(401, 'We could not sign you in with those credentials.');
    }

    res.json({ token: signToken(member), user: toProfile(member) });
  }),
);

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = parse(registerSchema, req.body);
    const normalized = email.trim().toLowerCase();

    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .ilike('email', normalized)
      .maybeSingle();
    if (existing) throw HttpError.conflict('An account already exists for that email.');

    const { data, error } = await supabase
      .from('members')
      .insert({
        name: name.trim(),
        email: normalized,
        password_hash: await hashPassword(password),
        role: 'student',
        headline: 'Student @ EPI Sousse',
        avatar: avatarFor(normalized),
        joined_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw HttpError.server(error.message);

    const member = data as MemberRow;
    res.status(201).json({ token: signToken(member), user: toProfile(member) });
  }),
);

const GOOGLE_EMAIL = 'mohamed.salah@gmail.com';

authRouter.post(
  '/google',
  asyncHandler(async (_req, res) => {
    const { data: existing, error: findError } = await supabase
      .from('members')
      .select('*')
      .eq('id', 'usr-google')
      .maybeSingle();
    if (findError) throw HttpError.server(findError.message);

    let member = existing as MemberRow | null;
    if (!member) {
      const { data, error } = await supabase
        .from('members')
        .insert({
          id: 'usr-google',
          name: 'Mohamed Salah',
          email: GOOGLE_EMAIL,
          role: 'student',
          headline: '3rd Year Software Eng. @ EPI Sousse',
          avatar: avatarFor('usr-google'),
          skills: ['Flutter', 'Dart', 'TypeScript'],
          socials: { github: 'mohamedsalah' },
        })
        .select('*')
        .single();
      if (error) throw HttpError.server(error.message);
      member = data as MemberRow;
    }

    res.json({ token: signToken(member), user: toProfile(member) });
  }),
);
