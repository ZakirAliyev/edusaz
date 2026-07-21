using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Edusaz.Infrastructure.Contexts;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<EdusazDbContext>();

        await context.Database.MigrateAsync();

        if (!context.Languages.Any())
        {
            var en = new Language { Id = Guid.NewGuid(), Name = "English", Code = "en", IsActive = true };
            var az = new Language { Id = Guid.NewGuid(), Name = "Azerbaijani", Code = "az", IsActive = true };
            var tr = new Language { Id = Guid.NewGuid(), Name = "Turkish", Code = "tr", IsActive = true };
            
            await context.Languages.AddRangeAsync(en, az, tr);
            await context.SaveChangesAsync();
        }

        if (!context.Universities.Any())
        {
            var enId = context.Languages.First(x => x.Code == "en").Id;

            var universities = new List<University>
            {
                new University
                {
                    Id = Guid.NewGuid(),
                    Country = "Azerbaijan",
                    LogoUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    WebsiteUrl = "https://ada.edu.az",
                    EstablishedYear = 2006,
                    Tuition = "$6,500/yr",
                    AcceptanceRate = "42%",
                    TeachingLanguage = "English",
                    Deadline = "Sep 1, 2025",
                    Ranking = "Est. 2006",
                    HasScholarship = true,
                    Translations = new List<UniversityTranslation>
                    {
                        new UniversityTranslation
                        {
                            Id = Guid.NewGuid(), LanguageId = enId, Name = "ADA University", City = "Baku",
                            Description = "A premier global institution in Azerbaijan."
                        }
                    }
                },
                new University
                {
                    Id = Guid.NewGuid(),
                    Country = "Turkey",
                    LogoUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    WebsiteUrl = "https://www.metu.edu.tr",
                    EstablishedYear = 1956,
                    Tuition = "$4,000/yr",
                    AcceptanceRate = "30%",
                    TeachingLanguage = "English",
                    Deadline = "Aug 15, 2025",
                    Ranking = "Top 5 National",
                    HasScholarship = true,
                    Translations = new List<UniversityTranslation>
                    {
                        new UniversityTranslation
                        {
                            Id = Guid.NewGuid(), LanguageId = enId, Name = "Middle East Technical University", City = "Ankara",
                            Description = "Leading technical university in Turkey."
                        }
                    }
                },
                new University
                {
                    Id = Guid.NewGuid(),
                    Country = "USA",
                    LogoUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    WebsiteUrl = "https://www.mit.edu",
                    EstablishedYear = 1861,
                    Tuition = "$55,000/yr",
                    AcceptanceRate = "4%",
                    TeachingLanguage = "English",
                    Deadline = "Jan 1, 2025",
                    Ranking = "#1 Global",
                    HasScholarship = true,
                    Translations = new List<UniversityTranslation>
                    {
                        new UniversityTranslation
                        {
                            Id = Guid.NewGuid(), LanguageId = enId, Name = "MIT", City = "Cambridge",
                            Description = "Massachusetts Institute of Technology."
                        }
                    }
                }
            };

            await context.Universities.AddRangeAsync(universities);
            await context.SaveChangesAsync();
        }
    }
}
