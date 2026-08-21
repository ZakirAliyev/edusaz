using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.AI;
using Edusaz.Application.Abstracts.Repositories.Countries;
using Edusaz.Application.Abstracts.Repositories.Languages;
using Edusaz.Application.Abstracts.Repositories.Universities;
using Edusaz.Application.Abstracts.Repositories.UniversityMedias;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.Application.Concretes.Services;

public class UniversityService : IUniversityService
{
    private readonly IUniversityReadRepository _universityReadRepository;
    private readonly IUniversityWriteRepository _universityWriteRepository;
    private readonly IUniversityMediaReadRepository _universityMediaReadRepository;
    private readonly IUniversityMediaWriteRepository _universityMediaWriteRepository;
    private readonly ILanguageReadRepository _languageReadRepository;
    private readonly ICountryReadRepository _countryReadRepository;
    private readonly ITranslationAIService _translationAiService;

    public UniversityService(
        IUniversityReadRepository universityReadRepository, 
        IUniversityWriteRepository universityWriteRepository,
        IUniversityMediaReadRepository universityMediaReadRepository,
        IUniversityMediaWriteRepository universityMediaWriteRepository,
        ILanguageReadRepository languageReadRepository,
        ICountryReadRepository countryReadRepository,
        ITranslationAIService translationAiService)
    {
        _universityReadRepository = universityReadRepository;
        _universityWriteRepository = universityWriteRepository;
        _universityMediaReadRepository = universityMediaReadRepository;
        _universityMediaWriteRepository = universityMediaWriteRepository;
        _languageReadRepository = languageReadRepository;
        _countryReadRepository = countryReadRepository;
        _translationAiService = translationAiService;
    }

    public async Task<List<UniversityDto>> GetAllUniversitiesAsync(string langCode = "en", Guid? countryId = null)
    {
        var universities = await _universityReadRepository.GetAllAsync(
            predicate: u => !u.IsDeleted && (!countryId.HasValue || u.CountryId == countryId.Value),
            include: q => q.Include(u => u.Translations).ThenInclude(t => t.Language).Include(u => u.CountryRef)
        );

        var countries = await _countryReadRepository.GetAllAsync(c => !c.IsDeleted);
        var mediaList = await _universityMediaReadRepository.GetAllAsync(m => !m.IsDeleted);

        return universities.Select(u => {
            var country = u.CountryRef 
                          ?? (u.CountryId.HasValue ? countries.FirstOrDefault(c => c.Id == u.CountryId.Value) : null)
                          ?? countries.FirstOrDefault(c => !string.IsNullOrEmpty(c.Code) && string.Equals(c.Code, u.Country?.Trim(), StringComparison.OrdinalIgnoreCase))
                          ?? countries.FirstOrDefault(c => !string.IsNullOrEmpty(c.DefaultName) && string.Equals(c.DefaultName, u.Country?.Trim(), StringComparison.OrdinalIgnoreCase))
                          ?? countries.FirstOrDefault(c => (!string.IsNullOrEmpty(c.Code) && c.Code.ToLower().Contains("us")) || (!string.IsNullOrEmpty(c.DefaultName) && c.DefaultName.ToLower().Contains("usa")));

            var translation = u.Translations != null 
                              ? (u.Translations.FirstOrDefault(t => t.Language != null && t.Language.Code == langCode) ?? u.Translations.FirstOrDefault())
                              : null;

            var uMedia = mediaList.Where(m => m.UniversityId == u.Id).OrderBy(m => m.OrderIndex).ToList();
            var images = uMedia.Where(m => m.MediaType == "Image").Select(m => m.Url).ToList();
            var videos = uMedia.Where(m => m.MediaType == "Video").Select(m => m.Url).ToList();

            return new UniversityDto
            {
                Id = u.Id,
                Country = country?.DefaultName ?? u.Country ?? "Azərbaycan",
                CountryId = country?.Id ?? u.CountryId,
                CountryCode = country?.Code ?? (string.Equals(u.Country, "USA", StringComparison.OrdinalIgnoreCase) ? "usa" : "az"),
                LogoUrl = u.LogoUrl ?? "",
                WebsiteUrl = u.WebsiteUrl ?? "",
                EstablishedYear = u.EstablishedYear,
                Name = translation?.Name ?? "University",
                Description = translation?.Description ?? "",
                City = translation?.City ?? "",
                Tuition = u.Tuition ?? "",
                AcceptanceRate = u.AcceptanceRate ?? "",
                TeachingLanguage = u.TeachingLanguage ?? "",
                Deadline = u.Deadline ?? "",
                Ranking = u.Ranking ?? "",
                HasScholarship = u.HasScholarship,
                Images = images,
                VideoUrls = videos
            };
        }).ToList();
    }

