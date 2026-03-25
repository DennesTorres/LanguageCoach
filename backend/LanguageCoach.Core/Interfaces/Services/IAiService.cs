namespace LanguageCoach.Core.Interfaces.Services;

public interface IAiService
{
    Task<ChatResponse> SendMessageAsync(ChatRequest request, CancellationToken cancellationToken = default);
    Task<Stream<ChatResponseStream>> SendMessageStreamAsync(ChatRequest request, CancellationToken cancellationToken = default);
    Task<CorrectionResult> CorrectMessageAsync(string message, string targetLanguage, CancellationToken cancellationToken = default);
    Task<VocabularyExtractionResult> ExtractVocabularyAsync(string message, string targetLanguage, string nativeLanguage, CancellationToken cancellationToken = default);
    Task<FeedbackResult> GenerateFeedbackAsync(IEnumerable<MessageContext> messages, string targetLanguage, CancellationToken cancellationToken = default);
    Task<string> GenerateConversationStarterAsync(string languageCode, string? scenario, ProficiencyLevel level, CancellationToken cancellationToken = default);
}

public class ChatRequest
{
    public required string SystemPrompt { get; set; }
    public required List<MessageContext> Messages { get; set; }
    public string Model { get; set; } = "gpt-4o";
    public double Temperature { get; set; } = 0.7;
    public int MaxTokens { get; set; } = 1000;
}

public class ChatResponse
{
    public required string Content { get; set; }
    public int TokensUsed { get; set; }
    public string FinishReason { get; set; } = string.Empty;
}

public class ChatResponseStream
{
    public string? Content { get; set; }
    public bool IsComplete { get; set; }
}

public class CorrectionResult
{
    public bool HasErrors { get; set; }
    public string CorrectedText { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public List<GrammarError> Errors { get; set; } = new();
}

public class GrammarError
{
    public string Original { get; set; } = string.Empty;
    public string Correction { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public string ErrorType { get; set; } = string.Empty; // grammar, vocabulary, style
}

public class VocabularyExtractionResult
{
    public List<ExtractedWord> Words { get; set; } = new();
}

public class ExtractedWord
{
    public string Word { get; set; } = string.Empty;
    public string PartOfSpeech { get; set; } = string.Empty;
    public string Translation { get; set; } = string.Empty;
    public string Definition { get; set; } = string.Empty;
    public string Context { get; set; } = string.Empty;
}

public class FeedbackResult
{
    public OverallScore Overall { get; set; } = new();
    public List<CategoryScore> Categories { get; set; } = new();
    public List<string> Strengths { get; set; } = new();
    public List<string> AreasToImprove { get; set; } = new();
    public string Summary { get; set; } = string.Empty;
}

public class OverallScore
{
    public int Score { get; set; } // 1-100
    public string Label { get; set; } = string.Empty;
}

public class CategoryScore
{
    public string Name { get; set; } = string.Empty;
    public int Score { get; set; }
    public string Comments { get; set; } = string.Empty;
}

public class MessageContext
{
    public string Role { get; set; } = string.Empty; // user, assistant
    public string Content { get; set; } = string.Empty;
}

public enum ProficiencyLevel
{
    Beginner = 1,
    Elementary = 2,
    Intermediate = 3,
    UpperIntermediate = 4,
    Advanced = 5,
    Proficient = 6
}
