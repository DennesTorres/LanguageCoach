using Microsoft.AspNetCore.Identity;

namespace LanguageCoach.Core.Entities;

public class User : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
    public string NativeLanguage { get; set; } = "en";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastActiveAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<LearningLanguage> LearningLanguages { get; set; } = new List<LearningLanguage>();
    public ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();
    public ICollection<VocabularyItem> VocabularyItems { get; set; } = new List<VocabularyItem>();
}

public class LearningLanguage
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string LanguageCode { get; set; } = string.Empty; // 'de', 'es', 'fr', etc.
    public string LanguageName { get; set; } = string.Empty;
    public ProficiencyLevel ProficiencyLevel { get; set; } = ProficiencyLevel.Beginner;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public int TotalMinutesPracticed { get; set; }
    public int ConversationsCompleted { get; set; }
    
    public User User { get; set; } = null!;
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
