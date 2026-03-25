using LanguageCoach.Application.DTOs;
using MediatR;

namespace LanguageCoach.Application.Queries;

public record GetVocabularyQuery(
    Guid UserId,
    string? LanguageCode = null,
    string? Status = null,
    string? SearchTerm = null
) : IRequest<VocabularyListDto>;

public record GetVocabularyItemQuery(
    Guid UserId,
    Guid VocabularyItemId
) : IRequest<VocabularyItemDto?>;

public record GetDueForReviewQuery(
    Guid UserId,
    string LanguageCode,
    int Limit = 20
) : IRequest<IEnumerable<VocabularyItemDto>>;

public record GetReviewSessionQuery(
    Guid UserId,
    string LanguageCode,
    int Count = 10
) : IRequest<IEnumerable<ReviewSessionDto>>;

public record GetVocabularyStatsQuery(
    Guid UserId,
    string? LanguageCode = null
) : IRequest<VocabularyStatsDto>;

public record SearchVocabularyQuery(
    Guid UserId,
    string SearchTerm,
    string? LanguageCode = null
) : IRequest<IEnumerable<VocabularyItemDto>>;
