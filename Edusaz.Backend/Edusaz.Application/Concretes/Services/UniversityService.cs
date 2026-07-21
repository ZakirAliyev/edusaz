using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.AI;
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
    private readonly ITranslationAIService _translationAiService;

    public UniversityService(
        IUniversityReadRepository universityReadRepository, 
        IUniversityWriteRepository universityWriteRepository,
        ILanguageReadRepository languageReadRepository,
        ITranslationAIService translationAiService)
    {
        _universityReadRepository = universityReadRepository;
        _universityWriteRepository = universityWriteRepository;
        _languageReadRepository = languageReadRepository;
        _translationAiService = translationAiService;
    }

    public async Task<List<UniversityDto>> GetAllUniversitiesAsync(string langCode)
    {
        var universities = await _universityReadRepository.GetAllAsync(
            predicate: u => !u.IsDeleted,
            include: q => q.Include(u => u.Translations.Where(t => t.Language.Code == langCode && !t.IsDeleted)).ThenInclude(t => t.Language)
        );

        return universities.Select(u => {
            var translation = u.Translations.FirstOrDefault();
            return new UniversityDto
            {
                Id = u.Id,
                Country = u.Country,
                LogoUrl = u.LogoUrl,
                WebsiteUrl = u.WebsiteUrl,
                EstablishedYear = u.EstablishedYear,
                Name = translation?.Name ?? "",
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

    public async Task<UniversityDto> GetUniversityByIdAsync(Guid id, string langCode)
    {
        var u = await _universityReadRepository.GetAsync(
            predicate: x => x.Id == id && !x.IsDeleted,
            include: q => q.Include(x => x.Translations.Where(t => t.Language.Code == langCode && !t.IsDeleted)).ThenInclude(t => t.Language)
        );

        if (u == null) return null;

        var translation = u.Translations.FirstOrDefault();
        return new UniversityDto
        {
            Id = u.Id,
            Country = u.Country,
            LogoUrl = u.LogoUrl,
            WebsiteUrl = u.WebsiteUrl,
            EstablishedYear = u.EstablishedYear,
            Name = translation?.Name ?? "",
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

        // Fetch all active languages
        var languages = await _languageReadRepository.GetAllAsync(x => x.IsActive && !x.IsDeleted);
        var baseLanguage = languages.FirstOrDefault(x => x.Code == dto.BaseLanguageCode);

        if (baseLanguage == null)
            throw new Exception("Base language not found or inactive.");

        // Add Base Language Translation
        university.Translations.Add(new UniversityTranslation
        {
            LanguageId = baseLanguage.Id,
            Name = dto.Name,
            Description = dto.Description,
            City = dto.City
        });

        // Translate to other languages using AI
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

        return await GetUniversityByIdAsync(university.Id, dto.BaseLanguageCode);
    }
}
