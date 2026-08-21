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

public class CountryService : ICountryService
{
    private readonly ICountryReadRepository _countryReadRepository;
    private readonly ICountryWriteRepository _countryWriteRepository;
    private readonly IUniversityReadRepository _universityReadRepository;
    private readonly ILanguageReadRepository _languageReadRepository;
    private readonly ITranslationAIService _translationAiService;

    public CountryService(
        ICountryReadRepository countryReadRepository,
        ICountryWriteRepository countryWriteRepository,
        IUniversityReadRepository universityReadRepository,
        ILanguageReadRepository languageReadRepository,
        ITranslationAIService translationAiService)
    {
        _countryReadRepository = countryReadRepository;
        _countryWriteRepository = countryWriteRepository;
        _universityReadRepository = universityReadRepository;
        _languageReadRepository = languageReadRepository;
        _translationAiService = translationAiService;
    }

    public async Task<List<CountryDto>> GetAllCountriesAsync(string lang = "en")
    {
        var countries = await _countryReadRepository.GetAllAsync(
            predicate: c => c.IsActive && !c.IsDeleted,
            include: q => q.Include(c => c.Translations.Where(t => !t.IsDeleted)).ThenInclude(t => t.Language)
        );

        var universities = await _universityReadRepository.GetAllAsync(u => !u.IsDeleted);

        return countries.Select(c =>
        {
            var translation = c.Translations.FirstOrDefault(t => t.Language?.Code == lang) 
                              ?? c.Translations.FirstOrDefault();

            int actualUniversityCount = universities.Count(u => 
                (u.CountryId.HasValue && u.CountryId.Value == c.Id) ||
                (!string.IsNullOrEmpty(u.Country) && (
                    string.Equals(u.Country.Trim(), c.Code.Trim(), StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(u.Country.Trim(), c.DefaultName.Trim(), StringComparison.OrdinalIgnoreCase) ||
                    (c.Code.Equals("us", StringComparison.OrdinalIgnoreCase) && u.Country.Trim().Equals("USA", StringComparison.OrdinalIgnoreCase))
                ))
            );

            return new CountryDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = translation?.Name ?? c.DefaultName,
                Label = translation?.Label ?? c.DefaultLabel,
                FlagEmoji = c.FlagEmoji,
                UniversityCount = actualUniversityCount,
                AverageCost = c.AverageCost,
                ImageUrl = c.ImageUrl
            };
        }).ToList();
    }

    public async Task<CountryDto?> GetCountryByIdAsync(Guid id, string lang = "en")
    {
        var country = await _countryReadRepository.GetAsync(
            predicate: c => c.Id == id && c.IsActive && !c.IsDeleted,
            include: q => q.Include(c => c.Translations.Where(t => !t.IsDeleted)).ThenInclude(t => t.Language)
        );

        if (country == null) return null;

        var universities = await _universityReadRepository.GetAllAsync(u => !u.IsDeleted);
        int actualUniversityCount = universities.Count(u => 
            (u.CountryId.HasValue && u.CountryId.Value == country.Id) ||
            (!string.IsNullOrEmpty(u.Country) && (
                string.Equals(u.Country.Trim(), country.Code.Trim(), StringComparison.OrdinalIgnoreCase) ||
                string.Equals(u.Country.Trim(), country.DefaultName.Trim(), StringComparison.OrdinalIgnoreCase)
            ))
        );

        var translation = country.Translations.FirstOrDefault(t => t.Language?.Code == lang)
                          ?? country.Translations.FirstOrDefault();

        return new CountryDto
        {
            Id = country.Id,
            Code = country.Code,
            Name = translation?.Name ?? country.DefaultName,
            Label = translation?.Label ?? country.DefaultLabel,
            FlagEmoji = country.FlagEmoji,
            UniversityCount = actualUniversityCount,
            AverageCost = country.AverageCost,
            ImageUrl = country.ImageUrl
        };
    }

    public async Task<CountryDto?> GetCountryByCodeOrIdAsync(string codeOrId, string lang = "en")
    {
        if (Guid.TryParse(codeOrId, out var id))
        {
            return await GetCountryByIdAsync(id, lang);
        }

        var country = await _countryReadRepository.GetAsync(
            predicate: c => c.Code.ToLower() == codeOrId.ToLower() && c.IsActive && !c.IsDeleted,
            include: q => q.Include(c => c.Translations.Where(t => !t.IsDeleted)).ThenInclude(t => t.Language)
        );

        if (country == null) return null;

        var universities = await _universityReadRepository.GetAllAsync(u => !u.IsDeleted);
        int actualUniversityCount = universities.Count(u => 
            (u.CountryId.HasValue && u.CountryId.Value == country.Id) ||
            (!string.IsNullOrEmpty(u.Country) && (
                string.Equals(u.Country.Trim(), country.Code.Trim(), StringComparison.OrdinalIgnoreCase) ||
                string.Equals(u.Country.Trim(), country.DefaultName.Trim(), StringComparison.OrdinalIgnoreCase)
            ))
        );

        var translation = country.Translations.FirstOrDefault(t => t.Language?.Code == lang)
                          ?? country.Translations.FirstOrDefault();

        return new CountryDto
        {
            Id = country.Id,
            Code = country.Code,
            Name = translation?.Name ?? country.DefaultName,
            Label = translation?.Label ?? country.DefaultLabel,
            FlagEmoji = country.FlagEmoji,
            UniversityCount = actualUniversityCount,
            AverageCost = country.AverageCost,
            ImageUrl = country.ImageUrl
        };
    }

