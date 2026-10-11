import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';

import { env } from './env';
import { HttpError } from './http/errors';
import { apiRouter } from './routes';
import { supabase } from './supabase';

const app = express();

app.use(
  cors({
    origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((origin) => origin.trim()),
  }),
);
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'gdg-epi-api' });
});

app.use('/api/v1', apiRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ message: 'We could not find what you were looking for.' });
});

// Central error handler — messages are shown to the user by the app.
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ message: 'That request body was not valid JSON.' });
    return;
  }
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  console.error('[api] unhandled error:', message);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

async function start(): Promise<void> {
  // Fail fast if Supabase creds are wrong.
  const { error } = await supabase.from('members').select('id', { head: true, count: 'exact' });
  if (error && error.code !== 'PGRST116') {
    console.warn('[api] Supabase connectivity check failed:', error.message);
  }

  app.listen(env.port, () => {
    console.log(`[api] GDG EPI backend listening on http://localhost:${env.port}`);
    console.log(`[api] Routes mounted at /api/v1  (health: /health)`);
  });
}

void start();
