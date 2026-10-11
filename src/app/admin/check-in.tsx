import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RequirePermission } from '@/components/RequirePermission';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/Chip';
import { Icon, IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useCheckIn, useUpcomingEvents } from '@/hooks/use-events';
import { useUiStore } from '@/stores/ui.store';
import { useTheme } from '@/theme';
import type { CheckInResult, CheckInStatus } from '@/types';

const STATUS_PRESENTATION: Record<
  CheckInStatus,
  { icon: IconName; label: string; tone: 'tertiary' | 'secondary' | 'error' }
> = {
  accepted: { icon: 'checkCircle', label: 'Checked in', tone: 'tertiary' },
  already_checked_in: { icon: 'history', label: 'Already checked in', tone: 'secondary' },
  invalid_ticket: { icon: 'errorOutline', label: 'Invalid ticket', tone: 'error' },
  wrong_event: { icon: 'errorOutline', label: 'Ticket for another event', tone: 'error' },
  not_registered: { icon: 'errorOutline', label: 'Not registered', tone: 'error' },
};

export default function CheckInScreen() {
  return (
    <RequirePermission permission="admin.checkIn">
      <CheckInScreenContent />
    </RequirePermission>
  );
}

function CheckInScreenContent() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);
  const { data: events } = useUpcomingEvents(20);
  const { mutateAsync: checkIn } = useCheckIn();
  const [permission, requestPermission] = useCameraPermissions();

  const [eventId, setEventId] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);

  const selected = events?.find((event) => event.id === eventId) ?? null;

  const submit = useCallback(
    async (token: string) => {
      const trimmed = token.trim();
      if (!eventId || !trimmed || locked.current) return;
      locked.current = true;
      setBusy(true);
      try {
        const response = await checkIn({ eventId, token: trimmed });
        setResult(response);
        void Haptics.notificationAsync(
          response.status === 'accepted'
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning,
        );
      } catch (error) {
        setResult({ status: 'invalid_ticket' });
        toast(error instanceof Error ? error.message : 'Check-in failed', 'error');
      } finally {
        setBusy(false);
      }
    },
    [checkIn, eventId, toast],
  );

  const reset = () => {
    locked.current = false;
    setResult(null);
    setManual('');
  };

  const onBarcodeScanned = (scan: BarcodeScanningResult) => {
    void submit(scan.data);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Check in attendees
          </Text>
        </View>
        <Text variant="bodySm" muted>
          Pick the event, then scan a member&apos;s ticket QR at the door.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}
        style={{ flexGrow: 0 }}
      >
        {(events ?? []).map((event) => (
          <FilterChip
            key={event.id}
            label={event.title}
            active={event.id === eventId}
            onPress={() => {
              setEventId(event.id);
              reset();
            }}
          />
        ))}
      </ScrollView>

      {!selected ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 }}>
          <View style={{ width: 68, height: 68, borderRadius: 22, backgroundColor: theme.colors.primaryFixed, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="qrCodeScanner" size={32} color="primary" />
          </View>
          <Text variant="titleMd" weight="bold" style={{ textAlign: 'center' }}>
            Choose an event to begin
          </Text>
          <Text variant="bodySm" muted style={{ textAlign: 'center', maxWidth: 260 }}>
            Tickets are validated against the event you select above.
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, marginHorizontal: 16, borderRadius: theme.radius.card, overflow: 'hidden', backgroundColor: theme.colors.terminal }}>
            {!permission ? null : !permission.granted ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
                <Icon name="cameraAlt" size={34} color="#FFFFFF" />
                <Text variant="labelLg" weight="semibold" style={{ color: '#FFFFFF', textAlign: 'center' }}>
                  Camera access needed
                </Text>
                <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: 240 }}>
                  Allow the camera to scan ticket QR codes.
                </Text>
                <Button label="Allow camera" onPress={() => void requestPermission()} compact />
              </View>
            ) : result ? (
              <ResultPanel result={result} onReset={reset} />
            ) : (
              <>
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing="back"
                  enableTorch={torch}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={busy ? undefined : onBarcodeScanned}
                />
                <View pointerEvents="none" style={styles.frameWrap}>
                  <View style={styles.frame} />
                </View>
                <View style={{ position: 'absolute', top: 12, right: 12 }}>
                  <IconButton
                    name={torch ? 'flashOn' : 'flashOff'}
                    onPress={() => setTorch((value) => !value)}
                    accessibilityLabel="Toggle torch"
                    color="onPrimary"
                    backgroundColor="overlay"
                  />
                </View>
                {busy ? (
                  <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(2,6,23,0.35)' }]}>
                    <ActivityIndicator color="#FFFFFF" />
                  </View>
                ) : null}
              </>
            )}
          </View>

          <View style={{ padding: 16, gap: 10 }}>
            <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Or enter code manually
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Input
                  value={manual}
                  onChangeText={setManual}
                  placeholder="GDGEPI-…"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  onSubmitEditing={() => void submit(manual)}
                />
              </View>
              <Button
                label="Check in"
                onPress={() => void submit(manual)}
                disabled={!manual.trim()}
                loading={busy && Boolean(manual.trim())}
                fullWidth={false}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function ResultPanel({ result, onReset }: { result: CheckInResult; onReset: () => void }) {
  const theme = useTheme();
  const presentation = STATUS_PRESENTATION[result.status];
  const bg = result.status === 'accepted' ? theme.colors.tertiaryFixed : theme.colors.surfaceContainerLow;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 }}>
      <PressableScale
        onPress={onReset}
        accessibilityLabel="Scan next attendee"
        style={{ width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceContainerLowest }}
      >
        <Icon name={presentation.icon} size={44} color={presentation.tone} />
      </PressableScale>
      <Text variant="headlineSm" weight="bold" style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
        {presentation.label}
      </Text>
      {result.attendee ? (
        <Text variant="bodyMd" muted style={{ textAlign: 'center' }}>
          {result.attendee.name}
          {result.attendee.headline ? ` · ${result.attendee.headline}` : ''}
        </Text>
      ) : null}
      {result.status === 'accepted' && result.pointsAwarded ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, backgroundColor: bg }}>
          <Icon name="stars" size={16} color="onTertiaryFixed" />
          <Text variant="labelMd" weight="semibold" color="onTertiaryFixed">
            +{result.pointsAwarded} XP awarded
          </Text>
        </View>
      ) : null}
      <Button label="Scan next" icon="qrCodeScanner" onPress={onReset} fullWidth={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  frameWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 232,
    height: 232,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
});
