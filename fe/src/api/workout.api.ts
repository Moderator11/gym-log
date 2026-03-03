import apiClient from "./client";
import {
  WorkoutSession,
  WorkoutCreateRequest,
  WorkoutUpdateRequest,
} from "@/types/workout.types";

export const workoutApi = {
  getAll: async (): Promise<WorkoutSession[]> => {
    const response = await apiClient.get<WorkoutSession[]>("/workouts");
    return response.data;
  },

  getById: async (id: number): Promise<WorkoutSession> => {
    const response = await apiClient.get<WorkoutSession>(`/workouts/${id}`);
    return response.data;
  },

  create: async (data: WorkoutCreateRequest): Promise<WorkoutSession> => {
    const response = await apiClient.post<WorkoutSession>("/workouts", data);
    return response.data;
  },

  update: async (
    id: number,
    data: WorkoutUpdateRequest,
  ): Promise<WorkoutSession> => {
    const response = await apiClient.put<WorkoutSession>(
      `/workouts/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/workouts/${id}`);
  },
};
