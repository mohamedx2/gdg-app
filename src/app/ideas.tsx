import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IdeaCard } from '@/components/IdeaCard';
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
import { IDEA_CATEGORIES, IDEA_STATUS, IDEA_STATUS_ORDER } from '@/constants/taxonomy';
import { useAuth } from '@/features/auth/auth-provider';
import { useCreateIdea, useIdeas, useToggleIdeaVote, useUpdateIdeaStatus } from '@/hooks/use-ideas';
import { useUiStore } from '@/stores/ui.store';
import { useTheme } from '@/theme';
import type { Idea, IdeaCategory, IdeaStatus } from '@/types';

const FILTERS = [
  { key: 'all', label: 'All ideas' },
  { key: 'trending', label: 'Trending' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'mine', label: 'Mine' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export default function IdeasScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);
  const { can } = useAuth();
  const canManage = can('ideas.manage');
  const { data: ideas, isPending, isError, error, refetch } = useIdeas();
  const toggleVote = useToggleIdeaVote();
  const updateStatus = useUpdateIdeaStatus();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [managing, setManaging] = useState<Idea | null>(null);

  const list = useMemo(() => {
    const all = ideas ?? [];
    if (filter === 'shipped') return all.filter((idea) => idea.status === 'shipped');
    if (filter === 'mine') return all.filter((idea) => idea.isMine);
    if (filter === 'trending') return [...all].sort((a, b) => b.votes - a.votes).slice(0, 10);
    return all;
  }, [ideas, filter]);

  const shipped = ideas?.filter((idea) => idea.status === 'shipped').length ?? 0;
  const voted = ideas?.filter((idea) => idea.voted).length ?? 0;

  const handleUpgrade = (idea: Idea, next: IdeaStatus) => {
    updateStatus.mutate(
      { id: idea.id, status: next },
      {
        onSuccess: () => toast(`Moved to ${IDEA_STATUS[next].label}`, 'success'),
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not update idea', 'error'),
      },
    );
  };

  const handleVote = (id: string) => {
    toggleVote.mutate(id, {
      onError: (err) => toast(err instanceof Error ? err.message : 'Could not vote', 'error'),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Idea box
          </Text>
        </View>
      </View>

      {isError ? (
        <View style={{ padding: 16 }}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </View>
      ) : isPending && !ideas ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={72} radius={14} />
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} height={140} radius={14} />
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
              <View style={{ borderRadius: theme.radius.card, padding: 16, backgroundColor: theme.colors.primaryFixed, gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="lightbulb" size={20} color="primary" />
                  <Text variant="titleSm" weight="bold" color="onPrimaryFixedVariant">
                    Shape the chapter
                  </Text>
                </View>
                <Text variant="bodySm" color="onPrimaryFixedVariant">
                  Suggest what we build next, upvote what matters, and see the club reply. You said, we did.
                </Text>
              </View>
            </Reveal>

            <Reveal delay={40}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <SummaryTile label="Ideas" value={ideas?.length ?? 0} icon="lightbulb" />
                <SummaryTile label="Shipped" value={shipped} icon="checkCircle" highlight={shipped > 0} />
                <SummaryTile label="Your votes" value={voted} icon="thumbUp" />
              </View>
            </Reveal>

            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {FILTERS.map((item) => (
                <FilterChip key={item.key} label={item.label} active={filter === item.key} onPress={() => setFilter(item.key)} />
              ))}
            </View>

            <View style={{ gap: 12 }}>
              <SectionHeader
                title={filter === 'shipped' ? 'You said, we did' : 'Ideas & suggestions'}
                subtitle={filter === 'shipped' ? 'Shipped, with the club’s response' : 'Most-upvoted first'}
                accent="tertiary"
              />
              {list.length ? (
                list.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onVote={handleVote}
                    voting={toggleVote.isPending && toggleVote.variables === idea.id}
                    onManage={canManage ? (target) => setManaging(target) : undefined}
                    onUpgrade={canManage ? handleUpgrade : undefined}
                    upgrading={updateStatus.isPending && updateStatus.variables?.id === idea.id}
                  />
                ))
              ) : (
                <Text variant="bodySm" muted>
                  Nothing here yet — share the first idea.
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 16 }}>
            <Button label="Share an idea" icon="add" onPress={() => setComposerOpen(true)} />
          </View>
        </>
      )}

      <IdeaComposer visible={composerOpen} onClose={() => setComposerOpen(false)} />
      <StatusSheet
        key={managing?.id ?? 'none'}
        idea={managing}
        saving={updateStatus.isPending}
        onClose={() => setManaging(null)}
        onSave={(status, response) => {
          if (!managing) return;
          updateStatus.mutate(
            { id: managing.id, status, response },
            {
              onSuccess: () => {
                toast('Idea updated', 'success');
                setManaging(null);
              },
              onError: (err) => toast(err instanceof Error ? err.message : 'Could not update idea', 'error'),
            },
          );
        }}
      />
    </View>
  );
}

