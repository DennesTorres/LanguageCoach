using LanguageCoach.Application.Commands;
using LanguageCoach.Application.DTOs;
using LanguageCoach.Core.Entities;
using LanguageCoach.Core.Interfaces.Repositories;
using LanguageCoach.Core.Interfaces.Services;
using MediatR;

namespace LanguageCoach.Application.Handlers;

public class StartConversationHandler : IRequestHandler<StartConversationCommand, ConversationDto>
{
    private readonly IConversationRepository _conversationRepo;
    private readonly IUserRepository _userRepo;
    private readonly IAiService _aiService;

    public StartConversationHandler(
        IConversationRepository conversationRepo,
        IUserRepository userRepo,
        IAiService aiService)
    {
        _conversationRepo = conversationRepo;
        _userRepo = userRepo;
        _aiService = aiService;
    }

    public async Task<ConversationDto> Handle(StartConversationCommand request, CancellationToken cancellationToken)
    {
        // Get user's proficiency level for the language
        var learningLanguages = await _userRepo.GetLearningLanguagesAsync(request.UserId, cancellationToken);
        var lang = learningLanguages.FirstOrDefault(l => l.LanguageCode == request.LanguageCode);
        
        var title = request.Title ?? $"{request.Type} - {DateTime.Now:MMM dd}";
        
        var conversation = new Conversation
        {
            UserId = request.UserId,
            LanguageCode = request.LanguageCode,
            Title = title,
            Type = Enum.Parse<ConversationType>(request.Type),
            Scenario = request.Scenario
        };

        var created = await _conversationRepo.CreateAsync(conversation, cancellationToken);

        // Generate initial AI message
        var starter = await _aiService.GenerateConversationStarterAsync(
            request.LanguageCode, 
            request.Scenario, 
            lang?.ProficiencyLevel ?? ProficiencyLevel.Beginner, 
            cancellationToken);

        await _conversationRepo.AddMessageAsync(created.Id, new Message
        {
            Role = MessageRole.Assistant,
            Content = starter
        }, cancellationToken);

        return MapToDto(created);
    }

    private static ConversationDto MapToDto(Conversation c) => new(
        c.Id,
        c.LanguageCode,
        c.Title,
        c.Type.ToString(),
        c.Status.ToString(),
        c.Scenario,
        c.StartedAt,
        c.EndedAt,
        c.DurationMinutes,
        c.MessagesCount,
        c.CorrectionsCount,
        c.NewVocabularyCount
    );
}

public class SendMessageHandler : IRequestHandler<SendMessageCommand, SendMessageResponse>
{
    private readonly IConversationRepository _conversationRepo;
    private readonly IVocabularyRepository _vocabularyRepo;
    private readonly IAiService _aiService;

    public SendMessageHandler(
        IConversationRepository conversationRepo,
        IVocabularyRepository vocabularyRepo,
        IAiService aiService)
    {
        _conversationRepo = conversationRepo;
        _vocabularyRepo = vocabularyRepo;
        _aiService = aiService;
    }

    public async Task<SendMessageResponse> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var conversation = await _conversationRepo.GetByIdAsync(request.ConversationId, cancellationToken);
        if (conversation == null || conversation.UserId != request.UserId)
            throw new UnauthorizedAccessException("Conversation not found");

        // Add user message
        var userMessage = new Message
        {
            Role = MessageRole.User,
            Content = request.Content
        };
        var savedUserMessage = await _conversationRepo.AddMessageAsync(conversation.Id, userMessage, cancellationToken);

        // Get correction if requested
        CorrectionResultDto? correctionDto = null;
        if (request.RequestCorrection)
        {
            var correction = await _aiService.CorrectMessageAsync(
                request.Content, 
                conversation.LanguageCode, 
                cancellationToken);
            
            if (correction.HasErrors)
            {
                savedUserMessage.CorrectedContent = correction.CorrectedText;
                savedUserMessage.Explanation = correction.Explanation;
                await _conversationRepo.UpdateAsync(conversation, cancellationToken);
            }

            correctionDto = new CorrectionResultDto(
                correction.HasErrors,
                correction.CorrectedText,
                correction.Explanation,
                correction.Errors.Select(e => new GrammarErrorDto(
                    e.Original, e.Correction, e.Explanation, e.ErrorType
                )).ToList()
            );
        }

