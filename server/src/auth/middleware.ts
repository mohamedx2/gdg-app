import type { NextFunction, Request, RequestHandler, Response } from 'express';

import type { MemberRole } from '../types';
import { supabase } from '../supabase';
import { HttpError } from '../http/errors';
import { verifyToken } from './jwt';
import type { MemberRow } from '../db-types';

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

/** Verifies the bearer token and loads the member onto `req.member`. */
export const requireAuth: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = bearerToken(req);
    if (!token) throw HttpError.unauthorized();

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw HttpError.unauthorized();
    }

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', payload.sub)
      .maybeSingle();

    if (error) throw HttpError.server(error.message);
    if (!data) throw HttpError.unauthorized();

    req.member = data as MemberRow;
    next();
  } catch (error) {
    next(error);
  }
};

const CORE_ROLES: MemberRole[] = ['super-admin', 'core-team'];

/** Gate a route to a set of roles. Assumes `requireAuth` ran first. */
export function requireRole(...roles: MemberRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.member) return next(HttpError.unauthorized());
    if (!roles.includes(req.member.role)) return next(HttpError.forbidden());
    next();
  };
}

export const requireOrganizer = requireRole(...CORE_ROLES);
export const requireSuperAdmin = requireRole('super-admin');

/**
 * Allows organizers, but lets regular members through in a read-only fashion.
 * The handler can inspect `req.member.role` to branch.
 */
export function isOrganizer(req: Request): boolean {
  return req.member ? CORE_ROLES.includes(req.member.role) : false;
}
