import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FilterChip, Pill } from '@/components/ui/Chip';
import { Icon, iconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTaxonomy, useUiConfig } from '@/hooks/use-content';
import { useAuth } from '@/features/auth/auth-provider';
import {
  useMyPresence,
  usePresenceOverview,
  usePresenceRoster,
  useStopPresence,
  useUpdatePresence,
} from '@/hooks/use-presence';
import { useUiStore } from '@/stores/ui.store';
import type { MyPresence, PresenceMember, PresenceOverview, PresenceStatus, UpdatePresenceInput } from '@/types';

type DraftScope = 'event' | 'hour' | 'open';

export default function PresenceScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ eventId?: string }>();
  const eventId = params.eventId;
  const { isOrganizer } = useAuth();
  const toast = useUiStore((state) => state.toast);

  const { data: mine, isPending } = useMyPresence();
  const { data: overview } = usePresenceOverview();
  const { data: roster } = usePresenceRoster(isOrganizer);
  const update = useUpdatePresence();
  const stop = useStopPresence();

  const [draftStatus, setDraftStatus] = useState<PresenceStatus>('on_campus');
  const [draftEta, setDraftEta] = useState<number | undefined>();
  const [draftScope, setDraftScope] = useState<DraftScope>(eventId ? 'event' : 'hour');

  const sharing = !!mine && mine.scope !== 'none';

  const commit = (patch: Partial<UpdatePresenceInput>) => {
    if (!mine) return;
    update.mutate(
      {
        status: mine.status,
        scope: mine.scope,
        eventId: mine.eventId,
        windowLabel: mine.windowLabel,
        expiresAt: mine.expiresAt,
        ghost: mine.ghost,
        etaMins: mine.etaMins,
        shareWithTeam: mine.shareWithTeam,
        ...patch,
      },
      { onError: (error) => toast(error instanceof Error ? error.message : 'Could not update presence', 'error') },
    );
  };

  const onShare = () => {
    update.mutate(
      {
        status: draftStatus,
        scope: draftScope === 'event' ? 'event' : 'window',
        eventId: draftScope === 'event' ? eventId : undefined,
        windowLabel: draftScope === 'hour' ? 'for the next hour' : 'until you stop',
        expiresAt: draftScope === 'hour' ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : undefined,
        etaMins: draftStatus === 'in_transit' ? (draftEta ?? 10) : undefined,
        ghost: false,
        shareWithTeam: true,
      },
      {
        onSuccess: () => toast('You’re sharing your status', 'success'),
        onError: (error) => toast(error instanceof Error ? error.message : 'Could not share', 'error'),
      },
    );
  };

  const onStop = () => {
    stop.mutate(undefined, {
      onSuccess: () => toast('Sharing stopped · your status was cleared', 'info'),
      onError: () => toast('Could not stop sharing', 'error'),
    });
  };

  const changeStatus = (status: PresenceStatus) => {
    commit({ status, etaMins: status === 'in_transit' ? (draftEta ?? mine?.etaMins ?? 10) : undefined });
  };

  return (
    <YStack flex={1} backgroundColor="background">
      <YStack paddingTop={insets.top + 8} paddingHorizontal={16}>
        <XStack alignItems="center" gap={4}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Who’s around
          </Text>
        </XStack>
      </YStack>

      {isPending && !mine ? (
        <YStack padding={16} gap={12}>
          <Skeleton height={150} radius={14} />
          <Skeleton height={120} radius={14} />
        </YStack>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Reveal>
            <PrivacyNote />
          </Reveal>

          {sharing && mine ? (
            <SharingCard
              mine={mine}
              onChangeStatus={changeStatus}
              onSetEta={(etaMins) => {
                setDraftEta(etaMins);
                commit({ etaMins });
              }}
              onToggleGhost={() => commit({ ghost: !mine.ghost })}
              onStop={onStop}
              stopping={stop.isPending}
              busy={update.isPending}
            />
          ) : (
            <ShareCard
              status={draftStatus}
              eta={draftEta}
              scope={draftScope}
              hasEvent={Boolean(eventId)}
              onChangeStatus={(status) => {
                setDraftStatus(status);
                if (status !== 'in_transit') setDraftEta(undefined);
              }}
              onChangeEta={setDraftEta}
              onChangeScope={setDraftScope}
              onShare={onShare}
              sharing={update.isPending}
            />
          )}

          <YStack gap={12}>
            <SectionHeader title="Campus right now" subtitle="Crowd-level — nobody’s exact spot" accent="tertiary" />
            <OverviewGrid overview={overview} />
          </YStack>

          <YStack gap={12}>
            <SectionHeader
              title={isOrganizer ? 'Your core team' : 'Your view'}
              subtitle={isOrganizer ? 'Members sharing their status with the team' : 'Privacy-scoped by design'}
              accent="primary"
            />
            {isOrganizer ? <Roster list={roster} /> : <MemberPrivacyNote />}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  );
}

function PrivacyNote() {
  return (
    <XStack
      alignItems="center"
      gap={10}
      padding={12}
      borderRadius="card"
      backgroundColor="surfaceContainerLow"
      borderWidth={1}
      borderColor="outlineVariant"
    >
      <YStack width={34} height={34} borderRadius={10} backgroundColor="tertiaryFixed" alignItems="center" justifyContent="center">
        <Icon name="shield" size={18} color="onTertiaryFixed" />
      </YStack>
      <Text variant="bodySm" muted style={{ flex: 1 }}>
        Sharing is off by default and always opt-in. You share a coarse status — never an exact location — and it deletes
        itself when it ends.
      </Text>
    </XStack>
  );
}

function SharingCard({
  mine,
  busy,
  stopping,
  onChangeStatus,
  onSetEta,
  onToggleGhost,
  onStop,
}: {
  mine: MyPresence;
  busy: boolean;
  stopping: boolean;
  onChangeStatus: (status: PresenceStatus) => void;
  onSetEta: (etaMins: number) => void;
  onToggleGhost: () => void;
  onStop: () => void;
}) {
  const { presenceStatus: PRESENCE_STATUS, presenceOrder: PRESENCE_ORDER } = useTaxonomy();
  const { presenceEtaOptions: ETA_OPTIONS } = useUiConfig();
  const meta = PRESENCE_STATUS[mine.status];

  return (
    <YStack
      padding={16}
      borderRadius="card"
      backgroundColor="surfaceContainerLowest"
      borderWidth={1}
      borderColor="outlineVariant"
      gap={14}
    >
      <XStack alignItems="center" gap={8} flexWrap="wrap">
        <Pill label={mine.ghost ? 'Ghost mode' : 'Sharing live'} color={mine.ghost ? 'secondary' : 'success'} dot />
        <Pill label={meta.label} color={meta.color} icon={iconName(meta.icon)} />
      </XStack>

      <XStack alignItems="center" gap={8}>
        <Icon name={mine.ghost ? 'visibilityOff' : 'nearMe'} size={16} color="primary" />
        <Text variant="bodySm" muted style={{ flex: 1 }}>
          {scopeText(mine)}
        </Text>
      </XStack>

      <Picker label="Update your status">
        {PRESENCE_ORDER.map((status) => {
          const statusMeta = PRESENCE_STATUS[status];
          return (
            <FilterChip
              key={status}
              label={statusMeta.label}
              icon={iconName(statusMeta.icon)}
              active={mine.status === status}
              onPress={() => onChangeStatus(status)}
            />
          );
        })}
      </Picker>

      {mine.status === 'in_transit' && !mine.ghost ? (
        <Picker label="ETA for the organisers">
          {ETA_OPTIONS.map((eta) => (
            <FilterChip key={eta} label={`${eta} min`} active={mine.etaMins === eta} onPress={() => onSetEta(eta)} />
          ))}
        </Picker>
      ) : null}

      <XStack gap={8} flexWrap="wrap">
        <FilterChip
          label="Ghost mode"
          icon="visibilityOff"
          active={mine.ghost}
          onPress={onToggleGhost}
        />
      </XStack>

      <Button label="Stop sharing" icon="logout" variant="outline" loading={stopping} disabled={busy} onPress={onStop} />
    </YStack>
  );
}

function ShareCard({
  status,
  eta,
  scope,
  hasEvent,
  sharing,
  onChangeStatus,
  onChangeEta,
  onChangeScope,
  onShare,
}: {
  status: PresenceStatus;
  eta?: number;
  scope: DraftScope;
  hasEvent: boolean;
  sharing: boolean;
  onChangeStatus: (status: PresenceStatus) => void;
  onChangeEta: (eta: number) => void;
  onChangeScope: (scope: DraftScope) => void;
  onShare: () => void;
}) {
  const { presenceStatus: PRESENCE_STATUS, presenceOrder: PRESENCE_ORDER } = useTaxonomy();
  const { presenceEtaOptions: ETA_OPTIONS } = useUiConfig();
  const meta = PRESENCE_STATUS[status];

  return (
    <YStack
      padding={16}
      borderRadius="card"
      backgroundColor="surfaceContainerLowest"
      borderWidth={1}
      borderColor="outlineVariant"
      gap={14}
    >
      <XStack alignItems="center" gap={8}>
        <Icon name="myLocation" size={18} color="primary" />
        <Text variant="titleSm" weight="bold">
          Share your status
        </Text>
      </XStack>

      <Picker label="Where are you?">
        {PRESENCE_ORDER.map((value) => {
          const statusMeta = PRESENCE_STATUS[value];
          return (
            <FilterChip
              key={value}
              label={statusMeta.label}
              icon={iconName(statusMeta.icon)}
              active={status === value}
              onPress={() => onChangeStatus(value)}
            />
          );
        })}
      </Picker>

      {status === 'in_transit' ? (
        <Picker label="ETA for the organisers">
          {ETA_OPTIONS.map((value) => (
            <FilterChip key={value} label={`${value} min`} active={(eta ?? 10) === value} onPress={() => onChangeEta(value)} />
          ))}
        </Picker>
      ) : null}

      <Picker label="For how long?">
        {hasEvent ? (
          <FilterChip label="This event" icon="event" active={scope === 'event'} onPress={() => onChangeScope('event')} />
        ) : null}
        <FilterChip label="An hour" icon="schedule" active={scope === 'hour'} onPress={() => onChangeScope('hour')} />
        <FilterChip label="Until I stop" icon="timer" active={scope === 'open'} onPress={() => onChangeScope('open')} />
      </Picker>

      <XStack alignItems="center" gap={8}>
        <Icon name={iconName(meta.icon)} size={15} color="onSurfaceVariant" />
        <Text variant="codeSm" muted style={{ flex: 1 }}>
          Only a label is shared — “{meta.label}” — not your GPS.
        </Text>
      </XStack>

      <Button label="Share my status" icon="nearMe" loading={sharing} onPress={onShare} />
    </YStack>
  );
}

function Picker({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <YStack gap={8}>
      <Text variant="codeSm" muted style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </Text>
      <XStack flexWrap="wrap" gap={8}>{children}</XStack>
    </YStack>
  );
}

function OverviewGrid({ overview }: { overview?: PresenceOverview }) {
  const tiles: { key: keyof PresenceOverview; label: string; icon: string; color: 'primary' | 'tertiary' | 'warning' | 'secondary' }[] = [
    { key: 'onCampus', label: 'On campus', icon: 'locationCity', color: 'primary' },
    { key: 'atVenue', label: 'At a venue', icon: 'meetingRoom', color: 'tertiary' },
    { key: 'inTransit', label: 'On the way', icon: 'directionsCar', color: 'warning' },
    { key: 'clubRoom', label: 'Club room', icon: 'home', color: 'secondary' },
  ];

  return (
    <XStack flexWrap="wrap" gap={10}>
      {tiles.map((tile) => (
        <YStack
          key={tile.key}
          flexBasis="47%"
          flexGrow={1}
          padding={14}
          borderRadius="card"
          backgroundColor="surfaceContainerLow"
          gap={8}
        >
          <YStack width={36} height={36} borderRadius={10} backgroundColor="surfaceContainerHigh" alignItems="center" justifyContent="center">
            <Icon name={iconName(tile.icon)} size={18} color={tile.color} />
          </YStack>
          <Text variant="headlineSm" weight="bold">
            {overview ? overview[tile.key] : '—'}
          </Text>
          <Text variant="bodySm" muted>
            {tile.label}
          </Text>
        </YStack>
      ))}
    </XStack>
  );
}

function Roster({ list }: { list?: PresenceMember[] }) {
  const { presenceStatus: PRESENCE_STATUS } = useTaxonomy();
  if (!list || !list.length) {
    return (
      <Text variant="bodySm" muted>
        No one from the core team is sharing right now.
      </Text>
    );
  }
  return (
    <YStack gap={8}>
      {list.map((member) => {
        const meta = PRESENCE_STATUS[member.status];
        return (
          <XStack
            key={member.id}
            alignItems="center"
            gap={12}
            padding={12}
            borderRadius="card"
            backgroundColor="surfaceContainerLowest"
            borderWidth={1}
            borderColor="outlineVariant"
          >
            <Avatar uri={member.avatar} name={member.name} size={40} />
            <YStack flex={1} gap={2}>
              <Text variant="labelLg" weight="semibold" numberOfLines={1}>
                {member.name}
              </Text>
              <Text variant="bodySm" muted numberOfLines={1}>
                {member.venue ?? meta.label}
                {member.etaMins != null ? ` · ${member.etaMins} min away` : ''}
              </Text>
            </YStack>
            <Pill label={meta.label} color={meta.color} icon={iconName(meta.icon)} />
          </XStack>
        );
      })}
    </YStack>
  );
}

function MemberPrivacyNote() {
  return (
    <XStack
      alignItems="center"
      gap={10}
      padding={12}
      borderRadius="card"
      backgroundColor="surfaceContainerLow"
    >
      <Icon name="lock" size={18} color="onSurfaceVariant" />
      <Text variant="bodySm" muted style={{ flex: 1 }}>
        You see a crowd-level view only. Individual statuses are reserved for the core team, so members can never track
        each other’s live position.
      </Text>
    </XStack>
  );
}

function scopeText(mine: MyPresence): string {
  if (mine.ghost) {
    return mine.scope === 'event'
      ? 'Paused for this event · resumes if you turn ghost mode off'
      : 'Paused · your window keeps running but no one can see you';
  }
  if (mine.scope === 'event') return 'Shared for this event · ends when the event does';
  if (mine.expiresAt) return `Shared ${mine.windowLabel ?? 'for a limited time'}`;
  return `Shared ${mine.windowLabel ?? 'until you stop'}`;
}
