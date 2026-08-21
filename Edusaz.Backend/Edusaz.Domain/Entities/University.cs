using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class University : BaseEntity
{
    public string Country { get; set; } = string.Empty;
    
    public Guid? CountryId { get; set; }
    public Country? CountryRef { get; set; }

    public string LogoUrl { get; set; } = string.Empty;
    public string WebsiteUrl { get; set; } = string.Empty;
    public int EstablishedYear { get; set; }
    public string Tuition { get; set; } = string.Empty;
    public string AcceptanceRate { get; set; } = string.Empty;
    public string TeachingLanguage { get; set; } = string.Empty;
    public string Deadline { get; set; } = string.Empty;
    public string Ranking { get; set; } = string.Empty;
    public bool HasScholarship { get; set; }
    
    [NotMapped]
    public List<string> Images { get; set; } = new();

    [NotMapped]
    public List<string> VideoUrls { get; set; } = new();

    public ICollection<UniversityTranslation> Translations { get; set; } = new List<UniversityTranslation>();
    public ICollection<Program> Programs { get; set; } = new List<Program>();
}
