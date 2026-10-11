import { Router } from 'express';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { requireAuth } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import { toSquad } from '../mappers';
import { evaluateBadges } from '../services/achievements';
import type { SquadRow } from '../db-types';
import type { Squad } from '../types';

export const squadsRouter = Router();

/** Leaderboard with computed rank, my-squad flag and gap to the team ahead. */
async function leaderboard(memberId: string): Promise<Squad[]> {
  const list = rows<SquadRow>(
    await supabase.from('squads').select('*').order('squad_xp', { ascending: false }),
  );
  const { data: membership } = await supabase
    .from('member_squads')
    .select('squad_id')
    .eq('member_id', memberId)
    .maybeSingle();
  const mySquadId = (membership?.squad_id as string | undefined) ?? null;

  const ranked = [...list].sort((a, b) => b.squad_xp - a.squad_xp);
  return ranked.map((row, index) => {
    const ahead = ranked[index - 1];
    return toSquad(row, {
      rank: index + 1,
      gapToNext: ahead ? Math.max(0, ahead.squad_xp - row.squad_xp + 1) : 0,
      isMine: mySquadId === row.id,
    });
  });
}

squadsRouter.get(
  '/squads',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await leaderboard(currentMember(req).id));
  }),
);

squadsRouter.get(
  '/me/squad',
  requireAuth,
  asyncHandler(async (req, res) => {
    const list = await leaderboard(currentMember(req).id);
    res.json(list.find((squad) => squad.isMine) ?? null);
  }),
);

squadsRouter.post(
  '/squads/:id/join',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const { data: squad, error: findError } = await supabase
      .from('squads')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();
    if (findError) throw HttpError.server(findError.message);
    if (!squad) throw HttpError.notFound('This squad does not exist.');

    const { error } = await supabase
      .from('member_squads')
      .upsert(
        { member_id: member.id, squad_id: req.params.id, joined_at: new Date().toISOString() },
        { onConflict: 'member_id' },
      );
    if (error) throw HttpError.server(error.message);

    await supabase.from('member_quest_steps').upsert(
      { member_id: member.id, quest_id: 'qst-community-starter', step_id: 'join-a-squad' },
      { onConflict: 'member_id,step_id', ignoreDuplicates: true },
    );
    await evaluateBadges(member.id);

    const list = await leaderboard(member.id);
    res.json(list.find((item) => item.isMine) ?? null);
  }),
);

squadsRouter.delete(
  '/me/squad',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from('member_squads')
      .delete()
      .eq('member_id', currentMember(req).id);
    if (error) throw HttpError.server(error.message);
    res.status(204).end();
  }),
);
