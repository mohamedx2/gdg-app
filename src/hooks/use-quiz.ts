import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { DailyQuiz, DailyQuizResult, QuizAnswer } from '@/types';

export function useDailyQuiz(): UseQueryResult<DailyQuiz> {
  return useQuery({
    queryKey: queryKeys.dailyQuiz,
    queryFn: () => api.quizzes.daily(),
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation<DailyQuizResult, unknown, QuizAnswer[]>({
    mutationFn: (answers) => api.quizzes.submit(answers),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dailyQuiz });
      void queryClient.invalidateQueries({ queryKey: queryKeys.achievementSummary });
      void queryClient.invalidateQueries({ queryKey: queryKeys.badges });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}
