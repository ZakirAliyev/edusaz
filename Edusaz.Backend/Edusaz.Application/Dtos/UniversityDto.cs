using System;

namespace Edusaz.Application.Dtos;

public class UniversityDto
{
    public Guid Id { get; set; }
    public string Country { get; set; }
    public string LogoUrl { get; set; }
    public string WebsiteUrl { get; set; }
    public int EstablishedYear { get; set; }
    
    // Localized fields
    // Localized fields
    public string Name { get; set; }
    public string Description { get; set; }
    public string City { get; set; }
    
    public string Tuition { get; set; }
    public string AcceptanceRate { get; set; }
    public string TeachingLanguage { get; set; }
    public string Deadline { get; set; }
    public string Ranking { get; set; }
    public bool HasScholarship { get; set; }
}

public class CreateUniversityDto
{
    public string Country { get; set; }
    public string LogoUrl { get; set; }
    public string WebsiteUrl { get; set; }
    public int EstablishedYear { get; set; }
    public string BaseLanguageCode { get; set; } // e.g., "en"

    public string Name { get; set; }
    public string Description { get; set; }
    public string City { get; set; }

    public string Tuition { get; set; }
    public string AcceptanceRate { get; set; }
    public string TeachingLanguage { get; set; }
    public string Deadline { get; set; }
    public string Ranking { get; set; }
    public bool HasScholarship { get; set; }
}
