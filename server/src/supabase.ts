import { createClient } from '@supabase/supabase-js';

import { env } from './env';

/**
 * Trusted server-side Supabase client. Uses the service_role key, which
 * bypasses Row Level Security — never expose this key to the mobile app.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
