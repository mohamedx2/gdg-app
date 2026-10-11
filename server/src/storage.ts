import { supabase } from './supabase';

/** Public bucket that holds every user-uploaded image/file. */
export const MEDIA_BUCKET = 'media';

/** Largest upload the API accepts, in bytes (8 MB). */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/**
 * Creates the public `media` bucket on first boot if it does not exist yet.
 * Safe to call repeatedly; failures are logged but never crash the server.
 */
export async function ensureMediaBucket(): Promise<void> {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn('[storage] could not list buckets:', error.message);
      return;
    }
    if (data?.some((bucket) => bucket.name === MEDIA_BUCKET)) return;

    const { error: createError } = await supabase.storage.createBucket(MEDIA_BUCKET, {
      public: true,
    });
    if (createError && !/already exists/i.test(createError.message)) {
      console.warn('[storage] could not create media bucket:', createError.message);
      return;
    }
    console.log(`[storage] ensured public bucket "${MEDIA_BUCKET}"`);
  } catch (error) {
    console.warn('[storage] bucket check failed:', error instanceof Error ? error.message : error);
  }
}

/** Public URL for a stored object path. */
export function publicUrl(path: string): string {
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
