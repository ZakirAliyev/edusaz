using System.Collections.Generic;

namespace Edusaz.Application.Dtos;

/// <summary>One language's text for a university or country. Null fields are left unchanged.</summary>
public class TranslationUpsertDto
{
    public string LanguageCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Description { get; set; }
    public string? Label { get; set; }
}

public class CountryTranslationsRequestDto
{
    /// <summary>Optional new URL code (e.g. "de"); must be unique.</summary>
    public string? Code { get; set; }
    public List<TranslationUpsertDto> Translations { get; set; } = new();
}
