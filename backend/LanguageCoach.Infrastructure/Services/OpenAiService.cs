using System.Text.Json;
using Azure.AI.OpenAI;
using LanguageCoach.Core.Interfaces.Services;
using OpenAI.Chat;

namespace LanguageCoach.Infrastructure.Services;

public class OpenAiService : IAiService
{
    private readonly AzureOpenAIClient _client;
    private readonly ILogger<OpenAiService> _logger;
    private const string DefaultModel = "gpt-4o";

    public OpenAiService(string endpoint, string apiKey, ILogger<OpenAiService> logger)
    {
        _client = new AzureOpenAIClient(new Uri(endpoint), new System.ClientModel.ApiKeyCredential(apiKey));
        _logger = logger;
    }

    public async Task<ChatResponse> SendMessageAsync(ChatRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var chatClient = _client.GetChatClient(request.Model ?? DefaultModel);
            
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(request.SystemPrompt)
            };

            foreach (var msg in request.Messages)
            {
                messages.Add(msg.Role.ToLower() == "user" 
                    ? new UserChatMessage(msg.Content)
                    : new AssistantChatMessage(msg.Content));
            }

            var options = new ChatCompletionOptions
            {
                Temperature = (float)request.Temperature,
                MaxOutputTokenCount = request.MaxTokens
            };

            var response = await chatClient.CompleteChatAsync(messages, options, cancellationToken);

