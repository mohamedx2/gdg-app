import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Share } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTaxonomy } from '@/hooks/use-content';
import { useDailyQuiz, useSubmitQuiz } from '@/hooks/use-quiz';
import { useUiStore } from '@/stores/ui.store';
import { useTheme } from '@/theme';
import type { DailyQuiz, DailyQuizResult, QuizAnswer, QuizQuestion } from '@/types';

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const toast = useUiStore((state) => state.toast);
  const { data: quiz, isPending } = useDailyQuiz();
  const submit = useSubmitQuiz();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<DailyQuizResult | null>(null);

  const reset = () => {
    setAnswers({});
    setIndex(0);
    setResult(null);
  };

  const finish = (activeQuiz: DailyQuiz) => {
    const payload: QuizAnswer[] = activeQuiz.questions.map((question) => ({
      questionId: question.id,
      selected: answers[question.id] ?? -1,
    }));
    submit.mutate(payload, {
      onSuccess: (outcome) => {
        setResult(outcome);
        if (outcome.reward > 0) toast(`+${outcome.reward} XP · streak ${outcome.streak} days`, 'success');
      },
      onError: (error) => toast(error instanceof Error ? error.message : 'Could not submit quiz', 'error'),
    });
  };

  return (
    <YStack flex={1} backgroundColor="background">
      <YStack paddingTop={insets.top + 8} paddingHorizontal={16}>
        <XStack alignItems="center" gap={4}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Daily quiz
          </Text>
        </XStack>
      </YStack>

      {isPending || !quiz ? (
        <YStack padding={16} gap={12}>
          <Skeleton height={90} radius={14} />
          <Skeleton height={220} radius={14} />
        </YStack>
      ) : result ? (
        <Results quiz={quiz} result={result} onReplay={reset} />
      ) : (
        <Question
          quiz={quiz}
          index={index}
          answers={answers}
          submitting={submit.isPending}
          onSelect={(questionId, selected) => setAnswers((prev) => ({ ...prev, [questionId]: selected }))}
          onBack={() => setIndex((value) => Math.max(0, value - 1))}
          onNext={() =>
            index < quiz.questions.length - 1 ? setIndex((value) => value + 1) : finish(quiz)
          }
        />
      )}
    </YStack>
  );
}

