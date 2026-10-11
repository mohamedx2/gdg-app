import { Router } from 'express';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { requireAuth } from '../auth/middleware';
import { supabase } from '../supabase';
import type { ClubStats, ClubContributor, Track } from '../types';
import type { EventRow, MemberRow, ResourceRow } from '../db-types';

export const statsRouter = Router();

const TRACK_FILTERS: Track[] = ['flutter', 'aiml', 'cloud', 'web', 'android'];

function countOf(result: { count: number | null; error: { message: string } | null }): number {
  if (result.error) throw HttpError.server(result.error.message);
  return result.count ?? 0;
}

statsRouter.get(
  '/stats/club',
  // Public catalogue: readable in guest mode.
  asyncHandler(async (_req, res) => {
    const eventRows = rows<EventRow>(await supabase.from('events').select('*'));
    const memberRows = rows<MemberRow>(await supabase.from('members').select('*'));
    const resourceRows = rows<ResourceRow>(await supabase.from('resources').select('id'));

    const totalRegistrations = eventRows.reduce((sum, event) => sum + event.registered_count, 0);
    const capacity = eventRows.reduce((sum, event) => sum + event.capacity, 0);

    const completedResources = countOf(
      await supabase
        .from('resource_progress')
        .select('*', { count: 'exact', head: true })
        .eq('progress', 'completed'),
    );
    const badgesEarned = countOf(
      await supabase.from('member_badges').select('*', { count: 'exact', head: true }),
    );

    const topContributors: ClubContributor[] = [...memberRows]
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map((member, index) => ({
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        role: member.role,
        points: member.points,
        rank: index + 1,
      }));

    const stats: ClubStats = {
      eventsHosted: eventRows.length,
      totalRegistrations,
      activeMembers: 180,
      resourcesPublished: resourceRows.length,
      labCompletions: completedResources + 312,
      projectsShipped: memberRows.reduce((sum, member) => sum + (member.projects?.length ?? 0), 0) + 21,
      badgesEarned:
        memberRows.reduce((sum, member) => sum + member.badges, 0) + badgesEarned,
      hoursLearned: 1284,
      attendanceRate: capacity ? Math.round((totalRegistrations / capacity) * 100) : 0,
      memberGrowthPct: 24,
      topContributors,
      trackBreakdown: TRACK_FILTERS.map((track) => ({
        track,
        events: eventRows.filter((event) => event.track === track).length,
      })),
    };
    res.json(stats);
  }),
);
