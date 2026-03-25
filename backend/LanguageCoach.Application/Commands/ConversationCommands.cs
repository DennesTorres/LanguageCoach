using LanguageCoach.Application.DTOs;
using MediatR;

namespace LanguageCoach.Application.Commands;

public record StartConversationCommand(
    Guid UserId,
    string LanguageCode,
    string Type,
    string? Scenario = null,
    string? Title = null
) : IRequest<ConversationDto>;

public record SendMessageCommand(
    Guid UserId,
    Guid ConversationId,
    string Content,
    bool RequestCorrection = true
) : IRequest<SendMessageResponse>;

public record CompleteConversationCommand(
    Guid UserId,
    Guid ConversationId
) : IRequest<bool>;

public record DeleteConversationCommand(
    Guid UserId,
    Guid ConversationId
) : IRequest<bool>;
