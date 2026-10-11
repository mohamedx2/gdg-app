import { HttpError } from './errors';

interface Result<T> {
  data: T | null;
  error: { message: string } | null;
}

/** Throws a 500 HttpError if the Supabase call failed, else returns the data. */
export function unwrap<T>(result: Result<T>): T {
  if (result.error) throw HttpError.server(result.error.message);
  return result.data as T;
}

/** Same as unwrap but returns the data (possibly empty array) with a fallback. */
export function rows<T>(result: Result<T[]>): T[] {
  if (result.error) throw HttpError.server(result.error.message);
  return result.data ?? [];
}

export function one<T>(result: Result<T>): T | null {
  if (result.error) throw HttpError.server(result.error.message);
  return result.data;
}
