using LanguageCoach.Application.DTOs;
using MediatR;

namespace LanguageCoach.Application.Queries;

public record GetConversationsQuery(
    Guid UserId,
    string? LanguageCode = null,
    int Limit = 20,
    int Offset = 0
) : IRequest<IEnumerable<ConversationDto>>;

public record GetConversationDetailQuery(
    Guid UserId,
    Guid ConversationId
) : IRequest<ConversationDetailDto?>;

public record GetConversationMessagesQuery(
    Guid UserId,
    Guid ConversationId,
    int Limit = 50
) : IRequest<IEnumerable<MessageDto>>;

public record GetConversationStatsQuery(
    Guid UserId,
    string? LanguageCode = null
) : IRequest<ConversationStatsDto>;

public record GetActiveConversationsQuery(
    Guid UserId
) : IRequest<IEnumerable<ConversationDto>>;

public record ConversationStatsDto(
    int TotalConversations,
    int TotalMessages,
    int TotalMinutes,
    int TotalCorrections,
    double AverageMessagesPerConversation,
    Dictionary<string, int> ConversationsByLanguage
);
