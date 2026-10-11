import React from 'react';
import { View } from 'react-native';

import { Pill } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';
import { formatCountdown } from '@/utils/date';
import { percentage } from '@/utils/format';
import type { Decision, DecisionOption } from '@/types';

interface DecisionCardProps {
  decision: Decision;
  onVote: (optionId: string) => void;
  voting?: boolean;
  /** False for regular members: decisions are voted by the core team. */
  canVote?: boolean;
}

export function DecisionCard({ decision, onVote, voting, canVote = true }: DecisionCardProps) {
  const theme = useTheme();
  const open = decision.status === 'open';
  const { resultsVisible } = decision;
  const quorumMet = decision.totalVotes >= decision.quorum;
  const turnout = percentage(decision.totalVotes, decision.eligibleVoters);

  return (
    <View
      style={{
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: decision.important ? theme.colors.warning : theme.colors.outlineVariant,
        overflow: 'hidden',
      }}
    >
      <View style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {decision.important ? <Pill label="Important" color="warning" icon="flag" /> : null}
          <Pill label={open ? `Open · ${formatCountdown(decision.closesAt)}` : 'Closed'} color={open ? 'success' : 'outline'} dot />
        </View>

        <View style={{ gap: 4 }}>
          <Text variant="titleMd" weight="bold">
            {decision.title}
          </Text>
          <Text variant="bodySm" muted>
            {decision.description}
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          {decision.options.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              total={decision.totalVotes}
              chosen={decision.myVoteOptionId === option.id}
              resultsVisible={resultsVisible}
              open={open}
              disabled={voting || !canVote}
              onPress={() => onVote(option.id)}
            />
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="howToVote" size={14} color="onSurfaceVariant" />
            <Text variant="bodyXs" muted>
              {decision.totalVotes} of {decision.eligibleVoters} voted · {turnout}%
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name={quorumMet ? 'checkCircle' : 'schedule'} size={14} color={quorumMet ? 'tertiary' : 'onSurfaceVariant'} />
            <Text variant="bodyXs" color={quorumMet ? 'tertiary' : 'onSurfaceVariant'}>
              {quorumMet ? 'Quorum met' : `Quorum ${decision.quorum}`}
            </Text>
          </View>
        </View>

        {!canVote ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="lock" size={14} color="onSurfaceVariant" />
            <Text variant="bodyXs" muted>
              {open ? 'Core team vote — the outcome will be shared here.' : 'Decided by the core team.'}
            </Text>
          </View>
        ) : null}

        {decision.myVoteOptionId ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="verified" size={14} color="primary" />
            <Text variant="bodyXs" primary>
              {open ? 'Your ballot is recorded — tap another option to change it.' : 'Your ballot was recorded.'}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function OptionRow({
  option,
  total,
  chosen,
  resultsVisible,
  open,
  disabled,
  onPress,
}: {
  option: DecisionOption;
  total: number;
  chosen: boolean;
  resultsVisible: boolean;
  open: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const share = total > 0 ? Math.round((option.votes / total) * 100) : 0;
  const tappable = open && !disabled;

  if (resultsVisible) {
    return (
      <PressableScale
        onPress={onPress}
        disabled={!tappable}
        accessibilityLabel={option.label}
        style={{
          borderRadius: theme.radius.base,
          borderWidth: 1.5,
          borderColor: chosen ? theme.colors.primary : theme.colors.outlineVariant,
          backgroundColor: theme.colors.surfaceContainerLow,
          overflow: 'hidden',
        }}
      >
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${share}%`, backgroundColor: chosen ? theme.colors.primaryFixed : theme.colors.surfaceContainerHigh }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10 }}>
          <Icon name={chosen ? 'radioButtonChecked' : 'radioButtonUnchecked'} size={18} color={chosen ? 'primary' : 'onSurfaceVariant'} />
          <Text variant="labelLg" weight={chosen ? 'bold' : 'medium'} style={{ flex: 1 }} numberOfLines={1}>
            {option.label}
          </Text>
          <Text variant="labelMd" weight="bold" color={chosen ? 'primary' : 'onSurface'}>
            {share}%
          </Text>
          <Text variant="bodyXs" muted>
            {option.votes}
          </Text>
        </View>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      onPress={onPress}
      disabled={!tappable}
      accessibilityLabel={option.label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: theme.radius.base,
        borderWidth: 1.5,
        borderColor: chosen ? theme.colors.primary : theme.colors.outlineVariant,
        backgroundColor: chosen ? theme.colors.primaryFixed : theme.colors.surfaceContainerLowest,
      }}
    >
      <Icon name={chosen ? 'radioButtonChecked' : 'radioButtonUnchecked'} size={18} color={chosen ? 'primary' : 'onSurfaceVariant'} />
      <Text variant="labelLg" weight={chosen ? 'bold' : 'medium'} style={{ flex: 1 }}>
        {option.label}
      </Text>
    </PressableScale>
  );
}
