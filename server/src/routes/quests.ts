import { Router } from 'express';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { requireAuth } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import { toQuest } from '../mappers';
import { awardPoints } from '../services/points';
import { evaluateBadges } from '../services/achievements';
import type { QuestRow, QuestStepRow } from '../db-types';
import type { Quest } from '../types';

export const questsRouter = Router();

async function questsFor(memberId: string): Promise<Quest[]> {
  const questList = rows<QuestRow>(
    await supabase.from('quests').select('*').order('sort_order', { ascending: true }),
  );
  const steps = rows<QuestStepRow>(
    await supabase.from('quest_steps').select('*').order('sort_order', { ascending: true }),
  );
  const doneRows = rows<{ step_id: string }>(
    await supabase.from('member_quest_steps').select('step_id').eq('member_id', memberId),
  );
  const claimedRows = rows<{ quest_id: string }>(
    await supabase.from('member_quests').select('quest_id').eq('member_id', memberId),
  );
  const doneStepIds = new Set(doneRows.map((row) => row.step_id));
  const claimedIds = new Set(claimedRows.map((row) => row.quest_id));

  return questList.map((quest) =>
    toQuest(
      quest,
      steps.filter((step) => step.quest_id === quest.id),
      doneStepIds,
      claimedIds.has(quest.id),
    ),
  );
}

questsRouter.get(
  '/me/quests',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await questsFor(currentMember(req).id));
  }),
);

questsRouter.post(
  '/me/quests/:id/claim',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const quests = await questsFor(member.id);
    const quest = quests.find((item) => item.id === req.params.id);
    if (!quest) throw HttpError.notFound('This quest no longer exists.');
    if (quest.status !== 'claimable') {
      throw HttpError.badRequest('This quest is not ready to claim yet.');
    }

    const { error } = await supabase
      .from('member_quests')
      .insert({ member_id: member.id, quest_id: quest.id, claimed_at: new Date().toISOString() });
    if (error) throw HttpError.server(error.message);

    await awardPoints(member.id, quest.reward);
    await evaluateBadges(member.id);

    const updated = await questsFor(member.id);
    res.json(updated.find((item) => item.id === quest.id) ?? quest);
  }),
);
