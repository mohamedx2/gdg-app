/**
 * Upserts only the events (2025/26 archive + 2026/27 plan) without touching
 * members, registrations, points or any other live data.
 * Run with: npm run seed:events
 */
import { env } from '../env';
import { supabase } from '../supabase';
import { seedEvents, seedUpcomingEvents } from './data';
import { toEventRow } from './event-rows';

async function main(): Promise<void> {
  const rows = [...seedEvents, ...seedUpcomingEvents].map(toEventRow);
  console.log(`Upserting ${rows.length} events into ${env.supabaseUrl} ...`);
  const { error } = await supabase.from('events').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`events: ${error.message}`);
  console.log('Done.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
