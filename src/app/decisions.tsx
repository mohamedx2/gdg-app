import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DecisionCard } from '@/components/DecisionCard';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { ModalSheet } from '@/components/ui/Modal';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Screen';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { useUiConfig } from '@/hooks/use-content';
import { useCreateDecision, useDecisions, useVoteDecision } from '@/hooks/use-decisions';
import { useUiStore } from '@/stores/ui.store';
import { useTheme } from '@/theme';

export default function DecisionsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);
  const { can } = useAuth();
  const canVote = can('decisions.vote');
  const { data: decisions, isPending, isError, error, refetch } = useDecisions();
  const vote = useVoteDecision();

  const [composerOpen, setComposerOpen] = useState(false);

  const open = decisions?.filter((item) => item.status === 'open') ?? [];
  const closed = decisions?.filter((item) => item.status === 'closed') ?? [];

  const handleVote = (id: string, optionId: string) => {
    vote.mutate(
      { id, optionId },
      {
        onSuccess: () => toast('Vote recorded', 'success'),
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not record vote', 'error'),
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Decisions
          </Text>
        </View>
      </View>

      {isError ? (
        <View style={{ padding: 16 }}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </View>
      ) : isPending && !decisions ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={80} radius={14} />
          {[1, 2].map((key) => (
            <Skeleton key={key} height={220} radius={14} />
          ))}
        </View>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <Reveal>
              <View style={{ borderRadius: theme.radius.card, padding: 16, backgroundColor: theme.colors.secondaryFixed, gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="howToVote" size={20} color="secondary" />
                  <Text variant="titleSm" weight="bold" color="onSecondaryFixedVariant">
                    {canVote ? 'Core team · one ballot each' : 'Decided by the core team'}
                  </Text>
                </View>
                <Text variant="bodySm" color="onSecondaryFixedVariant">
                  {canVote
                    ? 'Decisions that shape the chapter are voted by the core team. You can change your ballot while a vote is open.'
                    : 'The core team votes on chapter decisions. Follow what is being decided and see the outcomes here — share your own suggestions in the Idea box.'}
                </Text>
              </View>
            </Reveal>

            <View style={{ gap: 12 }}>
              <SectionHeader title="Open votes" subtitle={canVote ? 'Cast your ballot before it closes' : 'Being decided now'} accent="primary" />
              {open.length ? (
                open.map((decision) => (
                  <DecisionCard
                    key={decision.id}
                    decision={decision}
                    onVote={(optionId) => handleVote(decision.id, optionId)}
                    voting={vote.isPending && vote.variables?.id === decision.id}
                    canVote={canVote}
                  />
                ))
              ) : (
                <Text variant="bodySm" muted>
                  No open votes right now.
                </Text>
              )}
            </View>

            {closed.length > 0 ? (
              <View style={{ gap: 12 }}>
                <SectionHeader title="Results" subtitle="Closed votes and outcomes" accent="tertiary" />
                {closed.map((decision) => (
                  <DecisionCard key={decision.id} decision={decision} onVote={() => undefined} voting={false} canVote={canVote} />
                ))}
              </View>
            ) : null}
          </ScrollView>

          {can('decisions.create') ? (
            <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 16 }}>
              <Button label="Open a new vote" icon="add" onPress={() => setComposerOpen(true)} />
            </View>
          ) : null}
        </>
      )}

      <DecisionComposer visible={composerOpen} onClose={() => setComposerOpen(false)} />
    </View>
  );
}

