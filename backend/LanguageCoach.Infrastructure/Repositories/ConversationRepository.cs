using LanguageCoach.Core.Entities;
using LanguageCoach.Core.Interfaces.Repositories;
using LanguageCoach.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LanguageCoach.Infrastructure.Repositories;

public class ConversationRepository : IConversationRepository
{
    private readonly LanguageCoachDbContext _context;

    public ConversationRepository(LanguageCoachDbContext context)
    {
        _context = context;
    }

    public async Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Conversations
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Conversation>> GetByUserIdAsync(
        Guid userId, 
        int limit = 20, 
        int offset = 0, 
        CancellationToken cancellationToken = default)
    {
        return await _context.Conversations
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.StartedAt)
            .Skip(offset)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<Conversation> CreateAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync(cancellationToken);
        return conversation;
    }

    public async Task<Conversation> UpdateAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        _context.Conversations.Update(conversation);
        await _context.SaveChangesAsync(cancellationToken);
        return conversation;
    }

    public async Task<Message> AddMessageAsync(Guid conversationId, Message message, CancellationToken cancellationToken = default)
    {
        message.ConversationId = conversationId;
        _context.Messages.Add(message);
        
        // Update conversation stats
        var conversation = await _context.Conversations.FindAsync(new object[] { conversationId }, cancellationToken);
        if (conversation != null)
        {
            conversation.MessagesCount++;
            if (message.CorrectedContent != null)
            {
                conversation.CorrectionsCount++;
            }
        }
        
        await _context.SaveChangesAsync(cancellationToken);
        return message;
    }

    public async Task<IEnumerable<Message>> GetMessagesAsync(Guid conversationId, int limit = 50, CancellationToken cancellationToken = default)
    {
        return await _context.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.SentAt)
            .Take(limit)
            .Include(m => m.ExtractedVocabulary)
            .ThenInclude(ev => ev.VocabularyItem)
            .ToListAsync(cancellationToken);
    }

    public async Task CompleteAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        var conversation = await _context.Conversations.FindAsync(new object[] { conversationId }, cancellationToken);
        if (conversation != null)
        {
            conversation.Status = ConversationStatus.Completed;
            conversation.EndedAt = DateTime.UtcNow;
            conversation.DurationMinutes = (int)(conversation.EndedAt.Value - conversation.StartedAt).TotalMinutes;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<int> GetActiveCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Conversations
            .CountAsync(c => c.UserId == userId && c.Status == ConversationStatus.Active, cancellationToken);
    }

    public async Task<ConversationStats> GetStatsAsync(Guid userId, string? languageCode = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Conversations.Where(c => c.UserId == userId);
        
        if (!string.IsNullOrEmpty(languageCode))
        {
            query = query.Where(c => c.LanguageCode == languageCode);
        }

        var conversations = await query.ToListAsync(cancellationToken);
        
        return new ConversationStats
        {
            TotalConversations = conversations.Count,
            TotalMessages = conversations.Sum(c => c.MessagesCount),
            TotalMinutes = conversations.Sum(c => c.DurationMinutes),
            TotalCorrections = conversations.Sum(c => c.CorrectionsCount),
            AverageMessagesPerConversation = conversations.Any() ? conversations.Average(c => c.MessagesCount) : 0,
            ConversationsByLanguage = conversations
                .GroupBy(c => c.LanguageCode)
                .ToDictionary(g => g.Key, g => g.Count())
        };
    }
}
