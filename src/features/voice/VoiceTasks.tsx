import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { SwipeableRow } from '@/components/animations';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { ModalSheet } from '@/components/ui/Modal';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Screen';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/features/auth/auth-provider';
import { useTaxonomy } from '@/hooks/use-content';
import { useEvents, useUpcomingEvents } from '@/hooks/use-events';
import { useCreateTask, useSetTaskStatus, useTasks } from '@/hooks/use-tasks';
import { useUiStore } from '@/stores/ui.store';
import type { Task, TaskPriority, TaskStatus } from '@/types';

type TaskFilter = 'active' | 'mine' | 'todo' | 'done';

const FILTERS: { key: TaskFilter; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'mine', label: 'Mine' },
  { key: 'todo', label: 'To do' },
  { key: 'done', label: 'Done' },
];

const DUE_OPTIONS = [
  { key: 'none', label: 'No date', days: 0 },
  { key: '2d', label: '2 days', days: 2 },
  { key: '1w', label: '1 week', days: 7 },
  { key: '2w', label: '2 weeks', days: 14 },
] as const;

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: null,
};

/** Tasks board segment body — extracted from the former `/tasks` screen. */
export function VoiceTasks() {
  const toast = useUiStore((state) => state.toast);
  const { can } = useAuth();
  const canView = can('tasks.view');
  const canManage = can('tasks.manage');
  const { data: tasks, isPending, isError, error, refetch } = useTasks();
  const setStatus = useSetTaskStatus();

  const [filter, setFilter] = useState<TaskFilter>('active');
  const [composerOpen, setComposerOpen] = useState(false);

  const counts = useMemo(() => {
    const all = tasks ?? [];
    return {
      todo: all.filter((task) => task.status === 'todo').length,
      inProgress: all.filter((task) => task.status === 'in-progress').length,
      done: all.filter((task) => task.status === 'done').length,
      mine: all.filter((task) => task.isMine && task.status !== 'done').length,
    };
  }, [tasks]);

  const visible = useMemo(() => {
    const all = tasks ?? [];
    switch (filter) {
      case 'mine':
        return all.filter((task) => task.isMine);
      case 'todo':
        return all.filter((task) => task.status === 'todo');
      case 'done':
        return all.filter((task) => task.status === 'done');
      default:
        return all.filter((task) => task.status !== 'done');
    }
  }, [tasks, filter]);

  /** Tasks bucketed by event, events ordered by their next due task; general tasks last. */
  const groups = useMemo(() => {
    const map = new Map<string, { key: string; title: string; eventId?: string; items: Task[] }>();
    for (const task of visible) {
      const key = task.eventId ?? 'general';
      if (!map.has(key)) {
        map.set(key, { key, title: task.eventTitle ?? 'General · chapter', eventId: task.eventId, items: [] });
      }
      map.get(key)!.items.push(task);
    }
    return [...map.values()].sort((a, b) => {
      if (!a.eventId !== !b.eventId) return a.eventId ? -1 : 1;
      return b.items.length - a.items.length;
    });
  }, [visible]);

  const advance = (taskId: string, status: TaskStatus) => {
    setStatus.mutate(
      { id: taskId, status },
      {
        onSuccess: (task) => {
          if (status === 'done') toast(`Task complete · +${task.points} pts`, 'success');
        },
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not update task', 'error'),
      },
    );
  };

  if (!canView) {
    return (
      <YStack alignItems="center" justifyContent="center" padding={32} gap={10}>
        <YStack width={56} height={56} borderRadius={18} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
          <Icon name="lock" size={26} color="onSurfaceVariant" />
        </YStack>
        <Text variant="titleMd" weight="bold">Core team only</Text>
        <Text variant="bodySm" muted style={{ textAlign: 'center' }}>
          Event tasks are handled by the core team. Want to help organise? Apply to join the core team.
        </Text>
      </YStack>
    );
  }

  if (isError) return <ErrorState message={error?.message} onRetry={() => refetch()} />;

  if (isPending && !tasks) {
    return (
      <YStack gap={12}>
        <Skeleton height={72} radius={14} />
        <Skeleton height={130} radius={14} />
        <Skeleton height={130} radius={14} />
      </YStack>
    );
  }

  return (
    <>
      <Reveal>
        <XStack gap={12}>
          <SummaryTile value={counts.todo} label="To do" icon="radioButtonUnchecked" color="onSurfaceVariant" />
          <SummaryTile value={counts.inProgress} label="In progress" icon="schedule" color="warning" />
          <SummaryTile value={counts.done} label="Done" icon="checkCircle" color="tertiary" />
        </XStack>
      </Reveal>

      <XStack gap={8} flexWrap="wrap">
        {FILTERS.map((item) => (
          <FilterChip key={item.key} label={item.label} active={filter === item.key} onPress={() => setFilter(item.key)} />
        ))}
      </XStack>

      <SectionHeader
        title={filter === 'done' ? 'Completed' : filter === 'mine' ? 'Your tasks' : 'By event'}
        subtitle={
          filter === 'mine' && counts.mine > 0 ? `${counts.mine} open assigned to you` : 'Every task belongs to an activity'
        }
        accent="primary"
      />
      <YStack gap={22}>
        {groups.length ? (
          groups.map((group) => {
            const done = group.items.filter((task) => task.status === 'done').length;
            return (
              <YStack key={group.key} gap={10}>
                <PressableScale
                  disabled={!group.eventId}
                  onPress={() => group.eventId && router.push(`/events/${group.eventId}` as never)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
                >
                  <YStack width={32} height={32} borderRadius={10} alignItems="center" justifyContent="center" backgroundColor={group.eventId ? 'primaryFixed' : 'surfaceContainerHigh'}>
                    <Icon name={group.eventId ? 'event' : 'groups'} size={16} color={group.eventId ? 'primary' : 'onSurfaceVariant'} />
                  </YStack>
                  <YStack flex={1}>
                    <Text variant="labelLg" weight="bold" numberOfLines={1}>{group.title}</Text>
                    <Text variant="bodyXs" muted>
                      {group.items.length} task{group.items.length > 1 ? 's' : ''} · {done} done
                    </Text>
                  </YStack>
                  {group.eventId ? <Icon name="chevronRight" size={18} color="secondary" /> : null}
                </PressableScale>
                {group.items.map((task) => {
                  const next = NEXT_STATUS[task.status];
                  return (
                    <SwipeableRow
                      key={task.id}
                      enabled={Boolean(next)}
                      onSwipeRight={next ? () => advance(task.id, next) : undefined}
                    >
                      <TaskCard
                        task={task}
                        onAdvance={(status) => advance(task.id, status)}
                        busy={setStatus.isPending && setStatus.variables?.id === task.id}
                      />
                    </SwipeableRow>
                  );
                })}
              </YStack>
            );
          })
        ) : (
          <YStack alignItems="center" gap={6} paddingVertical={32}>
            <Icon name="taskAlt" size={28} color="secondary" />
            <Text variant="bodySm" muted>
              Nothing here — you&apos;re all caught up.
            </Text>
          </YStack>
        )}
      </YStack>

      {canManage ? <Button label="Assign a task" icon="add" onPress={() => setComposerOpen(true)} /> : null}

      <TaskComposer visible={composerOpen} onClose={() => setComposerOpen(false)} />
    </>
  );
}

function SummaryTile({ value, label, icon, color }: { value: number; label: string; icon: 'radioButtonUnchecked' | 'schedule' | 'checkCircle'; color: 'onSurfaceVariant' | 'warning' | 'tertiary' }) {
  return (
    <YStack flex={1} gap={4} padding={12} borderRadius="base" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
      <Icon name={icon} size={16} color={color} />
      <Text variant="titleLg" weight="bold">
        {value}
      </Text>
      <Text variant="bodyXs" muted>
        {label}
      </Text>
    </YStack>
  );
}

function TaskComposer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const toast = useUiStore((state) => state.toast);
  const { taskPriority: TASK_PRIORITY } = useTaxonomy();
  const create = useCreateTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [due, setDue] = useState<(typeof DUE_OPTIONS)[number]['key']>('1w');
  const [points, setPoints] = useState('20');
  const [eventId, setEventId] = useState<string | undefined>(undefined);
  const { data: upcoming } = useUpcomingEvents(10);
  const { data: past } = useEvents({ scope: 'past', pageSize: 10 });
  const eventOptions = [...(upcoming ?? []), ...(past?.data ?? [])];

  const reset = () => {
    setEventId(undefined);
    setTitle('');
    setDescription('');
    setAssignee('');
    setPriority('medium');
    setDue('1w');
    setPoints('20');
  };

  const submit = () => {
    if (title.trim().length < 4 || description.trim().length < 6) {
      toast('Add a title and a short description', 'error');
      return;
    }
    const days = DUE_OPTIONS.find((item) => item.key === due)?.days ?? 0;
    create.mutate(
      {
        title,
        description,
        priority,
        points: Number(points) || 20,
        assigneeName: assignee.trim() || undefined,
        eventId,
        dueAt: days ? new Date(Date.now() + days * 86_400_000).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          toast('Task assigned', 'success');
          reset();
          onClose();
        },
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not assign task', 'error'),
      },
    );
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} title="Assign a task">
      <YStack gap={14}>
        <Input label="Task" value={title} onChangeText={setTitle} placeholder="What needs doing?" icon="taskAlt" maxLength={90} />

        <YStack gap={6}>
          <Text variant="labelMd" color="onSurfaceVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Details
          </Text>
          <Input value={description} onChangeText={setDescription} placeholder="Add a little context" maxLength={200} />
        </YStack>

        <YStack gap={8}>
          <Text variant="labelMd" color="onSurfaceVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Event
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <FilterChip label="General" active={!eventId} onPress={() => setEventId(undefined)} />
            {eventOptions.map((event) => (
              <FilterChip key={event.id} label={event.title} active={eventId === event.id} onPress={() => setEventId(event.id)} />
            ))}
          </ScrollView>
        </YStack>

        <Input label="Assign to" value={assignee} onChangeText={setAssignee} placeholder="Leave blank to assign yourself" icon="person" />

        <YStack gap={8}>
          <Text variant="labelMd" color="onSurfaceVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Priority
          </Text>
          <XStack gap={8} flexWrap="wrap">
            {(['low', 'medium', 'high'] as TaskPriority[]).map((key) => (
              <FilterChip key={key} label={TASK_PRIORITY[key].label} active={priority === key} onPress={() => setPriority(key)} />
            ))}
          </XStack>
        </YStack>

        <YStack gap={8}>
          <Text variant="labelMd" color="onSurfaceVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Due
          </Text>
          <XStack gap={8} flexWrap="wrap">
            {DUE_OPTIONS.map((item) => (
              <FilterChip key={item.key} label={item.label} active={due === item.key} onPress={() => setDue(item.key)} />
            ))}
          </XStack>
        </YStack>

        <Input label="Points on completion" value={points} onChangeText={setPoints} icon="bolt" keyboardType="number-pad" />

        <Button label="Assign task" icon="taskAlt" loading={create.isPending} onPress={submit} />
      </YStack>
    </ModalSheet>
  );
}

export default VoiceTasks;
