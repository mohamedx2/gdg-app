import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { requireAuth, requireOrganizer } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import { toDecision } from '../mappers';
import type { DecisionOptionRow, DecisionRow } from '../db-types';
import type { Decision } from '../types';

export const decisionsRouter = Router();

const CORE_TEAM_SIZE = 15;

async function listDecisions(memberId: string): Promise<Decision[]> {
  const decisionRows = rows<DecisionRow>(await supabase.from('decisions').select('*'));
  const optionRows = rows<DecisionOptionRow>(
    await supabase.from('decision_options').select('*').order('sort_order', { ascending: true }),
  );
  const voteRows = rows<{ decision_id: string; option_id: string }>(
    await supabase.from('decision_votes').select('decision_id, option_id').eq('member_id', memberId),
  );
  const myBallots = new Map(voteRows.map((row) => [row.decision_id, row.option_id]));

  const list = decisionRows.map((decision) =>
    toDecision(
      decision,
      optionRows.filter((option) => option.decision_id === decision.id),
      myBallots.get(decision.id),
    ),
  );

  return list.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
    if (a.important !== b.important) return a.important ? -1 : 1;
    return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
  });
}

decisionsRouter.get(
  '/decisions',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await listDecisions(currentMember(req).id));
  }),
);

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  options: z.array(z.string().min(1)).min(2),
  closesAt: z.string().min(1),
  quorum: z.number().int().nonnegative(),
  resultsVisible: z.boolean().default(false),
  important: z.boolean().default(false),
});

decisionsRouter.post(
  '/decisions',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest(parsed.error.issues[0]?.message ?? 'That vote is invalid.');
    const input = parsed.data;
    const stamp = Date.now().toString(36);
    const decisionId = `dec-u-${stamp}`;

    const { error: decisionError } = await supabase.from('decisions').insert({
      id: decisionId,
      title: input.title.trim(),
      description: input.description.trim(),
      status: 'open',
      closes_at: input.closesAt,
      quorum: input.quorum,
      eligible_voters: CORE_TEAM_SIZE,
      results_visible: input.resultsVisible,
      important: input.important,
      created_at: new Date().toISOString(),
    });
    if (decisionError) throw HttpError.server(decisionError.message);

    const { error: optionsError } = await supabase.from('decision_options').insert(
      input.options.map((label, index) => ({
        id: `opt-${stamp}-${index}`,
        decision_id: decisionId,
        label: label.trim(),
        base_votes: 0,
        sort_order: index,
      })),
    );
    if (optionsError) throw HttpError.server(optionsError.message);

    const list = await listDecisions(currentMember(req).id);
    res.status(201).json(list.find((item) => item.id === decisionId));
  }),
);

const ballotSchema = z.object({ optionId: z.string().min(1) });

decisionsRouter.post(
  '/decisions/:id/ballot',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (req, res) => {
    const parsed = ballotSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest('Pick one of the available options.');
    const member = currentMember(req);
    const decisionId = req.params.id;

    const { data: decision, error: decisionError } = await supabase
      .from('decisions')
      .select('*')
      .eq('id', decisionId)
      .maybeSingle();
    if (decisionError) throw HttpError.server(decisionError.message);
    if (!decision) throw HttpError.notFound('This vote no longer exists.');
    if ((decision as DecisionRow).status !== 'open') throw HttpError.badRequest('This vote has closed.');

    const { data: option } = await supabase
      .from('decision_options')
      .select('id')
      .eq('id', parsed.data.optionId)
      .eq('decision_id', decisionId)
      .maybeSingle();
    if (!option) throw HttpError.badRequest('Pick one of the available options.');

    const { error } = await supabase.from('decision_votes').upsert(
      { member_id: member.id, decision_id: decisionId, option_id: parsed.data.optionId },
      { onConflict: 'member_id,decision_id' },
    );
    if (error) throw HttpError.server(error.message);

    const list = await listDecisions(member.id);
    res.json(list.find((item) => item.id === decisionId));
  }),
);
