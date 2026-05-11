import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllTasks,
  fetchTasks,
  createTask,
  updateTask,
  reorderTask,
  deleteTask,
} from '@/api/tasks.api';
import type {
  CreateTaskData,
  UpdateTaskData,
  ReorderTaskData,
  Task,
} from '@/types/task.types';

export const useAllTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: fetchAllTasks,
  });
};

export const useTasks = (projectId?: number) => {
  return useQuery({
    queryKey: ['tasks', projectId ?? 'all'],
    queryFn: () => (projectId ? fetchTasks(projectId) : fetchAllTasks()),
    enabled: true,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskData) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskData }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useReorderTask = (cacheKey: (string | number)[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReorderTaskData }) =>
      reorderTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previous = queryClient.getQueryData<Task[]>(cacheKey);

      queryClient.setQueryData<Task[]>(cacheKey, (old) => {
        if (!old) return old;

        return old.map((task) =>
          task.id === id
            ? { ...task, status: data.status, position: data.position }
            : task
        );
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(cacheKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
