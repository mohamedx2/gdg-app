import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gradient } from '@/components/ui/Gradient';
import { Icon, IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Orbs } from '@/components/ui/Orbs';
import { PressableScale } from '@/components/ui/PressableScale';
import { QRCode } from '@/components/ui/QRCode';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useAttendance, useEvent, useEventTicket } from '@/hooks/use-events';
import { useUiStore } from '@/stores/ui.store';
import { formatEventDateTime } from '@/utils/date';
import { useTheme } from '@/theme';

export default function TicketScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: event } = useEvent(id);
  const { data: attendance } = useAttendance(id);
  const {
    data: ticket,
    isPending,
    isError,
    error,
  } = useEventTicket(id, Boolean(attendance));

  const checkedIn = attendance === 'attended';

  const copyToken = async () => {
    if (!ticket) return;
    await Clipboard.setStringAsync(ticket.token);
    toast('Ticket code copied', 'success');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ overflow: 'hidden' }}>
        <Gradient token="brand" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Orbs />
          <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' }}>
            <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" color="onPrimary" />
            <Text variant="labelLg" weight="semibold" style={{ color: '#FFFFFF', marginLeft: 4 }}>
              Your ticket
            </Text>
          </View>
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 22, gap: 4 }}>
            <Text variant="codeSm" style={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              GDG on Campus EPI
            </Text>
            <Text variant="headlineSm" weight="bold" style={{ color: '#FFFFFF' }} numberOfLines={2}>
              {event?.title ?? ticket?.eventTitle ?? 'Event ticket'}
            </Text>
          </View>
        </Gradient>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {isError ? (
          <EmptyState
            icon="qrCode"
            title="No ticket yet"
            message={error instanceof Error ? error.message : 'Register for this event to get your QR ticket.'}
            actionLabel="Back to event"
            onAction={() => router.back()}
          />
        ) : isPending || !ticket ? (
          <View style={{ gap: 14, alignItems: 'center' }}>
            <Skeleton width={240} height={240} radius={16} />
            <Skeleton width={180} height={16} />
          </View>
        ) : (
          <>
            <View
              style={{
                alignItems: 'center',
                gap: 16,
                padding: 20,
                borderRadius: theme.radius.card,
                backgroundColor: theme.colors.surfaceContainerLowest,
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
              }}
            >
              <QRCode value={ticket.token} size={208} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: theme.colors.surfaceContainerHigh,
                  paddingLeft: 12,
                  paddingRight: 6,
                  paddingVertical: 6,
                  borderRadius: theme.radius.full,
                  maxWidth: '100%',
                }}
              >
                <Text variant="codeSm" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {ticket.token}
                </Text>
                <PressableScale
                  onPress={copyToken}
                  accessibilityLabel="Copy ticket code"
                  style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceContainerLowest }}
                >
                  <Icon name="copy" size={16} color="primary" />
                </PressableScale>
              </View>
              <Text variant="bodySm" muted style={{ textAlign: 'center' }}>
                Show this code at the door to check in.
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                padding: 14,
                borderRadius: theme.radius.base,
                backgroundColor: checkedIn ? theme.colors.tertiaryFixed : theme.colors.surfaceContainerLow,
                borderWidth: 1,
                borderColor: checkedIn ? 'transparent' : theme.colors.outlineVariant,
              }}
            >
              <Icon name={checkedIn ? 'checkCircle' : 'schedule'} size={18} color={checkedIn ? 'onTertiaryFixed' : 'primary'} />
              <View style={{ flex: 1 }}>
                <Text variant="labelLg" weight="semibold" color={checkedIn ? 'onTertiaryFixed' : undefined}>
                  {checkedIn ? 'Checked in' : 'Not checked in yet'}
                </Text>
                <Text variant="bodySm" color={checkedIn ? 'onTertiaryFixed' : undefined} muted={!checkedIn}>
                  {checkedIn
                    ? 'Your attendance has been recorded. Points added!'
                    : 'Present this QR to a volunteer to record your attendance.'}
                </Text>
              </View>
            </View>

            <View
              style={{
                gap: 12,
                padding: 16,
                borderRadius: theme.radius.card,
                backgroundColor: theme.colors.surfaceContainerLow,
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
              }}
            >
              <MetaRow icon="schedule" text={event ? formatEventDateTime(event.startsAt) : '—'} />
              <MetaRow icon="location" text={event ? `${event.location} — ${event.venue}` : '—'} />
              <MetaRow icon="person" text={ticket.attendeeName} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function MetaRow({ icon, text }: { icon: IconName; text: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: theme.colors.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color="primary" />
      </View>
      <Text variant="bodyMd" numberOfLines={2} style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
