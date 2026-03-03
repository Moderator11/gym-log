import apiClient from "./client";
import { ExerciseCategory } from "@/types/workout.types";

export interface CategoryPayload {
  name: string;
  tags: string[];
}

export const categoryApi = {
  getAll: async (): Promise<ExerciseCategory[]> => {
    const response = await apiClient.get<ExerciseCategory[]>("/categories");
    return response.data;
  },

  create: async (payload: CategoryPayload): Promise<ExerciseCategory> => {
    const response = await apiClient.post<ExerciseCategory>("/categories", payload);
    return response.data;
  },

  update: async (id: number, payload: CategoryPayload): Promise<ExerciseCategory> => {
    const response = await apiClient.put<ExerciseCategory>(`/categories/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
