using LanguageCoach.Application.DTOs;
using MediatR;

namespace LanguageCoach.Application.Commands;

public record CreateVocabularyCommand(
    Guid UserId,
    string LanguageCode,
    string Word,
    string Translation,
    string? Definition = null,
    string? PartOfSpeech = null,
    string? ContextPhrase = null
) : IRequest<VocabularyItemDto>;

public record QuickAddVocabularyCommand(
    Guid UserId,
    string LanguageCode,
    string Word,
    string? ContextPhrase = null
) : IRequest<VocabularyItemDto>;

public record UpdateVocabularyCommand(
    Guid UserId,
    Guid VocabularyItemId,
    string? Status = null,
    string? Translation = null,
    string? Definition = null
) : IRequest<VocabularyItemDto>;

public record DeleteVocabularyCommand(
    Guid UserId,
    Guid VocabularyItemId
) : IRequest<bool>;

public record ReviewVocabularyCommand(
    Guid UserId,
    Guid VocabularyItemId,
    bool WasCorrect,
    int ConfidenceLevel
) : IRequest<VocabularyItemDto>;

public record ExtractVocabularyFromMessageCommand(
    Guid UserId,
    Guid ConversationId,
    Guid MessageId
) : IRequest<List<ExtractedVocabularyDto>>;
