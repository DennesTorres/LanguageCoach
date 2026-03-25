namespace LanguageCoach.Core.Entities;

public class VocabularyItem
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string LanguageCode { get; set; } = string.Empty;
    public string Word { get; set; } = string.Empty;
    public string? ContextPhrase { get; set; } // How it was used in conversation
    public string Translation { get; set; } = string.Empty;
    public string? Definition { get; set; }
    public PartOfSpeech PartOfSpeech { get; set; }
    public VocabularySource Source { get; set; }
    public VocabularyStatus Status { get; set; } = VocabularyStatus.New;
    public int ReviewCount { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastReviewedAt { get; set; }
    public DateTime? NextReviewAt { get; set; } // SRS algorithm
    public int DifficultyRating { get; set; } = 3; // 1-5, for SRS
    
    public User User { get; set; } = null!;
    public ICollection<VocabularyExtraction> Extractions { get; set; } = new List<VocabularyExtraction>();
}

public class VocabularyExtraction
{
    public Guid Id { get; set; }
    public Guid VocabularyItemId { get; set; }
    public Guid MessageId { get; set; }
    public DateTime ExtractedAt { get; set; } = DateTime.UtcNow;
    
    public VocabularyItem VocabularyItem { get; set; } = null!;
    public Message Message { get; set; } = null!;
}

public class VocabularyReview
{
    public Guid Id { get; set; }
    public Guid VocabularyItemId { get; set; }
    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    public bool WasCorrect { get; set; }
    public int ConfidenceLevel { get; set; } // 1-5
    public ReviewType Type { get; set; }
    
    public VocabularyItem VocabularyItem { get; set; } = null!;
}

public enum PartOfSpeech
{
    Noun,
    Verb,
    Adjective,
    Adverb,
    Pronoun,
    Preposition,
    Conjunction,
    Interjection,
    Phrase,
    Other
}

public enum VocabularySource
{
    Conversation,
    ManualEntry,
    Import,
    Lesson
}

public enum VocabularyStatus
{
    New,
    Learning,
    Review,
    Mastered,
    Archived
}

public enum ReviewType
{
    Flashcard,
    Quiz,
    Typing,
    Context
}
