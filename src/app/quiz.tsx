import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Chip';
import { Gradient } from '@/components/ui/Gradient';
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
  const theme = useTheme();
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconButton name="arrowBack" onPress={() => router.back()} accessibilityLabel="Go back" />
          <Text variant="headlineMd" weight="bold">
            Daily quiz
          </Text>
        </View>
      </View>

      {isPending || !quiz ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={90} radius={14} />
          <Skeleton height={220} radius={14} />
        </View>
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
    </View>
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
        <StreakBanner quiz={quiz} />

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="labelMd" weight="semibold" muted>
              Question {index + 1} of {quiz.questions.length}
            </Text>
            <Pill label={track.label} color={track.color} />
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.colors.surfaceContainerHigh, overflow: 'hidden' }}>
            <View style={{ width: `${((index + 1) / quiz.questions.length) * 100}%`, height: '100%', borderRadius: 3, backgroundColor: theme.colors.primary }} />
          </View>
        </View>

        <Reveal key={question.id}>
          <View style={{ gap: 14 }}>
            <Text variant="titleLg" weight="bold">
              {question.prompt}
            </Text>
            <View style={{ gap: 10 }}>
              {question.options.map((option, optionIndex) => {
                const active = selected === optionIndex;
                return (
                  <PressableScale
                    key={option}
                    onPress={() => onSelect(question.id, optionIndex)}
                    accessibilityLabel={option}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      borderRadius: theme.radius.base,
                      borderWidth: 1.5,
                      borderColor: active ? theme.colors.primary : theme.colors.outlineVariant,
                      backgroundColor: active ? theme.colors.primaryFixed : theme.colors.surfaceContainerLowest,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: active ? theme.colors.primary : theme.colors.surfaceContainerHigh,
                      }}
                    >
                      <Text variant="labelMd" weight="bold" style={{ color: active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }}>
                        {String.fromCharCode(65 + optionIndex)}
                      </Text>
                    </View>
                    <Text variant="bodyMd" weight={active ? 'semibold' : 'regular'} style={{ flex: 1 }}>
                      {option}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        </Reveal>
      </ScrollView>

      <View style={{ position: 'absolute', left: 12, right: 12, bottom: 16, flexDirection: 'row', gap: 8 }}>
        {index > 0 ? <Button label="Back" variant="outline" fullWidth={false} onPress={onBack} /> : null}
        <Button
          label={isLast ? 'Finish' : 'Next'}
          icon={isLast ? 'check' : 'arrowForward'}
          loading={submitting}
          disabled={selected === undefined}
          onPress={onNext}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
}

function StreakBanner({ quiz }: { quiz: DailyQuiz }) {
  return (
    <View style={{ borderRadius: 14, overflow: 'hidden' }}>
      <Gradient token="sunrise" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          <Icon name="fire" size={26} color="#FFFFFF" />
          <View style={{ flex: 1 }}>
            <Text variant="titleSm" weight="bold" style={{ color: '#FFFFFF' }}>
              {quiz.streak}-day streak
            </Text>
            <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.9)' }}>
              5 questions · +{quiz.reward} XP for finishing today
            </Text>
          </View>
        </View>
      </Gradient>
    </View>
  );
}

function Results({ quiz, result, onReplay }: { quiz: DailyQuiz; result: DailyQuizResult; onReplay: () => void }) {
  const theme = useTheme();
  const perfect = result.score === result.total;
  const byId = new Map(quiz.questions.map((question) => [question.id, question]));

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 60, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Reveal>
        <View style={{ borderRadius: theme.radius.card, overflow: 'hidden' }}>
          <Gradient token={perfect ? 'aurora' : 'brand'} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={{ padding: 20, alignItems: 'center', gap: 6 }}>
              <Icon name={perfect ? 'emojiEvents' : 'insights'} size={40} color="#FFFFFF" />
              <Text variant="headlineMd" weight="bold" style={{ color: '#FFFFFF' }}>
                {result.score} / {result.total}
              </Text>
              <Text variant="bodyMd" style={{ color: 'rgba(255,255,255,0.92)', textAlign: 'center' }}>
                {perfect ? 'Perfect score — Quiz Whiz unlocked!' : result.reward > 0 ? 'Nice work today.' : 'Practice run — no XP this time.'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <ResultStat label="XP earned" value={result.reward > 0 ? `+${result.reward}` : '—'} />
                <ResultStat label="Streak" value={`${result.streak}d`} />
              </View>
            </View>
          </Gradient>
        </View>
      </Reveal>

      <View style={{ gap: 12 }}>
        <SectionHeader title="Review answers" subtitle="Explanations after every answer" accent="tertiary" />
        {result.results.map((row, rowIndex) => {
          const question = byId.get(row.questionId) as QuizQuestion | undefined;
          if (!question) return null;
          return (
            <View
              key={row.questionId}
              style={{
                padding: 14,
                borderRadius: theme.radius.card,
                backgroundColor: theme.colors.surfaceContainerLowest,
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <Icon name={row.correct ? 'checkCircle' : 'errorOutline'} size={20} color={row.correct ? 'tertiary' : 'error'} />
                <Text variant="labelLg" weight="semibold" style={{ flex: 1 }}>
                  {rowIndex + 1}. {question.prompt}
                </Text>
              </View>
              <View style={{ gap: 4, paddingLeft: 30 }}>
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
              </View>
            </View>
          );
        })}
      </View>

      <Button label="Play again (practice)" icon="eventRepeat" variant="container" onPress={onReplay} />
    </ScrollView>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', gap: 2 }}>
      <Text variant="titleMd" weight="bold" style={{ color: '#FFFFFF' }}>
        {value}
      </Text>
      <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.85)' }}>
        {label}
      </Text>
    </View>
  );
}
