import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";

export const useUserSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["userSettings"],
    queryFn: authApi.getMe,
  });

  const updateMutation = useMutation({
    mutationFn: ({ sharing_enabled, health_sharing_enabled }: { sharing_enabled: boolean; health_sharing_enabled: boolean }) =>
      authApi.updateSettings(sharing_enabled, health_sharing_enabled),
    onSuccess: (data) => {
      // 캐시 직접 업데이트 (재요청 없이 즉시 반영)
      queryClient.setQueryData(["userSettings"], data);
    },
  });

  const updateSharing = (sharing_enabled: boolean) => {
    const current = settingsQuery.data;
    return updateMutation.mutateAsync({
      sharing_enabled,
      health_sharing_enabled: current?.health_sharing_enabled ?? false,
    });
  };

  const updateHealthSharing = (health_sharing_enabled: boolean) => {
    const current = settingsQuery.data;
    return updateMutation.mutateAsync({
      sharing_enabled: current?.sharing_enabled ?? false,
      health_sharing_enabled,
    });
  };

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    updateSharing,
    updateHealthSharing,
    isUpdating: updateMutation.isPending,
  };
};
