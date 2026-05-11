import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPerfumes, 
  getPerfumeById, 
  createPerfume, 
  updatePerfume, 
  deletePerfume
} from '@/api/perfumes.api';
import type { Perfume } from '@/api/perfumes.api';

export function usePerfumes() {
  return useQuery({
    queryKey: ['perfumes'],
    queryFn: getPerfumes,
  });
}

export function usePerfume(id: string) {
  return useQuery({
    queryKey: ['perfumes', id],
    queryFn: () => getPerfumeById(id),
    enabled: !!id,
  });
}

export function usePerfumeMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createPerfume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfumes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Perfume> }) => 
      updatePerfume(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['perfumes'] });
      queryClient.invalidateQueries({ queryKey: ['perfumes', data.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePerfume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfumes'] });
    },
  });

  return {
    createPerfume: createMutation.mutateAsync,
    updatePerfume: updateMutation.mutateAsync,
    deletePerfume: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}