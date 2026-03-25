namespace LanguageCoach.Application.DTOs;

public record VocabularyItemDto(
    Guid Id,
    string LanguageCode,
    string Word,
    string? ContextPhrase,
    string Translation,
    string? Definition,
    string PartOfSpeech,
    string Source,
    string Status,
    int ReviewCount,
    DateTime AddedAt,
    DateTime? LastReviewedAt,
    DateTime? NextReviewAt
);

public record VocabularyListDto(
    List<VocabularyItemDto> Items,
    VocabularyStatsDto Stats
);

public record VocabularyStatsDto(
    int TotalItems,
    int NewItems,
    int LearningItems,
    int ReviewItems,
    int MasteredItems,
    int DueForReview,
    Dictionary<string, int> ItemsByLanguage
);

public record CreateVocabularyRequest(
    string LanguageCode,
    string Word,
    string Translation,
    string? Definition = null,
    string? PartOfSpeech = null,
    string? ContextPhrase = null
);

public record UpdateVocabularyRequest(
    string? Status = null,
    string? Translation = null,
    string? Definition = null
);

public record ReviewVocabularyRequest(
    bool WasCorrect,
    int ConfidenceLevel // 1-5
);

public record ReviewSessionDto(
    Guid VocabularyItemId,
    string Word,
    string? ContextPhrase,
    string PartOfSpeech,
    List<string> MultipleChoiceOptions
);

public record ReviewResultDto(
    bool Correct,
    string CorrectAnswer,
    string? UserAnswer,
    VocabularyItemDto UpdatedItem
);

public record QuickAddVocabularyRequest(
    string LanguageCode,
    string Word,
    string? ContextPhrase = null
);
