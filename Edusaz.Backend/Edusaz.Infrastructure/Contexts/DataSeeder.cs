using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Edusaz.Infrastructure.Contexts;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.GetRequiredService<EdusazDbContext>();

        try
        {
            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""UniversityId"" uuid;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""ProfileImageUrl"" text;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""Country"" text;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""DegreeLevel"" text;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""DesiredField"" text;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""EnglishScore"" text;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""Gpa"" double precision;
                CREATE TABLE IF NOT EXISTS ""UniversityMedias"" (
                    ""Id"" uuid PRIMARY KEY,
                    ""UniversityId"" uuid NOT NULL,
                    ""MediaType"" text NOT NULL,
                    ""Url"" text NOT NULL,
                    ""OrderIndex"" integer NOT NULL DEFAULT 0,
                    ""CreatedDate"" timestamp with time zone NOT NULL DEFAULT now(),
                    ""LastUpdatedDate"" timestamp with time zone NOT NULL DEFAULT now(),
                    ""DeletedDate"" timestamp with time zone,
                    ""IsDeleted"" boolean NOT NULL DEFAULT false
                );
            ");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DB Schema sync pre-check: {ex.Message}");
        }

        try
        {
            await context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DB Migration warning: {ex.Message}");
        }

        // 1. Seed Roles & SuperAdmin User
        try
        {
            await SeedSuperAdminAsync(serviceProvider, context);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"SeedSuperAdminAsync error: {ex.Message}");
        }

        // 2. Seed Languages
        await SeedLanguagesAsync(context);

        var enId = (await context.Languages.FirstAsync(x => x.Code == "en")).Id;
        var azId = (await context.Languages.FirstAsync(x => x.Code == "az")).Id;
        var trId = (await context.Languages.FirstAsync(x => x.Code == "tr")).Id;

        // 3. Seed Countries
        await SeedCountriesAsync(context, azId, trId);

        // 4. Seed Universities
        await SeedUniversitiesAsync(context, enId, azId, trId);

        // 5. Programs & Scholarships are now managed via admin panel — no longer cleared on restart

        // 6. Seed Instructors & Courses
        await SeedInstructorsAndCoursesAsync(serviceProvider, context, enId, azId, trId);

        // 7. Seed Student Applications, Campaigns, Team Members
        await SeedPortalDataAsync(context, azId, enId);
    }

    private static async Task SeedSuperAdminAsync(IServiceProvider serviceProvider, EdusazDbContext context)
    {
        var userManager = serviceProvider.GetService<UserManager<User>>();
        var roleManager = serviceProvider.GetService<RoleManager<Role>>();

        if (userManager != null && roleManager != null)
        {
            // Seed all required roles
            var requiredRoles = new[] { "SuperAdmin", "Instructor", "Student", "Teacher", "CourseCenter", "UniversityAdmin" };
            foreach (var roleName in requiredRoles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                    await roleManager.CreateAsync(new Role { Name = roleName });
            }

            const string superAdminRole = "SuperAdmin";

            const string adminEmail = "superadmin@edu.saz";
            var superAdminUser = await userManager.FindByEmailAsync(adminEmail);
            if (superAdminUser == null)
            {
                superAdminUser = new User
                {
                    Id = Guid.NewGuid(),
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FirstName = "Super",
                    LastName = "Admin",
                    CreatedAt = DateTime.UtcNow
                };

                var createResult = await userManager.CreateAsync(superAdminUser, "EduSaz2026!");
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(superAdminUser, superAdminRole);
                }
            }
        }
    }

    private static async Task SeedLanguagesAsync(EdusazDbContext context)
    {
        if (!context.Languages.Any())
        {
            var en = new Language { Id = Guid.NewGuid(), Name = "English", Code = "en", IsActive = true };
            var az = new Language { Id = Guid.NewGuid(), Name = "Azerbaijani", Code = "az", IsActive = true };
            var tr = new Language { Id = Guid.NewGuid(), Name = "Turkish", Code = "tr", IsActive = true };

            await context.Languages.AddRangeAsync(en, az, tr);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedCountriesAsync(EdusazDbContext context, Guid azId, Guid trId)
    {
        var existingCodes = await context.Countries.Select(c => c.Code.ToLower()).ToListAsync();

        var countryDefs = new List<Country>
        {
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "az",
                DefaultName = "Azerbaijan",
                DefaultLabel = "Affordable & Rich Heritage",
                FlagEmoji = "🇦🇿",
                UniversityCount = 48,
                AverageCost = "$1,500-$8,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Azərbaycan", Label = "Əlverişli və Zəngin İrs" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Azerbaycan", Label = "Uygun ve Zengin Miras" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "tr",
                DefaultName = "Turkey",
                DefaultLabel = "Popular Destination",
                FlagEmoji = "🇹🇷",
                UniversityCount = 186,
                AverageCost = "$2,000-$10,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Türkiyə", Label = "Populyar Məkan" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Türkiye", Label = "Popüler Lokasyon" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "de",
                DefaultName = "Germany",
                DefaultLabel = "Tuition-Free Options",
                FlagEmoji = "🇩🇪",
                UniversityCount = 300,
                AverageCost = "€0-€3,500/yr",
                ImageUrl = "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Almaniya", Label = "Pulsuz Təhsil Seçimləri" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Almanya", Label = "Ücretsiz Eğitim Seçenekleri" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "uk",
                DefaultName = "United Kingdom",
                DefaultLabel = "World-Class Rankings",
                FlagEmoji = "🇬🇧",
                UniversityCount = 165,
                AverageCost = "£9,000-£38,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Böyük Britaniya", Label = "Dünya Səviyyəli Reytinq" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Birleşik Krallık", Label = "Dünya Çapında Sıralamalar" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "ca",
                DefaultName = "Canada",
                DefaultLabel = "Post-Study Work Visa",
                FlagEmoji = "🇨🇦",
                UniversityCount = 220,
                AverageCost = "$15,000-$35,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Kanada", Label = "Təhsildən Sonra İş Vizası" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Kanada", Label = "Mezuniyet Sonrası Çalışma Vizesi" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "usa",
                DefaultName = "USA",
                DefaultLabel = "Top Global Universities",
                FlagEmoji = "🇺🇸",
                UniversityCount = 350,
                AverageCost = "$20,000-$65,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "ABŞ", Label = "Dünya Səviyyəli Universitetlər" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "ABD", Label = "Dünya Çapında Üniversiteler" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "it",
                DefaultName = "Italy",
                DefaultLabel = "Historic Universities",
                FlagEmoji = "🇮🇹",
                UniversityCount = 99,
                AverageCost = "€1,000-€18,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "İtaliya", Label = "Tarixi Universitetlər" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "İtalya", Label = "Tarihi Üniversiteler" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "pl",
                DefaultName = "Poland",
                DefaultLabel = "EU Recognition",
                FlagEmoji = "🇵🇱",
                UniversityCount = 130,
                AverageCost = "$2,500-$8,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1519197924294-4ac978a3e048?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Polşa", Label = "Aİ Tərəfindən Tanınma" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Polonya", Label = "AB Tarafından Tanınma" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "hu",
                DefaultName = "Hungary",
                DefaultLabel = "Stipendium Scholarships",
                FlagEmoji = "🇭🇺",
                UniversityCount = 78,
                AverageCost = "$3,000-$12,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Macarıstan", Label = "Stipendium Təqaüdləri" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Macaristan", Label = "Burs İmkanları" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "ae",
                DefaultName = "UAE",
                DefaultLabel = "Global Business Hub",
                FlagEmoji = "🇦🇪",
                UniversityCount = 67,
                AverageCost = "$8,000-$25,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "BƏƏ", Label = "Qlobal Biznes Mərkəzi" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "BAE", Label = "Küresel İş Merkezi" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "my",
                DefaultName = "Malaysia",
                DefaultLabel = "Affordable English",
                FlagEmoji = "🇲🇾",
                UniversityCount = 95,
                AverageCost = "$3,000-$12,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1596422846543-74c6eb24f628?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Malayziya", Label = "Sərfəli İngilis Dili" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Malezya", Label = "Uygun İngilizce Eğitimi" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "nl",
                DefaultName = "Netherlands",
                DefaultLabel = "Top Innovation & Tech",
                FlagEmoji = "🇳🇱",
                UniversityCount = 55,
                AverageCost = "€2,500-€18,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Niderland", Label = "İnnovasiya və Texnologiya" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Hollanda", Label = "İnovasyon ve Teknoloji" }
                }
            },
            new Country
            {
                Id = Guid.NewGuid(),
                Code = "se",
                DefaultName = "Sweden",
                DefaultLabel = "Sustainability & Research",
                FlagEmoji = "🇸🇪",
                UniversityCount = 45,
                AverageCost = "SEK 80,000-140,000/yr",
                ImageUrl = "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80",
                Translations = new List<CountryTranslation>
                {
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "İsveç", Label = "Davamlılıq və Tədqiqat" },
                    new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "İsveç", Label = "Sürdürülebilirlik ve Araştırma" }
                }
            }
        };

        foreach (var c in countryDefs)
        {
            if (!existingCodes.Contains(c.Code.ToLower()))
            {
                await context.Countries.AddAsync(c);
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedUniversitiesAsync(EdusazDbContext context, Guid enId, Guid azId, Guid trId)
    {
        var existingWebsites = await context.Universities.Select(u => u.WebsiteUrl.ToLower().Trim()).ToListAsync();
        var allCountries = await context.Countries.ToListAsync();

        var list = new List<University>
        {
            // USA
            new University
            {
                Id = Guid.NewGuid(), Country = "USA",
                LogoUrl = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.harvard.edu", EstablishedYear = 1636, Tuition = "$54,000/yr", AcceptanceRate = "4%",
                TeachingLanguage = "English", Deadline = "Jan 1, 2026", Ranking = "#1 Global", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Harvard University", City = "Cambridge, MA", Description = "Oldest and most prestigious higher education institution in the United States." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Harvard Universiteti", City = "Kembric, MA", Description = "ABŞ-ın ən qədim, ən nüfuzlu və dünya şöhrətli tədqiqat universiteti." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Harvard Üniversitesi", City = "Cambridge, MA", Description = "Amerika Birleşik Devletleri'nin en köklü ve saygın üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "USA",
                LogoUrl = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.mit.edu", EstablishedYear = 1861, Tuition = "$58,000/yr", AcceptanceRate = "4%",
                TeachingLanguage = "English", Deadline = "Jan 5, 2026", Ranking = "#1 Engineering", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Massachusetts Institute of Technology (MIT)", City = "Cambridge, MA", Description = "Global leader in technology, engineering, AI, and physical sciences." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Massaçusets Texnologiya İnstitutu (MIT)", City = "Kembric, MA", Description = "Süni intellekt, mühəndislik və innovasiyalar üzrə dünyanın 1 nömrəli texnoloji mərkəzi." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Massachusetts Teknoloji Enstitüsü (MIT)", City = "Cambridge, MA", Description = "Mühendislik ve yapay zeka alanında dünyanın önde gelen teknoloji enstitüsü." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "USA",
                LogoUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.stanford.edu", EstablishedYear = 1885, Tuition = "$56,000/yr", AcceptanceRate = "4%",
                TeachingLanguage = "English", Deadline = "Jan 5, 2026", Ranking = "#3 Global", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Stanford University", City = "Stanford, CA", Description = "Nestled in Silicon Valley, world-renowned for entrepreneurship and computing." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Stanford Universiteti", City = "Stanford, CA", Description = "Silikon Vadisinin ürəyində yerləşən, startap və kompüter elmləri üzrə qlobal lider." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Stanford Üniversitesi", City = "Stanford, CA", Description = "Silikon Vadisi'nin kalbinde yer alan girişimcilik ve teknoloji devi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "USA",
                LogoUrl = "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.columbia.edu", EstablishedYear = 1754, Tuition = "$62,000/yr", AcceptanceRate = "5%",
                TeachingLanguage = "English", Deadline = "Jan 1, 2026", Ranking = "#12 Global", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Columbia University", City = "New York, NY", Description = "Ivy League research powerhouse in the heart of Manhattan." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Kolumbiya Universiteti", City = "Nyu-York, NY", Description = "Manhettendə yerləşən Ivy League üzvü, maliyyə və hüquq üzrə aparıcı universitet." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Columbia Üniversitesi", City = "New York, NY", Description = "New York Manhattan'da yer alan seçkin Ivy League araştırma üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "USA",
                LogoUrl = "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.berkeley.edu", EstablishedYear = 1868, Tuition = "$44,000/yr", AcceptanceRate = "11%",
                TeachingLanguage = "English", Deadline = "Nov 30, 2025", Ranking = "#4 Global", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of California, Berkeley", City = "Berkeley, CA", Description = "Top public university in the US, known for Nobel laureates and CS research." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Kaliforniya Universiteti, Berkli", City = "Berkli, CA", Description = "ABŞ-ın 1 nömrəli dövlət universiteti, elmi kəşfləri və İT nailiyyətləri ilə tanınır." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "UC Berkeley", City = "Berkeley, CA", Description = "ABD'nin en iyi devlet araştırma üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "USA",
                LogoUrl = "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.nyu.edu", EstablishedYear = 1831, Tuition = "$58,000/yr", AcceptanceRate = "12%",
                TeachingLanguage = "English", Deadline = "Jan 5, 2026", Ranking = "#25 Global", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "New York University (NYU)", City = "New York, NY", Description = "Global network university with campuses in NYC, Abu Dhabi, and Shanghai." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Nyu-York Universiteti (NYU)", City = "Nyu-York, NY", Description = "Nyu-York şəhərinin mərkəzində, biznes və incəsənət üzrə dünya lideri." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "New York Üniversitesi (NYU)", City = "New York, NY", Description = "Küresel vizyona sahip, New York merkezli dünyaca ünlü üniversite." }
                }
            },

            // UK
            new University
            {
                Id = Guid.NewGuid(), Country = "United Kingdom",
                LogoUrl = "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.ox.ac.uk", EstablishedYear = 1096, Tuition = "£32,000/yr", AcceptanceRate = "17%",
                TeachingLanguage = "English", Deadline = "Oct 15, 2025", Ranking = "#2 Global", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Oxford", City = "Oxford", Description = "Oldest university in the English-speaking world with unmatched academic heritage." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Oksford Universiteti", City = "Oksford", Description = "İngilisdilli dünyanın ən qədim və prestijli universiteti." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Oxford Üniversitesi", City = "Oxford", Description = "İngilizce konuşulan dünyanın en eski ve en saygın üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "United Kingdom",
                LogoUrl = "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.cam.ac.uk", EstablishedYear = 1209, Tuition = "£34,000/yr", AcceptanceRate = "18%",
                TeachingLanguage = "English", Deadline = "Oct 15, 2025", Ranking = "#3 Global", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Cambridge", City = "Cambridge", Description = "Historic collegiate research university home to 121 Nobel laureates." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Kembric Universiteti", City = "Kembric", Description = "120-dən çox Nobel mükafatçısının təhsil aldığı dünya elminin mərkəzi." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Cambridge Üniversitesi", City = "Cambridge", Description = "Dünyanın en iyi bilim insanlarını yetiştiren tarihi araştırma üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "United Kingdom",
                LogoUrl = "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.imperial.ac.uk", EstablishedYear = 1907, Tuition = "£36,000/yr", AcceptanceRate = "14%",
                TeachingLanguage = "English", Deadline = "Jan 25, 2026", Ranking = "#6 Global", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Imperial College London", City = "London", Description = "World-class university focused exclusively on science, engineering, medicine, and business." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "İmperial Kollec London", City = "London", Description = "Dəqiq elmlər, tibb və mühəndislik üzrə Avropanın ən reytinqli universiteti." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Imperial College London", City = "Londra", Description = "Mühendislik, tıp ve fen bilimlerinde Avrupa'nın zirvesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "United Kingdom",
                LogoUrl = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.ucl.ac.uk", EstablishedYear = 1826, Tuition = "£29,000/yr", AcceptanceRate = "22%",
                TeachingLanguage = "English", Deadline = "Jan 25, 2026", Ranking = "#9 Global", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University College London (UCL)", City = "London", Description = "London's leading multidisciplinary university, pioneer in progressive education." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "London Universitet Kolleci (UCL)", City = "London", Description = "Londonun mərkəzində çoxşaxəli tədqiqat və qabaqcıl təhsil mərkəzi." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "UCL", City = "Londra", Description = "Londra'nın en büyük ve en prestijli çok disiplinli üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "United Kingdom",
                LogoUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.ed.ac.uk", EstablishedYear = 1583, Tuition = "£26,000/yr", AcceptanceRate = "28%",
                TeachingLanguage = "English", Deadline = "Jan 25, 2026", Ranking = "#15 Global", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Edinburgh", City = "Edinburgh", Description = "Scotland's ancient powerhouse of knowledge, AI, and medical discovery." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Edinburq Universiteti", City = "Edinburq", Description = "Şotlandiyanın tarixi və elmi cəhətdən ən qabaqcıl ali məktəbi." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Edinburgh Üniversitesi", City = "Edinburgh", Description = "İskoçya'nın en köklü ve prestijli araştırma üniversitesi." }
                }
            },

            // Germany
            new University
            {
                Id = Guid.NewGuid(), Country = "Germany",
                LogoUrl = "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.tum.de", EstablishedYear = 1868, Tuition = "€3,000/yr", AcceptanceRate = "25%",
                TeachingLanguage = "English / German", Deadline = "Jul 15, 2025", Ranking = "#1 Germany", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Technical University of Munich (TUM)", City = "Munich", Description = "Germany's top research university for engineering and innovation." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Münhen Texniki Universiteti (TUM)", City = "Münhen", Description = "Almaniyanın ən yaxşı mühəndislik və tədqiqat universiteti." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Münih Teknik Üniversitesi (TUM)", City = "Münih", Description = "Almanya'nın mühendislik alanındaki 1 numaralı üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Germany",
                LogoUrl = "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.uni-muenchen.de", EstablishedYear = 1472, Tuition = "€0/yr", AcceptanceRate = "20%",
                TeachingLanguage = "English / German", Deadline = "Jul 15, 2025", Ranking = "#2 Germany", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Ludwig Maximilian University of Munich (LMU)", City = "Munich", Description = "One of Europe's premier academic and research institutions." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Münhen Lüdviq Maksimilian Universiteti (LMU)", City = "Münhen", Description = "Avropanın ən qədim və tibb, təbiət elmləri üzrə nüfuzlu mərkəzi." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "LMU Münih", City = "Münih", Description = "Almanya'nın en köklü ve başarılı araştırma kurumlarından biri." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Germany",
                LogoUrl = "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.uni-heidelberg.de", EstablishedYear = 1386, Tuition = "€1,500/yr", AcceptanceRate = "19%",
                TeachingLanguage = "English / German", Deadline = "Jul 15, 2025", Ranking = "#3 Germany", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Heidelberg University", City = "Heidelberg", Description = "Germany's oldest university, world-renowned for medicine and humanities." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Heydelberq Universiteti", City = "Heydelberq", Description = "Almaniyanın ən qədim universiteti, tibb və biotexnologiya üzrə lider." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Heidelberg Üniversitesi", City = "Heidelberg", Description = "Almanya'nın en eski üniversitesi, tıp ve beşeri bilimlerde lider." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Germany",
                LogoUrl = "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.rwth-aachen.de", EstablishedYear = 1870, Tuition = "€0/yr", AcceptanceRate = "32%",
                TeachingLanguage = "English / German", Deadline = "Jul 15, 2025", Ranking = "#1 Tech Germany", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "RWTH Aachen University", City = "Aachen", Description = "Europe's leading technical university for mechanical engineering and automotive." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "RWTH Axen Universiteti", City = "Axen", Description = "Avropanın avtomobil sənayesi və maşınqayırma üzrə ən nəhəng mühəndislik mərkəzi." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "RWTH Aachen Üniversitesi", City = "Aachen", Description = "Avrupa'nın önde gelen teknik ve mühendislik üniversitesi." }
                }
            },

            // Canada
            new University
            {
                Id = Guid.NewGuid(), Country = "Canada",
                LogoUrl = "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.utoronto.ca", EstablishedYear = 1827, Tuition = "$28,000/yr", AcceptanceRate = "43%",
                TeachingLanguage = "English", Deadline = "Jan 15, 2026", Ranking = "#1 Canada", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Toronto", City = "Toronto", Description = "Canada's leading university known for research excellence and AI pioneers." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Toronto Universiteti", City = "Toronto", Description = "Kanadanın kompüter elmləri və tibb üzrə 1 nömrəli universiteti." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Toronto Üniversitesi", City = "Toronto", Description = "Kanada'nın en büyük ve en başarılı araştırma üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Canada",
                LogoUrl = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.mcgill.ca", EstablishedYear = 1821, Tuition = "$24,000/yr", AcceptanceRate = "38%",
                TeachingLanguage = "English", Deadline = "Jan 15, 2026", Ranking = "#2 Canada", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "McGill University", City = "Montreal", Description = "Renowned for medical research and global diversity in vibrant Montreal." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "MakGill Universiteti", City = "Monreal", Description = "Kanadanın ən beynəlxalq, tibb və hüquq sahəsində ən nüfuzlu ali məktəbi." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "McGill Üniversitesi", City = "Montreal", Description = "Kanada'nın dünyaca ünlü tıp ve araştırma üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Canada",
                LogoUrl = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.ubc.ca", EstablishedYear = 1908, Tuition = "$26,000/yr", AcceptanceRate = "45%",
                TeachingLanguage = "English", Deadline = "Jan 15, 2026", Ranking = "#3 Canada", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of British Columbia (UBC)", City = "Vancouver", Description = "Global center for teaching, learning and research, consistently ranked among top 40." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Britaniya Kolumbiyası Universiteti (UBC)", City = "Vankuver", Description = "Vankuverdə yerləşən, təbiət elmləri və biznes üzrə dünya səviyyəli mərkəz." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "British Columbia Üniversitesi (UBC)", City = "Vancouver", Description = "Vancouver'da yer alan küresel çapta tanınan üniversite." }
                }
            },

            // Italy
            new University
            {
                Id = Guid.NewGuid(), Country = "Italy",
                LogoUrl = "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.uniroma1.it", EstablishedYear = 1303, Tuition = "€2,500/yr", AcceptanceRate = "35%",
                TeachingLanguage = "Italian / English", Deadline = "Apr 30, 2025", Ranking = "#1 Italy", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Sapienza University of Rome", City = "Rome", Description = "One of Europe's largest public research universities with rich heritage." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Roma Sapienza Universiteti", City = "Roma", Description = "İtaliyanın və Avropanın ən böyük rəsmi tədqiqat universiteti." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Roma Sapienza Üniversitesi", City = "Roma", Description = "Avrupa'nın en büyük ve en köklü devlet üniversitelerinden biri." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Italy",
                LogoUrl = "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.polimi.it", EstablishedYear = 1863, Tuition = "€3,500/yr", AcceptanceRate = "28%",
                TeachingLanguage = "English / Italian", Deadline = "May 15, 2025", Ranking = "#1 Engineering Italy", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Politecnico di Milano", City = "Milan", Description = "Largest technical university in Italy, renowned for architecture, design and engineering." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Milan Politexnik Universiteti (Polimi)", City = "Milan", Description = "Memarlıq, dizayn və mühəndislik üzrə İtaliyanın 1 nömrəli texnoloji institutu." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Milano Politeknik Üniversitesi", City = "Milano", Description = "Mühendislik, mimarlık ve tasarım alanında İtalya'nın en iyisi." }
                }
            },

            // Poland
            new University
            {
                Id = Guid.NewGuid(), Country = "Poland",
                LogoUrl = "https://images.unsplash.com/photo-1519197924294-4ac978a3e048?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.uw.edu.pl", EstablishedYear = 1816, Tuition = "€3,500/yr", AcceptanceRate = "30%",
                TeachingLanguage = "English / Polish", Deadline = "Jun 30, 2025", Ranking = "#1 Poland", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Warsaw", City = "Warsaw", Description = "Largest research university in Poland, accredited across the European Union." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Varşava Universiteti", City = "Varşava", Description = "Polşanın ən böyük Aİ tərəfindən tanınan ali təhsil müəssisəsi." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Varşova Üniversitesi", City = "Varşova", Description = "Polonya'nın en büyük ve en prestijli üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Poland",
                LogoUrl = "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://en.uj.edu.pl", EstablishedYear = 1364, Tuition = "€3,000/yr", AcceptanceRate = "35%",
                TeachingLanguage = "English / Polish", Deadline = "Jun 30, 2025", Ranking = "#2 Poland", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Jagiellonian University", City = "Krakow", Description = "Founded by King Casimir the Great, one of the oldest universities in Central Europe." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Yagellon Universiteti", City = "Krakov", Description = "Krakovda yerləşən, Mərkəzi Avropanın ən qədim və mötəbər universitetlərindən biri." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Jagiellonian Üniversitesi", City = "Krakow", Description = "Orta Avrupa'nın en eski ve en saygın üniversitelerinden biri." }
                }
            },

            // Hungary
            new University
            {
                Id = Guid.NewGuid(), Country = "Hungary",
                LogoUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.unideb.hu", EstablishedYear = 1538, Tuition = "$5,500/yr", AcceptanceRate = "60%",
                TeachingLanguage = "English", Deadline = "Jan 15, 2026", Ranking = "#1 Hungary", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Debrecen", City = "Debrecen", Description = "Hungary's oldest continuously operating higher education institution with great medical faculty." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Debretsen Universiteti", City = "Debretsen", Description = "Macarıstanın Stipendium təqaüdü təklif edən ən populyar universiteti." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Debrecen Üniversitesi", City = "Debrecen", Description = "Macaristan'ın burs imkanları ile ünlü tıp ve bilim üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Hungary",
                LogoUrl = "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.elte.hu", EstablishedYear = 1635, Tuition = "€4,000/yr", AcceptanceRate = "50%",
                TeachingLanguage = "English", Deadline = "May 31, 2025", Ranking = "#1 Budapest", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Eötvös Loránd University (ELTE)", City = "Budapest", Description = "Hungary's largest and leading research university in the beautiful capital Budapest." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Etvöş Lorand Universiteti (ELTE)", City = "Budapeşt", Description = "Budapeştdə yerləşən, kompüter elmləri və humanitar sahələr üzrə lider təhsil ocağı." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "ELTE Üniversitesi", City = "Budapeşte", Description = "Budapeşte'nin kalbinde yer alan en prestijli araştırma üniversitesi." }
                }
            },

            // Turkey
            new University
            {
                Id = Guid.NewGuid(), Country = "Turkey",
                LogoUrl = "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.metu.edu.tr", EstablishedYear = 1956, Tuition = "$1,800/yr", AcceptanceRate = "15%",
                TeachingLanguage = "English", Deadline = "Jul 30, 2025", Ranking = "#1 Turkey", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Middle East Technical University (METU)", City = "Ankara", Description = "Premier engineering and technical research university in Turkey." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Orta Şərq Texniki Universiteti (ODTÜ)", City = "Ankara", Description = "Türkiyənin 1 nömrəli ingilisdilli texniki və mühəndislik universiteti." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Orta Doğu Teknik Üniversitesi (ODTÜ)", City = "Ankara", Description = "Türkiye'nin en başarılı ve köklü teknik üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Turkey",
                LogoUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.boun.edu.tr", EstablishedYear = 1863, Tuition = "$2,200/yr", AcceptanceRate = "12%",
                TeachingLanguage = "English", Deadline = "Jul 15, 2025", Ranking = "#2 Turkey", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Boğaziçi University", City = "Istanbul", Description = "Prestigious public university overlooking the Bosphorus, top choice for high achievers." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Boğaziçi Universiteti", City = "İstanbul", Description = "İstanbulda yerləşən, biznes və kompüter elmləri üzrə ən yüksək ballı universitet." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Boğaziçi Üniversitesi", City = "İstanbul", Description = "Boğaz manzaralı kampüsüyle Türkiye'nin en seçkin üniversitelerinden biri." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Turkey",
                LogoUrl = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.itu.edu.tr", EstablishedYear = 1773, Tuition = "$1,900/yr", AcceptanceRate = "18%",
                TeachingLanguage = "English / Turkish", Deadline = "Jul 30, 2025", Ranking = "#3 Turkey", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Istanbul Technical University (ITU)", City = "Istanbul", Description = "World's third-oldest technical university dedicated to engineering sciences." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "İstanbul Texniki Universiteti (İTÜ)", City = "İstanbul", Description = "Mühəndislik, memarlıq və dənizçilik üzrə 250 illik tarixi olan nəhəng ali məktəb." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "İstanbul Teknik Üniversitesi (İTÜ)", City = "İstanbul", Description = "250 yıllık köklü geçmişiyle Türkiye'nin mühendislik ekolü." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Turkey",
                LogoUrl = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.ku.edu.tr", EstablishedYear = 1993, Tuition = "$19,500/yr", AcceptanceRate = "10%",
                TeachingLanguage = "English", Deadline = "Jun 15, 2025", Ranking = "#1 Private Turkey", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Koç University", City = "Istanbul", Description = "Leading private research university with world-class faculty and facilities." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Koç Universiteti", City = "İstanbul", Description = "Türkiyənin 1 nömrəli özəl tədqiqat universiteti, tibb və biznes sahələrində lider." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Koç Üniversitesi", City = "İstanbul", Description = "Dünya standartlarında eğitim ve burs imkanları sunan vakıf üniversitesi." }
                }
            },

            // Azerbaijan
            new University
            {
                Id = Guid.NewGuid(), Country = "Azerbaijan",
                LogoUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.bdu.edu.az", EstablishedYear = 1919, Tuition = "$2,000/yr", AcceptanceRate = "65%",
                TeachingLanguage = "Azerbaijani / English / Russian", Deadline = "Aug 25, 2025", Ranking = "#1 Classic Azerbaijan", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Baku State University (BDU)", City = "Baku", Description = "Flagship public university in Azerbaijan with over 100 years of academic legacy." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Bakı Dövlət Universiteti (BDU)", City = "Bakı", Description = "Azərbaycanın ilk və ən böyük klassik ali təhsil ocağı." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Bakü Devlet Üniversitesi (BDU)", City = "Bakü", Description = "Azerbaycan'ın en köklü ve ilk devlet üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Azerbaijan",
                LogoUrl = "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.ada.edu.az", EstablishedYear = 2006, Tuition = "$4,500/yr", AcceptanceRate = "30%",
                TeachingLanguage = "English", Deadline = "Jul 10, 2025", Ranking = "#1 Modern Azerbaijan", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "ADA University", City = "Baku", Description = "Global innovative university dedicated to preparing next-generation leaders and engineers." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "ADA Universiteti", City = "Bakı", Description = "Müasir kampus, tam ingilisdilli tədris və İT, diplomatiya üzrə lider ali məktəb." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "ADA Üniversitesi", City = "Bakü", Description = "Diplomasi ve teknoloji odaklı modern Azerbaycan üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Azerbaijan",
                LogoUrl = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.bhos.edu.az", EstablishedYear = 2011, Tuition = "$3,500/yr", AcceptanceRate = "15%",
                TeachingLanguage = "English", Deadline = "Jul 20, 2025", Ranking = "#1 Tech Entry Score", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Baku Higher Oil School (BHOS)", City = "Baku", Description = "Specialized engineering institution partnering with Heriot-Watt University UK." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Bakı Ali Neft Məktəbi (BANM)", City = "Bakı", Description = "Azərbaycanın ən yüksək keçid ballı, SOCAR dəstəkli qabaqcıl mühəndislik məktəbi." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Bakü Yüksek Petrol Okulu (BHOS)", City = "Bakü", Description = "İngiliz standartlarında mühendislik eğitimi veren öncü yükseköğretim kurumu." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Azerbaijan",
                LogoUrl = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.amu.edu.az", EstablishedYear = 1930, Tuition = "$4,000/yr", AcceptanceRate = "40%",
                TeachingLanguage = "Azerbaijani / English", Deadline = "Aug 15, 2025", Ranking = "#1 Medical Azerbaijan", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Azerbaijan Medical University (AMU)", City = "Baku", Description = "Premier medical, dental, and pharmaceutical education center in the Caucasus." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Azərbaycan Tibb Universiteti (ATU)", City = "Bakı", Description = "Qafqazın ən böyük tibb, stomatologiya və əczaçılıq mərkəzi." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Azerbaycan Tıp Üniversitesi (ATÜ)", City = "Bakü", Description = "Kafkasların en köklü ve modern tıp fakültesi." }
                }
            },

            // UAE & Malaysia & Netherlands & Sweden
            new University
            {
                Id = Guid.NewGuid(), Country = "UAE",
                LogoUrl = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.uaeu.ac.ae", EstablishedYear = 1976, Tuition = "$14,000/yr", AcceptanceRate = "40%",
                TeachingLanguage = "English", Deadline = "May 31, 2025", Ranking = "#1 UAE", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "United Arab Emirates University (UAEU)", City = "Al Ain", Description = "First and top comprehensive national research university in UAE." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "BƏƏ Dövlət Universiteti (UAEU)", City = "Əl Ayn", Description = "BƏƏ-nin ən qabaqcıl dövlət və biznes universiteti." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "BAE Üniversitesi (UAEU)", City = "Al Ain", Description = "BAE'nin en köklü ve başarılı devlet üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "UAE",
                LogoUrl = "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.ku.ac.ae", EstablishedYear = 2007, Tuition = "$18,000/yr", AcceptanceRate = "25%",
                TeachingLanguage = "English", Deadline = "May 15, 2025", Ranking = "#1 STEM UAE", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Khalifa University", City = "Abu Dhabi", Description = "Top research institution dedicated to engineering, AI, and nuclear science in the Middle East." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Xəlifə Universiteti", City = "Əbu-Dabi", Description = "Yaxın Şərqin süni intellekt və kosmik mühəndislik üzrə ən yüksək təqaüdlü universiteti." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Halife Üniversitesi", City = "Abu Dabi", Description = "Mühendislik ve yapay zekada Ortadoğu'nun araştırma lideri." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Malaysia",
                LogoUrl = "https://images.unsplash.com/photo-1596422846543-74c6eb24f628?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.um.edu.my", EstablishedYear = 1905, Tuition = "$4,000/yr", AcceptanceRate = "25%",
                TeachingLanguage = "English", Deadline = "Aug 15, 2025", Ranking = "#65 Global", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Malaya (UM)", City = "Kuala Lumpur", Description = "Malaysia's premier and highest-ranking research university." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Malayziya Universiteti (UM)", City = "Kuala Lumpur", Description = "Malayziyanın ən nüfuzlu ingilisdilli tədqiqat universiteti." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Malaya Üniversitesi (UM)", City = "Kuala Lumpur", Description = "Malezya'nın 1 numaralı ve dünya sıralamasında ilk 70'te yer alan üniversitesi." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Netherlands",
                LogoUrl = "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.tudelft.nl", EstablishedYear = 1842, Tuition = "€16,000/yr", AcceptanceRate = "35%",
                TeachingLanguage = "English", Deadline = "Apr 1, 2025", Ranking = "#10 World Tech", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Delft University of Technology (TU Delft)", City = "Delft", Description = "World-leading tech university for aerospace, civil engineering, and sustainable energy." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Delft Texnologiya Universiteti (TU Delft)", City = "Delft", Description = "Aerokosmik və bərpa olunan enerji üzrə dünyanın ilk 10 texnoloji mərkəzindən biri." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Delft Teknoloji Üniversitesi", City = "Delft", Description = "Havacılık ve mühendislikte dünyanın en iyilerinden biri." }
                }
            },
            new University
            {
                Id = Guid.NewGuid(), Country = "Sweden",
                LogoUrl = "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80",
                WebsiteUrl = "https://www.kth.se", EstablishedYear = 1827, Tuition = "SEK 155,000/yr", AcceptanceRate = "29%",
                TeachingLanguage = "English", Deadline = "Jan 15, 2026", Ranking = "#1 Nordic Tech", HasScholarship = true,
                Translations = new List<UniversityTranslation>
                {
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "KTH Royal Institute of Technology", City = "Stockholm", Description = "Sweden's main center for industrial technology and software innovation." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "KTH Kral Texnologiya İnstitutu", City = "Stokholm", Description = "İsveçin ən böyük texniki ali məktəbi və innovasiya mərkəzi." },
                    new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "KTH Kraliyet Teknoloji Enstitüsü", City = "Stockholm", Description = "İskandinavya'nın en prestijli teknik üniversitesi." }
                }
            }
        };

        foreach (var uni in list)
        {
            var matchCountry = allCountries.FirstOrDefault(c =>
                string.Equals(c.Code, uni.Country, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(c.DefaultName, uni.Country, StringComparison.OrdinalIgnoreCase) ||
                (c.Code.ToLower() == "usa" && (uni.Country.ToUpper() == "USA" || uni.Country.Contains("United States"))) ||
                (c.Code.ToLower() == "uk" && (uni.Country.ToUpper() == "UK" || uni.Country.Contains("United Kingdom"))) ||
                (c.Code.ToLower() == "de" && uni.Country.Contains("Germany")) ||
                (c.Code.ToLower() == "it" && uni.Country.Contains("Italy")) ||
                (c.Code.ToLower() == "hu" && uni.Country.Contains("Hungary")) ||
                (c.Code.ToLower() == "ae" && uni.Country.Contains("UAE")) ||
                (c.Code.ToLower() == "pl" && uni.Country.Contains("Poland")) ||
                (c.Code.ToLower() == "my" && uni.Country.Contains("Malaysia")) ||
                (c.Code.ToLower() == "az" && uni.Country.Contains("Azerbaijan")) ||
                (c.Code.ToLower() == "tr" && uni.Country.Contains("Turkey")) ||
                (c.Code.ToLower() == "ca" && uni.Country.Contains("Canada")) ||
                (c.Code.ToLower() == "nl" && uni.Country.Contains("Netherlands")) ||
                (c.Code.ToLower() == "se" && uni.Country.Contains("Sweden"))
            );

            if (matchCountry != null)
            {
                uni.CountryId = matchCountry.Id;
            }

            var cleanUrl = uni.WebsiteUrl.Trim().ToLower();
            if (!existingWebsites.Contains(cleanUrl))
            {
                await context.Universities.AddAsync(uni);
                existingWebsites.Add(cleanUrl);
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedProgramsAsync(EdusazDbContext context, Guid enId, Guid azId, Guid trId)
    {
        if (context.Programs.Count() >= 25) return;

        var universities = await context.Universities.Include(u => u.Translations).ToListAsync();
        if (!universities.Any()) return;

        University GetUni(string namePart)
        {
            return universities.FirstOrDefault(u =>
                u.WebsiteUrl.Contains(namePart, StringComparison.OrdinalIgnoreCase) ||
                u.Translations.Any(t => t.Name.Contains(namePart, StringComparison.OrdinalIgnoreCase))
            ) ?? universities.First();
        }

        var progDefs = new List<(string uniKey, string level, string field, string duration, string tuition, string lang, string mode, string reqs, string dline, string titleEn, string descEn, string titleAz, string descAz)>
        {
            ("mit", "Bachelor", "Computer Science & AI", "4 Years", "$58,000/yr", "English", "Full-time", "SAT/ACT, High School Diploma, TOEFL/IELTS 7.5+", "Jan 5",
                "BSc in Computer Science & Artificial Intelligence", "Comprehensive undergraduate program covering deep learning, algorithms, and autonomous systems.",
                "Kompüter Elmləri və Süni İntellekt Bakalavrı", "Dərin öyrənmə, alqoritmlər və avtonom sistemləri əhatə edən intensiv bakalavr təhsili."),

            ("tum", "Master", "Data Science & Machine Learning", "2 Years", "€3,000/yr", "English", "Full-time", "BSc in CS or Math, IELTS 6.5+, GRE recommended", "Jul 15",
                "MSc in Data Science & Machine Learning", "Cutting-edge curriculum in statistical modeling, big data processing, and neural networks.",
                "Data Elmi və Maşın Öyrənməsi Magistrı", "Statistik modelləşdirmə, böyük həcmli məlumatlar və neyron şəbəkələri üzrə qabaqcıl magistratura."),

            ("bhos", "Bachelor", "Software Engineering", "5 Years", "$3,500/yr", "English", "Full-time", "SEC Math & Physics high score, IELTS 6.0+", "Jul 20",
                "BSc in Software Engineering & Cyber Security", "Dual-degree accredited program focused on enterprise software and critical infrastructure security.",
                "Proqram Təminatı Mühəndisliyi və Kibertəhlükəsizlik", "Böyük miqyaslı proqram sistemləri və kibermühafizə üzrə beynəlxalq standartlı təhsil."),

            ("ox.ac", "Master", "Advanced Computer Science", "1 Year", "£32,000/yr", "English", "Full-time", "First-class Bachelor's degree in CS, IELTS 7.5+", "Oct 15",
                "MSc in Advanced Computing & Cloud Systems", "Intensive master's focusing on quantum computing algorithms, distributed systems, and verification.",
                "Qabaqcıl Kompüter Elmləri və Bulud Sistemləri Magistrı", "Paylanmış sistemlər və kvant hesablamaları üzrə Oksford intensiv tədqiqat proqramı."),

            ("boun", "Bachelor", "Business Administration", "4 Years", "$2,200/yr", "English", "Full-time", "YKS / SAT 1400+, TOEFL 80+", "Jul 15",
                "Bachelor of Business Administration (BBA)", "Top-tier business curriculum preparing global leaders in management, marketing, and strategy.",
                "Biznesin İdarə Edilməsi Bakalavrı (BBA)", "Menecment, marketinq və qlobal biznes strategiyası üzrə liderlik proqramı."),

            ("columbia", "Master", "International Finance", "2 Years", "$62,000/yr", "English", "Full-time", "Bachelor degree, GMAT/GRE, 2 letters of recommendation", "Jan 1",
                "Master of International Finance & Quantitative Economics", "Wall Street-linked curriculum covering financial engineering, derivatives, and algorithmic trading.",
                "Beynəlxalq Maliyyə və Kəmiyyət İqtisadiyyatı Magistrı", "Uoll-Strit maliyyə bazarları və alqoritmik ticarət üzrə nüfuzlu magistratura proqramı."),

            ("polimi", "Bachelor", "Mechanical Engineering", "3 Years", "€3,500/yr", "English / Italian", "Full-time", "High School Diploma, TOL test score, English B2", "May 15",
                "BSc in Mechanical Engineering & Robotics", "Design, fluid dynamics, and robotics in the heart of industrial northern Italy.",
                "Mexanika Mühəndisliyi və Robototexnika Bakalavrı", "Avtomobil və robot sistemlərinin layihələndirilməsi üzrə İtaliya mühəndislik təhsili."),

            ("amu.edu", "Bachelor", "General Medicine", "6 Years", "$4,000/yr", "English / Azerbaijani", "Full-time", "Biology & Chemistry exam scores, Medical fitness", "Aug 15",
                "Doctor of General Medicine (MD)", "Complete 6-year clinical medical doctor training program with university hospital residency.",
                "Müalicə İşi və Ümumi Tibb (MD)", "Universitet klinikalarında praktika ilə 6 illik beynəlxalq standartlı həkim hazırlığı."),

            ("cam.ac", "Master", "International Law", "1 Year", "£34,000/yr", "English", "Full-time", "High 2:1 or First Class Law Degree, IELTS 7.5+", "Oct 15",
                "Master of International Public Law & Human Rights (LLM)", "Cambridge flagship law program covering commercial arbitration, sovereignty, and human rights.",
                "Beynəlxalq İctimai Hüquq və İnsan Hüquqları (LLM)", "Kommersiya arbitrajı və qlobal hüquq sistemi üzrə Kembric magistratura dərəcəsi."),

            ("uw.edu", "Bachelor", "Cyber Security", "3.5 Years", "€3,500/yr", "English", "Full-time", "High School certificate, Math background, IELTS 6.0+", "Jun 30",
                "BSc in Cyber Security & Network Defense", "Hands-on penetration testing, cryptography, and EU digital defense standards.",
                "Kibertəhlükəsizlik və Şəbəkə Müdafiəsi Bakalavrı", "Kriptoqrafiya, etik hakerlik və Avropa İttifaqı kiber təhlükəsizlik standartları."),

            ("tudelft", "Master", "Renewable Energy", "2 Years", "€16,000/yr", "English", "Full-time", "BSc in Engineering, GPA 75%+, IELTS 6.5+", "Apr 1",
                "MSc in Sustainable Energy Technologies", "Solar, hydrogen, and wind turbine technology in Europe's most sustainable campus.",
                "Davamlı Enerji Texnologiyaları Magistrı", "Günəş, külək və hidrogen energetikası üzrə dünyanın ən qabaqcıl proqramı."),

            ("uniroma1", "Bachelor", "Architecture", "3 Years", "€2,500/yr", "Italian / English", "Full-time", "Entrance architectural drawing test, High school diploma", "Apr 30",
                "Bachelor of Architecture & Sustainable Urban Planning", "Historic restoration and eco-friendly urban master planning in Rome.",
                "Memarlıq və Davamlı Şəhərsalma Bakalavrı", "Roma tarixi abidələri və müasir ekoloji memarlıq layihələndirməsi."),

            ("bdu.edu", "Master", "International Relations", "2 Years", "$2,000/yr", "English / Azerbaijani", "Full-time", "Bachelor degree, SEC Master exam or International interview", "Aug 25",
                "Master of International Relations & Diplomacy", "Geopolitics, energy diplomacy, and international organizations.",
                "Beynəlxalq Münasibətlər və Diplomatiya Magistrı", "Geosiyasət, enerji diplomatiyası və beynəlxalq təşkilatlarla əlaqələr."),

            ("utoronto", "Master", "Applied Economics", "2 Years", "$28,000/yr", "English", "Full-time", "BSc in Economics/Math, IELTS 7.0+, GRE required", "Jan 15",
                "Master of Applied Financial Economics & Big Data", "Econometrics, macroeconomic policy, and algorithmic financial forecasting.",
                "Tətbiqi Maliyyə İqtisadiyyatı və Böyük Məlumatlar", "Ekonometrika, qlobal iqtisadi siyasət və maliyyə proqnozlaşdırması."),

            ("ku.ac.ae", "Bachelor", "Robotics Engineering", "4 Years", "$18,000/yr", "English", "Full-time", "EmSAT Math 1250+, Physics 1000+, IELTS 6.5+", "May 15",
                "BSc in Autonomous Systems & Robotics Engineering", "Unmanned aerial vehicles, autonomous ground transport, and industrial automation.",
                "Avtonom Sistemlər və Robototexnika Mühəndisliyi", "Dronlar, süni intellektli robotlar və sənaye avtomatlaşdırması."),

            ("elte", "Bachelor", "Digital Marketing", "3 Years", "€4,000/yr", "English", "Full-time", "Secondary school certificate, IELTS 5.5+", "May 31",
                "BSc in Digital Media & Marketing Communications", "SEO, content strategy, brand psychology, and social media analytics.",
                "Rəqəmsal Media və Marketinq Kommunikasiyaları", "SEO, brendinq, rəqəmsal reklam və sosial media analitikası."),

            ("mcgill", "Master", "Biomedical Engineering", "2 Years", "$24,000/yr", "English", "Full-time", "BSc in Engineering or Physical Sciences, GPA 3.3/4.0", "Jan 15",
                "MSc in Biomedical Engineering & Neural Prosthetics", "Medical imaging, biomedical sensors, and biomaterials.",
                "Biotibbi Mühəndislik və Neyroprotezlər Magistrı", "Tibbi diaqnostika cihazları, biomateriallar və süni orqan mühəndisliyi."),

            ("metu", "Bachelor", "Electrical Engineering", "4 Years", "$1,800/yr", "English", "Full-time", "YKS top 1% or SAT 1450+, IELTS 6.5+", "Jul 30",
                "BSc in Electrical & Electronics Engineering", "Telecommunications, microelectronics, and signal processing.",
                "Elektrik və Elektronika Mühəndisliyi Bakalavrı", "Telekommunikasiya, mikroelektronika və rəqəmsal siqnal emalı."),

            ("harvard", "PhD", "Applied Physics", "4-5 Years", "Fully Funded", "English", "Full-time", "BSc/MSc in Physics/Math, GRE Physics, Research publications", "Dec 15",
                "PhD in Quantum Computing & Applied Physics", "Full research fellowship exploring topological quantum bits and photonics.",
                "Kvant Hesablamaları və Tətbiqi Fizika Doktoranturası (PhD)", "Kvant kompüterləri və fotonika üzrə tam maliyyələşdirilən doktorantura."),

            ("um.edu", "Bachelor", "Game Development", "3.5 Years", "$4,000/yr", "English", "Full-time", "High School diploma, Mathematics credit, IELTS 6.0+", "Aug 15",
                "BSc in Game Development & Virtual Reality", "Unreal Engine 5, 3D graphics rendering, and multiplayer networking.",
                "Oyun Proqramlaşdırma və Virtual Reallıq Bakalavrı", "Unreal Engine, 3D qrafika və virtual reallıq texnologiyaları."),

            ("imperial", "Master", "Public Health", "1 Year", "£36,000/yr", "English", "Full-time", "Medical or science degree, 2:1 honors, IELTS 7.0+", "Jan 25",
                "Master of Public Health (MPH) & Epidemiology", "Global pandemic preparedness, biostatistics, and health policy formulation.",
                "İctimai Səhiyyə və Epidemiologiya Magistrı (MPH)", "Qlobal epidemiologiya, biotibb statistikası və səhiyyə menecmenti."),

            ("itu.edu", "Bachelor", "Civil Engineering", "4 Years", "$1,900/yr", "English / Turkish", "Full-time", "YKS score, High school diploma, English proficiency", "Jul 30",
                "BSc in Civil & Earthquake-Resistant Engineering", "Structural mechanics, earthquake engineering, and smart infrastructure.",
                "İnşaat və Zəlzələyə Davamlı Mühəndislik Bakalavrı", "Zəlzələyə davamlı binaların inşası və ağıllı infrastruktur layihələndirməsi."),

            ("uni-heidelberg", "Master", "Molecular Biotechnology", "2 Years", "€1,500/yr", "English / German", "Full-time", "BSc in Biology or Chemistry, GPA 3.0+, IELTS 6.5+", "Jul 15",
                "MSc in Molecular Biotechnology & Genetics", "Gene therapy, CRISPR editing, and pharmaceutical research.",
                "Molekulyar Biotexnologiya və Genetika Magistrı", "Gen terapiyası, CRISPR texnologiyası və əczaçılıq tədqiqatları."),

            ("en.uj.edu", "Bachelor", "Graphic Design", "3 Years", "€3,000/yr", "English", "Full-time", "Portfolio submission, High school diploma, English B2", "Jun 30",
                "Bachelor of Graphic Design & Interactive Media", "Visual branding, typography, motion graphics, and digital UI design.",
                "Qrafik Dizayn və İnteraktiv Media Bakalavrı", "Vizual brendinq, tipoqrafika, animasiya və rəqəmsal dizayn."),

            ("rwth-aachen", "Master", "Automotive Engineering", "2 Years", "€0/yr", "English / German", "Full-time", "BSc in Mechanical/Electrical Engineering, GRE, IELTS 6.5+", "Jul 15",
                "MSc in Automotive Systems & Electric Mobility", "Electric powertrains, autonomous vehicle sensors, and battery systems.",
                "Avtomobil Sistemləri və Elektromobil Mühəndisliyi", "Elektromobillər, avtonom idarəetmə və batareya sistemləri."),

            ("unideb", "Bachelor", "Nursing & Public Health", "4 Years", "$5,500/yr", "English", "Full-time", "High school diploma, Medical English exam, IELTS 5.5+", "Jan 15",
                "BSc in Nursing & Patient Care", "Clinical healthcare, nursing ethics, and hospital ward management.",
                "Tibb Bacısı İşi və Xəstə Qayğısı Bakalavrı", "Klinik səhiyyə, təcili tibbi yardım və xəstəxana idarəçiliyi."),

            ("nyu.edu", "Master", "FinTech & Blockchain", "1.5 Years", "$58,000/yr", "English", "Full-time", "Bachelor degree in STEM/Finance, GMAT/GRE, IELTS 7.5+", "Jan 5",
                "MSc in FinTech & Blockchain Innovations", "Smart contracts, decentralized finance (DeFi), and financial AI.",
                "FinTech və Blokçeyn İnnovasiyaları Magistrı", "Ağıllı müqavilələr, mərkəzsiz maliyyə (DeFi) və süni intellektli bankçılıq.")
        };

        foreach (var def in progDefs)
        {
            var targetUni = GetUni(def.uniKey);

            var program = new Program
            {
                Id = Guid.NewGuid(),
                UniversityId = targetUni.Id,
                DegreeLevel = def.level,
                FieldOfStudy = def.field,
                Duration = def.duration,
                TuitionFee = def.tuition,
                LanguageOfInstruction = def.lang,
                StudyMode = def.mode,
                EntryRequirements = def.reqs,
                ApplicationDeadline = def.dline,
                Translations = new List<ProgramTranslation>
                {
                    new ProgramTranslation { Id = Guid.NewGuid(), LanguageId = enId, Title = def.titleEn, Description = def.descEn },
                    new ProgramTranslation { Id = Guid.NewGuid(), LanguageId = azId, Title = def.titleAz, Description = def.descAz },
                    new ProgramTranslation { Id = Guid.NewGuid(), LanguageId = trId, Title = def.titleEn, Description = def.descEn }
                }
            };

            await context.Programs.AddAsync(program);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedScholarshipsAsync(EdusazDbContext context, Guid enId, Guid azId, Guid trId)
    {
        if (context.Scholarships.Count() >= 20) return;

        var allUnis = await context.Universities.ToListAsync();
        var allCountries = await context.Countries.ToListAsync();

        University? GetUni(string namePart) =>
            allUnis.FirstOrDefault(u => u.WebsiteUrl.Contains(namePart, StringComparison.OrdinalIgnoreCase));

        Country? GetCountry(string code) =>
            allCountries.FirstOrDefault(c => c.Code.Equals(code, StringComparison.OrdinalIgnoreCase));

        var schDefs = new List<(string? uniKey, string cCode, string name, string loc, string status, string amount, string dline, string elig, string places, string btn, string nameAz, string descAz, string nameEn, string descEn)>
        {
            (null, "az", "Heydər Əliyev Beynəlxalq Təhsil Qrantı", "Bakı, Azərbaycan", "Open", "100% Təhsil + $500/ay + Yataqxana", "01 İyul 2025", "İslam Əməkdaşlıq Təşkilatı və Qoşulmama Hərəkatı ölkələrinin vətəndaşları", "100 yer/il", "check",
                "Heydər Əliyev Beynəlxalq Təhsil Qrantı", "Azərbaycan Respublikası tərəfindən xarici tələbələrə təqdim olunan tam təqaüd proqramı.",
                "Heydar Aliyev International Education Grant", "Full coverage government scholarship by the Republic of Azerbaijan for international students."),

            ("tum", "de", "DAAD Master Təqaüd Proqramı", "Münhen, Almaniya", "Open", "€934/ay + Yol xərcləri + Sığorta", "15 Oktyabr 2025", "Bakalavr məzunları və gənc mütəxəssislər", "250 yer/il", "check",
                "DAAD Master Təqaüd Proqramı", "Almaniyada magistratura pilləsində tam ödənişsiz təhsil və aylıq yaşayış xərcləri təqaüdü.",
                "DAAD Master Studies Scholarship", "Prestigious DAAD scholarship providing full living expenses and tuition support for studies in Germany."),

            ("boun", "tr", "Türkiyə Bursları Hökumət Təqaüdü", "İstanbul / Ankara, Türkiyə", "Open", "100% Təhsil + Aylıq Təqaüd + Yataqxana + Bilet", "20 Fevral 2026", "Bütün beynəlxalq abituriyent və tələbələr", "5000 yer/il", "check",
                "Türkiyə Bursları Hökumət Təqaüdü", "Türkiyənin ən mötəbər dövlət təqaüdü: pulsuz təhsil, tibbi sığorta və təyyarə bileti.",
                "Türkiye Scholarships (Türkiye Bursları)", "Full government scholarship covering tuition, accommodation, monthly stipend, and flight tickets."),

            ("unideb", "hu", "Stipendium Hungaricum Tam Dövlət Təqaüdü", "Debretsen / Budapeşt, Macarıstan", "Open", "Ödənişsiz Təhsil + HUF 43,700/ay + Yataqxana", "15 Yanvar 2026", "Azərbaycan və tərəfdaş ölkələrin vətəndaşları", "200 yer/il", "check",
                "Stipendium Hungaricum Tam Dövlət Təqaüdü", "Macarıstan Hökumətinin təqdim etdiyi ən populyar Avropa təqaüd proqramı.",
                "Stipendium Hungaricum Higher Education Scholarship", "Full tuition waiver, monthly stipend, and accommodation support in Hungary."),

            ("ox.ac", "uk", "Chevening UK Qlobal Liderlik Təqaüdü", "London / Oksford, Böyük Britaniya", "Open", "100% Təhsil + Aylıq Yaşayış Xərcləri + Uçuş", "05 Noyabr 2025", "Minimum 2 illik iş təcrübəsi və liderlik bacarıqları", "1500 yer/il", "check",
                "Chevening Böyük Britaniya Qlobal Təqaüdü", "Böyük Britaniyada 1 illik magistratura üçün tam maliyyələşdirilən dövlət təqaüdü.",
                "Chevening UK Scholarships", "Fully-funded UK Government scholarship for future leaders to study a one-year Master's degree."),

            ("harvard", "usa", "Fulbright Xarici Tələbə Proqramı", "Kembric / Nyu-York, ABŞ", "Open", "Tam Təhsil Haqqı + $2,200/ay + Tibbi Sığorta", "15 May 2025", "Bakalavr məzunları və yüksək akademik göstəricilər", "400 yer/il", "check",
                "Fulbright Xarici Tələbə Proqramı", "ABŞ Dövlət Departamenti tərəfindən magistratura təhsili üçün təqdim edilən əsas qrant.",
                "Fulbright Foreign Student Program", "Flagship international educational exchange program sponsored by the U.S. government."),

            (null, "nl", "Erasmus Mundus Birgə Magistr Qrantı", "Amsterdam / Delft, Avropa İttifaqı", "Open", "€1,400/ay + 100% Təhsil + Səyahət Qrantı", "15 Fevral 2026", "Bütün ölkələrdən əlaçı bakalavr məzunları", "800 yer/il", "check",
                "Erasmus Mundus Birgə Magistr Qrantı", "Ən azı 2 fərqli Avropa ölkəsində təhsil almaq imkanı verən nüfuzlu Aİ təqaüdü.",
                "Erasmus Mundus Joint Master Degrees (EMJMD)", "Prestigious EU-funded scholarship covering multiple European universities and generous stipend."),

            ("ada.edu", "az", "ADA Universiteti Akademik Mükəmməllik Təqaüdü", "Bakı, Azərbaycan", "Open", "100% Təhsil Haqqı Güzəşti", "10 İyul 2025", "Yüksək qəbul balı və GPA 3.8+ olan tələbələr", "50 yer/il", "check",
                "ADA Universiteti Akademik Mükəmməllik Təqaüdü", "Yüksək nəticə göstərən tələbələr üçün təhsil haqqından 100% azadolma təqaüdü.",
                "ADA University Academic Excellence Scholarship", "Merit-based full tuition waiver awarded to high achieving local and international students."),

            ("utoronto", "ca", "Lester B. Pearson Beynəlxalq Təqaüdü", "Toronto, Kanada", "Open", "Tam Təhsil + Kitablar + Yaşayış Yataqxanası", "30 Noyabr 2025", "Beynəlxalq məktəb məzunları və icma liderləri", "37 yer/il", "check",
                "Lester B. Pearson Beynəlxalq Təqaüdü", "Kanadanın Toronto Universitetində 4 illik tam ödənişsiz bakalavr təhsili və yataqxana dəstəyi.",
                "Lester B. Pearson International Scholarship", "Comprehensive scholarship covering tuition, books, incidental fees, and full residence support."),

            ("polimi", "it", "Politecnico di Milano Platin & Qızıl Təqaüdləri", "Milan, İtaliya", "Open", "€10,000/il + Təhsil Haqqı Azadlığı", "15 May 2025", "Magistraturaya qəbul olan ən yaxşı beynəlxalq tələbələr", "80 yer/il", "check",
                "Milan Politexnik Platin və Qızıl Təqaüdləri", "Mühəndislik və dizayn tələbələri üçün İtaliyanın ən böyük texniki təqaüdü.",
                "Politecnico di Milano Platinum & Gold Merit Scholarships", "Merit-based scholarship offering up to €10,000 gross per year plus tuition fee waiver."),

            ("ox.ac", "uk", "Oxford Clarendon Fondu Təqaüdü", "Oksford, Böyük Britaniya", "Open", "100% Kurs Xərcləri + £18,622/il Yaşayış Qrantı", "15 Yanvar 2026", "Oksford Universitetinə müraciət edən bütün magistr və PhD tələbələri", "140 yer/il", "check",
                "Oxford Clarendon Fondu Təqaüdü", "Oksfordda təhsil alan ən istedadlı magistr və doktorantlar üçün tam qrant.",
                "Oxford Clarendon Fund Scholarship", "Major graduate scholarship scheme at the University of Oxford offering full fee and generous living grant."),

            ("cam.ac", "uk", "Cambridge Gates Qlobal Təqaüdü", "Kembric, Böyük Britaniya", "Open", "Tam Təhsil + £20,000/il Təqaüd + Ailə Müavinəti", "05 Dekabr 2025", "Akademik mükəmməllik və cəmiyyətə xidmət öhdəliyi", "80 yer/il", "check",
                "Gates Cambridge Beynəlxalq Təqaüdü", "Bill & Melinda Gates Fondu tərəfindən Kembric tədqiqatçılarına ayrılan tam təqaüd.",
                "Gates Cambridge Scholarship", "Full-cost awards for outstanding applicants from countries outside the UK to pursue a postgraduate degree at Cambridge."),

            ("ku.ac.ae", "ae", "Xəlifə Universiteti Elmi Tədqiqat Qrantı", "Əbu-Dabi, BƏƏ", "Open", "100% Təhsil + AED 8,000/ay + Uçuş və Sığorta", "15 May 2025", "Mühəndislik və İT üzrə magistr/doktorantura tələbələri", "120 yer/il", "check",
                "Xəlifə Universiteti Elmi Tədqiqat Qrantı", "BƏƏ-də yüksək aylıq təqaüd, pulsuz yataqxana və elmi layihə büdcəsi təmin edən qrant.",
                "Khalifa University Postgraduate Research Scholarship", "Generous full fellowship covering all tuition fees, AED 8,000/mo stipend, and health insurance."),

            ("um.edu", "my", "Malayziya Beynəlxalq Təqaüdü (MIS)", "Kuala Lumpur, Malayziya", "Open", "Təhsil Haqqı Azadlığı + RM 1,500/ay Yaşayış Xərci", "15 Avqust 2025", "GPA 3.5+ olan magistr və doktorantura namizədləri", "150 yer/il", "check",
                "Malayziya Beynəlxalq Təqaüdü (MIS)", "Malayziya Ali Təhsil Nazirliyinin xarici istedadlar üçün təqdim etdiyi dövlət təqaüdü.",
                "Malaysian International Scholarship (MIS)", "Malaysian Government initiative to attract the best brains from around the world."),

            ("uw.edu", "pl", "Polşa Stefan Banach Təqaüd Proqramı", "Varşava / Krakov, Polşa", "Open", "Pulsuz Təhsil + PLN 1,700/ay Müavinət", "30 İyun 2025", "Mühəndislik, IT və dəqiq elmlər üzrə bakalavr məzunları", "300 yer/il", "check",
                "Stefan Banach Polşa Hökumət Təqaüdü", "Polşada ingilis və polyak dillərində magistratura təhsili üçün dövlət təqaüdü.",
                "Poland Stefan Banach Scholarship Programme", "NAWA scholarship for citizens of developing countries to study in Poland for free with monthly stipend."),

            ("kth.se", "se", "İsveç İnstitutu Qlobal Peşəkarlar Təqaüdü (SISGP)", "Stokholm, İsveç", "Open", "100% Təhsil + SEK 12,000/ay + Səyahət Qrantı", "15 Yanvar 2026", "Minimum 3,000 saatlıq iş təcrübəsi və liderlik", "350 yer/il", "check",
                "İsveç İnstitutu Qlobal Peşəkarlar Təqaüdü (SISGP)", "İsveçdə magistratura təhsili üçün tam təqaüd, aylıq 12000 SEK və tibbi sığorta.",
                "Swedish Institute Scholarships for Global Professionals", "Full tuition coverage and monthly living allowance for master's degree studies in Sweden."),

            ("tudelft", "nl", "Hollandiya Hökumət Təhsili Qrantı (NL Scholarship)", "Delft / Amsterdam, Niderland", "Open", "€5,000 Birinci İl Təqaüdü", "01 May 2025", "Aİ xarici ölkələrdən Niderland universitetlərinə ilk dəfə müraciət edənlər", "500 yer/il", "check",
                "Hollandiya Dövlət Təhsili Qrantı", "Niderland Təhsil Nazirliyinin beynəlxalq bakalavr və magistrlər üçün birdəfəlik qrantı.",
                "NL Scholarship (Holland Scholarship)", "Funded by the Dutch Ministry of Education for international students studying in the Netherlands."),

            ("ku.edu.tr", "tr", "Koç Universiteti Beynəlxalq Mükəmməllik Təqaüdü", "İstanbul, Türkiyə", "Open", "100% Təhsil + Pulsuz Yataqxana + 6,000 TL/ay", "15 İyun 2025", "Yüksək GRE/GMAT və akademik nailiyyətlər", "75 yer/il", "check",
                "Koç Universiteti Beynəlxalq Mükəmməllik Təqaüdü", "Türkiyənin ən reytinqli universitetində tam pulsuz təhsil və yataqxana təqaüdü.",
                "Koç University International Excellence Scholarship", "Merit-based full scholarship for outstanding international graduate students."),

            ("bhos.edu", "az", "SOCAR İstedadlı Tələbə Mükafatı", "Bakı, Azərbaycan", "Open", "100% Təhsil + 250 AZN/ay Təqaüd + Təcrübə", "20 İyul 2025", "650+ bal toplayan BANM tələbələri", "60 yer/il", "check",
                "BANM SOCAR İstedadlı Tələbə Təqaüdü", "SOCAR tərəfindən yüksək nəticəli tələbələrə verilən təqaüd və birbaşa iş imkanı.",
                "BHOS SOCAR Excellence Award", "Full corporate tuition scholarship and monthly stipend with guaranteed internship at SOCAR."),

            ("mcgill", "ca", "McGill Universiteti Qlobal Liderlik Qrantı", "Monreal, Kanada", "Open", "$12,000/il Yenilənən Təqaüd", "15 Yanvar 2026", "Akademik mükəmməllik və liderlik fəaliyyəti", "40 yer/il", "check",
                "McGill Universiteti Qlobal Liderlik Qrantı", "Kanadada təhsil alan ən yaxşı beynəlxalq tələbələrə 4 il müddətinə verilən illik təqaüd.",
                "McGill Major Entrance Scholarship", "Renewable annual entrance scholarship for top international undergraduate students.")
        };

        foreach (var def in schDefs)
        {
            var uni = def.uniKey != null ? GetUni(def.uniKey) : null;
            var country = GetCountry(def.cCode);

            var scholarship = new Scholarship
            {
                Id = Guid.NewGuid(),
                UniversityId = uni?.Id,
                CountryId = country?.Id,
                Name = def.name,
                Location = def.loc,
                Status = def.status,
                Amount = def.amount,
                Deadline = def.dline,
                Eligible = def.elig,
                Places = def.places,
                ButtonType = def.btn,
                Translations = new List<ScholarshipTranslation>
                {
                    new ScholarshipTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = def.nameAz, Description = def.descAz, Eligible = def.elig },
                    new ScholarshipTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = def.nameEn, Description = def.descEn, Eligible = def.elig },
                    new ScholarshipTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = def.nameEn, Description = def.descEn, Eligible = def.elig }
                }
            };

            await context.Scholarships.AddAsync(scholarship);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedInstructorsAndCoursesAsync(IServiceProvider serviceProvider, EdusazDbContext context, Guid enId, Guid azId, Guid trId)
    {
        if (context.Courses.Count() >= 20) return;

        var userManager = serviceProvider.GetService<UserManager<User>>();
        if (userManager == null) return;

        // Seed 6 Instructors
        var instructorDefs = new List<(string email, string first, string last, string display, string bio, string expertise, string avatar)>
        {
            ("rashad.aliyev@edusaz.com", "Dr. Rashad", "Aliyev", "Dr. Rashad Aliyev", "Ex-Google Senior Staff AI Engineer & PhD in Computer Science. Author of bestselling Machine Learning textbooks with 12+ years of distributed systems engineering.", "Artificial Intelligence, Cloud Architecture & Deep Learning", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"),
            ("aysel.mammadova@edusaz.com", "Aysel", "Mammadova", "Aysel Mammadova", "Senior Full-Stack Architect & Tech Lead with 10+ years specializing in React, Next.js, Node.js and .NET microservices. Trained over 25,000 developers globally.", "Full-Stack Web Development, React & Next.js", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"),
            ("jonathan.cole@edusaz.com", "Jonathan", "Cole", "Jonathan Cole", "Former Apple Senior Product Designer & Apple Design Award Winner. Passionate about design systems, typography, Figma mastery, and UX psychological principles.", "UI/UX Design, Design Systems & Figma", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"),
            ("elena.rostova@edusaz.com", "Dr. Elena", "Rostova", "Dr. Elena Rostova", "Chief Data Scientist at QuantumAnalytics and former CERN data fellow. Expert in predictive modeling, PyTorch, Big Data pipelines, and financial analytics.", "Data Science, Python & Big Data", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"),
            ("mark.wilson@edusaz.com", "Mark", "Wilson", "Mark Wilson, MA", "Cambridge Certified Senior English Trainer with 15+ years of helping international students achieve IELTS Band 8.5+ and TOEFL 110+ scores for top university admissions.", "IELTS Academic, TOEFL iBT & Business English", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"),
            ("deniz.yilmaz@edusaz.com", "Deniz", "Yılmaz", "Deniz Yılmaz", "Mobile Engineering Director, creator of top-charting iOS and Flutter applications with over 15 million downloads across App Store and Google Play.", "Mobile Development, Flutter 3 & Swift 6", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80")
        };

        var instructorMap = new Dictionary<string, Instructor>();

        foreach (var instDef in instructorDefs)
        {
            var user = await userManager.FindByEmailAsync(instDef.email);
            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    UserName = instDef.email,
                    Email = instDef.email,
                    EmailConfirmed = true,
                    FirstName = instDef.first,
                    LastName = instDef.last,
                    CreatedAt = DateTime.UtcNow
                };

                var createRes = await userManager.CreateAsync(user, "EduSazInstructor2026!");
                if (createRes.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "Instructor");
                }
            }

            var instructor = await context.Instructors.FirstOrDefaultAsync(i => i.UserId == user.Id);
            if (instructor == null)
            {
                instructor = new Instructor
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    DisplayName = instDef.display,
                    Bio = instDef.bio,
                    Expertise = instDef.expertise,
                    AvatarUrl = instDef.avatar,
                    IsApproved = true,
                    TotalStudents = 14500,
                    Rating = 4.9,
                    TotalReviews = 3200
                };
                await context.Instructors.AddAsync(instructor);
                await context.SaveChangesAsync();
            }

            instructorMap[instDef.email] = instructor;
        }

        // Seed 22 High Quality Courses
        var courseDefs = new List<CourseSeedModel>
        {
            new CourseSeedModel
            {
                InstructorEmail = "aysel.mammadova@edusaz.com",
                Title = "Full-Stack Web Development Bootcamp: React 19, Next.js 15 & Node.js",
                Category = "Web Development", SubCategory = "Frontend & Backend", Tags = "React, Next.js, TypeScript, Tailwind, Node.js, PostgreSQL",
                Language = "en", Level = "All", Price = 89.99m, DiscountPrice = 19.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = true, TotalStudents = 8420, Rating = 4.9, ReviewCount = 1840,
                ShortDescription = "Master modern Full-Stack development from absolute zero to deploying production Next.js 15 apps with authentication, SSR, and cloud databases.",
                Description = "Become a job-ready Full-Stack Web Developer. In this comprehensive masterclass, you will learn HTML5, CSS3, modern JavaScript (ES6+), TypeScript, React 19 hooks, Next.js 15 App Router, Server Components, Node.js, Express, and PostgreSQL with Prisma.",
                WhatYouLearn = "Build full-stack responsive web applications\nMaster React 19 Server Components and hooks\nDeploy Next.js apps with PostgreSQL and Prisma\nImplement JWT authentication and Stripe payments",
                Requirements = "Basic computer literacy\nNo prior coding experience required",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Modern JavaScript & TypeScript Essentials", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Modern JS Features: Async/Await, Destructuring & Modules", Duration = 18, IsFree = true },
                        new LectureSeedModel { Title = "TypeScript Fundamentals for React Developers", Duration = 24, IsFree = true }
                    }},
                    new SectionSeedModel { Title = "2. React 19 Deep Dive & State Architecture", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Components, Props & Modern Hooks (useActionState, useOptimistic)", Duration = 32 },
                        new LectureSeedModel { Title = "Zustand & TanStack Query State Management", Duration = 28 }
                    }},
                    new SectionSeedModel { Title = "3. Next.js 15 App Router & Server Actions", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Server vs Client Components Architecture", Duration = 35 },
                        new LectureSeedModel { Title = "Building Production REST & GraphQL APIs with Node", Duration = 40 }
                    }}
                },
                TitleAz = "Full-Stack Veb Proqramlaşdırma: React 19, Next.js 15 və Node.js",
                DescAz = "Sıfırdan peşəkar səviyyəyə qədər müasir Full-Stack proqramlaşdırma. React 19, Next.js 15, TypeScript və PostgreSQL ilə real layihələr qurun."
            },

            new CourseSeedModel
            {
                InstructorEmail = "aysel.mammadova@edusaz.com",
                Title = "C# .NET 8 Enterprise Microservices & Clean Architecture",
                Category = "Programming", SubCategory = "Backend Engineering", Tags = ".NET 8, C#, Microservices, Docker, RabbitMQ, Clean Architecture",
                Language = "en", Level = "Intermediate", Price = 94.99m, DiscountPrice = 24.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = true, TotalStudents = 5120, Rating = 4.9, ReviewCount = 1120,
                ShortDescription = "Build scalable, distributed enterprise backend applications using .NET 8, CQRS, MediatR, RabbitMQ, Docker, and PostgreSQL.",
                Description = "Master enterprise .NET 8 development. Learn Domain-Driven Design (DDD), Clean Architecture, CQRS with MediatR, Redis caching, RabbitMQ event-driven messaging, and Kubernetes container orchestration.",
                WhatYouLearn = "Design enterprise backend systems with Clean Architecture\nImplement Event-Driven Microservices with RabbitMQ & MassTransit\nContainerize .NET apps with Docker & Docker Compose\nWrite Unit & Integration tests with xUnit & FluentAssertions",
                Requirements = "Familiarity with basic C# syntax and Object-Oriented Programming (OOP)",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Clean Architecture & Domain-Driven Design (DDD)", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Core vs Infrastructure vs Application vs API Layers", Duration = 22, IsFree = true },
                        new LectureSeedModel { Title = "Implementing CQRS with MediatR & FluentValidation", Duration = 30 }
                    }},
                    new SectionSeedModel { Title = "2. Microservices Communication & Event-Driven Architecture", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "RabbitMQ Message Brokers & MassTransit Integration", Duration = 36 },
                        new LectureSeedModel { Title = "API Gateways with YARP & Ocelot", Duration = 25 }
                    }}
                },
                TitleAz = "C# .NET 8 Enterprise Mikroxidmətlər və Clean Architecture",
                DescAz = "Clean Architecture, CQRS, RabbitMQ və Docker istifadə edərək böyük miqyaslı paylanmış .NET 8 arxitekturası qurun."
            },

            new CourseSeedModel
            {
                InstructorEmail = "rashad.aliyev@edusaz.com",
                Title = "Generative AI, Large Language Models (LLMs) & Prompt Engineering Masterclass",
                Category = "AI & Machine Learning", SubCategory = "Generative AI", Tags = "AI, LLM, OpenAI, LangChain, RAG, Vector DB, Python",
                Language = "en", Level = "All", Price = 99.99m, DiscountPrice = 29.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = true, TotalStudents = 11300, Rating = 4.95, ReviewCount = 2980,
                ShortDescription = "Build autonomous AI agents, enterprise RAG systems, and custom LLM applications using LangChain, LlamaIndex, OpenAI, and Pinecone.",
                Description = "Join the AI revolution. Learn everything from advanced Prompt Engineering techniques to building multi-agent autonomous workflows, Retrieval-Augmented Generation (RAG) pipelines over company PDFs, and fine-tuning open-source models with LoRA.",
                WhatYouLearn = "Master advanced prompt engineering & chain-of-thought prompting\nBuild production RAG pipelines with LangChain & Pinecone\nCreate autonomous AI Agents with tool calling and memory\nFine-tune open weights models (Llama 3, Mistral) on custom datasets",
                Requirements = "Basic Python programming knowledge",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Foundations of Modern LLMs & Prompt Engineering", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "How Transformers Work: Embeddings, Tokens & Attention", Duration = 25, IsFree = true },
                        new LectureSeedModel { Title = "Zero-shot, Few-shot & Chain-of-Thought Prompting Mastery", Duration = 30, IsFree = true }
                    }},
                    new SectionSeedModel { Title = "2. Retrieval-Augmented Generation (RAG) Deep Dive", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Chunking Strategies, Vector Databases (Pinecone/Chroma)", Duration = 38 },
                        new LectureSeedModel { Title = "Building Chat-with-Your-Documents AI with LangChain", Duration = 45 }
                    }}
                },
                TitleAz = "Generativ Süni İntellekt, LLM-lər və Prompt Engineering Masterklass",
                DescAz = "LangChain, RAG, OpenAI və Pinecone istifadə edərək süni intellekt agentləri və korporativ AI tətbiqləri hazırlayın."
            },

            new CourseSeedModel
            {
                InstructorEmail = "elena.rostova@edusaz.com",
                Title = "Python for Data Science, Machine Learning & Predictive Analytics",
                Category = "Data Science", SubCategory = "Machine Learning", Tags = "Python, Pandas, NumPy, Scikit-Learn, Matplotlib, Data Analytics",
                Language = "en", Level = "Beginner", Price = 79.99m, DiscountPrice = 14.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = true, TotalStudents = 14200, Rating = 4.85, ReviewCount = 3400,
                ShortDescription = "Complete guide to data manipulation, visualization, statistical modeling, and machine learning with NumPy, Pandas, and Scikit-Learn.",
                Description = "From raw data to actionable business insights. Learn how to clean, analyze, visualize data, and train predictive machine learning algorithms (Linear Regression, Random Forests, XGBoost, Clustering).",
                WhatYouLearn = "Perform data wrangling with Pandas and NumPy\nCreate interactive data visualizations with Seaborn and Plotly\nBuild classification and regression machine learning models\nEvaluate model performance with precision, recall, and ROC-AUC",
                Requirements = "No prior mathematics or programming background required",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Data Analysis with Pandas & NumPy", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "NumPy Arrays & Vectorized Computations", Duration = 20, IsFree = true },
                        new LectureSeedModel { Title = "Data Cleaning, Filtering & Grouping with Pandas", Duration = 35 }
                    }},
                    new SectionSeedModel { Title = "2. Supervised & Unsupervised Machine Learning", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Regression & Classification with Scikit-Learn", Duration = 42 },
                        new LectureSeedModel { Title = "Ensemble Methods: Random Forests & XGBoost", Duration = 38 }
                    }}
                },
                TitleAz = "Data Elmi, Maşın Öyrənməsi və Proqnozlaşdırma Analitikası",
                DescAz = "Python, Pandas, NumPy və Scikit-Learn ilə məlumatların analizi və maşın öyrənməsi modellərinin qurulması."
            },

            new CourseSeedModel
            {
                InstructorEmail = "deniz.yilmaz@edusaz.com",
                Title = "Complete iOS 18 & Swift 6 App Development with SwiftUI",
                Category = "Mobile Development", SubCategory = "iOS & Apple", Tags = "iOS 18, Swift 6, SwiftUI, Xcode, CoreData, SwiftData",
                Language = "en", Level = "All", Price = 94.99m, DiscountPrice = 21.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = true, TotalStudents = 6750, Rating = 4.9, ReviewCount = 1420,
                ShortDescription = "Build beautiful, native iOS 18 apps from scratch with SwiftUI, SwiftData, async/await concurrency, and deploy to the App Store.",
                Description = "Master modern iOS development with Swift 6 and SwiftUI. You will build 10+ real-world apps including an E-Commerce app, Crypto Tracker, and Social Feed with smooth animations and Apple design guidelines.",
                WhatYouLearn = "Master SwiftUI layouts, state, bindings, and navigation\nPersist data seamlessly with SwiftData and CoreData\nIntegrate REST APIs using modern Swift async/await\nPublish apps directly to the Apple App Store",
                Requirements = "A Mac computer running macOS Sonoma or Sequoia",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Swift 6 Fundamentals & Modern Syntax", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Variables, Optionals, Enums & Structs in Swift 6", Duration = 26, IsFree = true },
                        new LectureSeedModel { Title = "Modern Concurrency: Async/Await, Actors & Tasks", Duration = 34 }
                    }},
                    new SectionSeedModel { Title = "2. SwiftUI Architecture & App Store Projects", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Building Dynamic List & Detail Views with Animations", Duration = 38 },
                        new LectureSeedModel { Title = "Offline Persistence with SwiftData", Duration = 30 }
                    }}
                },
                TitleAz = "iOS 18 və Swift 6 ilə Mobil Tətbiq Hazırlanması (SwiftUI)",
                DescAz = "SwiftUI və Swift 6 ilə müasir iPhone tətbiqləri hazırlayın və App Store-da yayımlayın."
            },

            new CourseSeedModel
            {
                InstructorEmail = "deniz.yilmaz@edusaz.com",
                Title = "Cross-Platform Mobile Apps with Flutter 3 & Dart",
                Category = "Mobile Development", SubCategory = "Cross-Platform", Tags = "Flutter, Dart, Mobile, iOS, Android, BLoC, Firebase",
                Language = "en", Level = "Beginner", Price = 84.99m, DiscountPrice = 17.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = false, TotalStudents = 9200, Rating = 4.85, ReviewCount = 2100,
                ShortDescription = "Single codebase for iOS, Android, Web, and Desktop. Learn Dart 3, state management (BLoC/Riverpod), and Firebase integration.",
                Description = "Learn Flutter from Google developer experts. Build pixel-perfect, natively compiled applications for mobile and web with high-performance animations and cloud backend connections.",
                WhatYouLearn = "Build native cross-platform iOS & Android mobile apps\nMaster Dart 3 object-oriented and functional features\nImplement robust BLoC and Riverpod state management\nConnect Firebase Auth, Firestore, and Push Notifications",
                Requirements = "Any Windows, Mac, or Linux computer",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Flutter Widgets & UI Mastery", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Stateless vs Stateful Widgets, Columns, Rows & Stacks", Duration = 24, IsFree = true },
                        new LectureSeedModel { Title = "Custom Animations, Hero Transitions & Themes", Duration = 32 }
                    }},
                    new SectionSeedModel { Title = "2. State Management & Cloud Integration", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "BLoC Pattern & Clean Architecture in Flutter", Duration = 40 },
                        new LectureSeedModel { Title = "Firebase Cloud Firestore & Authentication", Duration = 36 }
                    }}
                },
                TitleAz = "Flutter 3 və Dart ilə Kross-Platform Mobil Tətbiqlər",
                DescAz = "Tək kod bazası ilə həm iOS, həm də Android üçün peşəkar mobil tətbiqlər qurun."
            },

            new CourseSeedModel
            {
                InstructorEmail = "jonathan.cole@edusaz.com",
                Title = "UI/UX Design Masterclass: From Wireframe to Interactive Figma Prototype",
                Category = "Design", SubCategory = "User Interface & Experience", Tags = "UI/UX, Figma, Design Systems, Wireframing, UX Research, Mobile Design",
                Language = "en", Level = "All", Price = 79.99m, DiscountPrice = 16.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = true, TotalStudents = 12400, Rating = 4.95, ReviewCount = 3100,
                ShortDescription = "Learn industry-standard UI/UX design workflow. Master auto-layout, design tokens, micro-interactions, and usability testing.",
                Description = "Become a high-earning UI/UX Designer. This masterclass covers user research, wireframing, typography, color harmony, responsive components with Figma auto-layout, interactive prototypes, and developer handoff.",
                WhatYouLearn = "Master Figma: Auto Layout, Components, Variants & Variables\nBuild comprehensive scalable Design Systems\nConduct user research, personas, and usability testing\nCreate smooth interactive prototypes that wow clients",
                Requirements = "Free Figma account (no design experience needed)",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. UX Fundamentals & User Psychology", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Gestalt Principles, Fitts's Law & Visual Hierarchy", Duration = 22, IsFree = true },
                        new LectureSeedModel { Title = "User Journey Mapping & Wireframing", Duration = 28, IsFree = true }
                    }},
                    new SectionSeedModel { Title = "2. Figma Mastery & Design Systems", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Auto Layout 5.0, Component Variants & Token Variables", Duration = 45 },
                        new LectureSeedModel { Title = "Interactive Micro-interactions & Developer Handoff", Duration = 32 }
                    }}
                },
                TitleAz = "UI/UX Dizayn Masterklass: Figma və İnteraktiv Prototip",
                DescAz = "Sıfırdan Figma alətləri, dizayn sistemləri, mobil və veb interfeyslərin peşəkar dizaynı."
            },

            new CourseSeedModel
            {
                InstructorEmail = "mark.wilson@edusaz.com",
                Title = "IELTS Academic Band 8.5+: Complete 4-Skills Mastery Course",
                Category = "Language Learning", SubCategory = "Exam Preparation", Tags = "IELTS, Academic, English, Speaking, Writing, Listening, Reading",
                Language = "en", Level = "All", Price = 69.99m, DiscountPrice = 14.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = true, TotalStudents = 18900, Rating = 4.95, ReviewCount = 4800,
                ShortDescription = "Proven step-by-step strategies, essay templates, and speaking formulas to achieve Band 8.0 to 9.0 on your very first attempt.",
                Description = "Get accepted to top universities in the UK, USA, Canada, and Germany. Taught by a Cambridge certified trainer, this course reveals high-scoring vocabulary, grammar structures, and task-specific tactics for Listening, Reading, Writing Task 1 & 2, and Speaking.",
                WhatYouLearn = "Master IELTS Academic Writing Task 1 & Task 2 essay formulas\nAchieve 9.0 in Reading with skimming, scanning & keyword matching\nFluency, pronunciation & idiom mastery for Speaking Parts 1, 2 & 3\nAvoid all common traps and trick questions in Listening",
                Requirements = "Intermediate (B1) English level or above",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. IELTS Writing Task 2 Master Formulas", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Opinion, Discussion & Problem-Solution Essay Structures", Duration = 35, IsFree = true },
                        new LectureSeedModel { Title = "Band 9 Vocabulary & Complex Sentence Starters", Duration = 28, IsFree = true }
                    }},
                    new SectionSeedModel { Title = "2. Speaking & Reading Speed Strategies", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Part 2 Cue Card 2-Minute Natural Storytelling Strategy", Duration = 24 },
                        new LectureSeedModel { Title = "True/False/Not Given & Heading Matching Hacks", Duration = 30 }
                    }}
                },
                TitleAz = "IELTS Academic Band 8.5+: 4 Bacarığın Tam Hazırlıq Kursu",
                DescAz = "IELTS imtahanında 8.5+ bal toplamaq üçün yazı esseləri, danışıq strategiyaları və oxu qaydaları."
            },

            new CourseSeedModel
            {
                InstructorEmail = "rashad.aliyev@edusaz.com",
                Title = "Ethical Hacking, Penetration Testing & Cybersecurity Defense",
                Category = "Programming", SubCategory = "Cybersecurity", Tags = "Security, Kali Linux, Penetration Testing, Python, Network Security",
                Language = "en", Level = "Intermediate", Price = 99.99m, DiscountPrice = 24.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = false, TotalStudents = 7800, Rating = 4.88, ReviewCount = 1650,
                ShortDescription = "Learn how ethical hackers secure systems. Hands-on penetration testing with Kali Linux, Metasploit, Wireshark, and Burp Suite.",
                Description = "Discover network vulnerabilities before malicious hackers do. You will learn port scanning, SQL injection, XSS exploitation, wireless hacking, and corporate security auditing in legal sandbox environments.",
                WhatYouLearn = "Perform legal vulnerability assessments and penetration tests\nMaster Kali Linux security toolkits and command line\nExploit and patch web application vulnerabilities (OWASP Top 10)\nDefend networks against ransomware, phishing, and DDoS attacks",
                Requirements = "Basic understanding of networking (IP addresses, ports, routers)",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Network Reconnaissance & Port Scanning", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Nmap Advanced Scanning & Banner Grabbing", Duration = 25, IsFree = true },
                        new LectureSeedModel { Title = "Wireshark Packet Analysis & Protocol Decoding", Duration = 32 }
                    }},
                    new SectionSeedModel { Title = "2. Web Application Penetration Testing", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Burp Suite Proxy & Intercepting Requests", Duration = 28 },
                        new LectureSeedModel { Title = "SQL Injection (SQLi) & Cross-Site Scripting (XSS)", Duration = 40 }
                    }}
                },
                TitleAz = "Etik Hakerlik, Penetration Testing və Kibermüdafiə",
                DescAz = "Kali Linux, Wireshark və Burp Suite ilə şəbəkə və veb tətbiqlərinin təhlükəsizlik auditini öyrənin."
            },

            new CourseSeedModel
            {
                InstructorEmail = "rashad.aliyev@edusaz.com",
                Title = "Golang for High-Performance Distributed Backend Systems",
                Category = "Programming", SubCategory = "Backend", Tags = "Go, Golang, Microservices, gRPC, Concurrency, Docker",
                Language = "en", Level = "Intermediate", Price = 89.99m, DiscountPrice = 19.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = false, TotalStudents = 4600, Rating = 4.92, ReviewCount = 980,
                ShortDescription = "Harness Go's legendary concurrency model (goroutines, channels), gRPC microservices, and build blazingly fast APIs.",
                Description = "Master the language powering Docker, Kubernetes, and modern cloud infrastructure. Learn goroutines, worker pools, high-throughput gRPC streaming, and database pooling.",
                WhatYouLearn = "Master Go syntax, pointers, interfaces, and error handling\nBuild concurrent pipelines with Goroutines and Channels\nCreate high-performance gRPC & Protobuf microservices\nBenchmark and profile Go applications with pprof",
                Requirements = "Experience with at least one programming language (Python, C#, Java, or JS)",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Concurrency Mastery in Go", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Goroutines, Channels & Select Statements", Duration = 30, IsFree = true },
                        new LectureSeedModel { Title = "Worker Pools & Race Condition Prevention with Mutexes", Duration = 35 }
                    }},
                    new SectionSeedModel { Title = "2. Production gRPC Microservices", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Protobuf Schemas & High-Speed Binary Streaming", Duration = 38 },
                        new LectureSeedModel { Title = "PostgreSQL Connection Pooling & SQLX", Duration = 28 }
                    }}
                },
                TitleAz = "Yüksək Performanslı Backend Sistemləri üçün Golang",
                DescAz = "Goroutines, kanallar və gRPC mikroxidmətləri ilə saniyədə yüz minlərlə sorğu idarə edən Go proqramlaşdırması."
            },

            new CourseSeedModel
            {
                InstructorEmail = "jonathan.cole@edusaz.com",
                Title = "Motion Graphics, VFX & Visual Design with Adobe After Effects",
                Category = "Design", SubCategory = "Motion & Animation", Tags = "After Effects, Motion Graphics, Animation, VFX, Video Editing",
                Language = "en", Level = "Beginner", Price = 74.99m, DiscountPrice = 18.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = false, TotalStudents = 5800, Rating = 4.86, ReviewCount = 1250,
                ShortDescription = "Create stunning logo animations, kinetic typography, 3D camera projections, and visual effects for commercial videos.",
                Description = "Bring static graphics to life with Hollywood-grade motion design. Learn keyframing curves, graph editor, shape layers, track mattes, 3D space, and render optimization.",
                WhatYouLearn = "Master After Effects graph editor for organic, fluid animations\nCreate kinetic typography and dynamic title sequences\nAnimate vector illustrations and logo stings\nComposite visual effects with green screen and tracking",
                Requirements = "Adobe After Effects installed on your computer",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Keyframing & Animation Principles", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "12 Principles of Animation Applied to Motion Design", Duration = 24, IsFree = true },
                        new LectureSeedModel { Title = "Mastering Speed & Value Graphs in Graph Editor", Duration = 30 }
                    }},
                    new SectionSeedModel { Title = "2. Commercial Logo & UI Animations", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Morphing Shape Layers & Trim Paths", Duration = 28 },
                        new LectureSeedModel { Title = "Lottie Animations for Web & Mobile Apps", Duration = 22 }
                    }}
                },
                TitleAz = "Hərəkətli Qrafika və Animasiya (Adobe After Effects)",
                DescAz = "After Effects ilə loqo animasiyası, kinetik tipoqrafika və peşəkar video vizual effektlər."
            },

            new CourseSeedModel
            {
                InstructorEmail = "mark.wilson@edusaz.com",
                Title = "TOEFL iBT 110+ Strategy, Speaking & Writing Master Guide",
                Category = "Language Learning", SubCategory = "Exam Preparation", Tags = "TOEFL, English, University Prep, Speaking, Writing",
                Language = "en", Level = "All", Price = 64.99m, DiscountPrice = 14.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = false, TotalStudents = 8200, Rating = 4.9, ReviewCount = 1900,
                ShortDescription = "Master the new TOEFL iBT format. High-scoring templates for Academic Discussion Writing, Integrated Speaking, and Reading speed.",
                Description = "Everything you need to surpass the 110+ mark on TOEFL iBT. Learn academic note-taking methods, speech tempo management, and time-saving reading techniques.",
                WhatYouLearn = "Tackle the new 'Writing for an Academic Discussion' task effortlessly\nDeliver structured, fluent 45-second and 60-second Speaking responses\nTake accurate, shorthand notes during fast lecture listening\nAnalyze complex academic texts under strict time constraints",
                Requirements = "Intermediate English foundation",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Speaking Section Speed & Structure", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Task 1 Independent Speaking: The 15-Second Prep Strategy", Duration = 20, IsFree = true },
                        new LectureSeedModel { Title = "Integrated Campus & Academic Speaking Templates", Duration = 28 }
                    }},
                    new SectionSeedModel { Title = "2. Academic Discussion Writing & Listening", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Academic Discussion: 100-word High-Scoring Formula", Duration = 25 },
                        new LectureSeedModel { Title = "Note-Taking Shorthand for Science & History Lectures", Duration = 22 }
                    }}
                },
                TitleAz = "TOEFL iBT 110+ Strategiyası və İmtahan Hazırlığı",
                DescAz = "TOEFL iBT imtahanında 110+ bal üçün yeni format yazı və danışıq şablonları."
            },

            new CourseSeedModel
            {
                InstructorEmail = "mark.wilson@edusaz.com",
                Title = "Executive Business English & Global Corporate Communication",
                Category = "Language Learning", SubCategory = "Professional English", Tags = "Business English, Negotiations, Emails, Presentations, Leadership",
                Language = "en", Level = "All", Price = 59.99m, DiscountPrice = 12.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = false, TotalStudents = 9700, Rating = 4.88, ReviewCount = 2150,
                ShortDescription = "Elevate your global professional presence. Master persuasive business writing, high-stakes negotiations, and executive presentations.",
                Description = "Communicate with confidence in multinational corporate environments. Learn diplomatic phrasing, email etiquette, pitching to venture capitalists, and conflict resolution language.",
                WhatYouLearn = "Write clear, impactful corporate emails and formal proposals\nLead international meetings and negotiate terms with confidence\nDeliver captivating keynote business presentations\nMaster diplomatic language for disagreements and negotiations",
                Requirements = "Pre-intermediate to Upper-Intermediate English level",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. High-Impact Written Communication", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Executive Email Etiquette & Persuasive Proposals", Duration = 22, IsFree = true },
                        new LectureSeedModel { Title = "Diplomatic Phrasing for Difficult Messages", Duration = 18 }
                    }},
                    new SectionSeedModel { Title = "2. Meetings & Presentation Mastery", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Opening, Managing & Closing International Meetings", Duration = 26 },
                        new LectureSeedModel { Title = "The 3-Act Structure for Executive Presentations", Duration = 30 }
                    }}
                },
                TitleAz = "Biznes İngilis Dili və Beynəlxalq Korporativ Kommunikasiya",
                DescAz = "Beynəlxalq şirkətlərdə danışıqlar aparmaq, təqdimatlar hazırlamaq və rəsmi yazışmalar aparmaq üçün biznes ingilis dili."
            },

            new CourseSeedModel
            {
                InstructorEmail = "elena.rostova@edusaz.com",
                Title = "Deep Learning with PyTorch & Computer Vision Applications",
                Category = "AI & Machine Learning", SubCategory = "Deep Learning", Tags = "PyTorch, Deep Learning, CNN, Computer Vision, YOLO, Python",
                Language = "en", Level = "Advanced", Price = 99.99m, DiscountPrice = 27.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = false, TotalStudents = 4900, Rating = 4.93, ReviewCount = 1050,
                ShortDescription = "Build and train Convolutional Neural Networks (CNNs), Vision Transformers (ViTs), and real-time object detectors with YOLOv8.",
                Description = "Dive deep into modern computer vision with PyTorch. Implement image classification, semantic segmentation, real-time object tracking, and generative adversarial networks (GANs).",
                WhatYouLearn = "Build deep neural networks using pure PyTorch tensors and modules\nTrain Convolutional Neural Networks (ResNet, EfficientNet)\nDeploy real-time object detection models with YOLOv8\nImplement Vision Transformers (ViT) from scratch",
                Requirements = "Python proficiency and understanding of linear algebra basics",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. PyTorch Architecture & Neural Networks", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Tensors, Autograd & Custom Training Loops", Duration = 28, IsFree = true },
                        new LectureSeedModel { Title = "Building CNNs for Image Classification", Duration = 36 }
                    }},
                    new SectionSeedModel { Title = "2. Advanced Computer Vision Architectures", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Real-Time Object Detection with YOLOv8", Duration = 42 },
                        new LectureSeedModel { Title = "Vision Transformers (ViT) & Multi-Modal AI", Duration = 38 }
                    }}
                },
                TitleAz = "PyTorch ilə Dərin Öyrənmə və Kompüter Görməsi",
                DescAz = "PyTorch, CNN, YOLOv8 və Vision Transformers ilə real vaxt təsvir tanıma sistemlərinin yaradılması."
            },

            new CourseSeedModel
            {
                InstructorEmail = "aysel.mammadova@edusaz.com",
                Title = "SQL & PostgreSQL Database Optimization for Software Engineers",
                Category = "Programming", SubCategory = "Database Systems", Tags = "SQL, PostgreSQL, Indexes, Query Tuning, Database Architecture",
                Language = "en", Level = "All", Price = 69.99m, DiscountPrice = 14.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = false, TotalStudents = 7600, Rating = 4.89, ReviewCount = 1580,
                ShortDescription = "Transform slow database queries into sub-millisecond lookups. Master B-tree indexes, execution plans, transactions, and partitioning.",
                Description = "Databases are the core bottleneck of software systems. Learn how to write complex SQL, inspect EXPLAIN ANALYZE execution plans, optimize indexes, and handle ACID transactions safely under high concurrency.",
                WhatYouLearn = "Write complex SQL with CTEs, Window Functions, and Joins\nMaster PostgreSQL indexing: B-Tree, GIN, GiST, and Partial indexes\nAnalyze query execution plans with EXPLAIN ANALYZE\nDesign scalable schemas with table partitioning and connection pools",
                Requirements = "Basic familiarity with any relational database",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Advanced SQL & Analytical Queries", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Window Functions (ROW_NUMBER, RANK, LEAD/LAG)", Duration = 26, IsFree = true },
                        new LectureSeedModel { Title = "Common Table Expressions (CTEs) & Recursive Queries", Duration = 24 }
                    }},
                    new SectionSeedModel { Title = "2. Query Optimization & Indexing Secrets", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Reading & Decoding EXPLAIN (ANALYZE, BUFFERS)", Duration = 34 },
                        new LectureSeedModel { Title = "B-Tree vs GIN Indexing & Covering Indexes", Duration = 30 }
                    }}
                },
                TitleAz = "SQL və PostgreSQL Verilənlər Bazasının Optimizasiyası",
                DescAz = "Mürəkkəb SQL sorğuları, indeksləşdirmə və sorğu optimizasiyası ilə bazanın sürətləndirilməsi."
            },

            new CourseSeedModel
            {
                InstructorEmail = "aysel.mammadova@edusaz.com",
                Title = "Modern DevOps & Cloud Engineering: Docker, Kubernetes & AWS CI/CD",
                Category = "Programming", SubCategory = "Cloud & DevOps", Tags = "DevOps, Docker, Kubernetes, AWS, Terraform, GitHub Actions, CI/CD",
                Language = "en", Level = "Intermediate", Price = 99.99m, DiscountPrice = 24.99m, IsFree = false,
                ThumbnailUrl = "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80",
                IsPublished = true, IsApproved = true, IsFeatured = true, TotalStudents = 6300, Rating = 4.91, ReviewCount = 1390,
                ShortDescription = "Automate deployments, orchestrate container clusters with Kubernetes, manage cloud infrastructure with Terraform on AWS.",
                Description = "Become a highly sought-after DevOps Engineer. Learn how to package apps into minimal Docker containers, deploy Kubernetes pods and ingress controllers, write Terraform Infrastructure-as-Code (IaC), and automate CI/CD with GitHub Actions.",
                WhatYouLearn = "Containerize microservices with multi-stage Docker builds\nDeploy and scale applications on Kubernetes (EKS)\nProvision cloud infrastructure with Terraform on AWS\nBuild automated CI/CD deployment pipelines with GitHub Actions",
                Requirements = "Basic Linux command line knowledge",
                Sections = new List<SectionSeedModel>
                {
                    new SectionSeedModel { Title = "1. Docker & Containerization Mastery", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Multi-Stage Dockerfiles & Image Size Optimization", Duration = 25, IsFree = true },
                        new LectureSeedModel { Title = "Docker Compose for Multi-Container Environments", Duration = 28 }
                    }},
                    new SectionSeedModel { Title = "2. Kubernetes Clusters & Cloud CI/CD", Lectures = new List<LectureSeedModel> {
                        new LectureSeedModel { Title = "Deployments, Services, ConfigMaps & Ingress Routing", Duration = 42 },
                        new LectureSeedModel { Title = "GitHub Actions CI/CD Pipeline to AWS EKS", Duration = 38 }
                    }}
                },
                TitleAz = "Müasir DevOps və Bulud Mühəndisliyi: Docker, Kubernetes və AWS",
                DescAz = "Docker konteynerləri, Kubernetes klasterləri və GitHub Actions ilə avtomatlaşdırılmış bulud infrastrukturu."
            }
        };

        foreach (var cSeed in courseDefs)
        {
            var instructor = instructorMap[cSeed.InstructorEmail];

            var course = new Course
            {
                Id = Guid.NewGuid(),
                InstructorId = instructor.Id,
                Title = cSeed.Title,
                Description = cSeed.Description,
                ShortDescription = cSeed.ShortDescription,
                WhatYouLearn = cSeed.WhatYouLearn,
                Requirements = cSeed.Requirements,
                Category = cSeed.Category,
                SubCategory = cSeed.SubCategory,
                Tags = cSeed.Tags,
                Language = cSeed.Language,
                Level = cSeed.Level,
                Price = cSeed.Price,
                DiscountPrice = cSeed.DiscountPrice,
                Currency = "USD",
                IsFree = cSeed.IsFree,
                ThumbnailUrl = cSeed.ThumbnailUrl,
                PreviewVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                IsPublished = cSeed.IsPublished,
                IsApproved = cSeed.IsApproved,
                IsFeatured = cSeed.IsFeatured,
                TotalStudents = cSeed.TotalStudents,
                Rating = cSeed.Rating,
                ReviewCount = cSeed.ReviewCount,
                TotalLectures = cSeed.Sections.Sum(s => s.Lectures.Count),
                TotalDurationMinutes = cSeed.Sections.Sum(s => s.Lectures.Sum(l => l.Duration)),
                Translations = new List<CourseTranslation>
                {
                    new CourseTranslation
                    {
                        Id = Guid.NewGuid(),
                        LanguageCode = "az",
                        Title = cSeed.TitleAz,
                        Description = cSeed.DescAz,
                        ShortDescription = cSeed.DescAz,
                        WhatYouLearn = cSeed.WhatYouLearn,
                        Requirements = cSeed.Requirements
                    },
                    new CourseTranslation
                    {
                        Id = Guid.NewGuid(),
                        LanguageCode = "en",
                        Title = cSeed.Title,
                        Description = cSeed.Description,
                        ShortDescription = cSeed.ShortDescription,
                        WhatYouLearn = cSeed.WhatYouLearn,
                        Requirements = cSeed.Requirements
                    }
                }
            };

            int secOrder = 1;
            foreach (var sSeed in cSeed.Sections)
            {
                var sec = new CourseSection
                {
                    Id = Guid.NewGuid(),
                    CourseId = course.Id,
                    Title = sSeed.Title,
                    Description = sSeed.Title,
                    Order = secOrder++,
                    Lectures = new List<CourseLecture>()
                };

                int lectOrder = 1;
                foreach (var lSeed in sSeed.Lectures)
                {
                    sec.Lectures.Add(new CourseLecture
                    {
                        Id = Guid.NewGuid(),
                        SectionId = sec.Id,
                        Title = lSeed.Title,
                        Description = lSeed.Title,
                        DurationMinutes = lSeed.Duration,
                        Order = lectOrder++,
                        IsFree = lSeed.IsFree,
                        VideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                        LectureType = "Video"
                    });
                }

                course.Sections.Add(sec);
            }

            await context.Courses.AddAsync(course);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedPortalDataAsync(EdusazDbContext context, Guid azId, Guid enId)
    {
        var firstUni = await context.Universities.FirstOrDefaultAsync();
        var uniId = firstUni?.Id ?? Guid.NewGuid();

        if (!context.StudentApplications.Any())
        {
            var applications = new List<StudentApplication>
            {
                new StudentApplication { Id = Guid.NewGuid(), UniversityId = uniId, StudentName = "Chioma Okonkwo", OriginCountry = "Nigeria", CountryFlag = "🇳🇬", ProgramName = "Computer Science & AI", Email = "chioma.ok@gmail.com", Phone = "+234 803 123 4567", MatchScore = 96, Status = "Applied", Initials = "C", Color = "#7A5CFF", AppliedAt = DateTime.UtcNow.AddHours(-2) },
                new StudentApplication { Id = Guid.NewGuid(), UniversityId = uniId, StudentName = "Muhammad Ali", OriginCountry = "Pakistan", CountryFlag = "🇵🇰", ProgramName = "Business Administration", Email = "m.ali.dev@yahoo.com", Phone = "+92 300 987 6543", MatchScore = 88, Status = "Accepted", Initials = "M", Color = "#10b981", AppliedAt = DateTime.UtcNow.AddHours(-5) },
                new StudentApplication { Id = Guid.NewGuid(), UniversityId = uniId, StudentName = "Priya Sharma", OriginCountry = "India", CountryFlag = "🇮🇳", ProgramName = "Architecture & Design", Email = "priya.sharma@outlook.com", Phone = "+91 98765 43210", MatchScore = 82, Status = "Applied", Initials = "P", Color = "#6366f1", AppliedAt = DateTime.UtcNow.AddHours(-8) },
                new StudentApplication { Id = Guid.NewGuid(), UniversityId = uniId, StudentName = "Elvin Məmmədov", OriginCountry = "Azərbaycan", CountryFlag = "🇦🇿", ProgramName = "Software Engineering", Email = "elvin.mammadov@code.edu.az", Phone = "+994 50 123 45 67", MatchScore = 99, Status = "Accepted", Initials = "E", Color = "#059669", AppliedAt = DateTime.UtcNow.AddDays(-1) },
                new StudentApplication { Id = Guid.NewGuid(), UniversityId = uniId, StudentName = "Sarah Jenkins", OriginCountry = "United Kingdom", CountryFlag = "🇬🇧", ProgramName = "International Law", Email = "s.jenkins@oxford.ac.uk", Phone = "+44 7700 900077", MatchScore = 91, Status = "Under Review", Initials = "S", Color = "#f59e0b", AppliedAt = DateTime.UtcNow.AddDays(-2) }
            };
            await context.StudentApplications.AddRangeAsync(applications);
            await context.SaveChangesAsync();
        }

        if (!context.Campaigns.Any())
        {
            var campaigns = new List<Campaign>
            {
                new Campaign { Id = Guid.NewGuid(), UniversityId = uniId, Title = "Qərbi Afrika və Nigeriya Tələbə Cəlb Etmə Kampaniyası", TargetRegion = "Qərbi Afrika", TargetCountry = "Nigeriya, Qana", Budget = "$2,500/ay", Reach = "45,000+ tələbə", DailyApplications = "18-25/gün", Status = "Active", CampaignType = "Global Recruitment", Translations = new List<CampaignTranslation> { new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = azId, Title = "Qərbi Afrika və Nigeriya Tələbə Cəlb Etmə Kampaniyası", Description = "Nigeriya və Qana tələbələri üçün IT və Tibb sahələrinə cəlb etmə kampaniyası" }, new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = enId, Title = "West Africa & Nigeria Student Recruitment Drive", Description = "Targeted recruitment drive for IT and Medical programs for Nigerian students" } } },
                new Campaign { Id = Guid.NewGuid(), UniversityId = uniId, Title = "Mərkəzi Asiya İqtisadiyyat & Mühəndislik Xüsusi Kampaniyası", TargetRegion = "Mərkəzi Asiya", TargetCountry = "Qazaxıstan, Özbəkistan", Budget = "$1,800/ay", Reach = "28,000+ tələbə", DailyApplications = "12-16/gün", Status = "Active", CampaignType = "STEM Focus", Translations = new List<CampaignTranslation> { new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = azId, Title = "Mərkəzi Asiya İqtisadiyyat & Mühəndislik Xüsusi Kampaniyası", Description = "Qazaxıstan və Özbəkistan abituriyentləri üçün bakalavr və magistr təşviqi" }, new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = enId, Title = "Central Asia STEM & Economics Special Campaign", Description = "Bachelor and Master promotion for applicants in Kazakhstan and Uzbekistan" } } },
                new Campaign { Id = Guid.NewGuid(), UniversityId = uniId, Title = "100% Dövlət & Rektorluq Təqaüdü Təşviq Kampaniyası", TargetRegion = "Qlobal", TargetCountry = "Bütün Ölkələr", Budget = "$3,200/ay", Reach = "85,000+ tələbə", DailyApplications = "35-40/gün", Status = "Active", CampaignType = "Scholarship Drive", Translations = new List<CampaignTranslation> { new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = azId, Title = "100% Dövlət & Rektorluq Təqaüdü Təşviq Kampaniyası", Description = "Beynəlxalq tələbələr üçün tam təqaüd imkanlarının qlobal miqyasda təbliği" }, new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = enId, Title = "100% Scholarship Global Awareness Drive", Description = "Global awareness drive highlighting full tuition scholarships for international applicants" } } }
            };
            await context.Campaigns.AddRangeAsync(campaigns);
            await context.SaveChangesAsync();
        }

        if (!context.TeamMembers.Any())
        {
            var teamMembers = new List<TeamMember>
            {
                new TeamMember { Id = Guid.NewGuid(), UniversityId = uniId, FullName = "Dr. Anar Aliyev", Email = "a.aliyev@bdu.edu.az", Role = "Chief Admissions Officer", Status = "Active", CanViewPrograms = true, CanCreatePrograms = true, CanEditPrograms = true, CanDeletePrograms = true, CanViewScholarships = true, CanCreateScholarships = true, CanEditScholarships = true, CanDeleteScholarships = true, CanViewCampaigns = true, CanCreateCampaigns = true, CanEditCampaigns = true, CanDeleteCampaigns = true, CanEditProfile = true },
                new TeamMember { Id = Guid.NewGuid(), UniversityId = uniId, FullName = "Leyla Huseynova", Email = "l.huseynova@bdu.edu.az", Role = "International Relations", Status = "Active", CanViewPrograms = true, CanCreatePrograms = true, CanEditPrograms = true, CanDeletePrograms = false, CanViewScholarships = true, CanCreateScholarships = true, CanEditScholarships = false, CanDeleteScholarships = false, CanViewCampaigns = true, CanCreateCampaigns = false, CanEditCampaigns = false, CanDeleteCampaigns = false, CanEditProfile = false },
                new TeamMember { Id = Guid.NewGuid(), UniversityId = uniId, FullName = "Farid Ahmadov", Email = "f.ahmadov@bdu.edu.az", Role = "Marketing Manager", Status = "Active", CanViewPrograms = true, CanCreatePrograms = false, CanEditPrograms = false, CanDeletePrograms = false, CanViewScholarships = true, CanCreateScholarships = false, CanEditScholarships = false, CanDeleteScholarships = false, CanViewCampaigns = true, CanCreateCampaigns = true, CanEditCampaigns = true, CanDeleteCampaigns = true, CanEditProfile = true }
            };
            await context.TeamMembers.AddRangeAsync(teamMembers);
            await context.SaveChangesAsync();
        }
    }

    // Helper classes for Course Seeding
    private class CourseSeedModel
    {
        public string InstructorEmail { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string SubCategory { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
        public string Language { get; set; } = "en";
        public string Level { get; set; } = "All";
        public decimal Price { get; set; }
        public decimal DiscountPrice { get; set; }
        public bool IsFree { get; set; }
        public string ThumbnailUrl { get; set; } = string.Empty;
        public bool IsPublished { get; set; } = true;
        public bool IsApproved { get; set; } = true;
        public bool IsFeatured { get; set; }
        public int TotalStudents { get; set; }
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public string ShortDescription { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string WhatYouLearn { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
        public string TitleAz { get; set; } = string.Empty;
        public string DescAz { get; set; } = string.Empty;
        public List<SectionSeedModel> Sections { get; set; } = new();
    }

    private class SectionSeedModel
    {
        public string Title { get; set; } = string.Empty;
        public List<LectureSeedModel> Lectures { get; set; } = new();
    }

    private class LectureSeedModel
    {
        public string Title { get; set; } = string.Empty;
        public int Duration { get; set; }
        public bool IsFree { get; set; }
    }
}
