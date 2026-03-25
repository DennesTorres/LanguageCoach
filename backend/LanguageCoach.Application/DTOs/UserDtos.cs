namespace LanguageCoach.Application.DTOs;

public record UserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string NativeLanguage,
    DateTime CreatedAt,
    DateTime LastActiveAt
);

public record UserProfileDto(
    Guid Id,
    string Email,
    string DisplayName,
    string NativeLanguage,
    DateTime CreatedAt,
    List<LearningLanguageDto> LearningLanguages,
    UserStatsDto Stats
);

public record LearningLanguageDto(
    Guid Id,
    string LanguageCode,
    string LanguageName,
    string ProficiencyLevel,
    DateTime StartedAt,
    int TotalMinutesPracticed,
    int ConversationsCompleted
);

public record UserStatsDto(
    int TotalConversations,
    int TotalVocabularyItems,
    int VocabularyMastered,
    int TotalMinutesPracticed,
    int CurrentStreakDays
);

public record UpdateProfileRequest(
    string DisplayName,
    string NativeLanguage
);

public record AddLearningLanguageRequest(
    string LanguageCode,
    string ProficiencyLevel
);
