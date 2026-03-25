using LanguageCoach.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LanguageCoach.Infrastructure.Data;

public class LanguageCoachDbContext : IdentityDbContext<User, Microsoft.AspNetCore.Identity.IdentityRole<Guid>, Guid>
{
    public LanguageCoachDbContext(DbContextOptions<LanguageCoachDbContext> options) : base(options)
    {
    }

    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<ConversationFeedback> ConversationFeedback => Set<ConversationFeedback>();
    public DbSet<VocabularyItem> VocabularyItems => Set<VocabularyItem>();
    public DbSet<VocabularyExtraction> VocabularyExtractions => Set<VocabularyExtraction>();
    public DbSet<VocabularyReview> VocabularyReviews => Set<VocabularyReview>();
    public DbSet<LearningLanguage> LearningLanguages => Set<LearningLanguage>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // User configuration
        builder.Entity<User>(entity =>
        {
            entity.Property(u => u.DisplayName).HasMaxLength(100).IsRequired();
            entity.Property(u => u.NativeLanguage).HasMaxLength(10).HasDefaultValue("en");
            entity.HasIndex(u => u.LastActiveAt);
        });

        // LearningLanguage configuration
        builder.Entity<LearningLanguage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LanguageCode).HasMaxLength(10).IsRequired();
            entity.Property(e => e.LanguageName).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => new { e.UserId, e.LanguageCode }).IsUnique();
            entity.HasOne(e => e.User)
                .WithMany(u => u.LearningLanguages)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Conversation configuration
        builder.Entity<Conversation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LanguageCode).HasMaxLength(10).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Scenario).HasMaxLength(500);
            entity.HasIndex(e => new { e.UserId, e.Status });
            entity.HasIndex(e => e.StartedAt);
            entity.HasOne(e => e.User)
                .WithMany(u => u.Conversations)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Message configuration
        builder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.AudioUrl).HasMaxLength(500);
            entity.HasIndex(e => new { e.ConversationId, e.SentAt });
            entity.HasOne(e => e.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(e => e.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ConversationFeedback configuration
        builder.Entity<ConversationFeedback>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Category).HasMaxLength(50).IsRequired();
            entity.HasOne(e => e.Conversation)
                .WithMany(c => c.Feedback)
                .HasForeignKey(e => e.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // VocabularyItem configuration
        builder.Entity<VocabularyItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LanguageCode).HasMaxLength(10).IsRequired();
            entity.Property(e => e.Word).HasMaxLength(200).IsRequired();
            entity.Property(e => e.ContextPhrase).HasMaxLength(500);
            entity.Property(e => e.Translation).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Definition).HasMaxLength(1000);
            entity.HasIndex(e => new { e.UserId, e.LanguageCode, e.Status });
            entity.HasIndex(e => e.NextReviewAt);
            entity.HasIndex(e => new { e.UserId, e.Word, e.LanguageCode }).IsUnique();
            entity.HasOne(e => e.User)
                .WithMany(u => u.VocabularyItems)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // VocabularyExtraction configuration
        builder.Entity<VocabularyExtraction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.VocabularyItemId, e.MessageId }).IsUnique();
            entity.HasOne(e => e.VocabularyItem)
                .WithMany(v => v.Extractions)
                .HasForeignKey(e => e.VocabularyItemId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Message)
                .WithMany(m => m.ExtractedVocabulary)
                .HasForeignKey(e => e.MessageId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // VocabularyReview configuration
        builder.Entity<VocabularyReview>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.VocabularyItemId, e.ReviewedAt });
            entity.HasOne(e => e.VocabularyItem)
                .WithMany()
                .HasForeignKey(e => e.VocabularyItemId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Enum conversions
        builder.Entity<Conversation>().Property(e => e.Type).HasConversion<string>().HasMaxLength(50);
        builder.Entity<Conversation>().Property(e => e.Status).HasConversion<string>().HasMaxLength(50);
        builder.Entity<Message>().Property(e => e.Role).HasConversion<string>().HasMaxLength(50);
        builder.Entity<VocabularyItem>().Property(e => e.PartOfSpeech).HasConversion<string>().HasMaxLength(50);
        builder.Entity<VocabularyItem>().Property(e => e.Source).HasConversion<string>().HasMaxLength(50);
        builder.Entity<VocabularyItem>().Property(e => e.Status).HasConversion<string>().HasMaxLength(50);
        builder.Entity<VocabularyReview>().Property(e => e.Type).HasConversion<string>().HasMaxLength(50);
        builder.Entity<LearningLanguage>().Property(e => e.ProficiencyLevel).HasConversion<string>().HasMaxLength(50);
    }
}
