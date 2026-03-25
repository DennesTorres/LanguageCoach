using LanguageCoach.Core.Entities;
using LanguageCoach.Core.Interfaces.Repositories;
using LanguageCoach.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LanguageCoach.Infrastructure.Repositories;

public class VocabularyRepository : IVocabularyRepository
{
    private readonly LanguageCoachDbContext _context;

    public VocabularyRepository(LanguageCoachDbContext context)
    {
        _context = context;
    }

    public async Task<VocabularyItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.VocabularyItems
            .Include(v => v.Extractions)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<VocabularyItem>> GetByUserIdAsync(
        Guid userId, 
        string? languageCode = null, 
        VocabularyStatus? status = null, 
        CancellationToken cancellationToken = default)
    {
        var query = _context.VocabularyItems.Where(v => v.UserId == userId);
        
        if (!string.IsNullOrEmpty(languageCode))
        {
            query = query.Where(v => v.LanguageCode == languageCode);
        }
        
        if (status.HasValue)
        {
            query = query.Where(v => v.Status == status.Value);
        }

        return await query
            .OrderByDescending(v => v.AddedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<VocabularyItem>> GetDueForReviewAsync(
        Guid userId, 
        string languageCode, 
        int limit = 20, 
        CancellationToken cancellationToken = default)
    {
        return await _context.VocabularyItems
            .Where(v => v.UserId == userId 
                && v.LanguageCode == languageCode 
                && v.NextReviewAt <= DateTime.UtcNow
                && v.Status != VocabularyStatus.Mastered 
                && v.Status != VocabularyStatus.Archived)
            .OrderBy(v => v.NextReviewAt)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<VocabularyItem> CreateAsync(VocabularyItem item, CancellationToken cancellationToken = default)
    {
        _context.VocabularyItems.Add(item);
        await _context.SaveChangesAsync(cancellationToken);
        return item;
    }

    public async Task<VocabularyItem> UpdateAsync(VocabularyItem item, CancellationToken cancellationToken = default)
    {
        _context.VocabularyItems.Update(item);
        await _context.SaveChangesAsync(cancellationToken);
        return item;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await _context.VocabularyItems.FindAsync(new object[] { id }, cancellationToken);
        if (item != null)
        {
            _context.VocabularyItems.Remove(item);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<VocabularyExtraction> ExtractFromMessageAsync(
        Guid vocabularyItemId, 
        Guid messageId, 
        CancellationToken cancellationToken = default)
    {
        var extraction = new VocabularyExtraction
        {
            VocabularyItemId = vocabularyItemId,
            MessageId = messageId
        };
        
        _context.VocabularyExtractions.Add(extraction);
        await _context.SaveChangesAsync(cancellationToken);
        return extraction;
    }

    public async Task<VocabularyReview> AddReviewAsync(VocabularyReview review, CancellationToken cancellationToken = default)
    {
        _context.VocabularyReviews.Add(review);

        // Update vocabulary item stats
        var item = await _context.VocabularyItems.FindAsync(new object[] { review.VocabularyItemId }, cancellationToken);
        if (item != null)
        {
            item.ReviewCount++;
            item.LastReviewedAt = review.ReviewedAt;
            
            // Simple SRS: if correct, double the interval, if wrong reset
            if (review.WasCorrect)
            {
                item.DifficultyRating = Math.Min(5, item.DifficultyRating + 1);
                var daysUntilNext = item.DifficultyRating switch
                {
                    1 => 1,
                    2 => 2,
                    3 => 4,
                    4 => 7,
                    5 => 14,
                    _ => 1
                };
                item.NextReviewAt = DateTime.UtcNow.AddDays(daysUntilNext);

                // Promote status if appropriate
                if (item.ReviewCount >= 5 && item.DifficultyRating >= 4)
                {
                    item.Status = VocabularyStatus.Mastered;
                }
                else if (item.Status == VocabularyStatus.New)
                {
                    item.Status = VocabularyStatus.Learning;
                }
                else if (item.Status == VocabularyStatus.Learning && item.ReviewCount >= 3)
                {
                    item.Status = VocabularyStatus.Review;
                }
            }
            else
            {
                item.DifficultyRating = Math.Max(1, item.DifficultyRating - 1);
                item.Status = VocabularyStatus.Learning;
                item.NextReviewAt = DateTime.UtcNow.AddHours(4); // Retry soon
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return review;
    }

    public async Task<VocabularyStats> GetStatsAsync(Guid userId, string? languageCode = null, CancellationToken cancellationToken = default)
    {
        var query = _context.VocabularyItems.Where(v => v.UserId == userId);
        
        if (!string.IsNullOrEmpty(languageCode))
        {
            query = query.Where(v => v.LanguageCode == languageCode);
        }

        var items = await query.ToListAsync(cancellationToken);

        return new VocabularyStats
        {
            TotalItems = items.Count,
            NewItems = items.Count(v => v.Status == VocabularyStatus.New),
            LearningItems = items.Count(v => v.Status == VocabularyStatus.Learning),
            ReviewItems = items.Count(v => v.Status == VocabularyStatus.Review),
            MasteredItems = items.Count(v => v.Status == VocabularyStatus.Mastered),
            DueForReview = items.Count(v => v.NextReviewAt <= DateTime.UtcNow && v.Status != VocabularyStatus.Mastered && v.Status != VocabularyStatus.Archived),
            ItemsByLanguage = items
                .GroupBy(v => v.LanguageCode)
                .ToDictionary(g => g.Key, g => g.Count())
        };
    }

    public async Task<bool> ExistsAsync(Guid userId, string word, string languageCode, CancellationToken cancellationToken = default)
    {
        return await _context.VocabularyItems
            .AnyAsync(v => v.UserId == userId 
                && v.Word.ToLower() == word.ToLower() 
                && v.LanguageCode == languageCode, 
                cancellationToken);
    }
}
