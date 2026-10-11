import { router } from 'expo-router';
import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Gradient } from '@/components/ui/Gradient';
import { Icon } from '@/components/ui/Icon';
import { Orbs } from '@/components/ui/Orbs';
import { PressableScale } from '@/components/ui/PressableScale';
import { ErrorState } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useDailyQuiz } from '@/hooks/use-quiz';

/** Quiz segment — today's challenge card; the quiz itself runs on `/quiz`. */
export function ArenaQuiz() {
  const { data: quiz, isPending, isError, error, refetch } = useDailyQuiz();

  if (isError) return <ErrorState message={error?.message} onRetry={() => refetch()} />;
  if (isPending || !quiz) return <Skeleton height={230} radius={22} />;

  return (
    <>
      <YStack borderRadius="card" overflow="hidden">
        <Gradient token="brand" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Orbs />
          <YStack padding={18} gap={12}>
            <XStack alignItems="center" justifyContent="space-between">
              <Text variant="codeSm" weight="bold" color="onPrimary">
                DAILY DEV QUIZ
              </Text>
              <XStack alignItems="center" gap={4} paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="secondaryContainer">
                <Icon name="fire" size={13} color="warning" />
                <Text variant="codeSm" weight="bold" color="onSecondaryContainer">
                  {quiz.streak}-day streak
                </Text>
              </XStack>
            </XStack>
            <Text variant="headlineSm" weight="bold" color="onPrimary">
              {quiz.title}
            </Text>
            <Text variant="codeSm" color="onPrimary">
              {quiz.questions.length} questions · +{quiz.reward} XP
            </Text>
            <PressableScale onPress={() => router.push('/quiz' as never)} accessibilityLabel={quiz.completed ? 'Review today’s quiz' : 'Start today’s quiz'}>
              <XStack height={48} alignItems="center" justifyContent="center" gap={8} borderRadius={14} backgroundColor="surfaceContainerLowest">
                <Icon name={quiz.completed ? 'checkCircle' : 'playCircle'} size={18} color="primary" />
                <Text variant="labelLg" weight="bold" primary>
                  {quiz.completed ? 'Done today · review answers' : 'Start quiz'}
                </Text>
              </XStack>
            </PressableScale>
          </YStack>
        </Gradient>
      </YStack>

      <XStack gap={10}>
        <QuizStat icon="bolt" label="Reward" value={`+${quiz.reward} XP`} />
        <QuizStat icon="fire" label="Streak" value={`${quiz.streak}d`} />
        <QuizStat icon="schedule" label="Resets" value="00:00" />
      </XStack>
    </>
  );
}

function QuizStat({ icon, label, value }: { icon: 'bolt' | 'fire' | 'schedule'; label: string; value: string }) {
  return (
    <YStack flex={1} padding={12} gap={4} borderRadius={18} backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
      <Icon name={icon} size={16} color="primary" />
      <Text variant="codeSm" weight="bold">
        {value}
      </Text>
      <Text variant="bodyXs" muted>
        {label}
      </Text>
    </YStack>
  );
}

export default ArenaQuiz;
