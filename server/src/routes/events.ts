import { Router } from 'express';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { likeTerm, pageParams, paged, text } from '../http/query';
import { toEvent } from '../mappers';
import { requireAuth, requireOrganizer } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import { awardPoints } from '../services/points';
import { evaluateBadges } from '../services/achievements';
import type { ArrivalRow, EventRow, MemberRow, RegistrationRow } from '../db-types';
import type { ArrivalEta, CheckInResult, EventTicket, Registration } from '../types';

export const eventsRouter = Router();

const CHECK_IN_POINTS = 50;

function issueToken(eventId: string): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `GDGEPI-${eventId.toUpperCase()}-${stamp}${random}`;
}

function toRegistration(row: RegistrationRow): Registration {
  return {
    eventId: row.event_id,
    status: row.status,
    registeredAt: row.registered_at,
    attendedAt: row.attended_at ?? undefined,
    token: row.token ?? undefined,
  };
}

async function findEvent(id: string): Promise<EventRow> {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
  if (error) throw HttpError.server(error.message);
  if (!data) throw HttpError.notFound('This event no longer exists.');
  return data as EventRow;
}

async function findRegistration(memberId: string, eventId: string): Promise<RegistrationRow | null> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('member_id', memberId)
    .eq('event_id', eventId)
    .maybeSingle();
  if (error) throw HttpError.server(error.message);
  return (data as RegistrationRow | null) ?? null;
}

