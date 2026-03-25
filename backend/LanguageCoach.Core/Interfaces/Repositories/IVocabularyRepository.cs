using LanguageCoach.Core.Entities;

namespace LanguageCoach.Core.Interfaces.Repositories;

public interface IVocabularyRepository
{
    Task<VocabularyItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<VocabularyItem>> GetByUserIdAsync(Guid userId, string? languageCode = null, VocabularyStatus? status = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<VocabularyItem>> GetDueForReviewAsync(Guid userId, string languageCode, int limit = 20, CancellationToken cancellationToken = default);
    Task<VocabularyItem> CreateAsync(VocabularyItem item, CancellationToken cancellationToken = default);
    Task<VocabularyItem> UpdateAsync(VocabularyItem item, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<VocabularyExtraction> ExtractFromMessageAsync(Guid vocabularyItemId, Guid messageId, CancellationToken cancellationToken = default);
    Task<VocabularyReview> AddReviewAsync(VocabularyReview review, CancellationToken cancellationToken = default);
    Task<VocabularyStats> GetStatsAsync(Guid userId, string? languageCode = null, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid userId, string word, string languageCode, CancellationToken cancellationToken = default);
}

public class VocabularyStats
{
    public int TotalItems { get; set; }
    public int NewItems { get; set; }
    public int LearningItems { get; set; }
    public int ReviewItems { get; set; }
    public int MasteredItems { get; set; }
    public int DueForReview { get; set; }
    public Dictionary<string, int> ItemsByLanguage { get; set; } = new();
}