    public async Task<UniversityDto?> GetUniversityByIdAsync(Guid id, string langCode = "en")
    {
        var u = await _universityReadRepository.GetAsync(
            predicate: x => x.Id == id && !x.IsDeleted,
            include: q => q.Include(x => x.Translations).ThenInclude(t => t.Language).Include(x => x.CountryRef)
        );

        if (u == null) return null;

        var countries = await _countryReadRepository.GetAllAsync(c => !c.IsDeleted);
        var country = u.CountryRef ?? countries.FirstOrDefault(c => 
            (!string.IsNullOrEmpty(c.Code) && string.Equals(c.Code, u.Country?.Trim(), StringComparison.OrdinalIgnoreCase)) ||
            (!string.IsNullOrEmpty(c.DefaultName) && string.Equals(c.DefaultName, u.Country?.Trim(), StringComparison.OrdinalIgnoreCase)) ||
            (!string.IsNullOrEmpty(c.Code) && c.Code.ToLower() == "usa" && string.Equals(u.Country?.Trim(), "USA", StringComparison.OrdinalIgnoreCase)));

        var translation = u.Translations != null
                          ? (u.Translations.FirstOrDefault(t => t.Language != null && t.Language.Code == langCode) ?? u.Translations.FirstOrDefault())
                          : null;

        var media = await _universityMediaReadRepository.GetAllAsync(m => m.UniversityId == id && !m.IsDeleted);
        var images = media.Where(m => m.MediaType == "Image").OrderBy(m => m.OrderIndex).Select(m => m.Url).ToList();
        var videos = media.Where(m => m.MediaType == "Video").OrderBy(m => m.OrderIndex).Select(m => m.Url).ToList();

        return new UniversityDto
        {
            Id = u.Id,
            Country = country?.DefaultName ?? u.Country,
            CountryId = country?.Id ?? u.CountryId,
            CountryCode = country?.Code ?? string.Empty,
            LogoUrl = u.LogoUrl,
            WebsiteUrl = u.WebsiteUrl,
            EstablishedYear = u.EstablishedYear,
            Name = translation?.Name ?? "University",
            Description = translation?.Description ?? "",
            City = translation?.City ?? "",
            Tuition = u.Tuition,
            AcceptanceRate = u.AcceptanceRate,
            TeachingLanguage = u.TeachingLanguage,
            Deadline = u.Deadline,
            Ranking = u.Ranking,
            HasScholarship = u.HasScholarship,
            Images = images,
            VideoUrls = videos
        };
    }

    public async Task<UniversityDto> CreateUniversityAsync(CreateUniversityDto dto)
    {
        var university = new University
        {
            Country = dto.Country,
            CountryId = dto.CountryId,
            LogoUrl = dto.LogoUrl,
            WebsiteUrl = dto.WebsiteUrl,
            EstablishedYear = dto.EstablishedYear,
            Tuition = dto.Tuition,
            AcceptanceRate = dto.AcceptanceRate,
            TeachingLanguage = dto.TeachingLanguage,
            Deadline = dto.Deadline,
            Ranking = dto.Ranking,
            HasScholarship = dto.HasScholarship,
            Translations = new List<UniversityTranslation>()
        };

        var languages = await _languageReadRepository.GetAllAsync(x => x.IsActive && !x.IsDeleted);
        var baseLanguage = languages.FirstOrDefault(x => x.Code == dto.BaseLanguageCode);

        if (baseLanguage == null)
            throw new Exception("Base language not found or inactive.");

        university.Translations.Add(new UniversityTranslation
        {
            LanguageId = baseLanguage.Id,
            Name = dto.Name,
            Description = dto.Description,
            City = dto.City
        });

        foreach (var lang in languages.Where(x => x.Id != baseLanguage.Id))
        {
            string translatedName = await _translationAiService.TranslateAsync(dto.Name, lang.Name);
            string translatedDescription = await _translationAiService.TranslateAsync(dto.Description, lang.Name);
            string translatedCity = await _translationAiService.TranslateAsync(dto.City, lang.Name);

            university.Translations.Add(new UniversityTranslation
            {
                LanguageId = lang.Id,
                Name = translatedName,
                Description = translatedDescription,
                City = translatedCity
            });
        }

        await _universityWriteRepository.AddAsync(university);
        await _universityWriteRepository.CommitAsync();

        if (dto.Images != null && dto.Images.Count > 0)
        {
            int order = 0;
            foreach (var img in dto.Images.Where(x => !string.IsNullOrWhiteSpace(x)))
            {
                await _universityMediaWriteRepository.AddAsync(new UniversityMedia
                {
                    UniversityId = university.Id,
                    MediaType = "Image",
                    Url = img.Trim(),
                    OrderIndex = order++
                });
            }
        }

        if (dto.VideoUrls != null && dto.VideoUrls.Count > 0)
        {
            int order = 0;
            foreach (var vid in dto.VideoUrls.Where(x => !string.IsNullOrWhiteSpace(x)))
            {
                await _universityMediaWriteRepository.AddAsync(new UniversityMedia
                {
                    UniversityId = university.Id,
                    MediaType = "Video",
                    Url = vid.Trim(),
                    OrderIndex = order++
                });
            }
        }

        if ((dto.Images != null && dto.Images.Count > 0) || (dto.VideoUrls != null && dto.VideoUrls.Count > 0))
        {
            await _universityMediaWriteRepository.CommitAsync();
        }

        return (await GetUniversityByIdAsync(university.Id, dto.BaseLanguageCode))!;
    }