function SummaryTile({ label, value, icon, highlight }: { label: string; value: number; icon: 'lightbulb' | 'checkCircle' | 'thumbUp'; highlight?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        borderRadius: theme.radius.card,
        backgroundColor: highlight ? theme.colors.tertiaryFixed : theme.colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: highlight ? theme.colors.tertiaryFixedDim : theme.colors.outlineVariant,
        gap: 4,
      }}
    >
      <Icon name={icon} size={18} color={highlight ? 'onTertiaryFixedVariant' : 'secondary'} />
      <Text variant="titleMd" weight="bold" color={highlight ? 'onTertiaryFixedVariant' : 'onSurface'}>
        {value}
      </Text>
      <Text variant="bodyXs" muted>
        {label}
      </Text>
    </View>
  );
}

function IdeaComposer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const toast = useUiStore((state) => state.toast);
  const create = useCreateIdea();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<IdeaCategory>('events');
  const [anonymous, setAnonymous] = useState(false);

  const reset = () => {
    setTitle('');
    setBody('');
    setCategory('events');
    setAnonymous(false);
  };

  const submit = () => {
    if (title.trim().length < 4 || body.trim().length < 10) {
      toast('Add a clear title and a bit more detail', 'error');
      return;
    }
    create.mutate(
      { title, body, category, anonymous },
      {
        onSuccess: () => {
          toast('Idea shared · +10 XP', 'success');
          reset();
          onClose();
        },
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not submit idea', 'error'),
      },
    );
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Share an idea">
      <View style={{ gap: 14 }}>
        <Input label="Title" value={title} onChangeText={setTitle} placeholder="A short, clear idea" icon="lightbulb" maxLength={80} />

        <View style={{ gap: 6 }}>
          <Text variant="labelMd" color="onSurfaceVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Details
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Why is this valuable? What problem does it solve?"
            placeholderTextColor={theme.colors.outline}
            multiline
            numberOfLines={4}
            style={{
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.outlineVariant,
              backgroundColor: theme.colors.surfaceContainerLowest,
              padding: 12,
              minHeight: 92,
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
            Category
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {(Object.keys(IDEA_CATEGORIES) as IdeaCategory[]).map((key) => (
              <FilterChip key={key} label={IDEA_CATEGORIES[key].label} icon={IDEA_CATEGORIES[key].icon as never} active={category === key} onPress={() => setCategory(key)} />
            ))}
          </View>
        </View>

        <PressableScale onPress={() => setAnonymous((value) => !value)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: theme.radius.base, backgroundColor: theme.colors.surfaceContainerLow }}>
          <Icon name="visibilityOff" size={20} color="onSurfaceVariant" />
          <View style={{ flex: 1 }}>
            <Text variant="labelLg" weight="medium">
              Post anonymously
            </Text>
            <Text variant="bodyXs" muted>
              Your name stays hidden from everyone
            </Text>
          </View>
          <Switch value={anonymous} onValueChange={setAnonymous} trackColor={{ true: theme.colors.primaryContainer, false: theme.colors.surfaceContainerHighest }} />
        </PressableScale>

        <Button label="Submit idea" icon="check" loading={create.isPending} onPress={submit} />
      </View>
    </ModalSheet>
  );
}

function StatusSheet({
  idea,
  saving,
  onClose,
  onSave,
}: {
  idea: Idea | null;
  saving: boolean;
  onClose: () => void;
  onSave: (status: IdeaStatus, response: string) => void;
}) {
  const theme = useTheme();
  const [status, setStatus] = useState<IdeaStatus>(idea?.status ?? 'new');
  const [response, setResponse] = useState(idea?.response ?? '');

  return (
    <ModalSheet visible={!!idea} onClose={onClose} title="Update idea">
      <View style={{ gap: 14 }}>
        <Text variant="bodySm" muted numberOfLines={2}>
          {idea?.title}
        </Text>

        <View style={{ gap: 8 }}>
          <Text variant="labelMd" color="onSurfaceVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Roadmap status
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {IDEA_STATUS_ORDER.map((key) => (
              <FilterChip key={key} label={IDEA_STATUS[key].label} icon={IDEA_STATUS[key].icon as never} active={status === key} onPress={() => setStatus(key)} />
            ))}
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Text variant="labelMd" color="onSurfaceVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Official response
          </Text>
          <TextInput
            value={response}
            onChangeText={setResponse}
            placeholder="Tell members what happened (optional)"
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

        <Button label="Save update" icon="check" loading={saving} onPress={() => onSave(status, response)} />
      </View>
    </ModalSheet>
  );
}
