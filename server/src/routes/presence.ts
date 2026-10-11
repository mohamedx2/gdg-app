import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { requireAuth, requireOrganizer } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import type { MemberRow } from '../db-types';
import type { MyPresence, PresenceMember, PresenceOverview, PresenceStatus } from '../types';

export const presenceRouter = Router();

const STATUSES: PresenceStatus[] = [
  'in_transit',
  'on_campus',
  'at_venue',
  'club_room',
  'off_campus',
  'busy',
  'exam_mode',
];

function isVisible(row: MemberRow): boolean {
  if (row.presence_scope === 'none' || row.presence_ghost) return false;
  if (row.presence_scope === 'window' && row.presence_expires_at) {
    return new Date(row.presence_expires_at).getTime() > Date.now();
  }
  return row.presence_status !== 'off_campus';
}

function toMyPresence(row: MemberRow): MyPresence {
  const expired =
    row.presence_scope === 'window' &&
    row.presence_expires_at != null &&
    new Date(row.presence_expires_at).getTime() <= Date.now();
  if (expired) {
    return { status: row.presence_status, scope: 'none', ghost: false, shareWithTeam: row.presence_share_team };
  }
  return {
    status: row.presence_status,
    scope: row.presence_scope,
    eventId: row.presence_event_id ?? undefined,
    windowLabel: row.presence_window_label ?? undefined,
    expiresAt: row.presence_expires_at ?? undefined,
    ghost: row.presence_ghost,
    etaMins: row.presence_eta_mins ?? undefined,
    shareWithTeam: row.presence_share_team,
    updatedAt: row.presence_updated_at ?? undefined,
  };
}

presenceRouter.get(
  '/me/presence',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(toMyPresence(currentMember(req)));
  }),
);

const updateSchema = z.object({
  status: z.enum([
    'in_transit',
    'on_campus',
    'at_venue',
    'club_room',
    'off_campus',
    'busy',
    'exam_mode',
  ]),
  scope: z.enum(['none', 'event', 'window']),
  eventId: z.string().optional(),
  windowLabel: z.string().optional(),
  expiresAt: z.string().optional(),
  ghost: z.boolean().optional(),
  etaMins: z.number().optional(),
  shareWithTeam: z.boolean().optional(),
});

presenceRouter.put(
  '/me/presence',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest('Pick a valid presence state.');
    const member = currentMember(req);
    const input = parsed.data;

    const patch: Record<string, unknown> = {
      presence_status: input.status,
      presence_scope: input.scope,
      presence_event_id: input.eventId ?? null,
      presence_window_label: input.windowLabel ?? null,
      presence_expires_at: input.expiresAt ?? null,
      presence_eta_mins: input.etaMins ?? null,
      presence_ghost: input.ghost ?? member.presence_ghost,
      presence_share_team: input.shareWithTeam ?? member.presence_share_team,
      presence_updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('members')
      .update(patch)
      .eq('id', member.id)
      .select('*')
      .single();
    if (error) throw HttpError.server(error.message);
    res.json(toMyPresence(data as MemberRow));
  }),
);

presenceRouter.delete(
  '/me/presence',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('members')
      .update({
        presence_status: 'off_campus',
        presence_scope: 'none',
        presence_event_id: null,
        presence_window_label: null,
        presence_expires_at: null,
        presence_eta_mins: null,
        presence_ghost: false,
        presence_share_team: false,
        presence_updated_at: new Date().toISOString(),
      })
      .eq('id', currentMember(req).id)
      .select('*')
      .single();
    if (error) throw HttpError.server(error.message);
    res.json(toMyPresence(data as MemberRow));
  }),
);

presenceRouter.get(
  '/presence/overview',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const members = rows<MemberRow>(await supabase.from('members').select('*'));
    const visible = members.filter(isVisible);
    const overview: PresenceOverview = {
      sharing: visible.length,
      onCampus: visible.filter((member) => member.presence_status === 'on_campus').length,
      atVenue: visible.filter((member) => member.presence_status === 'at_venue').length,
      inTransit: visible.filter((member) => member.presence_status === 'in_transit').length,
      clubRoom: visible.filter((member) => member.presence_status === 'club_room').length,
    };
    res.json(overview);
  }),
);

presenceRouter.get(
  '/presence/roster',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (_req, res) => {
    const members = rows<MemberRow>(
      await supabase
        .from('members')
        .select('*')
        .in('role', ['core-team', 'super-admin'])
        .order('presence_updated_at', { ascending: false }),
    );
    const roster: PresenceMember[] = members.map((member) => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      role: member.role,
      status: member.presence_status,
      venue: member.presence_window_label ?? undefined,
      etaMins: member.presence_eta_mins ?? undefined,
      updatedAt: member.presence_updated_at ?? undefined,
    }));
    res.json(roster);
  }),
);
