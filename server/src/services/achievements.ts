import { supabase } from '../supabase';
import { rows } from '../http/db';
import { HttpError } from '../http/errors';
import { toBadge } from '../mappers';
import type { BadgeRow } from '../db-types';
import type { Badge } from '../types';

interface MemberBadgeRow {
  badge_id: string;
  unlocked_at: string;
}

/** The catalog with each badge's unlocked state folded in for this member. */
export async function badgesForMember(memberId: string): Promise<Badge[]> {
  const catalog = rows<BadgeRow>(
    await supabase.from('badges').select('*').order('sort_order', { ascending: true }),
  );
  const unlocked = rows<MemberBadgeRow>(
    await supabase
      .from('member_badges')
      .select('badge_id, unlocked_at')
      .eq('member_id', memberId),
  );
  const map = new Map(unlocked.map((row) => [row.badge_id, row.unlocked_at]));
  return catalog.map((badge) =>
    toBadge(badge, badge.seed_unlocked || map.has(badge.id), map.get(badge.id) ?? null),
  );
}

function countOf(result: { count: number | null; error: { message: string } | null }): number {
  if (result.error) throw HttpError.server(result.error.message);
  return result.count ?? 0;
}

/** Recomputes achievements from activity and grants any newly-earned badges. */
export async function evaluateBadges(memberId: string): Promise<Badge[]> {
  const current = await badgesForMember(memberId);
  const unlockedIds = new Set(current.filter((badge) => badge.unlocked).map((badge) => badge.id));

  const registrations = countOf(
    await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId),
  );
  const completedResources = countOf(
    await supabase
      .from('resource_progress')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('progress', 'completed'),
  );
  const squads = countOf(
    await supabase
      .from('member_squads')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId),
  );
  const claimedQuests = countOf(
    await supabase
      .from('member_quests')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId),
  );
  const authoredIdeas = countOf(
    await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', memberId),
  );
  const taskCompletions = countOf(
    await supabase
      .from('task_completions')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId),
  );
  const sentMessages = countOf(
    await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', memberId),
  );

  const { data: quizState } = await supabase
    .from('member_quiz_state')
    .select('perfect')
    .eq('member_id', memberId)
    .maybeSingle();
  const quizPerfect = Boolean(quizState?.perfect);

  const earned: string[] = [];
  if (registrations >= 1) earned.push('bnd-first-rsvp');
  if (completedResources >= 1) earned.push('bnd-open-source');
  if (squads >= 1) earned.push('bnd-squad-player');
  if (claimedQuests >= 3) earned.push('bnd-quest-master');
  if (quizPerfect) earned.push('bnd-quiz-whiz');
  if (authoredIdeas >= 1) earned.push('bnd-idea-starter');
  if (taskCompletions >= 1) earned.push('bnd-task-doer');
  if (sentMessages >= 1) earned.push('bnd-conversationalist');

  const toAdd = earned.filter((id) => !unlockedIds.has(id));
  if (toAdd.length) {
    const { error } = await supabase.from('member_badges').upsert(
      toAdd.map((badge_id) => ({
        member_id: memberId,
        badge_id,
        unlocked_at: new Date().toISOString(),
      })),
      { onConflict: 'member_id,badge_id', ignoreDuplicates: true },
    );
    if (error) throw HttpError.server(error.message);
  }

  return badgesForMember(memberId);
}
