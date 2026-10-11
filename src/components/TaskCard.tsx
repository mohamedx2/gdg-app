import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import type { ColorToken } from '@/theme/colors';
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

const ACTION: Record<TaskStatus, string> = {
  todo: 'Claim Task',
  'in-progress': 'Mark done',
  done: 'Done',
};

const STATUS_TONE: Record<TaskStatus, { bg: ColorToken; fg: ColorToken; label: string }> = {
  todo: { bg: 'surfaceContainerHigh', fg: 'onSurfaceVariant', label: 'AVAILABLE' },
  'in-progress': { bg: 'secondaryContainer', fg: 'onSecondaryContainer', label: 'IN PROGRESS' },
  done: { bg: 'tertiaryFixed', fg: 'onTertiaryFixedVariant', label: 'DONE' },
};

/** Micro-task card from the Stitch tasks board: tags, XP, due date and one CTA. */
export function TaskCard({ task, onAdvance, onOpenEvent, busy }: TaskCardProps) {
  const { taskPriority } = useTaxonomy();
  const done = task.status === 'done';
  const overdue = !done && !!task.dueAt && isPast(task.dueAt);
  const next = NEXT_STATUS[task.status];
  const tone = STATUS_TONE[task.status];
  const priority = taskPriority[task.priority];

  return (
    <YStack padding={16} gap={10} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant" opacity={done ? 0.85 : 1}>
      <XStack alignItems="center" justifyContent="space-between" gap={8}>
        <XStack gap={6} flexShrink={1} flexWrap="wrap">
          {task.eventTitle ? (
            <PressableScale onPress={onOpenEvent} disabled={!onOpenEvent} accessibilityLabel={`Open ${task.eventTitle}`}>
              <YStack paddingHorizontal={8} paddingVertical={3} borderRadius={8} backgroundColor="primaryFixed">
                <Text variant="codeSm" weight="bold" color="onPrimaryFixedVariant" numberOfLines={1}>
                  {task.eventTitle.toUpperCase().slice(0, 22)}
                </Text>
              </YStack>
            </PressableScale>
          ) : null}
          <YStack paddingHorizontal={8} paddingVertical={3} borderRadius={8} backgroundColor={tone.bg}>
            <Text variant="codeSm" weight="bold" color={tone.fg}>
              {tone.label}
            </Text>
          </YStack>
        </XStack>
        <XStack alignItems="center" gap={4} paddingHorizontal={8} paddingVertical={3} borderRadius={8} backgroundColor="inverseSurface">
          <Icon name="bolt" size={12} color="gold" />
          <Text variant="codeSm" weight="bold" color="inverseOnSurface">
            +{task.points} XP
          </Text>
        </XStack>
      </XStack>

      <YStack gap={4}>
        <Text variant="titleSm" weight="bold" style={done ? { textDecorationLine: 'line-through' } : undefined}>
          {task.title}
        </Text>
        {task.description ? (
          <Text variant="bodySm" muted numberOfLines={3}>
            {task.description}
          </Text>
        ) : null}
      </YStack>

      {task.assigneeName ? (
        <XStack alignItems="center" gap={8} padding={10} borderRadius={14} backgroundColor="surfaceContainerLow">
          <Avatar uri={task.assigneeAvatar} name={task.assigneeName} size={28} />
          <Text variant="labelMd" weight="bold" numberOfLines={1} style={{ flex: 1 }}>
            {task.assigneeName}
            {task.isMine ? ' (You)' : ''}
          </Text>
          {priority && task.priority !== 'low' ? (
            <Text variant="codeSm" weight="bold" color={priority.color}>
              {priority.label.toUpperCase()}
            </Text>
          ) : null}
        </XStack>
      ) : null}

      <XStack alignItems="center" justifyContent="space-between" gap={10}>
        {task.dueAt && !done ? (
          <XStack alignItems="center" gap={6} flexShrink={1}>
            <Icon name="schedule" size={14} color={overdue ? 'error' : 'onSurfaceVariant'} />
            <Text variant="codeSm" weight="bold" color={overdue ? 'error' : 'onSurfaceVariant'}>
              {overdue ? 'OVERDUE' : formatCountdown(task.dueAt).toUpperCase()}
            </Text>
          </XStack>
        ) : done ? (
          <Text variant="codeSm" weight="bold" color="tertiary">
            +{task.points} XP AWARDED
          </Text>
        ) : (
          <YStack />
        )}
        {next && onAdvance ? (
          <PressableScale onPress={() => onAdvance(next)} disabled={busy} accessibilityLabel={`${ACTION[task.status]}: ${task.title}`}>
            <XStack alignItems="center" gap={6} height={40} paddingHorizontal={14} borderRadius={12} backgroundColor={task.status === 'todo' ? 'primary' : 'surfaceContainerHigh'} opacity={busy ? 0.6 : 1}>
              <Text variant="labelMd" weight="bold" color={task.status === 'todo' ? 'onPrimary' : 'onSurface'}>
                {busy ? 'Saving…' : ACTION[task.status]}
              </Text>
              <Icon name={task.status === 'todo' ? 'arrowForward' : 'check'} size={15} color={task.status === 'todo' ? 'onPrimary' : 'onSurface'} />
            </XStack>
          </PressableScale>
        ) : null}
      </XStack>
    </YStack>
  );
}

export default TaskCard;
