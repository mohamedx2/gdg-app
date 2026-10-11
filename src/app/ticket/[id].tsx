import * as Calendar from 'expo-calendar';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Share } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '@/components/ui/Avatar';
import { Gradient } from '@/components/ui/Gradient';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Orbs } from '@/components/ui/Orbs';
import { PressableScale } from '@/components/ui/PressableScale';
import { QRCode } from '@/components/ui/QRCode';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { useTaxonomy } from '@/hooks/use-content';
import { useAttendance, useEvent, useEventTicket } from '@/hooks/use-events';
import { useUiStore } from '@/stores/ui.store';
import type { ColorToken } from '@/theme/colors';
import { formatLongDate, formatTime } from '@/utils/date';

const GOOGLE_DOTS: ColorToken[] = ['error', 'info', 'warning', 'success'];

/** E-ticket sheet: confirmation banner, perforated pass with the gate QR, and actions. */
export default function TicketScreen() {
  const toast = useUiStore((state) => state.toast);
  const { user } = useAuth();
  const { eventCategories } = useTaxonomy();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: event } = useEvent(id);
  const { data: attendance } = useAttendance(id);
  const { data: ticket, isPending, isError, error } = useEventTicket(id, Boolean(attendance));

  const checkedIn = attendance === 'attended';

  const copyToken = async () => {
    if (!ticket) return;
    await Clipboard.setStringAsync(ticket.token);
    toast('Ticket code copied', 'success');
  };

  const addToCalendar = async () => {
    if (!event) return;
    try {
      const calendar = await Calendar.getDefaultCalendarAsync();
      await Calendar.createEventAsync(calendar.id, {
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

  const shareTicket = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `I'm going to ${event.title} — ${formatLongDate(event.startsAt)} ${formatTime(event.startsAt)} GMT+1 · ${event.venue || event.location}. Join GDG on Campus EPI!`,
      });
    } catch {
      // share dismissed
    }
  };

  return (
    <Sheet contentContainerStyle={{ paddingBottom: 32 }}>
      <YStack paddingHorizontal={16} gap={16}>
        {isError ? (
          <EmptyState
            icon="qrCode"
            title="No ticket yet"
            message={error instanceof Error ? error.message : 'Register for this event to get your QR ticket.'}
            actionLabel="Back to event"
            onAction={() => router.back()}
          />
        ) : isPending || !ticket ? (
          <YStack gap={14}>
            <Skeleton height={64} radius={18} />
            <Skeleton height={420} radius={22} />
          </YStack>
        ) : (
          <>
            <XStack alignItems="center" gap={12} padding={14} borderRadius={18} backgroundColor="tertiaryFixed">
              <Icon name="checkCircle" size={26} color="onTertiaryFixedVariant" />
              <YStack flex={1}>
                <Text variant="titleSm" weight="bold" color="onTertiaryFixedVariant">
                  {checkedIn ? 'Checked in!' : 'RSVP Confirmed!'}
                </Text>
                <Text variant="bodySm" color="onTertiaryFixedVariant">
                  {checkedIn ? 'Attendance recorded — points added' : 'Seat reserved at EPI Sousse'}
                </Text>
              </YStack>
            </XStack>

            <YStack borderRadius="card" overflow="hidden" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
              <Gradient token="brand" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Orbs />
                <YStack padding={16} gap={10}>
                  <XStack alignItems="center" justifyContent="space-between">
                    <XStack alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="overlay">
                      <XStack gap={3}>
                        {GOOGLE_DOTS.map((color) => (
                          <YStack key={color} width={6} height={6} borderRadius={3} backgroundColor={color} />
                        ))}
                      </XStack>
                      <Text variant="codeSm" weight="bold" color="onPrimary">
                        GDG EPI
                      </Text>
                    </XStack>
                    {event ? (
                      <YStack paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="overlay">
                        <Text variant="codeSm" weight="bold" color="onPrimary">
                          {(eventCategories[event.category]?.label ?? event.category).toUpperCase()}
                        </Text>
                      </YStack>
                    ) : null}
                  </XStack>
                  <Text variant="headlineSm" weight="bold" color="onPrimary" numberOfLines={3}>
                    {event?.title ?? ticket.eventTitle}
                  </Text>
                  {event ? (
                    <YStack gap={4}>
                      <TicketMeta icon="calendarMonth" text={`${formatLongDate(event.startsAt).toUpperCase()} • ${formatTime(event.startsAt)} GMT+1`} />
                      <TicketMeta icon="location" text={event.venue || event.location} />
                    </YStack>
                  ) : null}
                  <XStack alignItems="center" gap={10} padding={10} borderRadius={14} backgroundColor="overlay">
                    <Avatar uri={user?.avatar} name={ticket.attendeeName} size={38} />
                    <YStack flex={1}>
                      <Text variant="labelLg" weight="bold" color="onPrimary" numberOfLines={1}>
                        {ticket.attendeeName}
                      </Text>
                      <Text variant="codeSm" color="onPrimary" numberOfLines={1}>
                        ID: {user?.id ?? '—'}
                      </Text>
                    </YStack>
                    <YStack alignItems="flex-end">
                      <Text variant="codeSm" color="onPrimary">
                        PASS TYPE
                      </Text>
                      <Text variant="codeSm" weight="bold" color="onPrimary">
                        STUDENT
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              </Gradient>

              <XStack alignItems="center" height={20}>
                <YStack width={20} height={20} borderRadius={10} marginLeft={-10} backgroundColor="background" />
                <YStack flex={1} borderTopWidth={1.5} borderStyle="dashed" borderColor="outlineVariant" />
                <YStack width={20} height={20} borderRadius={10} marginRight={-10} backgroundColor="background" />
              </XStack>

              <YStack alignItems="center" gap={12} padding={18} paddingTop={6}>
                <XStack alignItems="center" gap={6} paddingHorizontal={12} paddingVertical={5} borderRadius="full" backgroundColor="surfaceContainerHigh">
                  <YStack width={7} height={7} borderRadius={4} backgroundColor={checkedIn ? 'tertiary' : 'live'} />
                  <Text variant="codeSm" weight="bold">
                    {checkedIn ? 'CHECKED IN' : 'GATE QR READY'}
                  </Text>
                </XStack>
                <YStack padding={14} borderRadius={18} backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
                  <QRCode value={ticket.token} size={200} />
                </YStack>
                <PressableScale onPress={copyToken} accessibilityLabel="Copy ticket code">
                  <XStack alignItems="center" gap={6} paddingVertical={6}>
                    <Text variant="codeSm" weight="bold" numberOfLines={1}>
                      {ticket.token}
                    </Text>
                    <Icon name="copy" size={14} color="primary" />
                  </XStack>
                </PressableScale>
                <Text variant="bodySm" muted style={{ textAlign: 'center' }}>
                  Scan at the {event?.venue || 'venue'} entrance
                </Text>
              </YStack>
            </YStack>

            <XStack gap={10}>
              <ActionTile icon="calendarMonth" label="Add to Calendar" onPress={addToCalendar} />
              <ActionTile icon="share" label="Share Ticket" onPress={shareTicket} />
            </XStack>
            <PressableScale onPress={() => router.back()} accessibilityLabel="Done">
              <YStack height={48} alignItems="center" justifyContent="center">
                <Text variant="labelLg" weight="bold" muted>
                  Done
                </Text>
              </YStack>
            </PressableScale>
          </>
        )}
      </YStack>
    </Sheet>
  );
}

function TicketMeta({ icon, text }: { icon: IconName; text: string }) {
  return (
    <XStack alignItems="center" gap={8}>
      <Icon name={icon} size={16} color="gold" />
      <Text variant="codeSm" weight="bold" color="onPrimary" numberOfLines={1} style={{ flexShrink: 1 }}>
        {text}
      </Text>
    </XStack>
  );
}

function ActionTile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label} style={{ flex: 1 }}>
      <XStack height={52} alignItems="center" justifyContent="center" gap={8} borderRadius={16} backgroundColor="surfaceContainerHigh">
        <Icon name={icon} size={18} color="primary" />
        <Text variant="labelLg" weight="bold">
          {label}
        </Text>
      </XStack>
    </PressableScale>
  );
}