            return new ChatResponse
            {
                Content = response.Value.Content[0].Text,
                TokensUsed = response.Value.Usage.TotalTokenCount,
                FinishReason = response.Value.FinishReason.ToString()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Azure OpenAI");
            throw;
        }
    }

    public async Task<Stream<ChatResponseStream>> SendMessageStreamAsync(ChatRequest request, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Streaming not yet implemented");
    }

    public async Task<CorrectionResult> CorrectMessageAsync(string message, string targetLanguage, CancellationToken cancellationToken = default)
    {
        var systemPrompt = $"""You are a helpful language tutor. Check the following message in {targetLanguage} for grammar, vocabulary, and style errors.

Respond in this exact JSON format:
{{
    "hasErrors": true/false,
    "correctedText": "corrected version or same if no errors",
    "explanation": "brief explanation of errors or confirmation it's correct",
    "errors": [
        {{
            "original": "error text",
            "correction": "corrected text",
            "explanation": "why this is wrong",
            "errorType": "grammar/vocabulary/style"
        }}
    ]
}}

If there are no errors, return hasErrors: false and empty errors array.""";

        try
        {
            var chatClient = _client.GetChatClient(DefaultModel);
            
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(message)
            };

            var response = await chatClient.CompleteChatAsync(messages, cancellationToken: cancellationToken);
            var content = response.Value.Content[0].Text;
            
            // Extract JSON if wrapped in markdown
            if (content.Contains("```json"))
            {
                content = content.Split(new[] { "```json", "```" }, StringSplitOptions.None)[1];
            }
            else if (content.Contains("```"))
            {
                content = content.Split(new[] { "```" }, StringSplitOptions.None)[1];
            }

            var result = JsonSerializer.Deserialize<CorrectionResult>(content.Trim(), new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result ?? new CorrectionResult { HasErrors = false, CorrectedText = message };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error correcting message");
            return new CorrectionResult { HasErrors = false, CorrectedText = message };
        }
    }

    public async Task<VocabularyExtractionResult> ExtractVocabularyAsync(
        string message, 
        string targetLanguage, 
        string nativeLanguage, 
        CancellationToken cancellationToken = default)
    {
        var systemPrompt = $"""You are a language learning assistant. Extract 2-5 useful vocabulary items from the following message in {targetLanguage}.

For each word or phrase, provide:
- The word/phrase as used
- Part of speech
- Translation to {nativeLanguage}
- Brief definition in {targetLanguage}
- The context from the original message

Only extract words that would be valuable for a language learner (not extremely basic words like "the", "and" unless used idiomatically).

Respond in this exact JSON format:
{{
    "words": [
        {{
            "word": "extracted word",
            "partOfSpeech": "noun/verb/adjective/adverb/etc",
            "translation": "translation",
            "definition": "brief definition",
            "context": "context from original message"
        }}
    ]
}}""";

        try
        {
            var chatClient = _client.GetChatClient(DefaultModel);
            
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(message)
            };

            var response = await chatClient.CompleteChatAsync(messages, cancellationToken: cancellationToken);
            var content = response.Value.Content[0].Text;
            
            // Extract JSON if wrapped in markdown
            if (content.Contains("```json"))
            {
                content = content.Split(new[] { "```json", "```" }, StringSplitOptions.None)[1];
            }
            else if (content.Contains("```"))
            {
                content = content.Split(new[] { "```" }, StringSplitOptions.None)[1];
            }

            var result = JsonSerializer.Deserialize<VocabularyExtractionResult>(content.Trim(), new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result ?? new VocabularyExtractionResult { Words = new List<ExtractedWord>() };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting vocabulary");
            return new VocabularyExtractionResult { Words = new List<ExtractedWord>() };
        }
    }

    public async Task<FeedbackResult> GenerateFeedbackAsync(
        IEnumerable<MessageContext> messages, 
        string targetLanguage, 
        CancellationToken cancellationToken = default)
    {
        var conversationHistory = string.Join("\n", messages.Select(m => $"{m.Role}: {m.Content}"));
        
        var systemPrompt = $"""You are a language tutor. Analyze this conversation in {targetLanguage} and provide detailed feedback.

Provide feedback in this exact JSON format:
{{
    "overall": {{
        "score": 75,
        "label": "Good progress"
    }},
    "categories": [
        {{
            "name": "Grammar",
            "score": 80,
            "comments": "Good use of tenses, watch out for prepositions"
        }},
        {{
            "name": "Vocabulary",
            "score": 70,
            "comments": "Good range, could use more varied expressions"
        }}
    ],
    "strengths": ["consistent verb conjugation", "good use of connectors"],
    "areasToImprove": ["preposition usage", "more complex sentence structures"],
    "summary": "Brief overall summary of the conversation performance"
}}""";

        try
        {
            var chatClient = _client.GetChatClient(DefaultModel);
            
            var chatMessages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage($"Analyze this conversation:\n\n{conversationHistory}")
            };

            var response = await chatClient.CompleteChatAsync(chatMessages, cancellationToken: cancellationToken);
            var content = response.Value.Content[0].Text;
            
            // Extract JSON if wrapped in markdown
            if (content.Contains("```json"))
            {
                content = content.Split(new[] { "```json", "```" }, StringSplitOptions.None)[1];
            }
            else if (content.Contains("```"))
            {
                content = content.Split(new[] { "```" }, StringSplitOptions.None)[1];
            }

            var result = JsonSerializer.Deserialize<FeedbackResult>(content.Trim(), new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result ?? new FeedbackResult 
            { 
                Overall = new OverallScore { Score = 70, Label = "Good effort" },
                Categories = new List<CategoryScore>(),
                Strengths = new List<string>(),
                AreasToImprove = new List<string>(),
                Summary = "Keep practicing!"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating feedback");
            return new FeedbackResult 
            { 
                Overall = new OverallScore { Score = 70, Label = "Good effort" },
                Categories = new List<CategoryScore>(),
                Strengths = new List<string>(),
                AreasToImprove = new List<string>(),
                Summary = "Keep practicing!"
            };
        }
    }

    public async Task<string> GenerateConversationStarterAsync(
        string languageCode, 
        string? scenario, 
        ProficiencyLevel level, 
        CancellationToken cancellationToken = default)
    {
        var levelDescription = level switch
        {
            ProficiencyLevel.Beginner => "simple, short sentences with basic vocabulary",
            ProficiencyLevel.Elementary => "simple sentences, everyday topics",
            ProficiencyLevel.Intermediate => "natural conversation, some complex structures",
            ProficiencyLevel.UpperIntermediate => "varied vocabulary and complex sentences",
            ProficiencyLevel.Advanced => "sophisticated language, nuanced expressions",
            ProficiencyLevel.Proficient => "native-level fluency expectations",
            _ => "natural conversation appropriate to level"
        };

        var scenarioText = string.IsNullOrEmpty(scenario) 
            ? "Start a friendly general conversation" 
            : $"Start a conversation in this scenario: {scenario}";

        var prompt = $"""{scenarioText} in {languageCode}. 

Adapt to {level} level: {levelDescription}.

Start with a greeting and one engaging question. Keep it to 1-2 sentences. Be warm and encouraging.""";

        try
        {
            var chatClient = _client.GetChatClient(DefaultModel);
            
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage("You are a friendly language tutor starting a conversation."),
                new UserChatMessage(prompt)
            };

            var response = await chatClient.CompleteChatAsync(messages, cancellationToken: cancellationToken);
            return response.Value.Content[0].Text.Trim();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating conversation starter");
            return "Hello! How are you today? Let's practice together!";
        }
    }
}
