import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workoutApi } from "@/api/workout.api";
import {
  // WorkoutCreateRequest,
  WorkoutUpdateRequest,
} from "@/types/workout.types";

export const useWorkouts = () => {
  const queryClient = useQueryClient();

  const workoutsQuery = useQuery({
    queryKey: ["workouts"],
    queryFn: workoutApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: workoutApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkoutUpdateRequest }) =>
      workoutApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: workoutApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  return {
    workouts: workoutsQuery.data ?? [],
    isLoading: workoutsQuery.isLoading,
    error: workoutsQuery.error,
    createWorkout: createMutation.mutateAsync,
    updateWorkout: updateMutation.mutateAsync,
    deleteWorkout: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useWorkout = (id: number) => {
  return useQuery({
    queryKey: ["workout", id],
    queryFn: () => workoutApi.getById(id),
    enabled: !!id,
  });
};
