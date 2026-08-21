using System;
using System.Threading;
using System.Threading.Tasks;
using Edusaz.Domain.Entities;
using Edusaz.Domain.Entities.Common;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.Infrastructure.Contexts;

public class EdusazDbContext : IdentityDbContext<User, Role, Guid>
{
    public EdusazDbContext(DbContextOptions<EdusazDbContext> options) : base(options) { }

    public DbSet<Language> Languages { get; set; }
    public DbSet<University> Universities { get; set; }
    public DbSet<UniversityTranslation> UniversityTranslations { get; set; }
    public DbSet<UniversityMedia> UniversityMedias { get; set; }
    public DbSet<Program> Programs { get; set; }
    public DbSet<ProgramTranslation> ProgramTranslations { get; set; }
    public DbSet<Country> Countries { get; set; }
    public DbSet<CountryTranslation> CountryTranslations { get; set; }
    public DbSet<Scholarship> Scholarships { get; set; }
    public DbSet<ScholarshipTranslation> ScholarshipTranslations { get; set; }
    public DbSet<ScholarshipSubscription> ScholarshipSubscriptions { get; set; }
    public DbSet<PartnershipApplication> PartnershipApplications { get; set; }
    public DbSet<StudentApplication> StudentApplications { get; set; }
    public DbSet<Campaign> Campaigns { get; set; }
    public DbSet<CampaignTranslation> CampaignTranslations { get; set; }
    public DbSet<TeamMember> TeamMembers { get; set; }

    // Instructor & Course
    public DbSet<Instructor> Instructors { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<CourseTranslation> CourseTranslations { get; set; }
    public DbSet<CourseSection> CourseSections { get; set; }
    public DbSet<CourseLecture> CourseLectures { get; set; }
    public DbSet<CourseEnrollment> CourseEnrollments { get; set; }

    // Hidden Talents & Ideas
    public DbSet<HiddenTalent> HiddenTalents { get; set; }
    
    // Reviews
    public DbSet<Review> Reviews { get; set; }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedDate = DateTime.UtcNow;
                entry.Entity.LastUpdatedDate = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.LastUpdatedDate = DateTime.UtcNow;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