// ── List / detail ───────────────────────────────────────────────────────────
eventsRouter.get(
  '/events',
  // Public catalogue: readable in guest mode.
  asyncHandler(async (req, res) => {
    const ids = text(req.query.ids);
    if (ids) {
      const list = ids
        .split(',')
        .map((id) => decodeURIComponent(id.trim()))
        .filter(Boolean);
      const data = rows<EventRow>(await supabase.from('events').select('*').in('id', list));
      res.json(data.map(toEvent));
      return;
    }

    const scope = req.query.scope === 'past' ? 'past' : 'upcoming';
    const { page, pageSize, from, to } = pageParams(req);
    const now = new Date().toISOString();

    let query = supabase.from('events').select('*', { count: 'exact' });
    if (scope === 'past') {
      query = query.lt('ends_at', now).order('starts_at', { ascending: false });
    } else {
      query = query.gte('ends_at', now).order('starts_at', { ascending: true });
    }

    const category = text(req.query.category);
    if (category && category !== 'all') query = query.eq('category', category);
    const track = text(req.query.track);
    if (track && track !== 'all') query = query.eq('track', track);

    const search = text(req.query.search);
    if (search) {
      const term = likeTerm(search);
      query = query.or(`title.ilike.%${term}%,summary.ilike.%${term}%,location.ilike.%${term}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error) throw HttpError.server(error.message);
    res.json(paged((data ?? []).map((row) => toEvent(row as EventRow)), count ?? 0, page, pageSize));
  }),
);

eventsRouter.get(
  '/events/:id',
  // Public catalogue: readable in guest mode.
  asyncHandler(async (req, res) => {
    res.json(toEvent(await findEvent(req.params.id)));
  }),
);

// ── Registration ────────────────────────────────────────────────────────────
eventsRouter.post(
  '/events/:id/registration',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const event = await findEvent(req.params.id);

    const existing = await findRegistration(member.id, event.id);
    if (existing) {
      res.json(toRegistration(existing));
      return;
    }

    if (event.registered_count >= event.capacity) {
      throw HttpError.badRequest('This session is full. You joined the waitlist.');
    }

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        member_id: member.id,
        event_id: event.id,
        status: 'registered',
        registered_at: new Date().toISOString(),
        token: issueToken(event.id),
      })
      .select('*')
      .single();
    if (error) throw HttpError.server(error.message);

    await supabase.rpc('bump_event_registered', { p_event_id: event.id, p_delta: 1 });
    await awardPoints(member.id, 20);

    res.status(201).json(toRegistration(data as RegistrationRow));
  }),
);

eventsRouter.delete(
  '/events/:id/registration',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const existing = await findRegistration(member.id, req.params.id);
    if (!existing) {
      res.status(204).end();
      return;
    }
    const { error } = await supabase.from('registrations').delete().eq('id', existing.id);
    if (error) throw HttpError.server(error.message);
    if (existing.status === 'registered') {
      await supabase.rpc('bump_event_registered', { p_event_id: req.params.id, p_delta: -1 });
    }
    res.status(204).end();
  }),
);

eventsRouter.get(
  '/events/:id/attendance',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const registration = await findRegistration(member.id, req.params.id);
    res.json(registration?.status ?? 'none');
  }),
);

// ── Ticket & check-in ───────────────────────────────────────────────────────
eventsRouter.get(
  '/events/:id/ticket',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const event = await findEvent(req.params.id);
    const registration = await findRegistration(member.id, event.id);
    if (!registration || registration.status === 'waitlist') {
      throw HttpError.notFound('You do not have a ticket for this event yet.');
    }
    let token = registration.token;
    if (!token) {
      token = issueToken(event.id);
      await supabase.from('registrations').update({ token }).eq('id', registration.id);
    }
    const ticket: EventTicket = {
      eventId: event.id,
      eventTitle: event.title,
      token,
      issuedAt: registration.registered_at,
      attendeeName: member.name,
    };
    res.json(ticket);
  }),
);

eventsRouter.post(
  '/events/:id/check-in',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token : '';
    const event = await findEvent(req.params.id);

    const { data: matches, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('token', token)
      .limit(1);
    if (error) throw HttpError.server(error.message);
    const registration = (matches?.[0] as RegistrationRow | undefined) ?? null;

    if (registration && registration.event_id !== event.id) {
      res.json({ status: 'wrong_event', eventTitle: event.title } satisfies CheckInResult);
      return;
    }

    if (!registration || registration.status === 'waitlist') {
      res.json({ status: 'not_registered', eventTitle: event.title } satisfies CheckInResult);
      return;
    }

    const { data: attendeeRow } = await supabase
      .from('members')
      .select('*')
      .eq('id', registration.member_id)
      .maybeSingle();
    const attendeeMember = attendeeRow as MemberRow | null;

    if (registration.status === 'attended') {
      const result: CheckInResult = {
        status: 'already_checked_in',
        attendee: attendeeMember
          ? { name: attendeeMember.name, avatar: attendeeMember.avatar, headline: attendeeMember.headline }
          : undefined,
        eventTitle: event.title,
        checkedInAt: registration.attended_at ?? undefined,
      };
      res.json(result);
      return;
    }

    const checkedInAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('registrations')
      .update({ status: 'attended', attended_at: checkedInAt })
      .eq('id', registration.id);
    if (updateError) throw HttpError.server(updateError.message);

    await awardPoints(registration.member_id, CHECK_IN_POINTS);
    await evaluateBadges(registration.member_id);

    const result: CheckInResult = {
      status: 'accepted',
      attendee: attendeeMember
        ? { name: attendeeMember.name, avatar: attendeeMember.avatar, headline: attendeeMember.headline }
        : undefined,
      eventTitle: event.title,
      pointsAwarded: CHECK_IN_POINTS,
      checkedInAt,
    };
    res.json(result);
  }),
);

// ── Arrival board (organizers) ──────────────────────────────────────────────
eventsRouter.get(
  '/events/:id/arrivals',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const event = await findEvent(req.params.id);
    const list = rows<ArrivalRow>(
      await supabase.from('arrivals').select('*').order('eta_mins', { ascending: true }),
    );

    const result: ArrivalEta[] = list.map((row) => ({
      memberId: row.member_id ?? row.id,
      name: row.name,
      avatar: row.avatar,
      etaMins: row.eta_mins,
    }));

    const isEnRoute =
      member.presence_scope !== 'none' &&
      !member.presence_ghost &&
      member.presence_status === 'in_transit' &&
      member.presence_eta_mins != null;
    if (isEnRoute) {
      result.unshift({
        memberId: member.id,
        name: `${member.name} (you)`,
        avatar: member.avatar,
        etaMins: member.presence_eta_mins as number,
      });
    }

    result.sort((a, b) => a.etaMins - b.etaMins);
    res.json(result);
  }),
);
