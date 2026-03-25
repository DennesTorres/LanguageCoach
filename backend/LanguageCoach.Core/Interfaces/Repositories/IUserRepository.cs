using LanguageCoach.Core.Entities;

namespace LanguageCoach.Core.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IEnumerable<LearningLanguage>> GetLearningLanguagesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<LearningLanguage> AddLearningLanguageAsync(Guid userId, LearningLanguage learningLanguage, CancellationToken cancellationToken = default);
    Task UpdateLastActiveAsync(Guid userId, CancellationToken cancellationToken = default);
}