    public async Task<UniversityDto> UpdateUniversityAsync(Guid id, CreateUniversityDto dto)
    {
        var u = await _universityReadRepository.GetAsync(
            predicate: x => x.Id == id && !x.IsDeleted,
            include: q => q.Include(x => x.Translations)
        );

        if (u == null) throw new Exception("University not found.");

        u.Country = dto.Country;
        if (dto.CountryId.HasValue) u.CountryId = dto.CountryId;
        if (!string.IsNullOrEmpty(dto.LogoUrl)) u.LogoUrl = dto.LogoUrl;
        if (!string.IsNullOrEmpty(dto.WebsiteUrl)) u.WebsiteUrl = dto.WebsiteUrl;
        if (dto.EstablishedYear > 0) u.EstablishedYear = dto.EstablishedYear;
        u.Tuition = dto.Tuition;
        u.AcceptanceRate = dto.AcceptanceRate;
        u.TeachingLanguage = dto.TeachingLanguage;
        u.Deadline = dto.Deadline;
        u.Ranking = dto.Ranking;
        u.HasScholarship = dto.HasScholarship;

        var baseTranslation = u.Translations.FirstOrDefault();
        if (baseTranslation != null)
        {
            baseTranslation.Name = dto.Name;
            baseTranslation.Description = dto.Description;
            baseTranslation.City = dto.City;
        }
        else
        {
            u.Translations.Add(new UniversityTranslation
            {
                Name = dto.Name,
                Description = dto.Description,
                City = dto.City
            });
        }

        await _universityWriteRepository.UpdateAsync(u);
        await _universityWriteRepository.CommitAsync();

        // Update Media
        var oldMedia = await _universityMediaReadRepository.GetAllAsync(m => m.UniversityId == id);
        foreach (var m in oldMedia)
        {
            await _universityMediaWriteRepository.HardDeleteAsync(m);
        }

        if (dto.Images != null && dto.Images.Count > 0)
        {
            int order = 0;
            foreach (var img in dto.Images.Where(x => !string.IsNullOrWhiteSpace(x)))
            {
                await _universityMediaWriteRepository.AddAsync(new UniversityMedia
                {
                    UniversityId = id,
                    MediaType = "Image",
                    Url = img.Trim(),
                    OrderIndex = order++
                });
            }
        }

        if (dto.VideoUrls != null && dto.VideoUrls.Count > 0)
        {
            int order = 0;
            foreach (var vid in dto.VideoUrls.Where(x => !string.IsNullOrWhiteSpace(x)))
            {
                await _universityMediaWriteRepository.AddAsync(new UniversityMedia
                {
                    UniversityId = id,
                    MediaType = "Video",
                    Url = vid.Trim(),
                    OrderIndex = order++
                });
            }
        }

        await _universityMediaWriteRepository.CommitAsync();

        return (await GetUniversityByIdAsync(u.Id, dto.BaseLanguageCode))!;
    }

    public async Task<bool> DeleteUniversityAsync(Guid id)
    {
        var u = await _universityReadRepository.GetByIdAsync(id.ToString());
        if (u == null || u.IsDeleted) return false;

        u.IsDeleted = true;
        await _universityWriteRepository.UpdateAsync(u);
        await _universityWriteRepository.CommitAsync();
        return true;
    }

    public async Task<bool> ApproveUniversityAsync(Guid id)
    {
        var u = await _universityReadRepository.GetByIdAsync(id.ToString());
        if (u == null || u.IsDeleted) return false;

        await _universityWriteRepository.UpdateAsync(u);
        await _universityWriteRepository.CommitAsync();
        return true;
    }
}
