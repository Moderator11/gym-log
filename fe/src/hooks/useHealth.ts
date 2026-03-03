import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { healthApi } from "@/api/health.api";
import { HealthRecordPayload } from "@/types/health.types";

// ── 지표 ──────────────────────────────────────────────────────────────────

export const useHealthMetrics = () => {
  const queryClient = useQueryClient();

  const metricsQuery = useQuery({
    queryKey: ["health", "metrics"],
    queryFn: healthApi.getMetrics,
  });

  const createMutation = useMutation({
    mutationFn: ({ name, unit }: { name: string; unit: string }) =>
      healthApi.createMetric(name, unit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health", "metrics"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (metricId: number) => healthApi.deleteMetric(metricId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health", "metrics"] });
    },
  });

  return {
    metrics: metricsQuery.data ?? [],
    isLoading: metricsQuery.isLoading,
    createMetric: createMutation.mutateAsync,
    deleteMetric: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

// ── 기록 ──────────────────────────────────────────────────────────────────

export const useHealthRecords = () => {
  const queryClient = useQueryClient();

  const recordsQuery = useQuery({
    queryKey: ["health", "records"],
    queryFn: healthApi.getRecords,
  });

  const createMutation = useMutation({
    mutationFn: (payload: HealthRecordPayload) => healthApi.createRecord(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health", "records"] });
      queryClient.invalidateQueries({ queryKey: ["health", "stats"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: HealthRecordPayload }) =>
      healthApi.updateRecord(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["health", "records"] });
      queryClient.invalidateQueries({ queryKey: ["health", "record", id] });
      queryClient.invalidateQueries({ queryKey: ["health", "stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => healthApi.deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health", "records"] });
      queryClient.invalidateQueries({ queryKey: ["health", "stats"] });
    },
  });

  return {
    records: recordsQuery.data ?? [],
    isLoading: recordsQuery.isLoading,
    createRecord: createMutation.mutateAsync,
    updateRecord: updateMutation.mutateAsync,
    deleteRecord: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};

// ── 통계 ──────────────────────────────────────────────────────────────────

export const useHealthStats = () => {
  return useQuery({
    queryKey: ["health", "stats"],
    queryFn: healthApi.getStats,
  });
};

// ── 친구 건강 기록 ────────────────────────────────────────────────────────

export const useFriendHealthRecords = (friendId: number | null) => {
  return useQuery({
    queryKey: ["health", "friend", friendId, "records"],
    queryFn: () => healthApi.getFriendRecords(friendId!),
    enabled: !!friendId,
  });
};

export const useFriendHealthStats = (friendId: number | null) => {
  return useQuery({
    queryKey: ["health", "friend", friendId, "stats"],
    queryFn: () => healthApi.getFriendStats(friendId!),
    enabled: !!friendId,
  });
};
