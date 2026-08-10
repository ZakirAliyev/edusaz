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
            query = query.Where(p => p.University.CountryId == countryId.Value);
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
                p.University.Translations.Any(ut => ut.Name.ToLower().Contains(cleanSearch))
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
        if (dto.UniversityId == Guid.Empty)
        {
            var firstUni = await _context.Universities.FirstOrDefaultAsync();
            if (firstUni == null)
            {
                throw new Exception("Universitet tapılmadı. Proqram yaratmaq üçün əvvəlcə Universitet əlavə edilməlidir.");
            }
            dto.UniversityId = firstUni.Id;
        }
        else
        {
            var uniExists = await _context.Universities.AnyAsync(u => u.Id == dto.UniversityId);
            if (!uniExists)
            {
                throw new Exception($"Göstərilən Universitet (ID: {dto.UniversityId}) tapılmadı.");
            }
        }

        var enLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == "en");
        var azLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == "az");
        var trLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == "tr");
        var ruLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == "ru");

        var program = new Program
        {
            Id = Guid.NewGuid(),
            UniversityId = dto.UniversityId,
            DegreeLevel = dto.Level ?? "Bachelor",
            Duration = dto.Duration ?? "4 Years",
            TuitionFee = dto.TuitionFee ?? "$5,000/yr",
            FieldOfStudy = dto.FieldOfStudy ?? "General",
            EntryRequirements = dto.EntryRequirements ?? "High School Diploma",
            Translations = new List<ProgramTranslation>()
        };

        if (azLang != null && !string.IsNullOrEmpty(dto.TitleAz))
        {
            program.Translations.Add(new ProgramTranslation
            {
                Id = Guid.NewGuid(), LanguageId = azLang.Id,
                Title = dto.TitleAz, Description = dto.DescriptionAz ?? dto.TitleAz
            });
        }

        if (enLang != null && !string.IsNullOrEmpty(dto.TitleEn))
        {
            program.Translations.Add(new ProgramTranslation
            {
                Id = Guid.NewGuid(), LanguageId = enLang.Id,
                Title = dto.TitleEn, Description = dto.DescriptionEn ?? dto.TitleEn
            });
        }

        if (trLang != null && !string.IsNullOrEmpty(dto.TitleTr))
        {
            program.Translations.Add(new ProgramTranslation
            {
                Id = Guid.NewGuid(), LanguageId = trLang.Id,
                Title = dto.TitleTr, Description = dto.DescriptionTr ?? dto.TitleTr
            });
        }

        if (ruLang != null && !string.IsNullOrEmpty(dto.TitleRu))
        {
            program.Translations.Add(new ProgramTranslation
            {
                Id = Guid.NewGuid(), LanguageId = ruLang.Id,
                Title = dto.TitleRu, Description = dto.DescriptionRu ?? dto.TitleRu
            });
        }

        await _context.Programs.AddAsync(program);
        await _context.SaveChangesAsync();

        return (await GetProgramByIdAsync(program.Id, "en"))!;
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

        if (!string.IsNullOrEmpty(dto.Level)) program.DegreeLevel = dto.Level;
        if (!string.IsNullOrEmpty(dto.Duration)) program.Duration = dto.Duration;
        if (!string.IsNullOrEmpty(dto.TuitionFee)) program.TuitionFee = dto.TuitionFee;
        if (!string.IsNullOrEmpty(dto.FieldOfStudy)) program.FieldOfStudy = dto.FieldOfStudy;
        if (!string.IsNullOrEmpty(dto.EntryRequirements)) program.EntryRequirements = dto.EntryRequirements;

        var azLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == "az");
        if (azLang != null && !string.IsNullOrEmpty(dto.TitleAz))
        {
            var azTr = program.Translations.FirstOrDefault(t => t.LanguageId == azLang.Id);
            if (azTr != null)
            {
                azTr.Title = dto.TitleAz;
                azTr.Description = dto.DescriptionAz ?? dto.TitleAz;
            }
        }

        await _context.SaveChangesAsync();
        return (await GetProgramByIdAsync(program.Id, "en"))!;
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
            UniversityName = uniTranslation?.Name ?? "University",
            Country = p.University?.CountryRef?.DefaultName ?? p.University?.Country ?? "",
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
