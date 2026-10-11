import { Router } from 'express';

import { asyncHandler } from '../http/async';
import { rows } from '../http/db';
import { supabase } from '../supabase';
import type { AppConfigRow, MemoryRow } from '../db-types';

export const contentRouter = Router();

/**
 * Server-driven app config, merged into one object of `{ namespace: value }`.
 * Public: onboarding reads it before a member has signed in.
 */
contentRouter.get(
  '/content/config',
  asyncHandler(async (_req, res) => {
    const data = rows<AppConfigRow>(await supabase.from('app_config').select('*'));
    const config: Record<string, unknown> = {};
    for (const row of data) config[row.key] = row.value;
    res.json(config);
  }),
);

/** Curated memory gallery, in display order. Public for the same reason. */
contentRouter.get(
  '/content/memories',
  asyncHandler(async (_req, res) => {
    const data = rows<MemoryRow>(
      await supabase.from('memories').select('*').order('sort_order', { ascending: true }),
    );
    res.json(
      data.map((row) => ({
        id: row.id,
        imageUrl: row.image_url,
        caption: row.caption,
        portrait: row.portrait,
        sortOrder: row.sort_order,
      })),
    );
  }),
);
