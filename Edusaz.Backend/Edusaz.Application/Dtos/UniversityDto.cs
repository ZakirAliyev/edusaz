using System;

namespace Edusaz.Application.Dtos;

public class UniversityDto
{
    public Guid Id { get; set; }
    public string Country { get; set; } = string.Empty;
    public Guid? CountryId { get; set; }
    public string CountryCode { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string WebsiteUrl { get; set; } = string.Empty;
    public int EstablishedYear { get; set; }
    
    // Localized fields
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    
    public string Tuition { get; set; } = string.Empty;
    public string AcceptanceRate { get; set; } = string.Empty;
    public string TeachingLanguage { get; set; } = string.Empty;
    public string Deadline { get; set; } = string.Empty;
    public string Ranking { get; set; } = string.Empty;
    public bool HasScholarship { get; set; }
    public List<string> Images { get; set; } = new();
    public List<string> VideoUrls { get; set; } = new();
}

public class CreateUniversityDto
{
    public string Country { get; set; } = string.Empty;
    public Guid? CountryId { get; set; }
    public string LogoUrl { get; set; } = string.Empty;
    public string WebsiteUrl { get; set; } = string.Empty;
    public int EstablishedYear { get; set; }
    public string BaseLanguageCode { get; set; } = "en";

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;

    public string Tuition { get; set; } = string.Empty;
    public string AcceptanceRate { get; set; } = string.Empty;
    public string TeachingLanguage { get; set; } = string.Empty;
    public string Deadline { get; set; } = string.Empty;
    public string Ranking { get; set; } = string.Empty;
    public bool HasScholarship { get; set; }

    public List<string> Images { get; set; } = new();
    public List<string> VideoUrls { get; set; } = new();
}
