using LanguageCoach.Core.Entities;

namespace LanguageCoach.Core.Interfaces.Repositories;

public interface IConversationRepository
{
    Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Conversation>> GetByUserIdAsync(Guid userId, int limit = 20, int offset = 0, CancellationToken cancellationToken = default);
    Task<Conversation> CreateAsync(Conversation conversation, CancellationToken cancellationToken = default);
    Task<Conversation> UpdateAsync(Conversation conversation, CancellationToken cancellationToken = default);
    Task<Message> AddMessageAsync(Guid conversationId, Message message, CancellationToken cancellationToken = default);
    Task<IEnumerable<Message>> GetMessagesAsync(Guid conversationId, int limit = 50, CancellationToken cancellationToken = default);
    Task CompleteAsync(Guid conversationId, CancellationToken cancellationToken = default);
    Task<int> GetActiveCountAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<ConversationStats> GetStatsAsync(Guid userId, string? languageCode = null, CancellationToken cancellationToken = default);
}

public class ConversationStats
{
    public int TotalConversations { get; set; }
    public int TotalMessages { get; set; }
    public int TotalMinutes { get; set; }
    public int TotalCorrections { get; set; }
    public double AverageMessagesPerConversation { get; set; }
    public Dictionary<string, int> ConversationsByLanguage { get; set; } = new();
}
