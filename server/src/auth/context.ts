import type { Request } from 'express';

import type { MemberRow } from '../db-types';
import { HttpError } from '../http/errors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      member?: MemberRow;
    }
  }
}

/** The authenticated member for this request, or a 401 if somehow missing. */
export function currentMember(req: Request): MemberRow {
  if (!req.member) throw HttpError.unauthorized();
  return req.member;
}
