import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { conversationsApi } from "@/lib/api/conversations";
import { StartConversationRequest, SendMessageRequest, Conversation, Message } from "@/types";

// Get all conversations with optional status filter
export function useConversations(status?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["conversations", status],
    queryFn: () => conversationsApi.getAll(status),
  });

  return {
    conversations: data || [],
    isLoading,
  };
}

// Get active conversations
export function useActiveConversations() {
  const { data, isLoading } = useQuery({
    queryKey: ["conversations", "active"],
    queryFn: () => conversationsApi.getActive(),
  });

  return {
    activeConversations: data || [],
    isLoading,
  };
}

// Get conversation stats
export function useConversationStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["conversations", "stats"],
    queryFn: () => conversationsApi.getStats(),
  });

  return {
    stats: data,
    isLoading,
  };
}

// Get a single conversation
export function useGetConversation(conversationId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => conversationsApi.getById(conversationId),
    enabled: !!conversationId,
  });

  return {
    conversation: data,
    isLoading,
  };
}

// Get messages for a conversation
export function useGetMessages(conversationId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => conversationsApi.getMessages(conversationId),
    enabled: !!conversationId,
  });

  return {
    messages: data || [],
    isLoading,
  };
}

// Hook that combines conversation data for the conversation page
export function useConversation(conversationId: string) {
  const { conversation, isLoading: conversationLoading } = useGetConversation(conversationId);
  const { messages, isLoading: messagesLoading } = useGetMessages(conversationId);

  return {
    get conversation() { return conversation; },
    getMessages() { return messages; },
    isLoading: conversationLoading || messagesLoading,
  };
}

// Hook for the dashboard that combines all conversation data
export function useDashboardConversations() {
  const { conversations } = useConversations();
  const { activeConversations } = useActiveConversations();
  const { stats } = useConversationStats();
  const queryClient = useQueryClient();
  const router = useRouter();

  const startMutation = useMutation({
    mutationFn: (data: StartConversationRequest) => conversationsApi.start(data),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/conversations/${newConversation.id}`);
    },
  });

  const sendMutation = useMutation({
    mutationFn: ({ conversationId, content, requestCorrection = true }: { 
      conversationId: string; 
      content: string; 
      requestCorrection?: boolean;
    }) => conversationsApi.sendMessage(conversationId, { content, requestCorrection }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversationId] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (conversationId: string) => conversationsApi.complete(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    conversations,
    activeConversations,
    stats,
    isLoading: startMutation.isPending || sendMutation.isPending || completeMutation.isPending,
    startConversation: startMutation.mutate,
    sendMessage: sendMutation.mutate,
    completeConversation: completeMutation.mutate,
  };
}

// Hook that combines everything for conversation page
export function useConversationPage(conversationId: string) {
  const { conversation, getMessages, isLoading } = useConversation(conversationId);
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: ({ content, requestCorrection = true }: { content: string; requestCorrection?: boolean }) => 
      conversationsApi.sendMessage(conversationId, { content, requestCorrection }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => conversationsApi.complete(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
    },
  });

  return {
    conversation,
    messages: getMessages(),
    isLoading,
    sendMessage: sendMutation.mutate,
    completeConversation: completeMutation.mutate,
  };
}