function Question({
  quiz,
  index,
  answers,
  submitting,
  onSelect,
  onBack,
  onNext,
}: {
  quiz: DailyQuiz;
  index: number;
  answers: Record<string, number>;
  submitting: boolean;
  onSelect: (questionId: string, selected: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const theme = useTheme();
  const { tracks: TRACKS } = useTaxonomy();
  const question = quiz.questions[index];
  const track = TRACKS[question.track];
  const selected = answers[question.id];
  const isLast = index === quiz.questions.length - 1;

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap={6} paddingHorizontal={12} paddingVertical={6} borderRadius="full" backgroundColor="secondaryContainer">
            <Icon name="fire" size={16} color="warning" />
            <Text variant="codeSm" weight="bold" color="onSecondaryContainer">
              {quiz.streak} DAYS STREAK
            </Text>
          </XStack>
          <Text variant="codeSm" weight="bold" primary>
            {Math.round((Object.keys(answers).length / quiz.questions.length) * 100)}% Done
          </Text>
        </XStack>

        <YStack gap={8}>
          <Text variant="codeSm" weight="bold" muted>
            QUESTION {index + 1} OF {quiz.questions.length}
          </Text>
          <XStack gap={6}>
            {quiz.questions.map((item, itemIndex) => (
              <YStack
                key={item.id}
                flex={1}
                height={6}
                borderRadius={3}
                backgroundColor={itemIndex === index ? 'primary' : answers[item.id] !== undefined ? 'tertiary' : 'surfaceContainerHigh'}
              />
            ))}
          </XStack>
        </YStack>

        <Reveal key={question.id}>
          <YStack gap={14}>
            <YStack padding={16} gap={14} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
              <XStack alignItems="center" justifyContent="space-between" gap={8}>
                <XStack alignItems="center" gap={6} paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="surfaceContainerHigh" flexShrink={1}>
                  <YStack width={7} height={7} borderRadius={4} backgroundColor={track.color} />
                  <Text variant="codeSm" weight="bold" numberOfLines={1}>
                    {track.label.toUpperCase()} • {question.difficulty.toUpperCase()}
                  </Text>
                </XStack>
                <Text variant="codeSm" weight="bold" primary>
                  +{Math.round(quiz.reward / quiz.questions.length)} XP
                </Text>
              </XStack>
              <Text variant="titleLg" weight="bold">
                {question.prompt}
              </Text>
            </YStack>
            <XStack flexWrap="wrap" gap={10}>
              {question.options.map((option, optionIndex) => {
                const active = selected === optionIndex;
                return (
                  <PressableScale
                    key={option}
                    onPress={() => onSelect(question.id, optionIndex)}
                    accessibilityLabel={option}
                    accessibilityRole="radio"
                    selected={active}
                    style={{
                      flexBasis: '47%',
                      flexGrow: 1,
                      minHeight: 110,
                      padding: 14,
                      gap: 14,
                      justifyContent: 'space-between',
                      borderRadius: 20,
                      backgroundColor: active ? theme.colors.primary : theme.colors.surfaceContainerLow,
                    }}
                  >
                    <XStack alignItems="center" justifyContent="space-between">
                      <YStack width={30} height={30} borderRadius={15} alignItems="center" justifyContent="center" backgroundColor={active ? 'surfaceContainerLowest' : 'surfaceContainerHigh'}>
                        {active ? (
                          <Icon name="check" size={18} color="primary" />
                        ) : (
                          <Text variant="codeSm" weight="bold" muted>
                            {String.fromCharCode(65 + optionIndex)}
                          </Text>
                        )}
                      </YStack>
                    </XStack>
                    <Text variant="labelLg" weight="bold" color={active ? 'onPrimary' : 'onSurface'}>
                      {option}
                    </Text>
                  </PressableScale>
                );
              })}
            </XStack>
          </YStack>
        </Reveal>
      </ScrollView>

      <XStack position="absolute" left={12} right={12} bottom={16} gap={8}>
        {index > 0 ? <Button label="Back" variant="outline" fullWidth={false} onPress={onBack} /> : null}
        <Button
          label={isLast ? 'Finish' : 'Next'}
          icon={isLast ? 'check' : 'arrowForward'}
          loading={submitting}
          disabled={selected === undefined}
          onPress={onNext}
          style={{ flex: 1 }}
        />
      </XStack>
    </>
  );
}

function Results({ quiz, result, onReplay }: { quiz: DailyQuiz; result: DailyQuizResult; onReplay: () => void }) {
  const perfect = result.score === result.total;
  const byId = new Map(quiz.questions.map((question) => [question.id, question]));

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Reveal>
        <YStack padding={16} gap={14} borderRadius="card" backgroundColor="surfaceContainerLowest" borderWidth={1} borderColor="outlineVariant">
          <YStack gap={2}>
            <Text variant="codeSm" weight="bold" primary>
              ARENA MILESTONE
            </Text>
            <Text variant="headlineSm" weight="bold">
              Quiz Complete Results
            </Text>
          </YStack>
          <XStack alignItems="center" gap={16} padding={14} borderRadius={18} backgroundColor="surfaceContainerLow">
            <ScoreRing score={result.score} total={result.total} />
            <YStack flex={1} gap={8}>
              <XStack alignSelf="flex-start" alignItems="center" gap={4} paddingHorizontal={10} paddingVertical={4} borderRadius="full" backgroundColor="primaryFixed">
                <Icon name="bolt" size={13} color="onPrimaryFixedVariant" />
                <Text variant="codeSm" weight="bold" color="onPrimaryFixedVariant">
                  {result.reward > 0 ? `+${result.reward} XP Earned` : 'Practice run'}
                </Text>
              </XStack>
              <XStack alignItems="center" gap={6}>
                <Icon name="fire" size={16} color="warning" />
                <Text variant="labelLg" weight="bold" style={{ flex: 1 }}>
                  Streak: {result.streak} days
                </Text>
              </XStack>
              <Text variant="bodySm" muted>
                {perfect ? 'Perfect score — Quiz Whiz unlocked!' : 'Review the explanations below.'}
              </Text>
            </YStack>
          </XStack>
          <XStack gap={10}>
            <Button label="Share result" variant="container" fullWidth={false} style={{ flex: 1 }} onPress={() => void Share.share({ message: `I scored ${result.score}/${result.total} on today's GDG EPI dev quiz — ${result.streak}-day streak!` }).catch(() => undefined)} />
            <Button label="Keep grinding" fullWidth={false} style={{ flex: 1 }} onPress={() => router.replace('/?space=arena&segment=quests' as never)} />
          </XStack>
        </YStack>
      </Reveal>

      <YStack gap={12}>
        <SectionHeader title="Review answers" subtitle="Explanations after every answer" accent="tertiary" />
        {result.results.map((row, rowIndex) => {
          const question = byId.get(row.questionId) as QuizQuestion | undefined;
          if (!question) return null;
          return (
            <YStack
              key={row.questionId}
              padding={14}
              borderRadius="card"
              backgroundColor="surfaceContainerLowest"
              borderWidth={1}
              borderColor="outlineVariant"
              gap={10}
            >
              <XStack alignItems="flex-start" gap={10}>
                <Icon name={row.correct ? 'checkCircle' : 'errorOutline'} size={20} color={row.correct ? 'tertiary' : 'error'} />
                <Text variant="labelLg" weight="semibold" style={{ flex: 1 }}>
                  {rowIndex + 1}. {question.prompt}
                </Text>
              </XStack>
              <YStack gap={4} paddingLeft={30}>
                {!row.correct ? (
                  <Text variant="bodySm" color="error">
                    Your answer: {row.selected >= 0 ? question.options[row.selected] : 'Skipped'}
                  </Text>
                ) : null}
                <Text variant="bodySm" color="tertiary" weight="medium">
                  Correct: {question.options[row.correctIndex]}
                </Text>
                <Text variant="bodySm" muted>
                  {row.explanation}
                </Text>
              </YStack>
            </YStack>
          );
        })}
      </YStack>

      <Button label="Play again (practice)" icon="eventRepeat" variant="container" onPress={onReplay} />
    </ScrollView>
  );
}

function ScoreRing({ score, total }: { score: number; total: number }) {
  const theme = useTheme();
  const size = 96;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const share = total > 0 ? score / total : 0;
  return (
    <YStack width={size} height={size} alignItems="center" justifyContent="center">
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.colors.surfaceContainerHigh} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme.colors.tertiary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${share * circumference} ${circumference}`}
        />
      </Svg>
      <Text variant="titleMd" weight="bold" style={{ fontFamily: theme.typography.codeMd.fontFamily }}>
        {score}/{total}
      </Text>
      <Text variant="codeSm" muted>
        {Math.round(share * 100)}%
      </Text>
    </YStack>
  );
}
