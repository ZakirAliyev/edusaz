using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.AI;
using Edusaz.Application.Abstracts.Repositories.Countries;
using Edusaz.Application.Abstracts.Repositories.Languages;
using Edusaz.Application.Abstracts.Repositories.Universities;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.Application.Concretes.Services;

public class UniversityService : IUniversityService
{
    private readonly IUniversityReadRepository _universityReadRepository;
    private readonly IUniversityWriteRepository _universityWriteRepository;
    private readonly ILanguageReadRepository _languageReadRepository;
    private readonly ICountryReadRepository _countryReadRepository;
    private readonly ITranslationAIService _translationAiService;

    public UniversityService(
        IUniversityReadRepository universityReadRepository, 
        IUniversityWriteRepository universityWriteRepository,
        ILanguageReadRepository languageReadRepository,
        ICountryReadRepository countryReadRepository,
        ITranslationAIService translationAiService)
    {
        _universityReadRepository = universityReadRepository;
        _universityWriteRepository = universityWriteRepository;
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

        return universities.Select(u => {
            var country = u.CountryRef 
                          ?? (u.CountryId.HasValue ? countries.FirstOrDefault(c => c.Id == u.CountryId.Value) : null)
                          ?? countries.FirstOrDefault(c => string.Equals(c.Code, u.Country?.Trim(), StringComparison.OrdinalIgnoreCase))
                          ?? countries.FirstOrDefault(c => string.Equals(c.DefaultName, u.Country?.Trim(), StringComparison.OrdinalIgnoreCase))
                          ?? countries.FirstOrDefault(c => c.Code.ToLower().Contains("us") || c.DefaultName.ToLower().Contains("usa"));

            var translation = u.Translations.FirstOrDefault(t => t.Language != null && t.Language.Code == langCode) 
                              ?? u.Translations.FirstOrDefault();
            return new UniversityDto
            {
                Id = u.Id,
                Country = country?.DefaultName ?? u.Country,
                CountryId = country?.Id ?? u.CountryId ?? (u.Country == "USA" ? Guid.Parse("54da6f05-8990-4ad8-b17c-b188bb7dc7b7") : null),
                CountryCode = country?.Code ?? (u.Country == "USA" ? "usa" : string.Empty),
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
                HasScholarship = u.HasScholarship
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
            string.Equals(c.Code, u.Country?.Trim(), StringComparison.OrdinalIgnoreCase) ||
            string.Equals(c.DefaultName, u.Country?.Trim(), StringComparison.OrdinalIgnoreCase) ||
            (c.Code.ToLower() == "usa" && u.Country?.Trim().ToUpper() == "USA"));

        var translation = u.Translations.FirstOrDefault(t => t.Language != null && t.Language.Code == langCode) 
                          ?? u.Translations.FirstOrDefault();

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
            HasScholarship = u.HasScholarship
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
