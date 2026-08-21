using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.Infrastructure.Services;

public class ProgramService : IProgramService
{
    private readonly EdusazDbContext _context;

    public ProgramService(EdusazDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProgramDto>> GetAllProgramsAsync(
        string lang = "en", 
        Guid? countryId = null, 
        string? field = null, 
        string? search = null, 
        Guid? universityId = null)
    {
        var targetLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == lang) 
                         ?? await _context.Languages.FirstOrDefaultAsync(x => x.Code == "en");

        var query = _context.Programs
            .Include(x => x.Translations).ThenInclude(t => t.Language)
            .Include(x => x.University).ThenInclude(u => u.CountryRef)
            .Include(x => x.University).ThenInclude(u => u.Translations).ThenInclude(ut => ut.Language)
            .AsNoTracking();

        if (universityId.HasValue && universityId.Value != Guid.Empty)
        {
            query = query.Where(p => p.UniversityId == universityId.Value);
        }

        if (countryId.HasValue && countryId.Value != Guid.Empty)
        {
            query = query.Where(p => p.University != null && p.University.CountryId == countryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(field))
        {
            var cleanField = field.Trim().ToLower();
            query = query.Where(p => p.FieldOfStudy.ToLower().Contains(cleanField));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var cleanSearch = search.Trim().ToLower();
            query = query.Where(p => 
                p.FieldOfStudy.ToLower().Contains(cleanSearch) ||
                p.DegreeLevel.ToLower().Contains(cleanSearch) ||
                p.Translations.Any(t => t.Title.ToLower().Contains(cleanSearch) || t.Description.ToLower().Contains(cleanSearch)) ||
                (p.University != null && p.University.Translations.Any(ut => ut.Name.ToLower().Contains(cleanSearch)))
            );
        }

        var programs = await query.ToListAsync();
        return programs.Select(p => MapToDto(p, targetLang?.Id, lang)).ToList();
    }

    public async Task<ProgramDto?> GetProgramByIdAsync(Guid id, string lang = "en")
    {
        var targetLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == lang) 
                         ?? await _context.Languages.FirstOrDefaultAsync(x => x.Code == "en");

        var program = await _context.Programs
            .Include(x => x.Translations).ThenInclude(t => t.Language)
            .Include(x => x.University).ThenInclude(u => u.CountryRef)
            .Include(x => x.University).ThenInclude(u => u.Translations).ThenInclude(ut => ut.Language)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return program == null ? null : MapToDto(program, targetLang?.Id, lang);
    }

    public async Task<ProgramDto> CreateProgramAsync(CreateProgramDto dto)
    {
        Guid? finalUniId = null;
        if (dto.UniversityId.HasValue && dto.UniversityId.Value != Guid.Empty)
        {
            var uniExists = await _context.Universities.AnyAsync(u => u.Id == dto.UniversityId.Value);
            if (uniExists)
            {
                finalUniId = dto.UniversityId.Value;
            }
        }

        var allLanguages = await _context.Languages.ToListAsync();

        var program = new Program
        {
            Id = Guid.NewGuid(),
            UniversityId = finalUniId,
            DegreeLevel = dto.DegreeLevel ?? dto.Level ?? "Bakalavr",
            Duration = dto.Duration ?? "4 il",
            TuitionFee = dto.TuitionFee ?? "3,500 AZN / il",
            LanguageOfInstruction = dto.LanguageOfInstruction ?? dto.TeachingLanguage ?? "İngilis dili",
            FieldOfStudy = dto.FieldOfStudy ?? "Ümumi",
            EntryRequirements = dto.EntryRequirements ?? "Tam orta təhsil attestatı",
            Translations = new List<ProgramTranslation>()
        };

        var titleAz = !string.IsNullOrEmpty(dto.TitleAz) ? dto.TitleAz : (!string.IsNullOrEmpty(dto.Title) ? dto.Title : "Yeni Proqram");
        var descAz = !string.IsNullOrEmpty(dto.DescriptionAz) ? dto.DescriptionAz : (!string.IsNullOrEmpty(dto.Description) ? dto.Description : titleAz);

        if (dto.Translations != null && dto.Translations.Count > 0)
        {
            foreach (var kvp in dto.Translations)
            {
                var langMatch = allLanguages.FirstOrDefault(l => string.Equals(l.Code, kvp.Key, StringComparison.OrdinalIgnoreCase));
                if (langMatch != null && !string.IsNullOrEmpty(kvp.Value.Title))
                {
                    program.Translations.Add(new ProgramTranslation
                    {
                        Id = Guid.NewGuid(),
                        LanguageId = langMatch.Id,
                        Title = kvp.Value.Title,
                        Description = string.IsNullOrEmpty(kvp.Value.Description) ? kvp.Value.Title : kvp.Value.Description
                    });
                }
            }
        }

        // Ensure AZ is present
        var azLang = allLanguages.FirstOrDefault(x => x.Code == "az");
        if (azLang != null && !program.Translations.Any(t => t.LanguageId == azLang.Id))
        {
            program.Translations.Add(new ProgramTranslation
            {
                Id = Guid.NewGuid(),
                LanguageId = azLang.Id,
                Title = titleAz,
                Description = descAz
            });
        }

        // Ensure EN is present
        var enLang = allLanguages.FirstOrDefault(x => x.Code == "en");
        if (enLang != null && !program.Translations.Any(t => t.LanguageId == enLang.Id))
        {
            program.Translations.Add(new ProgramTranslation
            {
                Id = Guid.NewGuid(),
                LanguageId = enLang.Id,
                Title = !string.IsNullOrEmpty(dto.TitleEn) ? dto.TitleEn : titleAz,
                Description = !string.IsNullOrEmpty(dto.DescriptionEn) ? dto.DescriptionEn : descAz
            });
        }

        await _context.Programs.AddAsync(program);
        await _context.SaveChangesAsync();

        return (await GetProgramByIdAsync(program.Id, "az"))!;
    }

