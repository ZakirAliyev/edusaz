using System;

namespace Edusaz.Application.Dtos;

public class CountryDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string FlagEmoji { get; set; } = string.Empty;
    public int UniversityCount { get; set; }
    public string AverageCost { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}

public class CreateCountryDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string FlagEmoji { get; set; } = string.Empty;
    public int UniversityCount { get; set; }
    public string AverageCost { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string BaseLanguageCode { get; set; } = "az";
}
