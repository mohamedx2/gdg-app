import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Calendar from 'expo-calendar';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Share } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Icon, iconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pill, SolidPill } from '@/components/ui/Chip';
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
import { formatEventDateTime, formatLongDate, formatTime } from '@/utils/date';
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

  return (
    <Sheet
      showHandle={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      footer={
        registered ? (
          <XStack gap={8}>
            <Button label="View ticket" icon="qrCode" onPress={onViewTicket} style={{ flex: 1 }} />
            <Button label="Registered ✓" onPress={onToggleRegistration} loading={busy} variant="container" />
          </XStack>
        ) : (
          <Button
            label={`Register · ${formatCount(event.registeredCount)}${event.registeredCount >= event.capacity ? ' (full)' : ''}`}
            onPress={onToggleRegistration}
            loading={busy}
          />
        )
      }
    >
      <YStack height={240} backgroundColor="surfaceContainerHigh">
        <Image
          source={{ uri: event.coverImage }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
        <YStack position="absolute" top={12} left={12}>
          <IconButton name="close" onPress={() => router.back()} accessibilityLabel="Close" color="onPrimary" backgroundColor="overlay" />
        </YStack>
        <YStack position="absolute" top={12} right={12} gap={8}>
          <IconButton name="calendarMonth" onPress={onAddToCalendar} accessibilityLabel="Add to calendar" color="onPrimary" backgroundColor="overlay" />
          <IconButton name="share" onPress={onShare} accessibilityLabel="Share event" color="onPrimary" backgroundColor="overlay" />
        </YStack>
      </YStack>

      <YStack padding={16} gap={16}>
        <YStack gap={8}>
          <XStack alignItems="center" gap={6} flexWrap="wrap">
            <Pill label={EVENT_CATEGORIES[event.category].label} color={EVENT_CATEGORIES[event.category].color} dot uppercase />
            <Pill label={TRACKS[event.track].label} color={TRACKS[event.track].color} />
            {event.flagship ? <SolidPill label="Flagship" icon="flag" /> : null}
          </XStack>
          <Text variant="headlineMd" weight="bold">
            {event.title}
          </Text>
          <Text variant="bodySm" muted style={{ ...textTransformUppercase, letterSpacing: 0.5 }}>
            {formatEventDateTime(event.startsAt)} · {event.durationLabel}
          </Text>
        </YStack>

        <InfoRow icon="location" label="Location" value={`${event.location} — ${event.venue}`} />
        <InfoRow icon="groups" label="Attendance" value={`${formatCount(event.registeredCount)} of ${formatCount(event.capacity)} registered`} />
        {event.prize ? <InfoRow icon="emojiEvents" label="Prize" value={event.prize} /> : null}

        {registered ? (
          <Button
            label="On my way? Share your ETA"
            icon="directionsCar"
            variant="container"
            onPress={() => router.push({ pathname: '/presence', params: { eventId: event.id } })}
          />
        ) : null}

        {isOrganizer ? <ArrivalsSection eventId={event.id} /> : null}

        {event.speaker ? <SpeakerCard event={event} /> : null}

        {event.highlights.length ? (
          <XStack flexWrap="wrap" gap={8}>
            {event.highlights.map((highlight) => (
              <XStack
                key={highlight.label}
                alignItems="center"
                gap={6}
                paddingHorizontal={10}
                paddingVertical={8}
                borderRadius="base"
                backgroundColor="surfaceContainerLow"
                minWidth="47%"
                flexGrow={1}
              >
                <Icon name={iconName(highlight.icon)} size={16} color="primary" />
                <YStack gap={1}>
                  <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.3 }}>{highlight.label}</Text>
                  <Text variant="labelMd" weight="semibold" numberOfLines={1}>{highlight.value}</Text>
                </YStack>
              </XStack>
            ))}
          </XStack>
        ) : null}

        <Section title="About this event">
          <Text variant="bodyMd">{event.description}</Text>
          {event.perks?.length ? (
            <YStack gap={6} marginTop={4}>
              {event.perks.map((perk) => (
                <XStack key={perk} alignItems="center" gap={8}>
                  <Icon name="checkCircle" size={16} color="tertiary" />
                  <Text variant="bodySm">{perk}</Text>
                </XStack>
              ))}
            </YStack>
          ) : null}
        </Section>

        {event.agenda && event.agenda.length ? (
          <Section title="Agenda">
            <YStack gap={0}>
              {event.agenda.map((row, index) => (
                <XStack key={`${row.time}-${index}`} gap={12}>
                  <YStack alignItems="center">
                    <YStack flex={1} width={2} backgroundColor="outlineVariant" borderRadius={1} />
                    <YStack width={10} height={10} borderRadius={5} backgroundColor="primaryContainer" marginVertical={6} />
                  </YStack>
                  <YStack flex={1} paddingVertical={10} gap={2}>
                    <Text variant="codeSm" primary weight="medium">{row.time}</Text>
                    <Text variant="labelMd" weight="semibold">{row.title}</Text>
                    {row.speaker ? <Text variant="bodySm" muted>{row.speaker}</Text> : null}
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </Section>
        ) : null}

        {event.organizerNote ? (
          <YStack padding={14} borderRadius="card" backgroundColor="primaryFixed">
            <XStack alignItems="center" gap={8} marginBottom={6}>
              <Icon name="editNote" size={18} color="primary" />
              <Text variant="labelMd" primary weight="semibold">Organizer note</Text>
            </XStack>
            <Text variant="bodySm" color="onPrimaryFixed">{event.organizerNote}</Text>
          </YStack>
        ) : null}
      </YStack>
    </Sheet>
  );
}

const textTransformUppercase: { textTransform: 'uppercase' } = { textTransform: 'uppercase' };

function InfoRow({ icon, label, value }: { icon: 'location' | 'groups' | 'emojiEvents'; label: string; value: string }) {
  return (
    <XStack alignItems="center" gap={12}>
      <YStack width={36} height={36} borderRadius={10} backgroundColor="surfaceContainerLow" alignItems="center" justifyContent="center">
        <Icon name={icon} size={18} color="primary" />
      </YStack>
      <YStack flex={1}>
        <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</Text>
        <Text variant="bodyMd" weight="semibold">{value}</Text>
      </YStack>
    </XStack>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <YStack gap={8}>
      <Text variant="titleMd" weight="bold">{title}</Text>
      {children}
    </YStack>
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