function DecisionComposer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const toast = useUiStore((state) => state.toast);
  const { decisionDurations: DURATIONS } = useUiConfig();
  const create = useCreateDecision();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]['key']>('1w');
  const [quorum, setQuorum] = useState('50');
  const [resultsVisible, setResultsVisible] = useState(true);
  const [important, setImportant] = useState(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setOptions(['', '']);
    setDuration('1w');
    setQuorum('50');
    setResultsVisible(true);
    setImportant(false);
  };

  const setOption = (index: number, value: string) =>
    setOptions((prev) => prev.map((item, i) => (i === index ? value : item)));

  const submit = () => {
    const cleaned = options.map((option) => option.trim()).filter(Boolean);
    if (title.trim().length < 4 || description.trim().length < 10 || cleaned.length < 2) {
      toast('Add a title, description and at least two options', 'error');
      return;
    }
    const days = DURATIONS.find((item) => item.key === duration)?.days ?? 7;
    const closesAt = new Date(Date.now() + days * 86_400_000).toISOString();
    create.mutate(
      {
        title,
        description,
        options: cleaned,
        closesAt,
        quorum: Number(quorum) || 50,
        resultsVisible,
        important,
      },
      {
        onSuccess: () => {
          toast('Vote opened', 'success');
          reset();
          onClose();
        },
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not open vote', 'error'),
      },
    );
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Open a new vote">
      <View style={{ gap: 14 }}>
        <Input label="Question" value={title} onChangeText={setTitle} placeholder="What are we deciding?" icon="howToVote" maxLength={100} />

        <View style={{ gap: 6 }}>
          <Text variant="labelMd" color="onSurfaceVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Context
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Give the core team the background they need"
            placeholderTextColor={theme.colors.outline}
            multiline
            numberOfLines={3}
            style={{
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.outlineVariant,
              backgroundColor: theme.colors.surfaceContainerLowest,
              padding: 12,
              minHeight: 76,
              color: theme.colors.onSurface,
              fontSize: 14,
              lineHeight: 20,
              fontFamily: theme.typography.bodyMd.fontFamily,
              textAlignVertical: 'top',
            }}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text variant="labelMd" color="onSurfaceVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Options
          </Text>
          {options.map((option, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Input value={option} onChangeText={(value) => setOption(index, value)} placeholder={`Option ${index + 1}`} />
              </View>
              {options.length > 2 ? (
                <PressableScale
                  onPress={() => setOptions((prev) => prev.filter((_, i) => i !== index))}
                  accessibilityLabel="Remove option"
                  style={{ width: 36, height: 48, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="delete" size={18} color="error" />
                </PressableScale>
              ) : null}
            </View>
          ))}
          {options.length < 6 ? (
            <PressableScale
              onPress={() => setOptions((prev) => [...prev, ''])}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 6 }}
            >
              <Icon name="add" size={16} color="primary" />
              <Text variant="labelMd" primary>
                Add option
              </Text>
            </PressableScale>
          ) : null}
        </View>

        <View style={{ gap: 8 }}>
          <Text variant="labelMd" color="onSurfaceVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Closes in
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {DURATIONS.map((item) => (
              <FilterChip key={item.key} label={item.label} active={duration === item.key} onPress={() => setDuration(item.key)} />
            ))}
          </View>
        </View>

        <Input label="Quorum" value={quorum} onChangeText={setQuorum} placeholder="Minimum votes" icon="groups" keyboardType="number-pad" />

        <View style={{ gap: 8 }}>
          <ToggleRow
            icon="visibility"
            label="Show live results"
            hint="Everyone sees partial results while voting"
            value={resultsVisible}
            onChange={setResultsVisible}
          />
          <ToggleRow
            icon="flag"
            label="Mark as important"
            hint="Pin it and badge it as a key decision"
            value={important}
            onChange={setImportant}
          />
        </View>

        <Button label="Open vote" icon="howToVote" loading={create.isPending} onPress={submit} />
      </View>
    </ModalSheet>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: 'visibility' | 'flag';
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={() => onChange(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: theme.radius.base, backgroundColor: theme.colors.surfaceContainerLow }}
    >
      <Icon name={icon} size={20} color="onSurfaceVariant" />
      <View style={{ flex: 1 }}>
        <Text variant="labelLg" weight="medium">
          {label}
        </Text>
        <Text variant="bodyXs" muted>
          {hint}
        </Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.colors.primaryContainer, false: theme.colors.surfaceContainerHighest }} />
    </PressableScale>
  );
}
