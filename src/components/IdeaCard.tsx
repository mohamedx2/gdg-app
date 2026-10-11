import React from 'react';
import { View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useTheme } from '@/theme';
import type { Idea, IdeaStatus } from '@/types';

/** Forward path on the roadmap; shipped and declined are terminal. */
const NEXT_STATUS: Partial<Record<IdeaStatus, IdeaStatus>> = {
  new: 'under_review',
  under_review: 'planned',
  planned: 'in_progress',
  in_progress: 'shipped',
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
  const theme = useTheme();
  const taxonomy = useTaxonomy();
  const category = taxonomy.ideaCategories[idea.category];
  const status = taxonomy.ideaStatus[idea.status];
  const shipped = idea.status === 'shipped';

  return (
    <View
      style={{
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: shipped ? theme.colors.tertiaryFixedDim : theme.colors.outlineVariant,
        overflow: 'hidden',
      }}
    >
      {shipped ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: theme.colors.tertiaryFixed }}>
          <Icon name="checkCircle" size={14} color="onTertiaryFixedVariant" />
          <Text variant="codeSm" weight="semibold" color="onTertiaryFixedVariant" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            You said, we did
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 12, padding: 14 }}>
        <VoteButton count={idea.votes} voted={idea.voted} disabled={voting} onPress={() => onVote(idea.id)} />

        <View style={{ flex: 1, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              <Pill label={status.label} color={status.color} dot />
              <Pill label={category.label} color={category.color} icon={category.icon as never} />
            </View>
          </View>

          <Text variant="titleSm" weight="bold">
            {idea.title}
          </Text>
          <Text variant="bodySm" muted numberOfLines={3}>
            {idea.body}
          </Text>

          {idea.response ? (
            <View style={{ gap: 4, padding: 10, borderRadius: theme.radius.base, backgroundColor: theme.colors.surfaceContainerLow }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="campaign" size={14} color="primary" />
                <Text variant="codeSm" weight="semibold" primary>
                  Club response
                </Text>
              </View>
              <Text variant="bodySm">{idea.response}</Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {idea.anonymous ? (
                <>
                  <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceContainerHigh }}>
                    <Icon name="visibilityOff" size={13} color="onSurfaceVariant" />
                  </View>
                  <Text variant="bodyXs" muted>
                    Anonymous
                  </Text>
                </>
              ) : (
                <>
                  <Avatar uri={idea.authorAvatar} name={idea.authorName ?? 'Member'} size={22} />
                  <Text variant="bodyXs" muted>
                    {idea.isMine ? 'You' : idea.authorName}
                  </Text>
                </>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {onUpgrade && NEXT_STATUS[idea.status] ? (
              <PressableScale
                onPress={() => onUpgrade(idea, NEXT_STATUS[idea.status]!)}
                disabled={upgrading}
                hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                accessibilityLabel={`Move to ${taxonomy.ideaStatus[NEXT_STATUS[idea.status]!].label}`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.radius.full, backgroundColor: theme.colors.tertiaryFixed, opacity: upgrading ? 0.6 : 1 }}
              >
                <Icon name="trendingUp" size={13} color="onTertiaryFixedVariant" />
                <Text variant="codeSm" weight="semibold" color="onTertiaryFixedVariant">
                  {taxonomy.ideaStatus[NEXT_STATUS[idea.status]!].label}
                </Text>
              </PressableScale>
            ) : null}
            {onManage ? (
              <PressableScale onPress={() => onManage(idea)} hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }} accessibilityLabel="Update idea status" style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.radius.full, backgroundColor: theme.colors.primaryFixed }}>
                <Icon name="edit" size={13} color="primary" />
                <Text variant="codeSm" weight="semibold" primary>
                  Update
                </Text>
              </PressableScale>
            ) : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function VoteButton({ count, voted, disabled, onPress }: { count: number; voted: boolean; disabled?: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={voted ? 'Remove upvote' : 'Upvote idea'}
      style={{
        width: 52,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingVertical: 8,
        borderRadius: theme.radius.base,
        borderWidth: 1,
        borderColor: voted ? theme.colors.primary : theme.colors.outlineVariant,
        backgroundColor: voted ? theme.colors.primaryFixed : theme.colors.surfaceContainerLow,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Icon name="thumbUp" size={18} color={voted ? 'primary' : 'onSurfaceVariant'} />
      <Text variant="labelMd" weight="bold" color={voted ? 'primary' : 'onSurface'}>
        {count}
      </Text>
    </PressableScale>
  );
}
