import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, type UpdateProfilePayload } from '@/api/profile.api';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}