    public async Task<bool> DeleteProgramAsync(Guid id)
    {
        var program = await _context.Programs.FindAsync(id);
        if (program == null) return false;

        _context.Programs.Remove(program);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ProgramDto> UpdateProgramAsync(Guid id, CreateProgramDto dto)
    {
        var program = await _context.Programs
            .Include(p => p.Translations)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (program == null)
            throw new Exception("Program not found");

        if (dto.UniversityId.HasValue && dto.UniversityId.Value != Guid.Empty) program.UniversityId = dto.UniversityId.Value;
        else program.UniversityId = null;

        if (!string.IsNullOrEmpty(dto.DegreeLevel)) program.DegreeLevel = dto.DegreeLevel;
        else if (!string.IsNullOrEmpty(dto.Level)) program.DegreeLevel = dto.Level;

        if (!string.IsNullOrEmpty(dto.Duration)) program.Duration = dto.Duration;
        if (!string.IsNullOrEmpty(dto.TuitionFee)) program.TuitionFee = dto.TuitionFee;
        if (!string.IsNullOrEmpty(dto.LanguageOfInstruction)) program.LanguageOfInstruction = dto.LanguageOfInstruction;
        else if (!string.IsNullOrEmpty(dto.TeachingLanguage)) program.LanguageOfInstruction = dto.TeachingLanguage;

        if (!string.IsNullOrEmpty(dto.FieldOfStudy)) program.FieldOfStudy = dto.FieldOfStudy;
        if (!string.IsNullOrEmpty(dto.EntryRequirements)) program.EntryRequirements = dto.EntryRequirements;

        var allLanguages = await _context.Languages.ToListAsync();

        if (dto.Translations != null && dto.Translations.Count > 0)
        {
            foreach (var kvp in dto.Translations)
            {
                var langMatch = allLanguages.FirstOrDefault(l => string.Equals(l.Code, kvp.Key, StringComparison.OrdinalIgnoreCase));
                if (langMatch != null && !string.IsNullOrEmpty(kvp.Value.Title))
                {
                    var existingTr = program.Translations.FirstOrDefault(t => t.LanguageId == langMatch.Id);
                    if (existingTr != null)
                    {
                        existingTr.Title = kvp.Value.Title;
                        existingTr.Description = string.IsNullOrEmpty(kvp.Value.Description) ? kvp.Value.Title : kvp.Value.Description;
                    }
                    else
                    {
                        program.Translations.Add(new ProgramTranslation
                        {
                            Id = Guid.NewGuid(),
                            LanguageId = langMatch.Id,
                            Title = kvp.Value.Title,
                            Description = string.IsNullOrEmpty(kvp.Value.Description) ? kvp.Value.Title : kvp.Value.Description
                        });
                    }
                }
            }
        }
        else if (!string.IsNullOrEmpty(dto.TitleAz) || !string.IsNullOrEmpty(dto.Title))
        {
            var title = !string.IsNullOrEmpty(dto.TitleAz) ? dto.TitleAz : dto.Title!;
            var desc = !string.IsNullOrEmpty(dto.DescriptionAz) ? dto.DescriptionAz : (dto.Description ?? title);
            var azLang = allLanguages.FirstOrDefault(x => x.Code == "az");
            if (azLang != null)
            {
                var azTr = program.Translations.FirstOrDefault(t => t.LanguageId == azLang.Id);
                if (azTr != null)
                {
                    azTr.Title = title;
                    azTr.Description = desc;
                }
                else
                {
                    program.Translations.Add(new ProgramTranslation
                    {
                        Id = Guid.NewGuid(),
                        LanguageId = azLang.Id,
                        Title = title,
                        Description = desc
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
        return (await GetProgramByIdAsync(program.Id, "az"))!;
    }

    private static ProgramDto MapToDto(Program p, Guid? langId, string langCode)
    {
        var translation = p.Translations.FirstOrDefault(x => x.LanguageId == langId)
                          ?? p.Translations.FirstOrDefault();

        var uniTranslation = p.University?.Translations.FirstOrDefault(t => t.Language != null && t.Language.Code == langCode)
                             ?? p.University?.Translations.FirstOrDefault();

        var dto = new ProgramDto
        {
            Id = p.Id,
            UniversityId = p.UniversityId,
            UniversityName = uniTranslation?.Name ?? p.University?.Translations?.FirstOrDefault()?.Name ?? "Ümumi / Təyin edilməyib",
            Country = p.University?.CountryRef?.DefaultName ?? p.University?.Country ?? "Qlobal",
            CountryId = p.University?.CountryId,
            LogoUrl = p.University?.LogoUrl ?? "",

            Title = translation?.Title ?? "Program",
            Description = translation?.Description ?? "",
            DegreeLevel = p.DegreeLevel,
            FieldOfStudy = p.FieldOfStudy,
            Duration = p.Duration,
            TuitionFee = p.TuitionFee,
            LanguageOfInstruction = p.LanguageOfInstruction,
            StudyMode = p.StudyMode,
            EntryRequirements = p.EntryRequirements,
            ApplicationDeadline = p.ApplicationDeadline
        };

        foreach (var t in p.Translations)
        {
            if (t.Language != null)
            {
                dto.Translations[t.Language.Code] = new ProgramTranslationDto
                {
                    Title = t.Title,
                    Description = t.Description
                };
            }
        }

        return dto;
    }
}
