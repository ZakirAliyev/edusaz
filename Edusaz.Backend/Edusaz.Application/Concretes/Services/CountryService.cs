using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Repositories.Countries;
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

    public CountryService(
        ICountryReadRepository countryReadRepository,
        ICountryWriteRepository countryWriteRepository,
        IUniversityReadRepository universityReadRepository)
    {
        _countryReadRepository = countryReadRepository;
        _countryWriteRepository = countryWriteRepository;
        _universityReadRepository = universityReadRepository;
    }

    public async Task<List<CountryDto>> GetAllCountriesAsync(string lang = "en")
    {
        var countries = await _countryReadRepository.GetAllAsync(
            predicate: c => c.IsActive && !c.IsDeleted,
            include: q => q.Include(c => c.Translations.Where(t => !t.IsDeleted)).ThenInclude(t => t.Language)
        );

        return countries.Select(c =>
        {
            var translation = c.Translations.FirstOrDefault(t => t.Language?.Code == lang) 
                              ?? c.Translations.FirstOrDefault();

            return new CountryDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = translation?.Name ?? c.DefaultName,
                Label = translation?.Label ?? c.DefaultLabel,
                FlagEmoji = c.FlagEmoji,
                UniversityCount = c.UniversityCount,
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

        var translation = country.Translations.FirstOrDefault(t => t.Language?.Code == lang)
                          ?? country.Translations.FirstOrDefault();

        return new CountryDto
        {
            Id = country.Id,
            Code = country.Code,
            Name = translation?.Name ?? country.DefaultName,
            Label = translation?.Label ?? country.DefaultLabel,
            FlagEmoji = country.FlagEmoji,
            UniversityCount = country.UniversityCount,
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

        var translation = country.Translations.FirstOrDefault(t => t.Language?.Code == lang)
                          ?? country.Translations.FirstOrDefault();

        return new CountryDto
        {
            Id = country.Id,
            Code = country.Code,
            Name = translation?.Name ?? country.DefaultName,
            Label = translation?.Label ?? country.DefaultLabel,
            FlagEmoji = country.FlagEmoji,
            UniversityCount = country.UniversityCount,
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
        var c = new Country
        {
            Id = Guid.NewGuid(),
            Code = dto.Code.ToLower(),
            DefaultName = dto.Name,
            DefaultLabel = dto.Label,
            FlagEmoji = dto.FlagEmoji,
            UniversityCount = dto.UniversityCount,
            AverageCost = dto.AverageCost,
            ImageUrl = dto.ImageUrl,
            IsActive = true
        };

        await _countryWriteRepository.AddAsync(c);
        await _countryWriteRepository.CommitAsync();

        return (await GetCountryByIdAsync(c.Id))!;
    }

    public async Task<CountryDto> UpdateCountryAsync(Guid id, CreateCountryDto dto)
    {
        var c = await _countryReadRepository.GetByIdAsync(id.ToString());
        if (c == null || c.IsDeleted) throw new Exception("Country not found");

        c.Code = dto.Code.ToLower();
        c.DefaultName = dto.Name;
        c.DefaultLabel = dto.Label;
        c.FlagEmoji = dto.FlagEmoji;
        c.UniversityCount = dto.UniversityCount;
        c.AverageCost = dto.AverageCost;
        c.ImageUrl = dto.ImageUrl;

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
