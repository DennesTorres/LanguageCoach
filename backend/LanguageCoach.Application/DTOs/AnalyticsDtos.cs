namespace LanguageCoach.Application.DTOs;

// Progress tracking DTOs
public record LearningProgressDto(
    int TotalConversations,
    int TotalPracticeMinutes,
    int TotalMessages,
    int VocabularyLearned,
    int VocabularyMastered,
    double AverageCorrectionsPerConversation,
    int StreakDays,
    List<WeeklyProgressDto> WeeklyProgress
);

public record WeeklyProgressDto(
    string WeekStarting,
    int PracticeMinutes,
    int ConversationsCount,
    int NewVocabulary
);

public record DailyProgressDto(
    string Date,
    int PracticeMinutes,
    int ConversationsCount,
    int NewVocabulary
);

// Overview DTOs
public record LearningOverviewDto(
    int StreakDays,
    int TotalPracticeMinutes,
    int TotalConversations,
    int TotalVocabulary,
    List<LanguageProgressDto> LanguageBreakdown,
    VocabStatusBreakdownDto VocabularyByStatus,
    List<RecentActivityDto> RecentActivity
);

public record LanguageProgressDto(
    string LanguageCode,
    string ProficiencyLevel,
    int ConversationCount,
    int PracticeMinutes,
    int VocabularyCount
);

public record VocabStatusBreakdownDto(
    int New,
    int Learning,
    int Review,
    int Mastered
);

public record RecentActivityDto(
    Guid ConversationId,
    string Title,
    string Type,
    string LanguageCode,
    DateTime StartedAt,
    int DurationMinutes,
    int MessagesCount
);

// Weekly goal DTO
public record WeeklyGoalDto(
    int TargetMinutes,
    int CurrentMinutes,
    int TargetConversations,
    int CurrentConversations,
    double MinutesProgressPercent,
    double ConversationsProgressPercent
);

// Conversation stats DTO (referenced by controller)
public record ConversationStatsDto(
    int TotalConversations,
    int TotalPracticeMinutes,
    int ActiveConversations,
    double AverageMessagesPerConversation,
    int TotalCorrections
);
