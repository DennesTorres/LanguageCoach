using System.Security.Claims;
using LanguageCoach.Application.DTOs;
using LanguageCoach.Core.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanguageCoach.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IConversationRepository _conversationRepo;
    private readonly IVocabularyRepository _vocabularyRepo;
    private readonly IUserRepository _userRepo;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(
        IConversationRepository conversationRepo,
        IVocabularyRepository vocabularyRepo,
        IUserRepository userRepo,
        ILogger<AnalyticsController> logger)
    {
        _conversationRepo = conversationRepo;
        _vocabularyRepo = vocabularyRepo;
        _userRepo = userRepo;
        _logger = logger;
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(claim!);
    }

    [HttpGet("progress")]
    public async Task<ActionResult<LearningProgressDto>> GetProgress(
        [FromQuery] string? languageCode = null,
        [FromQuery] int days = 30)
    {
        var userId = GetCurrentUserId();
        var endDate = DateTime.UtcNow;
        var startDate = endDate.AddDays(-days);

        var conversations = await _conversationRepo.GetByDateRangeAsync(
            userId, startDate, endDate, languageCode);
        
        var vocabItems = await _vocabularyRepo.GetByUserIdAsync(userId, languageCode);
        var user = await _userRepo.GetByIdAsync(userId);

        var dailyProgress = new List<DailyProgressDto>();
        for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
        {
            var dayConversations = conversations.Where(c => c.StartedAt.Date == date).ToList();
            var dayVocab = vocabItems.Where(v => v.AddedAt.Date == date).ToList();
            
            dailyProgress.Add(new DailyProgressDto(
                date.ToString("yyyy-MM-dd"),
                dayConversations.Sum(c => c.DurationMinutes),
                dayConversations.Count,
                dayVocab.Count
            ));
        }

        var weeklyProgress = dailyProgress
            .GroupBy(d => DateTime.Parse(d.Date).StartOfWeek(DayOfWeek.Monday))
            .Select(g => new WeeklyProgressDto(
                g.Key.ToString("yyyy-MM-dd"),
                g.Sum(d => d.PracticeMinutes),
                g.Sum(d => d.ConversationsCount),
                g.Sum(d => d.NewVocabulary)
            ))
            .ToList();

        var totalConversations = conversations.Count;
        var totalPracticeMinutes = conversations.Sum(c => c.DurationMinutes);
        var totalMessages = conversations.Sum(c => c.MessagesCount);
        var averageCorrections = totalConversations > 0 
            ? conversations.Average(c => c.CorrectionsCount) 
            : 0;

        var vocabularyLearned = vocabItems.Count;
        var vocabularyMastered = vocabItems.Count(v => v.Status == Core.Entities.VocabularyStatus.Mastered);

        return Ok(new LearningProgressDto(
            totalConversations,
            totalPracticeMinutes,
            totalMessages,
            vocabularyLearned,
            vocabularyMastered,
            averageCorrections,
            user?.StreakDays ?? 0,
            weeklyProgress
        ));
    }

    [HttpGet("overview")]
    public async Task<ActionResult<LearningOverviewDto>> GetOverview()
    {
        var userId = GetCurrentUserId();
        
        var conversations = await _conversationRepo.GetByUserIdAsync(userId, null, 1000, 0);
        var vocabItems = await _vocabularyRepo.GetByUserIdAsync(userId);
        var user = await _userRepo.GetByIdAsync(userId);
        var learningLanguages = await _userRepo.GetLearningLanguagesAsync(userId);

        var languageBreakdown = learningLanguages
            .Select(ll => new LanguageProgressDto(
                ll.LanguageCode,
                ll.ProficiencyLevel.ToString(),
                conversations.Count(c => c.LanguageCode == ll.LanguageCode),
                conversations.Where(c => c.LanguageCode == ll.LanguageCode).Sum(c => c.DurationMinutes),
                vocabItems.Count(v => v.LanguageCode == ll.LanguageCode)
            ))
            .ToList();

        var vocabByStatus = new VocabStatusBreakdownDto(
            vocabItems.Count(v => v.Status == Core.Entities.VocabularyStatus.New),
            vocabItems.Count(v => v.Status == Core.Entities.VocabularyStatus.Learning),
            vocabItems.Count(v => v.Status == Core.Entities.VocabularyStatus.Review),
            vocabItems.Count(v => v.Status == Core.Entities.VocabularyStatus.Mastered)
        );

        var recentActivity = conversations
            .OrderByDescending(c => c.StartedAt)
            .Take(10)
            .Select(c => new RecentActivityDto(
                c.Id,
                c.Title,
                c.Type.ToString(),
                c.LanguageCode,
                c.StartedAt,
                c.DurationMinutes,
                c.MessagesCount
            ))
            .ToList();

        return Ok(new LearningOverviewDto(
            user?.StreakDays ?? 0,
            user?.TotalPracticeMinutes ?? 0,
            conversations.Count,
            vocabItems.Count,
            languageBreakdown,
            vocabByStatus,
            recentActivity
        ));
    }

    [HttpGet("weekly-goal")]
    public async Task<ActionResult<WeeklyGoalDto>> GetWeeklyGoal()
    {
        var userId = GetCurrentUserId();
        var startOfWeek = DateTime.UtcNow.StartOfWeek(DayOfWeek.Monday);
        var endOfWeek = startOfWeek.AddDays(7);

        var conversations = await _conversationRepo.GetByDateRangeAsync(
            userId, startOfWeek, endOfWeek);
        
        var practiceMinutes = conversations.Sum(c => c.DurationMinutes);
        var conversationsCount = conversations.Count;
        
        // Goals (could be configurable per user)
        const int targetMinutes = 120; // 2 hours per week
        const int targetConversations = 5;

        return Ok(new WeeklyGoalDto(
            targetMinutes,
            practiceMinutes,
            targetConversations,
            conversationsCount,
            (double)practiceMinutes / targetMinutes * 100,
            (double)conversationsCount / targetConversations * 100
        ));
    }
}

// Extension method for DateTime
file static class DateTimeExtensions
{
    public static DateTime StartOfWeek(this DateTime dt, DayOfWeek startOfWeek)
    {
        int diff = (7 + (dt.DayOfWeek - startOfWeek)) % 7;
        return dt.AddDays(-1 * diff).Date;
    }
}
