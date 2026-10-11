import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { memo } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import type { GdgEvent } from '@/types';
import { EVENT_CATEGORIES, TRACKS } from '@/constants/taxonomy';
import { formatDayNumber, formatEventDateTime, formatMonthShort, formatCountdown } from '@/utils/date';
import { formatCount } from '@/utils/format';
import { Button } from './ui/Button';
import { Gradient } from './ui/Gradient';
import { Icon } from './ui/Icon';
import { TagPill } from './ui/Chip';
import { PressableScale } from './ui/PressableScale';
import { Sheen } from './ui/Sheen';
import { Text } from './ui/Text';

interface EventCardProps {
  event: GdgEvent;
  horizontal?: boolean;
}

/** Compact event row — date tile + meta + chevron. */
export const EventCard = memo(function EventCard({ event, horizontal }: EventCardProps) {
  const theme = useTheme();
  const category = EVENT_CATEGORIES[event.category];
  const track = TRACKS[event.track];

  return (
    <PressableScale
      onPress={() => router.push(`/events/${event.id}`)}
      style={{
        width: horizontal ? 258 : undefined,
        flex: horizontal ? undefined : 1,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderRadius: theme.radius.card,
        padding: 12,
        flexDirection: 'row',
        gap: 12,
        shadowColor: theme.colors.inverseSurface,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <DateTile event={event} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <TagPill label={category.label} color={category.color} dot />
          <Text variant="codeSm" muted>
            {track.label}
          </Text>
        </View>
        <Text variant="titleSm" weight="semibold" numberOfLines={2}>
          {event.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Icon name="schedule" size={12} color="secondary" />
          <Text variant="bodySm" muted>{event.durationLabel}</Text>
          <Icon name="location" size={12} color="secondary" />
          <Text variant="bodySm" muted numberOfLines={1} style={{ flexShrink: 1 }}>
            {event.venue}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Icon name="groups" size={12} color="secondary" />
          <Text variant="bodySm" muted>
            {formatCount(event.registeredCount)} attending
          </Text>
          <View style={{ flex: 1 }} />
          <Icon name="chevronRight" size={16} color="secondary" />
        </View>
      </View>
    </PressableScale>
  );
});

export const DateTile = memo(function DateTile({ event, size = 'base' }: { event: GdgEvent; size?: 'base' | 'lg' }) {
  const theme = useTheme();
  const w = size === 'lg' ? 64 : 52;
  const h = size === 'lg' ? 72 : 60;
  return (
    <View style={{ width: w, height: h, borderRadius: theme.radius.base, overflow: 'hidden' }}>
      <Gradient
        token="brand"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: w, height: h, alignItems: 'center', justifyContent: 'center', gap: 1 }}
      >
        <Text variant="codeSm" style={{ textTransform: 'uppercase', letterSpacing: 0.6, color: 'rgba(255,255,255,0.85)' }}>
          {formatMonthShort(event.startsAt)}
        </Text>
        <Text variant="titleLg" weight="bold" style={{ lineHeight: 24, color: '#FFFFFF' }}>
          {formatDayNumber(event.startsAt)}
        </Text>
        <Text variant="codeSm" style={{ color: 'rgba(255,255,255,0.92)' }}>{formatTimeShort(event)}</Text>
      </Gradient>
    </View>
  );
});

/** Fixed-width compact card for horizontal rails (home / related lists). */
export const CompactEventCard = memo(function CompactEventCard({ event }: { event: GdgEvent }) {
  return <EventCard event={event} horizontal />;
});

function formatTimeShort(event: GdgEvent): string {
  const d = new Date(event.startsAt);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Full-width hero banner with gradient overlay for the featured event. */
export const FeaturedEventCard = memo(function FeaturedEventCard({ event }: { event: GdgEvent }) {
  const theme = useTheme();
  const category = EVENT_CATEGORIES[event.category];

  return (
    <PressableScale
      onPress={() => router.push(`/events/${event.id}`)}
      style={{ borderRadius: theme.radius.card, overflow: 'hidden' }}
    >
      <View style={{ height: 190, backgroundColor: theme.colors.surfaceContainerHigh }}>
        <Image
          source={{ uri: event.coverImage }}
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
          transition={200}
        />
        <Sheen delay={700} />
        <LinearGradient
          colors={['rgba(11,17,32,0.05)', 'rgba(11,17,32,0.85)']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}
        >
          <View style={{ padding: 14, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FDD663' }} />
                <Text variant="codeSm" weight="semibold" style={{ color: '#FFFFFF' }}>
                  UP NEXT · {formatCountdown(event.startsAt).toUpperCase()}
                </Text>
              </View>
              <TagPillLabel label={category.label} />
            </View>
            <Text variant="titleLg" weight="bold" style={{ color: '#FFFFFF' }}>
              {event.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <RowIconLabel icon="schedule" text={formatEventDateTime(event.startsAt)} />
              <RowIconLabel icon="location" text={event.venue} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, paddingTop: 4 }}>
              <Button label="Register" onPress={() => router.push(`/events/${event.id}`)} compact />
              <Button label={`${formatCount(event.registeredCount)} going`} variant="container" onPress={() => router.push(`/events/${event.id}`)} compact />
            </View>
          </View>
        </LinearGradient>
      </View>
    </PressableScale>
  );
});

function RowIconLabel({ icon, text }: { icon: 'schedule' | 'location'; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={13} color="#F8FAFC" />
      <Text variant="bodySm" style={{ color: '#E2E8F0' }} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function TagPillLabel({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: theme.colors.primaryContainer, opacity: 0.92 }}>
      <Text variant="codeSm" color="onPrimary" weight="semibold">
        {label}
      </Text>
    </View>
  );
}