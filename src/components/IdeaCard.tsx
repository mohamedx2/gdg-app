import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import type { ColorToken } from '@/theme/colors';
import type { Idea, IdeaStatus } from '@/types';
import { formatRelativeTime } from '@/utils/date';

/** Forward path on the roadmap; shipped and declined are terminal. */
const NEXT_STATUS: Partial<Record<IdeaStatus, IdeaStatus>> = {
  new: 'under_review',
  under_review: 'planned',
  planned: 'in_progress',
  in_progress: 'shipped',
};

/** Status badge tone, matching the Stitch idea feed. */
const STATUS_TONE: Record<IdeaStatus, { bg: ColorToken; fg: ColorToken; icon?: 'checkCircle' | 'trendingUp' }> = {
  new: { bg: 'surfaceContainerHigh', fg: 'onSurfaceVariant' },
  under_review: { bg: 'surfaceContainerHigh', fg: 'onSurfaceVariant' },
  planned: { bg: 'primaryFixed', fg: 'onPrimaryFixedVariant' },
  in_progress: { bg: 'primaryFixed', fg: 'onPrimaryFixedVariant', icon: 'trendingUp' },
  shipped: { bg: 'tertiaryContainer', fg: 'onTertiaryContainer', icon: 'checkCircle' },
  declined: { bg: 'surfaceContainerHigh', fg: 'outline' },
};

interface IdeaCardProps {
  idea: Idea;
  onVote: (id: string) => void;
  onManage?: (idea: Idea) => void;
  /** Core team: advance the idea one step along the roadmap. */
  onUpgrade?: (idea: Idea, next: IdeaStatus) => void;
  upgrading?: boolean;
  voting?: boolean;
}

export function IdeaCard({ idea, onVote, onManage, onUpgrade, upgrading, voting }: IdeaCardProps) {
  const { ideaCategories, ideaStatus } = useTaxonomy();
  const category = ideaCategories[idea.category];
  const status = ideaStatus[idea.status];
  const tone = STATUS_TONE[idea.status];
  const next = NEXT_STATUS[idea.status];
  const author = idea.anonymous ? 'Anonymous' : idea.isMine ? 'You' : idea.authorName ?? 'Member';

  return (
    <YStack padding={16} gap={12} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
      <XStack alignItems="center" justifyContent="space-between" gap={8}>
        <YStack paddingHorizontal={8} paddingVertical={3} borderRadius={8} backgroundColor="primaryFixed">
          <Text variant="codeSm" weight="bold" color="onPrimaryFixedVariant">
            {(category?.label ?? idea.category).toUpperCase()}
          </Text>
        </YStack>
        <XStack alignItems="center" gap={4} paddingHorizontal={8} paddingVertical={3} borderRadius={8} backgroundColor={tone.bg}>
          {tone.icon ? <Icon name={tone.icon} size={12} color={tone.fg} /> : null}
          <Text variant="codeSm" weight="bold" color={tone.fg}>
            {(status?.label ?? idea.status).toUpperCase()}
          </Text>
        </XStack>
      </XStack>

      <XStack alignItems="center" gap={10}>
        {idea.anonymous ? (
          <YStack width={32} height={32} borderRadius={16} alignItems="center" justifyContent="center" backgroundColor="surfaceContainerHigh">
            <Icon name="visibilityOff" size={16} color="onSurfaceVariant" />
          </YStack>
        ) : (
          <Avatar uri={idea.authorAvatar} name={author} size={32} />
        )}
        <YStack flex={1}>
          <Text variant="labelLg" weight="bold" numberOfLines={1}>
            {author}
          </Text>
          <Text variant="codeSm" muted>
            {formatRelativeTime(idea.createdAt)}
          </Text>
        </YStack>
      </XStack>

      <YStack gap={4}>
        <Text variant="titleMd" weight="bold">
          {idea.title}
        </Text>
        <Text variant="bodySm" muted numberOfLines={3}>
          {idea.body}
        </Text>
      </YStack>

      {idea.response ? (
        <YStack gap={4} padding={12} borderRadius={14} backgroundColor="surfaceContainerLow" borderLeftWidth={3} borderLeftColor="tertiary">
          <XStack alignItems="center" gap={6}>
            <Icon name="campaign" size={14} color="tertiary" />
            <Text variant="codeSm" weight="bold" color="tertiary">
              {idea.status === 'shipped' ? 'YOU SAID, WE DID' : 'CLUB RESPONSE'}
            </Text>
          </XStack>
          <Text variant="bodySm">{idea.response}</Text>
        </YStack>
      ) : null}

      <XStack alignItems="center" gap={8}>
        <PressableScale onPress={() => onVote(idea.id)} disabled={voting} accessibilityLabel={idea.voted ? 'Remove upvote' : 'Upvote idea'} selected={idea.voted}>
          <XStack alignItems="center" gap={6} height={40} paddingHorizontal={14} borderRadius="full" backgroundColor={idea.voted ? 'primary' : 'surfaceContainerHigh'} opacity={voting ? 0.6 : 1}>
            <Icon name="thumbUp" size={16} color={idea.voted ? 'onPrimary' : 'onSurface'} />
            <Text variant="codeSm" weight="bold" color={idea.voted ? 'onPrimary' : 'onSurface'}>
              {idea.votes}
            </Text>
          </XStack>
        </PressableScale>
        <YStack flex={1} />
        {onUpgrade && next ? (
          <PressableScale
            onPress={() => onUpgrade(idea, next)}
            disabled={upgrading}
            hitSlop={{ top: 6, bottom: 6 }}
            accessibilityLabel={`Move to ${ideaStatus[next]?.label ?? next}`}
          >
            <XStack alignItems="center" gap={4} height={36} paddingHorizontal={12} borderRadius="full" backgroundColor="tertiaryFixed" opacity={upgrading ? 0.6 : 1}>
              <Icon name="trendingUp" size={14} color="onTertiaryFixedVariant" />
              <Text variant="codeSm" weight="bold" color="onTertiaryFixedVariant">
                {ideaStatus[next]?.label ?? next}
              </Text>
            </XStack>
          </PressableScale>
        ) : null}
        {onManage ? (
          <PressableScale onPress={() => onManage(idea)} hitSlop={{ top: 6, bottom: 6 }} accessibilityLabel="Update idea status">
            <XStack alignItems="center" gap={4} height={36} paddingHorizontal={12} borderRadius="full" backgroundColor="primaryFixed">
              <Icon name="edit" size={14} color="onPrimaryFixedVariant" />
              <Text variant="codeSm" weight="bold" color="onPrimaryFixedVariant">
                Update
              </Text>
            </XStack>
          </PressableScale>
        ) : null}
      </XStack>
    </YStack>
  );
}

export default IdeaCard;
