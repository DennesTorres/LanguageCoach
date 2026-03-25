import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vocabularyApi } from "@/lib/api/vocabulary";
import { VocabularyItem, AddVocabularyRequest } from "@/types";

// Get all vocabulary for the current user
export function useVocabulary() {
  const { data, isLoading } = useQuery({
    queryKey: ["vocabulary"],
    queryFn: () => vocabularyApi.getAll(),
  });

  return {
    vocabulary: data || { items: [], total: 0 },
    isLoading,
  };
}

// Get vocabulary statistics
export function useVocabularyStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["vocabulary", "stats"],
    queryFn: () => vocabularyApi.getStats(),
  });

  return {
    stats: data,
    isLoading,
  };
}

// Get words due for review
export function useVocabularyReview() {
  const { data, isLoading } = useQuery({
    queryKey: ["vocabulary", "review"],
    queryFn: () => vocabularyApi.getDueForReview(),
  });

  return {
    dueForReview: data || [],
    isLoading,
  };
}

// Combined hook for vocabulary page
export function useVocabularyPage() {
  const { vocabulary, isLoading: vocabLoading } = useVocabulary();
  const { stats, isLoading: statsLoading } = useVocabularyStats();
  const { dueForReview, isLoading: reviewLoading } = useVocabularyReview();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (data: AddVocabularyRequest) => vocabularyApi.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VocabularyItem> }) => 
      vocabularyApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vocabularyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, difficulty }: { id: string; difficulty: number }) => 
      vocabularyApi.submitReview(id, difficulty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    },
  });

  return {
    vocabulary,
    stats,
    dueForReview,
    isLoading: vocabLoading || statsLoading || reviewLoading,
    addVocabulary: addMutation.mutate,
    updateVocabulary: updateMutation.mutate,
    deleteVocabulary: deleteMutation.mutate,
    submitReview: reviewMutation.mutate,
  };
}
