namespace LanguageCoach.Application.DTOs;

public record ConversationDto(
    Guid Id,
    string LanguageCode,
    string Title,
    string Type,
    string Status,
    string? Scenario,
    DateTime StartedAt,
    DateTime? EndedAt,
    int DurationMinutes,
    int MessagesCount,
    int CorrectionsCount,
    int NewVocabularyCount
);

public record ConversationDetailDto(
    Guid Id,
    string LanguageCode,
    string Title,
    string Type,
    string Status,
    string? Scenario,
    DateTime StartedAt,
    DateTime? EndedAt,
    int DurationMinutes,
    List<MessageDto> Messages,
    List<ConversationFeedbackDto> Feedback
);

public record MessageDto(
    Guid Id,
    string Role,
    string Content,
    string? CorrectedContent,
    string? Explanation,
    DateTime SentAt,
    int? AudioDurationMs,
    string? AudioUrl,
    List<ExtractedVocabularyDto> ExtractedVocabulary
);

public record ExtractedVocabularyDto(
    Guid VocabularyItemId,
    string Word,
    string Translation
);

public record ConversationFeedbackDto(
    string Category,
    int Score,
    string? Comments,
    List<string> Suggestions
);

public record StartConversationRequest(
    string LanguageCode,
    string Type,
    string? Scenario = null,
    string? Title = null
);

public record SendMessageRequest(
    string Content,
    bool RequestCorrection = true,
    string? AudioBase64 = null
);

public record SendMessageResponse(
    MessageDto UserMessage,
    MessageDto AssistantMessage,
    CorrectionResultDto? Correction,
    List<ExtractedVocabularyDto> NewVocabulary
);

public record CorrectionResultDto(
    bool HasErrors,
    string CorrectedText,
    string Explanation,
    List<GrammarErrorDto> Errors
);

public record GrammarErrorDto(
    string Original,
    string Correction,
    string Explanation,
    string ErrorType
);

public record ConversationSummaryDto(
    Guid Id,
    string Title,
    string LanguageCode,
    DateTime StartedAt,
    int MessageCount,
    string LastMessagePreview
);
