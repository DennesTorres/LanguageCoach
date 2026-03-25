import { apiClient } from "./client";
import { 
  VocabularyItem, 
  VocabularyStats, 
  AddVocabularyRequest 
} from "@/types";

export interface VocabularyListResponse {
  items: VocabularyItem[];
  total: number;
}

export const vocabularyApi = {
  getAll: (params?: { 
    languageCode?: string; 
    status?: string; 
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<VocabularyListResponse> =>
    apiClient.get<VocabularyListResponse>("/vocabulary", params),

  getById: (id: string): Promise<VocabularyItem> =>
    apiClient.get<VocabularyItem>(`/vocabulary/${id}`),

  getStats: (): Promise<VocabularyStats> =>
    apiClient.get<VocabularyStats>("/vocabulary/stats"),

  getDueForReview: (limit?: number): Promise<VocabularyItem[]> =>
    apiClient.get<VocabularyItem[]>("/vocabulary/review/due", limit ? { limit } : undefined),

  add: (data: AddVocabularyRequest): Promise<VocabularyItem> =>
    apiClient.post<VocabularyItem>("/vocabulary", data),

  update: (id: string, data: Partial<VocabularyItem>): Promise<VocabularyItem> =>
    apiClient.put<VocabularyItem>(`/vocabulary/${id}`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/vocabulary/${id}`),

  submitReview: (id: string, difficulty: number): Promise<void> =>
    apiClient.post<void>(`/vocabulary/${id}/review`, { difficulty }),
};
