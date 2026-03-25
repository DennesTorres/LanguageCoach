export type ProficiencyLevel = "Beginner" | "Elementary" | "Intermediate" | "UpperIntermediate" | "Advanced" | "Proficient" | "Fluent";

export interface User {
  id: string;
  email: string;
  name: string;
  nativeLanguage: string;
  targetLanguage: string;
  proficiencyLevel: ProficiencyLevel;
  createdAt: string;
  streakDays: number;
  totalPracticeMinutes: number;
}

export type ConversationType = "FreeChat" | "Scenario" | "GrammarPractice" | "VocabularyQuiz" | "Debate" | "Interview";
export type ConversationStatus = "Active" | "Paused" | "Completed" | "Abandoned";

export interface Conversation {
  id: string;
  userId: string;
  languageCode: string;
  title: string;
  type: ConversationType;
  status: ConversationStatus;
  scenario?: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  messagesCount: number;
  correctionsCount: number;
  newVocabularyCount: number;
  messages?: Message[];
}

export type MessageRole = "User" | "Assistant" | "System";

export interface VocabularyExtraction {
  id: string;
  vocabularyItemId: string;
  word: string;
  translation: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  correctedContent?: string;
  explanation?: string;
  sentAt: string;
  audioDurationMs?: number;
  audioUrl?: string;
  extractedVocabulary?: VocabularyExtraction[];
}

export type PartOfSpeech = "Noun" | "Verb" | "Adjective" | "Adverb" | "Pronoun" | "Preposition" | "Conjunction" | "Interjection" | "Phrase" | "Other";
export type VocabularySource = "Conversation" | "ManualEntry" | "Import" | "Lesson";
export type VocabularyStatus = "New" | "Learning" | "Review" | "Mastered" | "Archived";

export interface VocabularyItem {
  id: string;
  userId: string;
  languageCode: string;
  word: string;
  contextPhrase?: string;
  translation: string;
  definition?: string;
  partOfSpeech: PartOfSpeech;
  source: VocabularySource;
  status: VocabularyStatus;
  reviewCount: number;
  addedAt: string;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  difficultyRating: number;
  extractCount?: number;
}

export interface VocabularyStats {
  totalItems: number;
  newItems: number;
  learningItems: number;
  reviewItems: number;
  masteredItems: number;
  dueForReview: number;
}

export interface StartConversationRequest {
  languageCode: string;
  type: ConversationType;
  scenario?: string;
  title?: string;
}

export interface SendMessageRequest {
  content: string;
  requestCorrection?: boolean;
  audioBase64?: string;
}

export interface AddVocabularyRequest {
  word: string;
  translation: string;
  languageCode: string;
  definition?: string;
  partOfSpeech?: PartOfSpeech;
  contextPhrase?: string;
}

export interface ConversationFeedback {
  id: string;
  conversationId: string;
  category: "Grammar" | "Vocabulary" | "Pronunciation" | "Fluency";
  score: number;
  comments?: string;
  suggestions: string[];
}

export interface ConversationStats {
  totalConversations: number;
  totalPracticeMinutes: number;
  activeConversations: number;
  averageMessagesPerConversation: number;
  totalCorrections: number;
}

export interface WeeklyProgress {
  weekStarting: string;
  practiceMinutes: number;
  conversationsCount: number;
  newVocabulary: number;
}

export interface LearningProgress {
  totalConversations: number;
  totalPracticeMinutes: number;
  totalMessages: number;
  vocabularyLearned: number;
  vocabularyMastered: number;
  averageCorrectionsPerConversation: number;
  streakDays: number;
  weeklyProgress: WeeklyProgress[];
}

export interface LanguageProgress {
  languageCode: string;
  proficiencyLevel: string;
  conversationCount: number;
  practiceMinutes: number;
  vocabularyCount: number;
}

export interface VocabStatusBreakdown {
  New: number;
  Learning: number;
  Review: number;
  Mastered: number;
}

export interface RecentActivity {
  conversationId: string;
  title: string;
  type: string;
  languageCode: string;
  startedAt: string;
  durationMinutes: number;
  messagesCount: number;
}

export interface LearningOverview {
  streakDays: number;
  totalPracticeMinutes: number;
  totalConversations: number;
  totalVocabulary: number;
  languageBreakdown: LanguageProgress[];
  vocabularyByStatus: VocabStatusBreakdown;
  recentActivity: RecentActivity[];
}

export interface WeeklyGoal {
  targetMinutes: number;
  currentMinutes: number;
  targetConversations: number;
  currentConversations: number;
  minutesProgressPercent: number;
  conversationsProgressPercent: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