    public async Task<List<UniversityDto>> GetUniversitiesByCountryIdAsync(Guid countryId, string lang = "en")
    {
        var universities = await _universityReadRepository.GetAllAsync(
            predicate: u => !u.IsDeleted && (u.CountryId == countryId),
            include: q => q.Include(u => u.Translations).ThenInclude(t => t.Language).Include(u => u.CountryRef)
        );

        return universities.Select(u => {
            var translation = u.Translations.FirstOrDefault(t => t.Language?.Code == lang) 
                              ?? u.Translations.FirstOrDefault();
            return new UniversityDto
            {
                Id = u.Id,
                Country = u.CountryRef?.DefaultName ?? u.Country,
                CountryId = u.CountryId,
                CountryCode = u.CountryRef?.Code ?? string.Empty,
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

    public async Task<CountryDto> CreateCountryAsync(CreateCountryDto dto)
    {
        string countryName = dto.Name?.Trim() ?? string.Empty;
        string code = !string.IsNullOrWhiteSpace(dto.Code) 
                      ? dto.Code.Trim().ToLower() 
                      : (countryName.Length >= 2 ? countryName.Substring(0, 2).ToLower() : Guid.NewGuid().ToString().Substring(0, 4));

        var c = new Country
        {
            Id = Guid.NewGuid(),
            Code = code,
            DefaultName = countryName,
            DefaultLabel = dto.Label ?? string.Empty,
            FlagEmoji = dto.FlagEmoji?.Trim() ?? "🌐",
            UniversityCount = dto.UniversityCount,
            AverageCost = dto.AverageCost ?? string.Empty,
            ImageUrl = dto.ImageUrl ?? string.Empty,
            IsActive = true,
            Translations = new List<CountryTranslation>()
        };

        var languages = await _languageReadRepository.GetAllAsync(x => x.IsActive && !x.IsDeleted);
        var baseLang = languages.FirstOrDefault(x => x.Code == (dto.BaseLanguageCode ?? "az")) ?? languages.FirstOrDefault();

        if (baseLang != null)
        {
            c.Translations.Add(new CountryTranslation
            {
                LanguageId = baseLang.Id,
                Name = countryName,
                Label = dto.Label ?? string.Empty
            });
        }

        foreach (var l in languages.Where(x => baseLang == null || x.Id != baseLang.Id))
        {
            try
            {
                string translatedName = await _translationAiService.TranslateAsync(countryName, l.Name);
                c.Translations.Add(new CountryTranslation
                {
                    LanguageId = l.Id,
                    Name = !string.IsNullOrWhiteSpace(translatedName) ? translatedName : countryName,
                    Label = dto.Label ?? string.Empty
                });
            }
            catch
            {
                c.Translations.Add(new CountryTranslation
                {
                    LanguageId = l.Id,
                    Name = countryName,
                    Label = dto.Label ?? string.Empty
                });
            }
        }

        await _countryWriteRepository.AddAsync(c);
        await _countryWriteRepository.CommitAsync();

        return (await GetCountryByIdAsync(c.Id))!;
    }

    public async Task<CountryDto> UpdateCountryAsync(Guid id, CreateCountryDto dto)
    {
        var c = await _countryReadRepository.GetAsync(
            predicate: x => x.Id == id && !x.IsDeleted,
            include: q => q.Include(x => x.Translations)
        );

        if (c == null) throw new Exception("Country not found");

        string countryName = dto.Name?.Trim() ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(dto.Code)) c.Code = dto.Code.Trim().ToLower();
        c.DefaultName = countryName;
        if (!string.IsNullOrWhiteSpace(dto.FlagEmoji)) c.FlagEmoji = dto.FlagEmoji.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Label)) c.DefaultLabel = dto.Label;
        if (!string.IsNullOrWhiteSpace(dto.AverageCost)) c.AverageCost = dto.AverageCost;
        if (!string.IsNullOrWhiteSpace(dto.ImageUrl)) c.ImageUrl = dto.ImageUrl;

        var languages = await _languageReadRepository.GetAllAsync(x => x.IsActive && !x.IsDeleted);
        var baseLang = languages.FirstOrDefault(x => x.Code == (dto.BaseLanguageCode ?? "az")) ?? languages.FirstOrDefault();

        // Update translations
        foreach (var l in languages)
        {
            var existingTranslation = c.Translations.FirstOrDefault(t => t.LanguageId == l.Id);
            string nameToSet = countryName;

            if (baseLang != null && l.Id != baseLang.Id)
            {
                try
                {
                    string translated = await _translationAiService.TranslateAsync(countryName, l.Name);
                    if (!string.IsNullOrWhiteSpace(translated)) nameToSet = translated;
                }
                catch { }
            }

            if (existingTranslation != null)
            {
                existingTranslation.Name = nameToSet;
            }
            else
            {
                c.Translations.Add(new CountryTranslation
                {
                    LanguageId = l.Id,
                    Name = nameToSet,
                    Label = dto.Label ?? string.Empty
                });
            }
        }

        await _countryWriteRepository.UpdateAsync(c);
        await _countryWriteRepository.CommitAsync();

        return (await GetCountryByIdAsync(c.Id))!;
    }

    public async Task<bool> DeleteCountryAsync(Guid id)
    {
        var c = await _countryReadRepository.GetByIdAsync(id.ToString());
        if (c == null || c.IsDeleted) return false;

        c.IsDeleted = true;
        await _countryWriteRepository.UpdateAsync(c);
        await _countryWriteRepository.CommitAsync();
        return true;
    }
}
