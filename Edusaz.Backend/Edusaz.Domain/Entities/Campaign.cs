using System;
using System.Collections.Generic;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class Campaign : BaseEntity
{
    public Guid? UniversityId { get; set; }
    public University? UniversityRef { get; set; }

    public string Title { get; set; } = string.Empty;
    public string TargetRegion { get; set; } = string.Empty; // e.g. Central Asia, West Africa, Europe
    public string TargetCountry { get; set; } = string.Empty; // e.g. Nigeria, Turkey, Kazakhstan
    public string Budget { get; set; } = "$1,500/mo";
    public string Reach { get; set; } = "15,000+ students";
    public string DailyApplications { get; set; } = "8-12/day";
    public string Status { get; set; } = "Active"; // Active, Draft, Ended
    public string CampaignType { get; set; } = "Global Recruitment"; // Global Recruitment, Scholarship Drive, STEM Focus

    public ICollection<CampaignTranslation> Translations { get; set; } = new List<CampaignTranslation>();
}
