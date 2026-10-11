import React from 'react';
import { View } from 'react-native';

import { Pill } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { TASK_PRIORITY, TASK_STATUS } from '@/constants/taxonomy';
import { useTheme } from '@/theme';
import { formatCountdown, isPast } from '@/utils/date';
import type { Task, TaskStatus } from '@/types';

interface TaskCardProps {
  task: Task;
  onAdvance?: (status: TaskStatus) => void;
  onOpenEvent?: () => void;
  busy?: boolean;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: null,
};

export function TaskCard({ task, onAdvance, onOpenEvent, busy }: TaskCardProps) {
  const theme = useTheme();
  const done = task.status === 'done';
  const meta = TASK_STATUS[task.status];
  const priority = TASK_PRIORITY[task.priority];
  const overdue = !done && !!task.dueAt && isPast(task.dueAt);
  const next = NEXT_STATUS[task.status];

  return (
    <View
      style={{
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: theme.colors.outlineVariant,
        padding: 14,
        gap: 12,
        opacity: done ? 0.7 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <PressableScale
          onPress={() => onAdvance?.(next ?? 'done')}
          disabled={!onAdvance || !next}
          accessibilityLabel={next ? `Move to ${TASK_STATUS[next].label}` : 'Completed'}
          style={{ paddingTop: 2 }}
        >
          <Icon name={done ? 'checkCircle' : 'radioButtonUnchecked'} size={24} color={done ? 'tertiary' : 'onSurfaceVariant'} />
        </PressableScale>

        <View style={{ flex: 1, gap: 6 }}>
          <Text
            variant="titleSm"
            weight="bold"
            style={done ? { textDecorationLine: 'line-through', opacity: 0.7 } : undefined}
          >
            {task.title}
          </Text>
          <Text variant="bodySm" muted numberOfLines={2}>
            {task.description}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Pill label={meta.label} color={meta.color} dot />
            {task.priority !== 'low' ? <Pill label={priority.label} color={priority.color} /> : null}
            {task.points > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Icon name="bolt" size={13} color="primary" />
                <Text variant="bodyXs" primary>
                  +{task.points}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {task.dueAt ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="schedule" size={13} color={overdue ? 'error' : 'onSurfaceVariant'} />
              <Text variant="bodyXs" color={overdue ? 'error' : 'onSurfaceVariant'}>
                {done ? 'Closed' : formatCountdown(task.dueAt)}
              </Text>
            </View>
          ) : null}
          {task.eventTitle ? (
            <PressableScale
              onPress={onOpenEvent}
              disabled={!onOpenEvent}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Icon name="event" size={13} color="secondary" />
              <Text variant="bodyXs" color="secondary" numberOfLines={1}>
                {task.eventTitle}
              </Text>
            </PressableScale>
          ) : null}
          {!task.isMine && task.assigneeName ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="person" size={13} color="onSurfaceVariant" />
              <Text variant="bodyXs" muted>
                {task.assigneeName}
              </Text>
            </View>
          ) : null}
        </View>

        {task.isMine && next ? (
          <PressableScale
            onPress={() => onAdvance?.(next)}
            disabled={busy}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: next === 'done' ? theme.colors.primary : theme.colors.secondaryContainer,
            }}
          >
            <Text variant="labelMd" weight="bold" color={next === 'done' ? 'onPrimary' : 'onSecondaryContainer'}>
              {busy ? '…' : next === 'done' ? 'Complete' : 'Start'}
            </Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}
