import apiClient from "./client";
import { ExerciseCategory } from "@/types/workout.types";

export const categoryApi = {
  getAll: async (): Promise<ExerciseCategory[]> => {
    const response = await apiClient.get<ExerciseCategory[]>("/categories");
    return response.data;
  },

  create: async (name: string): Promise<ExerciseCategory> => {
    const response = await apiClient.post<ExerciseCategory>("/categories", { name });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
