using System;
using System.Collections.Generic;

namespace Edusaz.Application.Dtos;

public class ProgramDto
{
    public Guid Id { get; set; }
    public Guid UniversityId { get; set; }
    public string UniversityName { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public Guid? CountryId { get; set; }
    public string LogoUrl { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DegreeLevel { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string TuitionFee { get; set; } = string.Empty;
    public string LanguageOfInstruction { get; set; } = string.Empty;
    public string StudyMode { get; set; } = string.Empty;
    public string EntryRequirements { get; set; } = string.Empty;
    public string ApplicationDeadline { get; set; } = string.Empty;
    public Dictionary<string, ProgramTranslationDto> Translations { get; set; } = new();
}

public class ProgramTranslationDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class CreateProgramDto
{
    public Guid UniversityId { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string TitleAz { get; set; } = string.Empty;
    public string DescriptionAz { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string TitleRu { get; set; } = string.Empty;
    public string DescriptionRu { get; set; } = string.Empty;
    public string TitleTr { get; set; } = string.Empty;
    public string DescriptionTr { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string? DegreeLevel { get; set; }
    public string Duration { get; set; } = string.Empty;
    public string TuitionFee { get; set; } = string.Empty;
    public string? LanguageOfInstruction { get; set; }
    public string? TeachingLanguage { get; set; }
    public string FieldOfStudy { get; set; } = string.Empty;
    public string EntryRequirements { get; set; } = string.Empty;
    public Dictionary<string, ProgramTranslationDto>? Translations { get; set; }
}
