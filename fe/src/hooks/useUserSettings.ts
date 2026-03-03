import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";

export const useUserSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["userSettings"],
    queryFn: authApi.getMe,
  });

  const updateMutation = useMutation({
    mutationFn: (sharing_enabled: boolean) =>
      authApi.updateSettings(sharing_enabled),
    onSuccess: (data) => {
      // 캐시 직접 업데이트 (재요청 없이 즉시 반영)
      queryClient.setQueryData(["userSettings"], data);
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    updateSharing: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
