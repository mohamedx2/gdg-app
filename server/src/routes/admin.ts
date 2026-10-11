import { Router } from 'express';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { requireAuth, requireOrganizer } from '../auth/middleware';
import { supabase } from '../supabase';
import { toAnnouncement, toEvent } from '../mappers';
import type { AnnouncementRow, EventRow } from '../db-types';
import type { Announcement, GdgEvent, OrganizerStats } from '../types';

export const adminRouter = Router();

function eventInsert(dto: GdgEvent): Record<string, unknown> {
  return {
    id: dto.id || `evt-${Date.now().toString(36)}`,
    title: dto.title,
    summary: dto.summary ?? '',
    description: dto.description ?? '',
    category: dto.category,
    track: dto.track ?? 'general',
    starts_at: dto.startsAt,
    ends_at: dto.endsAt,
    duration_label: dto.durationLabel ?? '',
    location: dto.location ?? '',
    venue: dto.venue ?? '',
    capacity: dto.capacity ?? 0,
    registered_count: dto.registeredCount ?? 0,
    cover_image: dto.coverImage ?? '',
    speaker: dto.speaker ?? null,
    featured: dto.featured ?? false,
    flagship: dto.flagship ?? false,
    prize: dto.prize ?? null,
    highlights: dto.highlights ?? [],
    perks: dto.perks ?? null,
    agenda: dto.agenda ?? null,
    organizer_note: dto.organizerNote ?? null,
  };
}

function eventPatch(patch: Partial<GdgEvent>): Record<string, unknown> {
  const map: Record<keyof GdgEvent, string> = {
    id: 'id',
    title: 'title',
    summary: 'summary',
    description: 'description',
    category: 'category',
    track: 'track',
    startsAt: 'starts_at',
    endsAt: 'ends_at',
    durationLabel: 'duration_label',
    location: 'location',
    venue: 'venue',
    capacity: 'capacity',
    registeredCount: 'registered_count',
    coverImage: 'cover_image',
    speaker: 'speaker',
    featured: 'featured',
    flagship: 'flagship',
    prize: 'prize',
    highlights: 'highlights',
    perks: 'perks',
    agenda: 'agenda',
    organizerNote: 'organizer_note',
  };
  const out: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(map) as [keyof GdgEvent, string][]) {
    if (patch[key] !== undefined) out[column] = patch[key];
  }
  return out;
}

adminRouter.get(
  '/admin/stats',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (_req, res) => {
    const { data: events, error } = await supabase.from('events').select('*');
    if (error) throw HttpError.server(error.message);
    const eventRows = (events ?? []) as EventRow[];

    const { count: onlineMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('online', true);

    const now = Date.now();
    const upcoming = eventRows.filter((event) => new Date(event.starts_at).getTime() > now);
    const registrations = eventRows.reduce((sum, event) => sum + event.registered_count, 0);
    const capacity = eventRows.reduce((sum, event) => sum + event.capacity, 0);

    const stats: OrganizerStats = {
      totalEvents: eventRows.length,
      upcomingEvents: upcoming.length,
      totalRegistrations: registrations,
      activeMembers: (onlineMembers ?? 0) * 18 + 42,
      announcementReach: 214,
      attendanceRate: capacity ? Math.round((registrations / capacity) * 100) : 0,
    };
    res.json(stats);
  }),
);

adminRouter.post(
  '/admin/events',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (req, res) => {
    const dto = req.body as GdgEvent;
    if (!dto?.title || !dto?.startsAt || !dto?.endsAt) {
      throw HttpError.badRequest('An event needs a title and start/end times.');
    }
    const { data, error } = await supabase.from('events').insert(eventInsert(dto)).select('*').single();
    if (error) throw HttpError.server(error.message);
    res.status(201).json(toEvent(data as EventRow));
  }),
);

adminRouter.patch(
  '/admin/events/:id',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (req, res) => {
    const patch = eventPatch(req.body as Partial<GdgEvent>);
    const { data, error } = await supabase
      .from('events')
      .update(patch)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) throw HttpError.server(error.message);
    if (!data) throw HttpError.notFound('This event no longer exists.');
    res.json(toEvent(data as EventRow));
  }),
);

adminRouter.delete(
  '/admin/events/:id',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('events').delete().eq('id', req.params.id);
    if (error) throw HttpError.server(error.message);
    res.status(204).end();
  }),
);

function announcementInsert(dto: Announcement): Record<string, unknown> {
  return {
    id: dto.id || `ann-${Date.now().toString(36)}`,
    title: dto.title,
    body: dto.body ?? '',
    tag: dto.tag ?? '',
    deadline: dto.deadline ?? null,
    created_at: dto.createdAt || new Date().toISOString(),
    cta_label: dto.ctaLabel ?? null,
    cta_link: dto.ctaLink ?? null,
    pinned: dto.pinned ?? false,
  };
}

adminRouter.post(
  '/admin/announcements',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (req, res) => {
    const dto = req.body as Announcement;
    if (!dto?.title) throw HttpError.badRequest('An announcement needs a title.');
    const { data, error } = await supabase
      .from('announcements')
      .insert(announcementInsert(dto))
      .select('*')
      .single();
    if (error) throw HttpError.server(error.message);
    res.status(201).json(toAnnouncement(data as AnnouncementRow));
  }),
);

adminRouter.delete(
  '/admin/announcements/:id',
  requireAuth,
  requireOrganizer,
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('announcements').delete().eq('id', req.params.id);
    if (error) throw HttpError.server(error.message);
    res.status(204).end();
  }),
);