        // Get conversation context for AI
        var messages = await _conversationRepo.GetMessagesAsync(conversation.Id, 10, cancellationToken);
        var context = messages.Select(m => new MessageContext
        {
            Role = m.Role.ToString().ToLower(),
            Content = m.Content
        }).ToList();

        // Build system prompt based on conversation settings
        var systemPrompt = BuildSystemPrompt(conversation);

        // Get AI response
        var aiResponse = await _aiService.SendMessageAsync(new ChatRequest
        {
            SystemPrompt = systemPrompt,
            Messages = context,
            Temperature = 0.8
        }, cancellationToken);

        var assistantMessage = new Message
        {
            Role = MessageRole.Assistant,
            Content = aiResponse.Content
        };
        var savedAssistantMessage = await _conversationRepo.AddMessageAsync(conversation.Id, assistantMessage, cancellationToken);

        // Extract vocabulary
        var newVocabulary = new List<ExtractedVocabularyDto>();
        var extraction = await _aiService.ExtractVocabularyAsync(
            request.Content, 
            conversation.LanguageCode, 
            "en", // TODO: Get from user profile
            cancellationToken);

        foreach (var word in extraction.Words)
        {
            if (!await _vocabularyRepo.ExistsAsync(request.UserId, word.Word, conversation.LanguageCode, cancellationToken))
            {
                var vocab = await _vocabularyRepo.CreateAsync(new VocabularyItem
                {
                    UserId = request.UserId,
                    LanguageCode = conversation.LanguageCode,
                    Word = word.Word,
                    Translation = word.Translation,
                    Definition = word.Definition,
                    ContextPhrase = word.Context,
                    PartOfSpeech = Enum.TryParse<PartOfSpeech>(word.PartOfSpeech, true, out var pos) ? pos : PartOfSpeech.Other,
                    Source = VocabularySource.Conversation
                }, cancellationToken);

                await _vocabularyRepo.ExtractFromMessageAsync(vocab.Id, savedUserMessage.Id, cancellationToken);
                
                newVocabulary.Add(new ExtractedVocabularyDto(vocab.Id, vocab.Word, vocab.Translation));
            }
        }

        return new SendMessageResponse(
            MapMessageToDto(savedUserMessage),
            MapMessageToDto(savedAssistantMessage),
            correctionDto,
            newVocabulary
        );
    }

    private static string BuildSystemPrompt(Conversation conversation)
    {
        var basePrompt = $"""You are a helpful language tutor conducting a conversation in {conversation.LanguageCode}.

Your role is to:
1. Engage in natural, friendly conversation
2. Adapt to the user's proficiency level
3. Gently correct major errors without interrupting flow
4. Introduce relevant vocabulary naturally
5. Ask follow-up questions to keep conversation going
""";

        if (!string.IsNullOrEmpty(conversation.Scenario))
        {
            basePrompt += $"\n\nYou are in this scenario: {conversation.Scenario}. Stay in character.";
        }

        return basePrompt;
    }

    private static MessageDto MapMessageToDto(Message m) => new(
        m.Id,
        m.Role.ToString(),
        m.Content,
        m.CorrectedContent,
        m.Explanation,
        m.SentAt,
        m.AudioDurationMs,
        m.AudioUrl,
        m.ExtractedVocabulary?.Select(ev => new ExtractedVocabularyDto(
            ev.VocabularyItemId, ev.VocabularyItem.Word, ev.VocabularyItem.Translation
        )).ToList() ?? new List<ExtractedVocabularyDto>()
    );
}
