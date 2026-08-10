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

        await context.Database.MigrateAsync();

        // Seed SuperAdmin User & Role
        var userManager = serviceProvider.GetService<UserManager<User>>();
        var roleManager = serviceProvider.GetService<RoleManager<Role>>();

        if (userManager != null && roleManager != null)
        {
            const string superAdminRole = "SuperAdmin";
            if (!await roleManager.RoleExistsAsync(superAdminRole))
            {
                await roleManager.CreateAsync(new Role { Name = superAdminRole });
            }

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

        if (!context.Languages.Any())
        {
            var en = new Language { Id = Guid.NewGuid(), Name = "English", Code = "en", IsActive = true };
            var az = new Language { Id = Guid.NewGuid(), Name = "Azerbaijani", Code = "az", IsActive = true };
            var tr = new Language { Id = Guid.NewGuid(), Name = "Turkish", Code = "tr", IsActive = true };
            
            await context.Languages.AddRangeAsync(en, az, tr);
            await context.SaveChangesAsync();
        }

        var enId = context.Languages.First(x => x.Code == "en").Id;
        var azId = context.Languages.First(x => x.Code == "az").Id;
        var trId = context.Languages.First(x => x.Code == "tr").Id;

        // Seed Countries
        if (!context.Countries.Any())
        {
            var countries = new List<Country>
            {
                new Country
                {
                    Id = Guid.NewGuid(),
                    Code = "az",
                    DefaultName = "Azerbaijan",
                    DefaultLabel = "Affordable & Growing",
                    FlagEmoji = "🇦🇿",
                    UniversityCount = 48,
                    AverageCost = "$1,500-$8,000/yr",
                    ImageUrl = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
                    Translations = new List<CountryTranslation>
                    {
                        new CountryTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Azərbaycan", Label = "Əlverişli və İnkişaf Edən" },
                        new CountryTranslation { Id = Guid.NewGuid(), LanguageId = trId, Name = "Azerbaycan", Label = "Uygun ve Gelişen" }
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
                }
            };

            await context.Countries.AddRangeAsync(countries);
            await context.SaveChangesAsync();
        }

        if (!context.Countries.Any(c => c.Code == "usa"))
        {
            var usa = new Country
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
            };
            await context.Countries.AddAsync(usa);
            await context.SaveChangesAsync();
        }

        // Seed Additional Universities if missing
        if (!context.Universities.Any(u => u.WebsiteUrl == "https://www.uniroma1.it"))
        {
            var extraUnis = new List<University>
            {
                new University
                {
                    Id = Guid.NewGuid(),
                    Country = "United Kingdom",
                    LogoUrl = "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    WebsiteUrl = "https://www.ox.ac.uk",
                    EstablishedYear = 1096,
                    Tuition = "£32,000/yr",
                    AcceptanceRate = "17%",
                    TeachingLanguage = "English",
                    Deadline = "Oct 15, 2025",
                    Ranking = "#2 Global",
                    HasScholarship = true,
                    Translations = new List<UniversityTranslation>
                    {
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Oxford", City = "Oxford", Description = "Oldest university in the English-speaking world." },
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Oksford Universiteti", City = "Oksford", Description = "İngilisdilli dünyanın ən qədim və prestijli universiteti." }
                    }
                },
                new University
                {
                    Id = Guid.NewGuid(),
                    Country = "Germany",
                    LogoUrl = "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    WebsiteUrl = "https://www.tum.de",
                    EstablishedYear = 1868,
                    Tuition = "€3,000/yr",
                    AcceptanceRate = "25%",
                    TeachingLanguage = "English / German",
                    Deadline = "Jul 15, 2025",
                    Ranking = "#1 Germany",
                    HasScholarship = true,
                    Translations = new List<UniversityTranslation>
                    {
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Technical University of Munich (TUM)", City = "Munich", Description = "Germany's top research university for innovation." },
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Münhen Texniki Universiteti (TUM)", City = "Münhen", Description = "Almaniyanın ən yaxşı mühəndislik və tədqiqat universiteti." }
                    }
                },
                new University
                {
                    Id = Guid.NewGuid(),
                    Country = "Canada",
                    LogoUrl = "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    WebsiteUrl = "https://www.utoronto.ca",
                    EstablishedYear = 1827,
                    Tuition = "$28,000/yr",
                    AcceptanceRate = "43%",
                    TeachingLanguage = "English",
                    Deadline = "Jan 15, 2025",
                    Ranking = "#1 Canada",
                    HasScholarship = true,
                    Translations = new List<UniversityTranslation>
                    {
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Toronto", City = "Toronto", Description = "Canada's leading university known for research excellence." },
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Toronto Universiteti", City = "Toronto", Description = "Kanadanın kompüter elmləri və tibb üzrə 1 nömrəli universiteti." }
                    }
                },
                new University
                {
                    Id = Guid.NewGuid(),
                    Country = "Hungary",
                    LogoUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    WebsiteUrl = "https://www.unideb.hu",
                    EstablishedYear = 1538,
                    Tuition = "$5,500/yr",
                    AcceptanceRate = "60%",
                    TeachingLanguage = "English",
                    Deadline = "Jan 15, 2025",
                    Ranking = "#1 Hungary",
                    HasScholarship = true,
                    Translations = new List<UniversityTranslation>
                    {
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Debrecen", City = "Debrecen", Description = "Hungary's oldest continuously operating higher education institution." },
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Debretsen Universiteti", City = "Debretsen", Description = "Macarıstanın Stipendium təqaüdü təklif edən ən populyar universiteti." }
                    }
                },
                new University
                {
                    Id = Guid.NewGuid(),
                    Country = "Italy",
                    LogoUrl = "https://images.unsplash.com/photo-1529260830199-42c24126f198?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    WebsiteUrl = "https://www.uniroma1.it",
                    EstablishedYear = 1303,
                    Tuition = "€2,500/yr",
                    AcceptanceRate = "35%",
                    TeachingLanguage = "Italian / English",
                    Deadline = "Apr 30, 2025",
                    Ranking = "#1 Italy",
                    HasScholarship = true,
                    Translations = new List<UniversityTranslation>
                    {
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "Sapienza University of Rome", City = "Rome", Description = "One of Europe's largest public research universities." },
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Roma Sapienza Universiteti", City = "Roma", Description = "İtaliyanın və Avropanın ən böyük rəsmi tədqiqat universiteti." }
                    }
                },
                new University
                {
                    Id = Guid.NewGuid(),
                    Country = "UAE",
                    LogoUrl = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    WebsiteUrl = "https://www.uaeu.ac.ae",
                    EstablishedYear = 1976,
                    Tuition = "$14,000/yr",
                    AcceptanceRate = "40%",
                    TeachingLanguage = "English",
                    Deadline = "May 31, 2025",
                    Ranking = "#1 UAE",
                    HasScholarship = true,
                    Translations = new List<UniversityTranslation>
                    {
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "United Arab Emirates University (UAEU)", City = "Al Ain", Description = "First and top comprehensive national university in UAE." },
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "BƏƏ Dövlət Universiteti (UAEU)", City = "Əl Ayn", Description = "BƏƏ-nin ən qabaqcıl dövlət və biznes universiteti." }
                    }
                },
                new University
                {
                    Id = Guid.NewGuid(),
                    Country = "Poland",
                    LogoUrl = "https://images.unsplash.com/photo-1519197924294-4ac978a3e048?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    WebsiteUrl = "https://www.uw.edu.pl",
                    EstablishedYear = 1816,
                    Tuition = "€3,500/yr",
                    AcceptanceRate = "30%",
                    TeachingLanguage = "English / Polish",
                    Deadline = "Jun 30, 2025",
                    Ranking = "#1 Poland",
                    HasScholarship = true,
                    Translations = new List<UniversityTranslation>
                    {
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Warsaw", City = "Warsaw", Description = "Largest research university in Poland." },
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Varşava Universiteti", City = "Varşava", Description = "Polşanın ən böyük Aİ tərəfindən tanınan ali təhsil müəssisəsi." }
                    }
                },
                new University
                {
                    Id = Guid.NewGuid(),
                    Country = "Malaysia",
                    LogoUrl = "https://images.unsplash.com/photo-1596422846543-74c6eb24f628?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    WebsiteUrl = "https://www.um.edu.my",
                    EstablishedYear = 1905,
                    Tuition = "$4,000/yr",
                    AcceptanceRate = "25%",
                    TeachingLanguage = "English",
                    Deadline = "Aug 15, 2025",
                    Ranking = "#65 Global",
                    HasScholarship = true,
                    Translations = new List<UniversityTranslation>
                    {
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "University of Malaya (UM)", City = "Kuala Lumpur", Description = "Malaysia's premier and highest-ranking research university." },
                        new UniversityTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "Malayziya Universiteti (UM)", City = "Kuala Lumpur", Description = "Malayziyanın ən nüfuzlu ingilisdilli tədqiqat universiteti." }
                    }
                }
            };

            await context.Universities.AddRangeAsync(extraUnis);
            await context.SaveChangesAsync();
        }

        // Link all Universities to CountryId
        var trackedCountries = await context.Countries.ToListAsync();
        var allUnis = await context.Universities.ToListAsync();
        foreach (var u in allUnis)
        {
            var countryStr = u.Country?.Trim() ?? "";
            var match = trackedCountries.FirstOrDefault(c => 
                string.Equals(c.Code, countryStr, StringComparison.OrdinalIgnoreCase) || 
                string.Equals(c.DefaultName, countryStr, StringComparison.OrdinalIgnoreCase) ||
                (c.Code.ToLower() == "usa" && (countryStr.ToUpper() == "USA" || countryStr.Contains("United States"))) ||
                (c.Code.ToLower() == "uk" && (countryStr.ToUpper() == "UK" || countryStr.Contains("United Kingdom"))) ||
                (c.Code.ToLower() == "de" && countryStr.Contains("Germany")) ||
                (c.Code.ToLower() == "it" && countryStr.Contains("Italy")) ||
                (c.Code.ToLower() == "hu" && countryStr.Contains("Hungary")) ||
                (c.Code.ToLower() == "ae" && countryStr.Contains("UAE")) ||
                (c.Code.ToLower() == "pl" && countryStr.Contains("Poland")) ||
                (c.Code.ToLower() == "my" && countryStr.Contains("Malaysia")) ||
                (c.Code.ToLower() == "az" && countryStr.Contains("Azerbaijan")) ||
                (c.Code.ToLower() == "tr" && countryStr.Contains("Turkey")) ||
                (c.Code.ToLower() == "ca" && countryStr.Contains("Canada"))
            );

            if (match != null)
            {
                u.CountryId = match.Id;
            }
        }
        await context.SaveChangesAsync();

        // Remove duplicate universities by WebsiteUrl
        var uniDuplicates = await context.Universities.Include(u => u.Translations).ToListAsync();
        var groupedDuplicates = uniDuplicates
            .GroupBy(u => u.WebsiteUrl?.Trim().ToLower())
            .Where(g => !string.IsNullOrEmpty(g.Key) && g.Count() > 1);

        foreach (var group in groupedDuplicates)
        {
            var toRemove = group.Skip(1).ToList();
            context.Universities.RemoveRange(toRemove);
        }
        await context.SaveChangesAsync();

        // Seed BDU Scholarships
        if (!context.Scholarships.Any())
        {
            var bduUni = await context.Universities.FirstOrDefaultAsync();
            var bduId = bduUni?.Id;
            var azCountry = await context.Countries.FirstOrDefaultAsync(c => c.Code == "az");

            var scholarships = new List<Scholarship>
            {
                new Scholarship
                {
                    Id = Guid.NewGuid(),
                    UniversityId = bduId,
                    CountryId = azCountry?.Id,
                    Name = "BDU Əlaçı Tələbə Xüsusi Təqaüdü",
                    Location = "Bakı, Azərbaycan",
                    Status = "Open",
                    Amount = "100% Təhsil Haqqı Güzəştı + $300/ay",
                    Deadline = "30 İyul 2025",
                    Eligible = "Yüksək GPA balı olan bütün tələbələr",
                    Places = "30 yer/il",
                    ButtonType = "check",
                    Translations = new List<ScholarshipTranslation>
                    {
                        new ScholarshipTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "BDU Əlaçı Tələbə Xüsusi Təqaüdü", Description = "BDU-da yüksək akademik göstəriciləri olan tələbələr üçün xüsusi stipensiya", Eligible = "Yüksək GPA balı olan tələbələr" },
                        new ScholarshipTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "BSU Merit Student Scholarship", Description = "Special merit scholarship for high achieving students at Baku State University", Eligible = "Students with high GPA" }
                    }
                },
                new Scholarship
                {
                    Id = Guid.NewGuid(),
                    UniversityId = bduId,
                    CountryId = azCountry?.Id,
                    Name = "BDU Beynəlxalq Tələbə Qrantı",
                    Location = "Bakı, Azərbaycan",
                    Status = "Open",
                    Amount = "$3,500/il",
                    Deadline = "15 Avqust 2025",
                    Eligible = "Xarici ölkələrdən müraciət edən tələbələr",
                    Places = "50 yer/il",
                    ButtonType = "check",
                    Translations = new List<ScholarshipTranslation>
                    {
                        new ScholarshipTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "BDU Beynəlxalq Tələbə Qrantı", Description = "Xarici ölkələrdən BDU-ya qəbul olan beynəlxalq tələbələr üçün təhsil qrantı", Eligible = "Xarici tələbələr" },
                        new ScholarshipTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "BSU International Student Grant", Description = "Financial support grant for international students studying at Baku State University", Eligible = "International applicants" }
                    }
                },
                new Scholarship
                {
                    Id = Guid.NewGuid(),
                    UniversityId = bduId,
                    CountryId = azCountry?.Id,
                    Name = "BDU Gənc Tədqiqatçı Təqaüdü",
                    Location = "Bakı, Azərbaycan",
                    Status = "Open",
                    Amount = "€500/ay",
                    Deadline = "01 Sentyabr 2025",
                    Eligible = "Magistr və Doktorantura tədqiqatçıları",
                    Places = "20 yer/il",
                    ButtonType = "check",
                    Translations = new List<ScholarshipTranslation>
                    {
                        new ScholarshipTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "BDU Gənc Tədqiqatçı Təqaüdü", Description = "Elmi-tədqiqat layihələri ilə məşğul olan magistr və doktorantlar üçün təqaüd", Eligible = "Magistrant və doktorantlar" },
                        new ScholarshipTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "BSU Young Researcher Fellowship", Description = "Research fellowship for Masters and PhD students at BSU", Eligible = "Masters and PhD researchers" }
                    }
                },
                new Scholarship
                {
                    Id = Guid.NewGuid(),
                    UniversityId = bduId,
                    CountryId = azCountry?.Id,
                    Name = "BDU Rektorluq Xüsusi Mükəmməllik Təqaüdü",
                    Location = "Bakı, Azərbaycan",
                    Status = "Open",
                    Amount = "Tam Təqaüd + Ödənişsiz Yataqxana",
                    Deadline = "31 Oktyabr 2025",
                    Eligible = "Olimpiada qalibləri və xüsusi istedadlı gənclər",
                    Places = "10 yer/il",
                    ButtonType = "check",
                    Translations = new List<ScholarshipTranslation>
                    {
                        new ScholarshipTranslation { Id = Guid.NewGuid(), LanguageId = azId, Name = "BDU Rektorluq Xüsusi Mükəmməllik Təqaüdü", Description = "BDU Rektorluğu tərəfindən istedadlı gənclərə təqdim olunan tam təhsil və yataqxana təqaüdü", Eligible = "Olimpiada qalibləri" },
                        new ScholarshipTranslation { Id = Guid.NewGuid(), LanguageId = enId, Name = "BSU Rector Excellence Scholarship", Description = "Full coverage tuition and housing scholarship awarded by the BSU Rectorate", Eligible = "Olympiad winners" }
                    }
                }
            };

            await context.Scholarships.AddRangeAsync(scholarships);
            await context.SaveChangesAsync();
        }

        // Seed StudentApplications
        if (!context.StudentApplications.Any())
        {
            var uni = await context.Universities.FirstOrDefaultAsync();
            var uniId = uni?.Id ?? Guid.NewGuid();

            var applications = new List<StudentApplication>
            {
                new StudentApplication
                {
                    Id = Guid.NewGuid(),
                    UniversityId = uniId,
                    StudentName = "Chioma Okonkwo",
                    OriginCountry = "Nigeria",
                    CountryFlag = "🇳🇬",
                    ProgramName = "Computer Science & AI",
                    Email = "chioma.ok@gmail.com",
                    Phone = "+234 803 123 4567",
                    MatchScore = 96,
                    Status = "Applied",
                    Initials = "C",
                    Color = "#7A5CFF",
                    AppliedAt = DateTime.UtcNow.AddHours(-2)
                },
                new StudentApplication
                {
                    Id = Guid.NewGuid(),
                    UniversityId = uniId,
                    StudentName = "Muhammad Ali",
                    OriginCountry = "Pakistan",
                    CountryFlag = "🇵🇰",
                    ProgramName = "Business Administration",
                    Email = "m.ali.dev@yahoo.com",
                    Phone = "+92 300 987 6543",
                    MatchScore = 88,
                    Status = "Accepted",
                    Initials = "M",
                    Color = "#10b981",
                    AppliedAt = DateTime.UtcNow.AddHours(-5)
                },
                new StudentApplication
                {
                    Id = Guid.NewGuid(),
                    UniversityId = uniId,
                    StudentName = "Priya Sharma",
                    OriginCountry = "India",
                    CountryFlag = "🇮🇳",
                    ProgramName = "Architecture & Design",
                    Email = "priya.sharma@outlook.com",
                    Phone = "+91 98765 43210",
                    MatchScore = 82,
                    Status = "Applied",
                    Initials = "P",
                    Color = "#6366f1",
                    AppliedAt = DateTime.UtcNow.AddHours(-8)
                },
                new StudentApplication
                {
                    Id = Guid.NewGuid(),
                    UniversityId = uniId,
                    StudentName = "Elvin Məmmədov",
                    OriginCountry = "Azərbaycan",
                    CountryFlag = "🇦🇿",
                    ProgramName = "Software Engineering",
                    Email = "elvin.mammadov@code.edu.az",
                    Phone = "+994 50 123 45 67",
                    MatchScore = 99,
                    Status = "Accepted",
                    Initials = "E",
                    Color = "#059669",
                    AppliedAt = DateTime.UtcNow.AddDays(-1)
                },
                new StudentApplication
                {
                    Id = Guid.NewGuid(),
                    UniversityId = uniId,
                    StudentName = "Sarah Jenkins",
                    OriginCountry = "United Kingdom",
                    CountryFlag = "🇬🇧",
                    ProgramName = "International Law",
                    Email = "s.jenkins@oxford.ac.uk",
                    Phone = "+44 7700 900077",
                    MatchScore = 91,
                    Status = "Under Review",
                    Initials = "S",
                    Color = "#f59e0b",
                    AppliedAt = DateTime.UtcNow.AddDays(-2)
                }
            };

            await context.StudentApplications.AddRangeAsync(applications);
            await context.SaveChangesAsync();
        }

        // Seed Campaigns
        if (!context.Campaigns.Any())
        {
            var bduUni = await context.Universities.FirstOrDefaultAsync();
            var bduId = bduUni?.Id;

            var campaigns = new List<Campaign>
            {
                new Campaign
                {
                    Id = Guid.NewGuid(),
                    UniversityId = bduId,
                    Title = "Qərbi Afrika və Nigeriya Tələbə Cəlb Etmə Kampaniyası",
                    TargetRegion = "Qərbi Afrika",
                    TargetCountry = "Nigeriya, Qana",
                    Budget = "$2,500/ay",
                    Reach = "45,000+ tələbə",
                    DailyApplications = "18-25/gün",
                    Status = "Active",
                    CampaignType = "Global Recruitment",
                    Translations = new List<CampaignTranslation>
                    {
                        new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = azId, Title = "Qərbi Afrika və Nigeriya Tələbə Cəlb Etmə Kampaniyası", Description = "Nigeriya və Qana tələbələri üçün BDU-da IT və Tibb sahələrinə cəlb etmə kampaniyası" },
                        new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = enId, Title = "West Africa & Nigeria Student Recruitment Drive", Description = "Targeted recruitment drive for IT and Medical programs at BSU for Nigerian students" }
                    }
                },
                new Campaign
                {
                    Id = Guid.NewGuid(),
                    UniversityId = bduId,
                    Title = "Mərkəzi Asiya İqtisadiyyat & Müəndislik Xüsusi Kampaniyası",
                    TargetRegion = "Mərkəzi Asiya",
                    TargetCountry = "Qazaxıstan, Özbəkistan",
                    Budget = "$1,800/ay",
                    Reach = "28,000+ tələbə",
                    DailyApplications = "12-16/gün",
                    Status = "Active",
                    CampaignType = "STEM Focus",
                    Translations = new List<CampaignTranslation>
                    {
                        new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = azId, Title = "Mərkəzi Asiya İqtisadiyyat & Müəndislik Xüsusi Kampaniyası", Description = "Qazaxıstan və Özbəkistan abituriyentləri üçün bakalavr və magistr təşviqi" },
                        new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = enId, Title = "Central Asia STEM & Economics Special Campaign", Description = "Bachelor and Master promotion for applicants in Kazakhstan and Uzbekistan" }
                    }
                },
                new Campaign
                {
                    Id = Guid.NewGuid(),
                    UniversityId = bduId,
                    Title = "BDU 100% Dövlət & Rektorluq Təqaüdü Təşviq Kampaniyası",
                    TargetRegion = "Qlobal",
                    TargetCountry = "Bütün Ölkələr",
                    Budget = "$3,200/ay",
                    Reach = "85,000+ tələbə",
                    DailyApplications = "35-40/gün",
                    Status = "Active",
                    CampaignType = "Scholarship Drive",
                    Translations = new List<CampaignTranslation>
                    {
                        new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = azId, Title = "BDU 100% Dövlət & Rektorluq Təqaüdü Təşviq Kampaniyası", Description = "Beynəlxalq tələbələr üçün tam təqaüd imkanlarının qlobal miqyasda təbliği" },
                        new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = enId, Title = "BSU 100% Scholarship Global Awareness Drive", Description = "Global awareness drive highlighting full tuition scholarships for international applicants" }
                    }
                }
            };

            await context.Campaigns.AddRangeAsync(campaigns);
            await context.SaveChangesAsync();
        }

        if (!context.TeamMembers.Any())
        {
            var bduUni = await context.Universities.FirstOrDefaultAsync();
            var bduId = bduUni?.Id;

            var teamMembers = new List<TeamMember>
            {
                new TeamMember
                {
                    Id = Guid.NewGuid(),
                    UniversityId = bduId,
                    FullName = "Dr. Anar Aliyev",
                    Email = "a.aliyev@bdu.edu.az",
                    Role = "Chief Admissions Officer",
                    Status = "Active",
                    CanViewPrograms = true, CanCreatePrograms = true, CanEditPrograms = true, CanDeletePrograms = true,
                    CanViewScholarships = true, CanCreateScholarships = true, CanEditScholarships = true, CanDeleteScholarships = true,
                    CanViewCampaigns = true, CanCreateCampaigns = true, CanEditCampaigns = true, CanDeleteCampaigns = true,
                    CanEditProfile = true
                },
                new TeamMember
                {
                    Id = Guid.NewGuid(),
                    UniversityId = bduId,
                    FullName = "Leyla Huseynova",
                    Email = "l.huseynova@bdu.edu.az",
                    Role = "International Relations",
                    Status = "Active",
                    CanViewPrograms = true, CanCreatePrograms = true, CanEditPrograms = true, CanDeletePrograms = false,
                    CanViewScholarships = true, CanCreateScholarships = true, CanEditScholarships = false, CanDeleteScholarships = false,
                    CanViewCampaigns = true, CanCreateCampaigns = false, CanEditCampaigns = false, CanDeleteCampaigns = false,
                    CanEditProfile = false
                },
                new TeamMember
                {
                    Id = Guid.NewGuid(),
                    UniversityId = bduId,
                    FullName = "Farid Ahmadov",
                    Email = "f.ahmadov@bdu.edu.az",
                    Role = "Marketing Manager",
                    Status = "Active",
                    CanViewPrograms = true, CanCreatePrograms = false, CanEditPrograms = false, CanDeletePrograms = false,
                    CanViewScholarships = true, CanCreateScholarships = false, CanEditScholarships = false, CanDeleteScholarships = false,
                    CanViewCampaigns = true, CanCreateCampaigns = true, CanEditCampaigns = true, CanDeleteCampaigns = true,
                    CanEditProfile = true
                }
            };

            await context.TeamMembers.AddRangeAsync(teamMembers);
            await context.SaveChangesAsync();
        }
    }
}
