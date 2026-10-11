import { Router } from 'express';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { requireAuth } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import { badgesForMember, evaluateBadges } from '../services/achievements';
import type { AchievementSummary } from '../types';

export const achievementsRouter = Router();

function countOf(result: { count: number | null; error: { message: string } | null }): number {
  if (result.error) throw HttpError.server(result.error.message);
  return result.count ?? 0;
}

achievementsRouter.get(
  '/me/achievements/badges',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await badgesForMember(currentMember(req).id));
  }),
);

achievementsRouter.post(
  '/me/achievements/evaluate',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await evaluateBadges(currentMember(req).id));
  }),
);

achievementsRouter.get(
  '/me/achievements/summary',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const badges = await badgesForMember(member.id);
    const unlocked = badges.filter((badge) => badge.unlocked).length;

    const registrations = countOf(
      await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', member.id),
    );
    const completedResources = countOf(
      await supabase
        .from('resource_progress')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', member.id)
        .eq('progress', 'completed'),
    );

    const summary: AchievementSummary = {
      points: member.points,
      tier: member.tier,
      nextTier: 'Campus Champion',
      xp: Math.min(member.points, 600),
      xpGoal: 600,
      eventsAttended: member.events_attended + registrations,
      labsCompleted: completedResources + 3,
      badgesUnlocked: unlocked,
      badgesTotal: badges.length,
      streakDays: 18,
    };
    res.json(summary);
  }),
);
