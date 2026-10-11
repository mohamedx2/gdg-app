import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { formatCountdown, formatTime, parseDate } from '@/utils/date';
import { percentage } from '@/utils/format';
import type { Decision, DecisionOption } from '@/types';

interface DecisionCardProps {
  decision: Decision;
  onVote: (optionId: string) => void;
  voting?: boolean;
  /** False for regular members: decisions are voted by the core team. */
  canVote?: boolean;
}

/** Vote card from the Stitch decision detail: status, close time, ranked option cards. */
export function DecisionCard({ decision, onVote, voting, canVote = true }: DecisionCardProps) {
  const open = decision.status === 'open';
  const { resultsVisible } = decision;
  const quorumMet = decision.totalVotes >= decision.quorum;
  const turnout = percentage(decision.totalVotes, decision.eligibleVoters);
  const ranking = [...decision.options].sort((a, b) => b.votes - a.votes);
  const leaderId = decision.totalVotes > 0 ? ranking[0]?.id : undefined;
  const closes = parseDate(decision.closesAt);

  return (
    <YStack padding={16} gap={12} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor={decision.important ? 'warning' : 'outlineVariant'}>
      <XStack gap={6} flexWrap="wrap">
        <XStack alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor={open ? 'tertiaryFixed' : 'surfaceContainerHigh'}>
          <YStack width={6} height={6} borderRadius={3} backgroundColor={open ? 'live' : 'outline'} />
          <Text variant="codeSm" weight="bold" color={open ? 'onTertiaryFixedVariant' : 'onSurfaceVariant'}>
            {open ? 'OPEN VOTE' : 'CLOSED'}
            {quorumMet ? ' • BINDING' : ''}
          </Text>
        </XStack>
        {decision.important ? (
          <XStack alignItems="center" gap={4} paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="secondaryContainer">
            <Icon name="flag" size={12} color="onSecondaryContainer" />
            <Text variant="codeSm" weight="bold" color="onSecondaryContainer">
              IMPORTANT
            </Text>
          </XStack>
        ) : null}
      </XStack>

      {open ? (
        <XStack alignItems="center" gap={6}>
          <Icon name="schedule" size={14} color="warning" />
          <Text variant="codeSm" muted>
            CLOSES {formatCountdown(decision.closesAt).toUpperCase()} · {formatTime(closes)} GMT+1
          </Text>
        </XStack>
      ) : null}

      <YStack gap={4}>
        <Text variant="titleLg" weight="bold">
          {decision.title}
        </Text>
        <Text variant="bodySm" muted>
          {decision.description}
        </Text>
      </YStack>

      <Text variant="codeSm" muted>
        {decision.totalVotes} of {decision.eligibleVoters} votes cast · {turnout}% turnout · {quorumMet ? 'quorum met' : `quorum ${decision.quorum}`}
      </Text>

      <YStack gap={10}>
        {decision.options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            total={decision.totalVotes}
            rank={ranking.findIndex((item) => item.id === option.id) + 1}
            leading={option.id === leaderId}
            chosen={decision.myVoteOptionId === option.id}
            resultsVisible={resultsVisible}
            disabled={!open || voting || !canVote}
            onPress={() => onVote(option.id)}
          />
        ))}
      </YStack>

      {!canVote ? (
        <XStack alignItems="center" gap={6}>
          <Icon name="lock" size={14} color="onSurfaceVariant" />
          <Text variant="bodyXs" muted>
            {open ? 'Core team vote — the outcome will be shared here.' : 'Decided by the core team.'}
          </Text>
        </XStack>
      ) : decision.myVoteOptionId ? (
        <XStack alignItems="center" gap={6}>
          <Icon name="verified" size={14} color="primary" />
          <Text variant="bodyXs" primary>
            {open ? 'Ballot recorded — tap another option to change it.' : 'Your ballot was recorded.'}
          </Text>
        </XStack>
      ) : null}
    </YStack>
  );
}

function OptionCard({
  option,
  total,
  rank,
  leading,
  chosen,
  resultsVisible,
  disabled,
  onPress,
}: {
  option: DecisionOption;
  total: number;
  rank: number;
  leading: boolean;
  chosen: boolean;
  resultsVisible: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const share = total > 0 ? Math.round((option.votes / total) * 100) : 0;

  return (
    <PressableScale onPress={onPress} disabled={disabled} accessibilityLabel={option.label} accessibilityRole="radio" selected={chosen}>
      <YStack padding={14} gap={10} borderRadius={18} borderWidth={1.5} borderColor={chosen ? 'primary' : 'outlineVariant'} backgroundColor={chosen ? 'surfaceContainerLow' : 'surfaceContainerLowest'}>
        <XStack alignItems="flex-start" gap={10}>
          <YStack width={24} height={24} borderRadius={12} alignItems="center" justifyContent="center" backgroundColor={chosen ? 'primary' : 'surfaceContainerHigh'}>
            {chosen ? <Icon name="check" size={16} color="onPrimary" /> : null}
          </YStack>
          <Text variant="labelLg" weight="bold" style={{ flex: 1 }}>
            {option.label}
          </Text>
          {resultsVisible && leading ? (
            <XStack alignItems="center" gap={4} paddingHorizontal={8} paddingVertical={3} borderRadius="full" backgroundColor="secondaryContainer">
              <Icon name="fire" size={12} color="onSecondaryContainer" />
              <Text variant="codeSm" weight="bold" color="onSecondaryContainer">
                LEADING
              </Text>
            </XStack>
          ) : null}
        </XStack>

        {resultsVisible ? (
          <YStack gap={6}>
            <XStack justifyContent="space-between">
              <Text variant="codeSm" weight="bold" color={chosen ? 'primary' : 'onSurface'}>
                {share}% <Text variant="codeSm" muted>({option.votes} votes)</Text>
              </Text>
              <Text variant="codeSm" weight="bold" color={chosen ? 'primary' : 'onSurfaceVariant'}>
                {chosen ? 'YOUR SELECTION' : `Rank #${rank}`}
              </Text>
            </XStack>
            <YStack height={8} borderRadius={4} backgroundColor="surfaceContainerHigh" overflow="hidden">
              <YStack width={`${share}%`} height="100%" borderRadius={4} backgroundColor={chosen ? 'primary' : 'outline'} />
            </YStack>
          </YStack>
        ) : null}
      </YStack>
    </PressableScale>
  );
}

export default DecisionCard;
