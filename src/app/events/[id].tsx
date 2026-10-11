import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Calendar from 'expo-calendar';
import React, { useState } from 'react';
import { Share } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Icon, iconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pill } from '@/components/ui/Chip';
import { Gradient } from '@/components/ui/Gradient';
import { Orbs } from '@/components/ui/Orbs';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useAuth } from '@/features/auth/auth-provider';
import { useAttendance, useEvent, useRegisterEvent, useUnregisterEvent } from '@/hooks/use-events';
import { useArrivals } from '@/hooks/use-presence';
import { useUiStore } from '@/stores/ui.store';
import { cancelEventReminder, notifyRegistrationConfirmed, scheduleEventReminder } from '@/lib/notifications';
import { formatLongDate, formatTime, isPast } from '@/utils/date';
import { formatCount } from '@/utils/format';
import type { ArrivalEta, GdgEvent } from '@/types';

export default function EventDetailScreen() {
  const { eventCategories: EVENT_CATEGORIES, tracks: TRACKS } = useTaxonomy();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const toast = useUiStore((state) => state.toast);
  const { isOrganizer } = useAuth();

  const { data: event, isPending } = useEvent(params.id);
  const { data: attendance } = useAttendance(params.id);
  const { mutateAsync: register } = useRegisterEvent();
  const { mutateAsync: unregister } = useUnregisterEvent();
  const [busy, setBusy] = useState(false);

  if (isPending || !event) {
    return (
      <Sheet title="Event">
        <YStack gap={12}>
          <Skeleton height={180} radius={12} />
          <Skeleton height={20} width="70%" />
          <Skeleton height={14} />
          <Skeleton height={120} radius={12} />
        </YStack>
      </Sheet>
    );
  }

  const registered = attendance === 'registered' || attendance === 'attended';

  const onToggleRegistration = async () => {
    setBusy(true);
    try {
      if (registered) {
        await unregister({ event });
        await cancelEventReminder(event.id);
        toast('You left the event', 'info');
      } else {
        await register({ event });
        await notifyRegistrationConfirmed(event);
        await scheduleEventReminder(event);
        toast('You’re going! Seat confirmed', 'success');
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Registration failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const onAddToCalendar = async () => {
    try {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      await Calendar.createEventAsync(defaultCalendar.id, {
        title: event.title,
        notes: event.description,
        location: `${event.location} · ${event.venue}`,
        startDate: new Date(event.startsAt),
        endDate: new Date(event.endsAt),
        alarms: [{ relativeOffset: -60 }],
      });
      toast('Added to your calendar', 'success');
    } catch {
      toast('Calendar permission needed', 'error');
    }
  };

  const onShare = async () => {
    const message = `${event.title}\n${formatLongDate(event.startsAt)} ${formatTime(event.startsAt)} GMT+1 · ${event.location}\nJoin the GDG on Campus EPI community 🚀`;
    try {
      await Share.share({ message });
    } catch {
      // share dismissed
    }
  };

  const onViewTicket = () => {
    router.push({ pathname: '/ticket/[id]', params: { id: event.id } });
  };

  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const fill = event.capacity > 0 ? Math.min(1, event.registeredCount / event.capacity) : 0;
  const ended = isPast(event.endsAt);
  const track = TRACKS[event.track];
  const category = EVENT_CATEGORIES[event.category];

  return (
    <Sheet
      contentContainerStyle={{ paddingBottom: 20 }}
      footer={
        <YStack gap={10}>
          <YStack gap={6}>
            <XStack justifyContent="space-between">
              <XStack alignItems="center" gap={6}>
                <YStack width={6} height={6} borderRadius={3} backgroundColor="live" />
                <Text variant="codeSm" weight="bold">
                  {event.registeredCount}/{event.capacity} seats filled
                </Text>
              </XStack>
              {!ended ? (
                <Text variant="codeSm" weight="bold" color={seatsLeft <= 10 ? 'error' : 'tertiary'}>
                  {seatsLeft > 0 ? `${seatsLeft} SPOTS LEFT` : 'WAITLIST'}
                </Text>
              ) : null}
            </XStack>
            <YStack height={6} borderRadius={3} backgroundColor="surfaceContainerHigh" overflow="hidden">
              <YStack width={`${fill * 100}%`} height="100%" backgroundColor="primary" />
            </YStack>
          </YStack>
          {registered ? (
            <XStack gap={8}>
              <Button label="View ticket" icon="qrCode" onPress={onViewTicket} style={{ flex: 1 }} />
              <Button label="Leave" onPress={onToggleRegistration} loading={busy} variant="container" fullWidth={false} />
            </XStack>
          ) : ended ? (
            <Button label="Event has ended" icon="history" variant="container" disabled onPress={() => undefined} />
          ) : (
            <Button label={seatsLeft > 0 ? 'Confirm RSVP' : 'Join waitlist'} icon="bolt" onPress={onToggleRegistration} loading={busy} />
          )}
        </YStack>
      }
    >
      <YStack paddingHorizontal={16} gap={16}>
        <YStack borderRadius="card" overflow="hidden">
          <Gradient token="brand" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Orbs />
            <YStack padding={16} gap={12}>
              <XStack alignItems="center" gap={6} flexWrap="wrap">
                <XStack alignItems="center" gap={5} paddingHorizontal={8} paddingVertical={3} borderRadius="full" backgroundColor="primaryFixed">
                  <YStack width={6} height={6} borderRadius={3} backgroundColor={track?.color ?? 'live'} />
                  <Text variant="codeSm" weight="bold" color="onPrimaryFixedVariant">
                    {(track?.label ?? event.track).toUpperCase()}
                  </Text>
                </XStack>
                <YStack paddingHorizontal={8} paddingVertical={3} borderRadius="full" backgroundColor="secondaryContainer">
                  <Text variant="codeSm" weight="bold" color="onSecondaryContainer">
                    {(category?.label ?? event.category).toUpperCase()}
                  </Text>
                </YStack>
                {event.flagship ? (
                  <YStack paddingHorizontal={8} paddingVertical={3} borderRadius="full" backgroundColor="tertiaryFixed">
                    <Text variant="codeSm" weight="bold" color="onTertiaryFixedVariant">
                      FLAGSHIP
                    </Text>
                  </YStack>
                ) : null}
              </XStack>
              <XStack alignItems="flex-end" justifyContent="space-between" gap={12}>
                <YStack flex={1}>
                  <Text variant="codeSm" weight="bold" color="onPrimary">
                    GDG ON CAMPUS EPI
                  </Text>
                  <Text variant="bodySm" color="onPrimary">
                    {event.durationLabel} · {event.venue || event.location}
                  </Text>
                </YStack>
                <XStack gap={8}>
                  <IconButton name="calendarMonth" onPress={onAddToCalendar} accessibilityLabel="Add to calendar" color="onPrimary" backgroundColor="overlay" />
                  <IconButton name="share" onPress={onShare} accessibilityLabel="Share event" color="onPrimary" backgroundColor="overlay" />
                </XStack>
              </XStack>
            </YStack>
          </Gradient>
        </YStack>

        <Text variant="headlineSm" weight="bold">
          {event.title}
        </Text>

        {event.speaker ? <SpeakerCard event={event} /> : null}

        <YStack gap={8}>
          <InfoRow icon="calendarMonth" label="Date" value={formatLongDate(event.startsAt).toUpperCase()} />
          <InfoRow icon="schedule" label="Time" value={`${formatTime(event.startsAt)} – ${formatTime(event.endsAt)} GMT+1`} />
          <InfoRow icon="location" label="Location" value={[event.venue, event.location].filter(Boolean).join(' · ')} />
          {event.prize ? <InfoRow icon="emojiEvents" label="Prize" value={event.prize} /> : null}
        </YStack>

        {registered && !ended ? (
          <Button
            label="On my way? Share your ETA"
            icon="directionsCar"
            variant="container"
            onPress={() => router.push({ pathname: '/presence', params: { eventId: event.id } })}
          />
        ) : null}

        {isOrganizer ? <ArrivalsSection eventId={event.id} /> : null}

        <YStack padding={16} gap={10} borderRadius="card" backgroundColor="surfaceContainerLow">
          <XStack alignItems="center" gap={8}>
            <Icon name="info" size={18} color="primary" />
            <Text variant="titleSm" weight="bold">
              About this event
            </Text>
          </XStack>
          <Text variant="bodyMd">{event.description}</Text>
          {event.organizerNote ? (
            <XStack gap={10} padding={12} borderRadius={14} backgroundColor="surfaceContainerHigh">
              <Icon name="editNote" size={18} color="onSurfaceVariant" />
              <Text variant="bodySm" muted style={{ flex: 1 }}>
                {event.organizerNote}
              </Text>
            </XStack>
          ) : null}
          {event.perks?.length ? (
            <YStack gap={6}>
              {event.perks.map((perk) => (
                <XStack key={perk} alignItems="center" gap={8}>
                  <Icon name="checkCircle" size={16} color="tertiary" />
                  <Text variant="bodySm">{perk}</Text>
                </XStack>
              ))}
            </YStack>
          ) : null}
        </YStack>

        {event.agenda && event.agenda.length ? (
          <YStack gap={8}>
            <XStack alignItems="center" justifyContent="space-between">
              <Text variant="titleMd" weight="bold">
                Session Agenda
              </Text>
              <Text variant="codeSm" muted>
                {event.durationLabel.toUpperCase()}
              </Text>
            </XStack>
            <YStack>
              {event.agenda.map((row, index, rows) => (
                <XStack key={`${row.time}-${index}`} gap={12}>
                  <YStack alignItems="center" width={28}>
                    <YStack width={28} height={28} borderRadius={14} alignItems="center" justifyContent="center" backgroundColor={AGENDA_TONES[index % AGENDA_TONES.length]}>
                      <Icon name={AGENDA_ICONS[index % AGENDA_ICONS.length]} size={14} color="onSurface" />
                    </YStack>
                    {index < rows.length - 1 ? <YStack flex={1} width={2} marginVertical={2} backgroundColor="outlineVariant" /> : null}
                  </YStack>
                  <YStack flex={1} paddingBottom={14} gap={2}>
                    <XStack gap={8} alignItems="baseline">
                      <Text variant="codeSm" weight="bold" primary>
                        {row.time}
                      </Text>
                      <Text variant="labelLg" weight="bold" style={{ flex: 1 }}>
                        {row.title}
                      </Text>
                    </XStack>
                    {row.speaker ? (
                      <Text variant="bodySm" muted>
                        {row.speaker}
                      </Text>
                    ) : null}
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </YStack>
        ) : null}

        {event.highlights.length ? (
          <XStack flexWrap="wrap" gap={8}>
            {event.highlights.map((highlight) => (
              <XStack key={highlight.label} alignItems="center" gap={8} padding={12} borderRadius={14} backgroundColor="surfaceContainerLow" minWidth="47%" flexGrow={1}>
                <Icon name={iconName(highlight.icon)} size={16} color="primary" />
                <YStack gap={1}>
                  <Text variant="codeSm" muted>
                    {highlight.label.toUpperCase()}
                  </Text>
                  <Text variant="labelMd" weight="semibold" numberOfLines={1}>
                    {highlight.value}
                  </Text>
                </YStack>
              </XStack>
            ))}
          </XStack>
        ) : null}

        <XStack alignItems="center" justifyContent="space-between" padding={16} borderRadius="card" backgroundColor="surfaceContainerLow">
          <YStack gap={2}>
            <Text variant="titleSm" weight="bold">
              Who&apos;s going
            </Text>
            <Text variant="codeSm" muted>
              {formatCount(event.registeredCount)} confirmed{registered ? ' · including you' : ''}
            </Text>
          </YStack>
          <Text variant="codeSm" weight="bold" color="tertiary">
            CONFIRMED
          </Text>
        </XStack>
      </YStack>
    </Sheet>
  );
}

const AGENDA_ICONS = ['flag', 'code', 'cloudDone', 'emojiEvents'] as const;
const AGENDA_TONES = ['primaryFixed', 'tertiaryFixed', 'secondaryContainer', 'surfaceContainerHigh'] as const;

function InfoRow({ icon, label, value }: { icon: 'location' | 'groups' | 'emojiEvents' | 'calendarMonth' | 'schedule'; label: string; value: string }) {
  return (
    <XStack alignItems="center" gap={12} padding={12} borderRadius={16} backgroundColor="surfaceContainerLow">
      <YStack width={36} height={36} borderRadius={10} backgroundColor="surfaceContainerLowest" alignItems="center" justifyContent="center">
        <Icon name={icon} size={18} color="primary" />
      </YStack>
      <YStack flex={1}>
        <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</Text>
        <Text variant="codeSm" weight="bold">{value}</Text>
      </YStack>
    </XStack>
  );
}

function SpeakerCard({ event }: { event: GdgEvent }) {
  const { tracks: TRACKS } = useTaxonomy();
  const speaker = event.speaker!;
  return (
    <XStack alignItems="center" gap={12} padding={12} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
      <Avatar uri={speaker.avatar} name={speaker.name} size={48} />
      <YStack flex={1} gap={2}>
        <XStack alignItems="center" gap={6}>
          <Text variant="labelLg" weight="bold">{speaker.name}</Text>
          {speaker.verified ? <Icon name="verified" size={14} color="primary" /> : null}
        </XStack>
        <Text variant="bodySm" muted>{speaker.title}</Text>
        <Pill label={TRACKS[speaker.track].label} color={TRACKS[speaker.track].color} />
      </YStack>
    </XStack>
  );
}

/** Organizers only: who is on the way, and when they expect to arrive. */
function ArrivalsSection({ eventId }: { eventId: string }) {
  const { data: arrivals } = useArrivals(eventId, true);

  if (!arrivals || !arrivals.length) return null;

  return (
    <YStack
      padding={14}
      borderRadius="card"
      backgroundColor="surfaceContainerLow"
      borderWidth={1}
      borderColor="outlineVariant"
      gap={12}
    >
      <XStack alignItems="center" gap={8}>
        <Icon name="directionsCar" size={18} color="warning" />
        <Text variant="titleSm" weight="bold">
          Arrivals
        </Text>
        <Text variant="bodySm" muted>
          {arrivals.length} on the way
        </Text>
      </XStack>
      <YStack gap={10}>
        {arrivals.map((arrival: ArrivalEta) => (
          <XStack key={arrival.memberId} alignItems="center" gap={12}>
            <Avatar uri={arrival.avatar} name={arrival.name} size={34} />
            <Text variant="bodyMd" weight="medium" style={{ flex: 1 }} numberOfLines={1}>
              {arrival.name}
            </Text>
            <Pill label={`${arrival.etaMins} min`} color="warning" icon="schedule" />
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
