using System;
using System.Collections.Generic;

namespace Edusaz.Application.Dtos;

public class CampaignDto
{
    public Guid Id { get; set; }
    public Guid? UniversityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string TargetRegion { get; set; } = string.Empty;
    public string TargetCountry { get; set; } = string.Empty;
    public string Budget { get; set; } = "$1,500/mo";
    public string Reach { get; set; } = "15,000+ students";
    public string DailyApplications { get; set; } = "8-12/day";
    public string Status { get; set; } = "Active";
    public string CampaignType { get; set; } = "Global Recruitment";
    public Dictionary<string, CampaignTranslationDto> Translations { get; set; } = new();
}

public class CampaignTranslationDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class CreateCampaignDto
{
    public Guid? UniversityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string TargetRegion { get; set; } = string.Empty;
    public string TargetCountry { get; set; } = string.Empty;
    public string Budget { get; set; } = "$1,500/mo";
    public string Reach { get; set; } = "15,000+ students";
    public string DailyApplications { get; set; } = "8-12/day";
    public string Status { get; set; } = "Active";
    public string CampaignType { get; set; } = "Global Recruitment";

    public string TitleAz { get; set; } = string.Empty;
    public string DescriptionAz { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string TitleTr { get; set; } = string.Empty;
    public string DescriptionTr { get; set; } = string.Empty;
}
