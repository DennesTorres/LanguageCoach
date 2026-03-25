using LanguageCoach.Core.Entities;
using LanguageCoach.Core.Interfaces.Repositories;
using LanguageCoach.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LanguageCoach.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly LanguageCoachDbContext _context;

    public UserRepository(LanguageCoachDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.LearningLanguages)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.LearningLanguages)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AnyAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<IEnumerable<LearningLanguage>> GetLearningLanguagesAsync(
        Guid userId, 
        CancellationToken cancellationToken = default)
    {
        return await _context.LearningLanguages
            .Where(ll => ll.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<LearningLanguage> AddLearningLanguageAsync(
        Guid userId, 
        LearningLanguage learningLanguage, 
        CancellationToken cancellationToken = default)
    {
        learningLanguage.UserId = userId;
        _context.LearningLanguages.Add(learningLanguage);
        await _context.SaveChangesAsync(cancellationToken);
        return learningLanguage;
    }

    public async Task UpdateLastActiveAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user != null)
        {
            user.LastActiveAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
