import { Router } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../http/async';
import { HttpError } from '../http/errors';
import { rows } from '../http/db';
import { requireAuth } from '../auth/middleware';
import { currentMember } from '../auth/context';
import { supabase } from '../supabase';
import { awardPoints } from '../services/points';
import { evaluateBadges } from '../services/achievements';
import type { DailyQuiz, DailyQuizResult, QuizAnswer, QuizQuestion, QuizResultRow } from '../types';
import type { MemberQuizStateRow, QuizQuestionRow } from '../db-types';

export const quizzesRouter = Router();

const QUIZ_ID = 'quiz-daily';
const QUIZ_REWARD = 30;
const QUESTION_COUNT = 5;

function toQuestion(row: QuizQuestionRow): QuizQuestion {
  return {
    id: row.id,
    prompt: row.prompt,
    options: row.options ?? [],
    answer: row.answer,
    explanation: row.explanation,
    track: row.track,
    difficulty: row.difficulty,
  };
}

async function dailyQuestions(): Promise<QuizQuestion[]> {
  const data = rows<QuizQuestionRow>(
    await supabase
      .from('quiz_questions')
      .select('*')
      .order('sort_order', { ascending: true })
      .limit(QUESTION_COUNT),
  );
  return data.map(toQuestion);
}

async function quizState(memberId: string): Promise<MemberQuizStateRow> {
  const { data, error } = await supabase
    .from('member_quiz_state')
    .select('*')
    .eq('member_id', memberId)
    .maybeSingle();
  if (error) throw HttpError.server(error.message);
  return (
    (data as MemberQuizStateRow | null) ?? {
      member_id: memberId,
      streak: 0,
      awarded_date: null,
      perfect: false,
      updated_at: new Date().toISOString(),
    }
  );
}

const today = () => new Date().toISOString().slice(0, 10);

quizzesRouter.get(
  '/quizzes/daily',
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    const [questions, state] = await Promise.all([dailyQuestions(), quizState(member.id)]);
    const quiz: DailyQuiz = {
      id: QUIZ_ID,
      title: 'Daily campus quiz',
      date: today(),
      questions,
      reward: QUIZ_REWARD,
      streak: state.streak,
      completed: state.awarded_date === today(),
    };
    res.json(quiz);
  }),
);

const attemptSchema = z.object({
  answers: z.array(z.object({ questionId: z.string(), selected: z.number().int() })).default([]),
});

quizzesRouter.post(
  '/quizzes/daily/attempts',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = attemptSchema.safeParse(req.body);
    if (!parsed.success) throw HttpError.badRequest('That submission is invalid.');
    const member = currentMember(req);
    const answers: QuizAnswer[] = parsed.data.answers;

    const questions = await dailyQuestions();
    const results: QuizResultRow[] = questions.map((question) => {
      const selected = answers.find((answer) => answer.questionId === question.id)?.selected ?? -1;
      return {
        questionId: question.id,
        selected,
        correct: selected === question.answer,
        correctIndex: question.answer,
        explanation: question.explanation,
      };
    });
    const score = results.filter((row) => row.correct).length;

    const state = await quizState(member.id);
    const firstToday = state.awarded_date !== today();
    let reward = 0;
    let streak = state.streak;
    let perfect = state.perfect;

    if (firstToday) {
      reward = QUIZ_REWARD;
      streak = state.streak + 1;
      perfect = state.perfect || score === questions.length;
      await awardPoints(member.id, reward);
    }

    const { error } = await supabase.from('member_quiz_state').upsert(
      {
        member_id: member.id,
        streak,
        awarded_date: firstToday ? today() : state.awarded_date,
        perfect,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'member_id' },
    );
    if (error) throw HttpError.server(error.message);

    await evaluateBadges(member.id);

    const result: DailyQuizResult = {
      quizId: QUIZ_ID,
      score,
      total: questions.length,
      reward,
      streak,
      results,
    };
    res.json(result);
  }),
);
