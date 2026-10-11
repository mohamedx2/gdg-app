import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

import { api, queryKeys } from '@/lib/api';
import type { CreateTaskInput, Task, TaskStatus } from '@/types';

export function useTasks(): UseQueryResult<Task[]> {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => api.tasks.list(),
  });
}

export function useSetTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation<Task, unknown, { id: string; status: TaskStatus }>({
    mutationFn: ({ id, status }) => api.tasks.setStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, unknown, CreateTaskInput>({
    mutationFn: (input) => api.tasks.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    },
  });
}
