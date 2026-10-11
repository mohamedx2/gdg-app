import { Router, type RequestHandler } from 'express';
import multer from 'multer';

import { requireAuth } from '../auth/middleware';
import { HttpError } from '../http/errors';
import { MAX_UPLOAD_BYTES, MEDIA_BUCKET, publicUrl } from '../storage';
import { supabase } from '../supabase';

/** Logical folders a client may target; anything else falls back to `misc`. */
const FOLDERS = new Set(['avatars', 'events', 'ideas', 'chat', 'resources', 'misc']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

/** Runs multer and turns its errors into friendly HttpErrors. */
const handleUpload: RequestHandler = (req, res, next) => {
  upload.single('file')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(HttpError.badRequest('That file is larger than 8 MB.'));
        return;
      }
      next(HttpError.badRequest('That file could not be uploaded.'));
      return;
    }
    next(error);
  });
};

function safeName(original: string): string {
  const cleaned = original.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^[.-]+/, '');
  return (cleaned || 'upload').slice(-80);
}

export const mediaRouter = Router();

/** Upload an image/file to Supabase Storage and return its public URL. */
mediaRouter.post('/media', requireAuth, handleUpload, async (req, res, next) => {
  try {
    if (!req.file) throw HttpError.badRequest('Attach a file to upload.');
    if (!req.member) throw HttpError.unauthorized();

    const requested = String(req.body?.folder ?? '');
    const folder = FOLDERS.has(requested) ? requested : 'misc';
    const path = `${folder}/${req.member.id}/${Date.now()}-${safeName(req.file.originalname)}`;

    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, req.file.buffer, {
      contentType: req.file.mimetype || 'application/octet-stream',
      upsert: false,
    });
    if (error) throw HttpError.server(error.message);

    res.status(201).json({ url: publicUrl(path), path });
  } catch (error) {
    next(error);
  }
});
