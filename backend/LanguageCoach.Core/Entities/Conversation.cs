namespace LanguageCoach.Core.Entities;

public class Conversation
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string LanguageCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public ConversationType Type { get; set; }
    public ConversationStatus Status { get; set; } = ConversationStatus.Active;
    public string? Scenario { get; set; } // Restaurant, Job interview, etc.
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
    public int DurationMinutes { get; set; }
    public int MessagesCount { get; set; }
    public int CorrectionsCount { get; set; }
    public int NewVocabularyCount { get; set; }
    
    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public ICollection<ConversationFeedback> Feedback { get; set; } = new List<ConversationFeedback>();
}

public class Message
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public MessageRole Role { get; set; } // User or AI
    public string Content { get; set; } = string.Empty;
    public string? CorrectedContent { get; set; } // AI correction of user message
    public string? Explanation { get; set; } // Explanation of corrections
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public int? AudioDurationMs { get; set; } // If voice message
    public string? AudioUrl { get; set; }
    
    public Conversation Conversation { get; set; } = null!;
    public ICollection<VocabularyExtraction> ExtractedVocabulary { get; set; } = new List<VocabularyExtraction>();
}

public class ConversationFeedback
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public string Category { get; set; } = string.Empty; // Grammar, Vocabulary, Pronunciation, Fluency
    public int Score { get; set; } // 1-100
    public string? Comments { get; set; }
    public List<string> Suggestions { get; set; } = new();
    
    public Conversation Conversation { get; set; } = null!;
}

public enum ConversationType
{
    FreeChat,
    Scenario,
    GrammarPractice,
    VocabularyQuiz,
    Debate,
    Interview
}

public enum ConversationStatus
{
    Active,
    Paused,
    Completed,
    Abandoned
}

public enum MessageRole
{
    User,
    Assistant,
    System
}
