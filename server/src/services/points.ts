import { supabase } from '../supabase';
import { HttpError } from '../http/errors';

/** Atomically adds `delta` points to a member and returns the new total. */
export async function awardPoints(memberId: string, delta: number): Promise<number> {
  const { data, error } = await supabase.rpc('increment_points', {
    p_member_id: memberId,
    p_delta: delta,
  });
  if (error) throw HttpError.server(error.message);
  return (data as number) ?? 0;
}
