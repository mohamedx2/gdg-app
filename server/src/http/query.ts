import type { Request } from 'express';

export function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function intParam(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function pageParams(req: Request, fallbackSize = 20): { page: number; pageSize: number; from: number; to: number } {
  const page = intParam(req.query.page, 1);
  const pageSize = intParam(req.query.pageSize, fallbackSize);
  const from = (page - 1) * pageSize;
  return { page, pageSize, from, to: from + pageSize - 1 };
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  page: number;
}

export function paged<T>(data: T[], total: number, page: number, pageSize: number): PagedResponse<T> {
  return { data, total, page, hasMore: page * pageSize < total };
}

/** Escapes a value for use inside a PostgREST `or(...)` ilike filter. */
export function likeTerm(value: string): string {
  return value.replace(/[%,()]/g, ' ').trim();
}
