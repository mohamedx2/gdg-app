import type { GdgEvent } from '../types';

/** App event → `events` table row. Shared by the full seed and `seed:events`. */
export function toEventRow(event: GdgEvent): Record<string, unknown> {
  return {
    id: event.id,
    title: event.title,
    summary: event.summary,
    description: event.description,
    category: event.category,
    track: event.track,
    starts_at: event.startsAt,
    ends_at: event.endsAt,
    duration_label: event.durationLabel,
    location: event.location,
    venue: event.venue,
    capacity: event.capacity,
    registered_count: event.registeredCount,
    cover_image: event.coverImage,
    speaker: event.speaker ?? null,
    featured: event.featured,
    flagship: event.flagship,
    prize: event.prize ?? null,
    highlights: event.highlights ?? [],
    perks: event.perks ?? null,
    agenda: event.agenda ?? null,
    organizer_note: event.organizerNote ?? null,
  };
}
