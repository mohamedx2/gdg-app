import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { env } from '../env';
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

const googleSchema = z.object({
  idToken: z.string().min(20),
});

const googleClient = new OAuth2Client();

/**
 * Sign in with Google. The app sends the ID token from Google Sign-In; we verify
 * its signature, audience (our Web client ID) and verified email with Google,
 * then sign in the member with that email or create a new member account.
 */
authRouter.post(
  '/google',
  asyncHandler(async (req, res) => {
    if (env.googleClientIds.length === 0) {
      throw new HttpError(503, 'Google sign-in is not configured on the server yet.');
    }
    const { idToken } = parse(googleSchema, req.body);

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken, audience: env.googleClientIds });
      payload = ticket.getPayload();
    } catch {
      throw new HttpError(401, 'Google could not verify this sign-in. Please try again.');
    }
    if (!payload?.email || !payload.email_verified) {
      throw new HttpError(401, 'Your Google account has no verified email.');
    }

    const email = payload.email.trim().toLowerCase();
    const { data: existing, error: findError } = await supabase
      .from('members')
      .select('*')
      .ilike('email', email)
      .maybeSingle();
    if (findError) throw HttpError.server(findError.message);

    let member = existing as MemberRow | null;
    if (!member) {
      const { data, error } = await supabase
        .from('members')
        .insert({
          id: `usr-g${payload.sub}`,
          name: payload.name?.trim() || email.split('@')[0],
          email,
          role: 'student',
          headline: 'GDG on Campus EPI member',
          avatar: payload.picture ?? avatarFor(email),
        })
        .select('*')
        .single();
      if (error) throw HttpError.server(error.message);
      member = data as MemberRow;
    }

    res.json({ token: signToken(member), user: toProfile(member) });
  }),
);
