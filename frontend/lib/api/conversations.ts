import { apiClient } from "./client";
import { 
  Conversation, 
  Message, 
  StartConversationRequest, 
  SendMessageRequest, 
  ConversationFeedback,
  ConversationStats
} from "@/types";

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
  correction?: {
    hasErrors: boolean;
    correctedText: string;
    explanation: string;
    errors: Array<{
      original: string;
      correction: string;
      explanation: string;
      errorType: string;
    }>;
  };
  newVocabulary: Array<{
    id: string;
    word: string;
    translation: string;
  }>;
}

export const conversationsApi = {
  getAll: (status?: string): Promise<Conversation[]> =>
    apiClient.get<Conversation[]>("/conversations", status ? { status } : undefined),

  getActive: (): Promise<Conversation[]> =>
    apiClient.get<Conversation[]>("/conversations/active"),

  getStats: (languageCode?: string): Promise<ConversationStats> =>
    apiClient.get<ConversationStats>("/conversations/stats", languageCode ? { languageCode } : undefined),

  getById: (id: string): Promise<Conversation> =>
    apiClient.get<Conversation>(`/conversations/${id}`),

  getMessages: (conversationId: string): Promise<Message[]> =>
    apiClient.get<Message[]>(`/conversations/${conversationId}/messages`),

  start: (data: StartConversationRequest): Promise<Conversation> =>
    apiClient.post<Conversation>("/conversations", data),

  sendMessage: (conversationId: string, data: SendMessageRequest): Promise<SendMessageResponse> =>
    apiClient.post<SendMessageResponse>(`/conversations/${conversationId}/messages`, data),

  complete: (id: string): Promise<Conversation> =>
    apiClient.post<Conversation>(`/conversations/${id}/complete`),

  getFeedback: (id: string): Promise<ConversationFeedback[]> =>
    apiClient.get<ConversationFeedback[]>(`/conversations/${id}/feedback`),

  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/conversations/${id}`),
};
