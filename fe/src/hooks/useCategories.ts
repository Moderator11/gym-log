import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi, CategoryPayload } from "@/api/category.api";

export const useCategories = () => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CategoryPayload) => categoryApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryPayload }) =>
      categoryApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
