import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { HttpError } from './errors';

/** Wraps an async handler so rejected promises reach the error middleware. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

/** Returns the first row or throws a 404-style error. */
export function firstOrThrow<T>(rows: T[] | null | undefined, message: string): T {
  if (!rows || rows.length === 0) throw HttpError.notFound(message);
  return rows[0];
}
