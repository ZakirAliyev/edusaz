using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Edusaz.API.Security;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CountriesController : ControllerBase
{
    private readonly ICountryService _countryService;
    private readonly EdusazDbContext _context;

    public CountriesController(ICountryService countryService, EdusazDbContext context)
    {
        _countryService = countryService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string lang = "en")
    {
        var result = await _countryService.GetAllCountriesAsync(lang);
        return Ok(ApiResponse<List<CountryDto>>.SuccessResponse(result));
    }

    [HttpGet("{idOrCode}")]
    public async Task<IActionResult> GetByIdOrCode(string idOrCode, [FromQuery] string lang = "en")
    {
        var result = await _countryService.GetCountryByCodeOrIdAsync(idOrCode, lang);
        if (result == null) return NotFound(ApiResponse<CountryDto>.ErrorResponse("Country not found", 404));
        return Ok(ApiResponse<CountryDto>.SuccessResponse(result));
    }

    [HttpGet("{id}/universities")]
    public async Task<IActionResult> GetUniversities(Guid id, [FromQuery] string lang = "en")
    {
        var result = await _countryService.GetUniversitiesByCountryIdAsync(id, lang);
        return Ok(ApiResponse<List<UniversityDto>>.SuccessResponse(result));
    }

    [Authorize(Roles = AccessRoles.SuperAdmin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCountryDto dto)
    {
        try
        {
            var result = await _countryService.CreateCountryAsync(dto);
            return Ok(ApiResponse<CountryDto>.SuccessResponse(result, "Country created successfully", 201));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<CountryDto>.ErrorResponse(ex.Message, 400));
        }
    }

    [Authorize(Roles = AccessRoles.SuperAdmin)]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateCountryDto dto)
    {
        try
        {
            var result = await _countryService.UpdateCountryAsync(id, dto);
            return Ok(ApiResponse<CountryDto>.SuccessResponse(result, "Country updated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<CountryDto>.ErrorResponse(ex.Message, 400));
        }
    }

    [Authorize(Roles = AccessRoles.SuperAdmin)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _countryService.DeleteCountryAsync(id);
        if (!result) return NotFound(ApiResponse<bool>.ErrorResponse("Country not found", 404));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Country deleted successfully"));
    }

    /// <summary>Creates or updates a country's name/label in several languages at once (and optionally its URL code).</summary>
    [Authorize(Roles = AccessRoles.SuperAdmin)]
    [HttpPut("{id:guid}/translations")]
    public async Task<IActionResult> UpsertTranslations(Guid id, [FromBody] CountryTranslationsRequestDto dto)
    {
        if (dto?.Translations == null || dto.Translations.Count == 0)
            return BadRequest(ApiResponse<string>.ErrorResponse("Tərcümə siyahısı boşdur.", 400));

        var country = await _context.Countries.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        if (country == null) return NotFound(ApiResponse<string>.ErrorResponse("Country not found", 404));

        if (!string.IsNullOrWhiteSpace(dto.Code))
        {
            var code = dto.Code.Trim().ToLower();
            if (await _context.Countries.AnyAsync(c => c.Id != id && !c.IsDeleted && c.Code == code))
                return BadRequest(ApiResponse<string>.ErrorResponse($"'{code}' kodu artıq başqa ölkədə istifadə olunur.", 400));
            country.Code = code;
        }

        var languages = await _context.Languages.Where(l => !l.IsDeleted)
            .ToDictionaryAsync(l => l.Code.ToLower(), l => l.Id);
        var rows = await _context.CountryTranslations.Where(t => t.CountryId == id && !t.IsDeleted).ToListAsync();

        int created = 0, updated = 0;
        var skipped = new List<string>();
        foreach (var item in dto.Translations)
        {
            var code = (item.LanguageCode ?? "").Trim().ToLower();
            if (string.IsNullOrWhiteSpace(item.Name) || !languages.TryGetValue(code, out var languageId))
            {
                skipped.Add(code);
                continue;
            }

            var sameLanguage = rows.Where(t => t.LanguageId == languageId).ToList();
            var row = sameLanguage.FirstOrDefault();
            foreach (var duplicate in sameLanguage.Skip(1))
            {
                duplicate.IsDeleted = true;
                duplicate.DeletedDate = DateTime.UtcNow;
            }

            if (row == null)
            {
                row = new CountryTranslation { CountryId = id, LanguageId = languageId };
                _context.CountryTranslations.Add(row);
                rows.Add(row);
                created++;
            }
            else updated++;

            row.Name = item.Name.Trim();
            if (item.Label != null) row.Label = item.Label.Trim();
            row.LastUpdatedDate = DateTime.UtcNow;

            // DefaultName/DefaultLabel are the English fallback used when a language is missing.
            if (code == "en")
            {
                country.DefaultName = row.Name;
                if (item.Label != null) country.DefaultLabel = row.Label;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.SuccessResponse(new { code = country.Code, created, updated, skipped }));
    }
}
