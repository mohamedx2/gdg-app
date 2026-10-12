/**
 * Removes the invented demo members so the directory only lists real people.
 * Their own rows (registrations, votes, squads, progress…) cascade away; shared
 * content they authored (ideas, tasks, messages) keeps existing with no author.
 * Run with: npm run remove:demo-members (the full seed also calls it).
 */
import { env } from '../env';
import { supabase } from '../supabase';

/** Demo profiles from the original mock data — not part of the 26/27 team. */
export const DEMO_MEMBER_IDS = [
  'usr-ahmed', // Ahmed Karray
  'usr-karim', // Karim Mansour
  'usr-lina', // Lina Chahed
  'usr-meriem', // Meriem Trabelsi (was organizer@epi.dev)
  'usr-you', // Mohamed Salah (was member@epi.dev)
  'usr-nour', // Nour Zribi
  'usr-omar', // Omar Khemir
  'usr-rayen', // Rayen Belhaj
  'usr-sarrah', // Sarrah Mnif
];

export async function removeDemoMembers(): Promise<number> {
  // Arrivals store a plain member_id (no foreign key), so clear them explicitly.
  const arrivals = await supabase.from('arrivals').delete().in('member_id', DEMO_MEMBER_IDS);
  if (arrivals.error) throw new Error(`arrivals: ${arrivals.error.message}`);

  const { data, error } = await supabase.from('members').delete().in('id', DEMO_MEMBER_IDS).select('id');
  if (error) throw new Error(`members: ${error.message}`);
  return data?.length ?? 0;
}

async function main(): Promise<void> {
  console.log(`Removing demo members from ${env.supabaseUrl} ...`);
  const removed = await removeDemoMembers();
  console.log(`Removed ${removed} demo members.`);
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
