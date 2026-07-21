using System.Collections.Generic;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class University : BaseEntity
{
    public string Country { get; set; }
    public string LogoUrl { get; set; }
    public string WebsiteUrl { get; set; }
    public int EstablishedYear { get; set; }
    public string Tuition { get; set; }
    public string AcceptanceRate { get; set; }
    public string TeachingLanguage { get; set; }
    public string Deadline { get; set; }
    public string Ranking { get; set; }
    public bool HasScholarship { get; set; }
    
    public ICollection<UniversityTranslation> Translations { get; set; } = new List<UniversityTranslation>();
}
