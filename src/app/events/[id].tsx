import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Calendar from 'expo-calendar';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, iconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pill, SolidPill } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { EVENT_CATEGORIES, TRACKS } from '@/constants/taxonomy';
import { useAuth } from '@/features/auth/auth-provider';
import { useAttendance, useEvent, useRegisterEvent, useUnregisterEvent } from '@/hooks/use-events';
import { useArrivals } from '@/hooks/use-presence';
import { useUiStore } from '@/stores/ui.store';
import { cancelEventReminder, notifyRegistrationConfirmed, scheduleEventReminder } from '@/lib/notifications';
import { formatEventDateTime, formatLongDate, formatTime } from '@/utils/date';
import { formatCount } from '@/utils/format';
import { useTheme } from '@/theme';
import type { ArrivalEta, GdgEvent } from '@/types';

export default function EventDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <HeroSkeleton />
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={20} width="70%" />
          <Skeleton height={14} />
          <Skeleton height={120} radius={12} />
        </View>
      </View>
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 240, backgroundColor: theme.colors.surfaceContainerHigh }}>
          <Image
            source={{ uri: event.coverImage }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
          <View style={{ position: 'absolute', top: insets.top + 4, left: 12, flexDirection: 'row', gap: 8 }}>
            <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" color="onPrimary" backgroundColor="overlay" />
          </View>
          <View style={{ position: 'absolute', top: insets.top + 4, right: 12, flexDirection: 'row', gap: 8 }}>
            <IconButton name="calendarMonth" onPress={onAddToCalendar} accessibilityLabel="Add to calendar" color="onPrimary" backgroundColor="overlay" />
            <IconButton name="share" onPress={onShare} accessibilityLabel="Share event" color="onPrimary" backgroundColor="overlay" />
          </View>
        </View>

        <View style={{ padding: 16, gap: 16 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Pill label={EVENT_CATEGORIES[event.category].label} color={EVENT_CATEGORIES[event.category].color} dot uppercase />
              <Pill label={TRACKS[event.track].label} color={TRACKS[event.track].color} />
              {event.flagship ? <SolidPill label="Flagship" icon="flag" /> : null}
            </View>
            <Text variant="headlineMd" weight="bold">
              {event.title}
            </Text>
            <Text variant="bodySm" muted style={{ ...textTransformUppercase, letterSpacing: 0.5 }}>
              {formatEventDateTime(event.startsAt)} · {event.durationLabel}
            </Text>
          </View>

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

          {event.speaker ? (
            <SpeakerCard event={event} />
          ) : null}

          {event.highlights.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {event.highlights.map((highlight) => (
                <View
                  key={highlight.label}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: theme.radius.base, backgroundColor: theme.colors.surfaceContainerLow, minWidth: '47%', flexGrow: 1 }}
                >
                  <Icon name={iconName(highlight.icon)} size={16} color="primary" />
                  <View style={{ gap: 1 }}>
                    <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.3 }}>{highlight.label}</Text>
                    <Text variant="labelMd" weight="semibold" numberOfLines={1}>{highlight.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <Section title="About this event">
            <Text variant="bodyMd">{event.description}</Text>
            {event.perks?.length ? (
              <View style={{ gap: 6, marginTop: 4 }}>
                {event.perks.map((perk) => (
                  <View key={perk} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Icon name="checkCircle" size={16} color="tertiary" />
                    <Text variant="bodySm">{perk}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Section>

          {event.agenda && event.agenda.length ? (
            <Section title="Agenda">
              <View style={{ gap: 0 }}>
                {event.agenda.map((row, index) => (
                  <View key={`${row.time}-${index}`} style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ alignItems: 'center' }}>
                      <View style={{ flex: 1, width: 2, backgroundColor: theme.colors.outlineVariant, borderRadius: 1 }} />
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primaryContainer, marginVertical: 6 }} />
                    </View>
                    <View style={{ flex: 1, paddingVertical: 10, gap: 2 }}>
                      <Text variant="codeSm" primary weight="medium">{row.time}</Text>
                      <Text variant="labelMd" weight="semibold">{row.title}</Text>
                      {row.speaker ? <Text variant="bodySm" muted>{row.speaker}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          {event.organizerNote ? (
            <View style={{ padding: 14, borderRadius: theme.radius.card, backgroundColor: theme.colors.primaryFixed }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icon name="editNote" size={18} color="primary" />
                <Text variant="labelMd" primary weight="semibold">Organizer note</Text>
              </View>
              <Text variant="bodySm" color="onPrimaryFixed">{event.organizerNote}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: insets.bottom + 10,
          flexDirection: 'row',
          gap: 8,
        }}
      >
        {registered ? (
          <>
            <Button label="View ticket" icon="qrCode" onPress={onViewTicket} style={{ flex: 1 }} />
            <Button label="Registered ✓" onPress={onToggleRegistration} loading={busy} variant="container" />
          </>
        ) : (
          <Button label={`Register · ${formatCount(event.registeredCount)}${event.registeredCount >= event.capacity ? ' (full)' : ''}`} onPress={onToggleRegistration} loading={busy} style={{ flex: 1 }} />
        )}
      </View>
    </View>
  );
}

const textTransformUppercase: { textTransform: 'uppercase' } = { textTransform: 'uppercase' };

function InfoRow({ icon, label, value }: { icon: 'location' | 'groups' | 'emojiEvents'; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color="primary" />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</Text>
        <Text variant="bodyMd" weight="semibold">{value}</Text>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="titleMd" weight="bold">{title}</Text>
      {children}
    </View>
  );
}

function SpeakerCard({ event }: { event: GdgEvent }) {
  const theme = useTheme();
  const speaker = event.speaker!;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant }}>
      <Avatar uri={speaker.avatar} name={speaker.name} size={48} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="labelLg" weight="bold">{speaker.name}</Text>
          {speaker.verified ? <Icon name="verified" size={14} color="primary" /> : null}
        </View>
        <Text variant="bodySm" muted>{speaker.title}</Text>
        <Pill label={TRACKS[speaker.track].label} color={TRACKS[speaker.track].color} />
      </View>
    </View>
  );
}

function HeroSkeleton() {
  const theme = useTheme();
  return <View style={{ height: 240, backgroundColor: theme.colors.surfaceContainerHigh }} />;
}

/** Organizers only: who is on the way, and when they expect to arrive. */
function ArrivalsSection({ eventId }: { eventId: string }) {
  const theme = useTheme();
  const { data: arrivals } = useArrivals(eventId, true);

  if (!arrivals || !arrivals.length) return null;

  return (
    <View
      style={{
        padding: 14,
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.surfaceContainerLow,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name="directionsCar" size={18} color="warning" />
        <Text variant="titleSm" weight="bold">
          Arrivals
        </Text>
        <Text variant="bodySm" muted>
          {arrivals.length} on the way
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        {arrivals.map((arrival: ArrivalEta) => (
          <View key={arrival.memberId} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar uri={arrival.avatar} name={arrival.name} size={34} />
            <Text variant="bodyMd" weight="medium" style={{ flex: 1 }} numberOfLines={1}>
              {arrival.name}
            </Text>
            <Pill label={`${arrival.etaMins} min`} color="warning" icon="schedule" />
          </View>
        ))}
      </View>
    </View>
  );
}
