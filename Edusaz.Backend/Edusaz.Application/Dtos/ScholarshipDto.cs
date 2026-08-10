using System;
using System.Collections.Generic;

namespace Edusaz.Application.Dtos;

public class ScholarshipDto
{
    public Guid Id { get; set; }
    public Guid? UniversityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public Guid? CountryId { get; set; }
    public string CountryCode { get; set; } = string.Empty;
    public string Status { get; set; } = "Open";
    public string Amount { get; set; } = string.Empty;
    public string Deadline { get; set; } = string.Empty;
    public string Eligible { get; set; } = string.Empty;
    public string Places { get; set; } = string.Empty;
    public string ButtonType { get; set; } = "check";
    public Dictionary<string, ScholarshipTranslationDto> Translations { get; set; } = new();
}

public class ScholarshipTranslationDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Eligible { get; set; } = string.Empty;
}

public class CreateScholarshipDto
{
    public Guid? UniversityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public Guid? CountryId { get; set; }
    public string Status { get; set; } = "Open";
    public string Amount { get; set; } = string.Empty;
    public string Deadline { get; set; } = string.Empty;
    public string Eligible { get; set; } = string.Empty;
    public string Places { get; set; } = string.Empty;
    public string ButtonType { get; set; } = "check";

    public string NameAz { get; set; } = string.Empty;
    public string DescriptionAz { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string NameTr { get; set; } = string.Empty;
    public string DescriptionTr { get; set; } = string.Empty;
}

public class CheckEligibilityRequestDto
{
    public Guid ScholarshipId { get; set; }
    public string Email { get; set; } = string.Empty;
}

public class CheckEligibilityResponseDto
{
    public Guid ScholarshipId { get; set; }
    public string ScholarshipName { get; set; } = string.Empty;
    public int MatchScore { get; set; }
    public string Summary { get; set; } = string.Empty;
    public List<string> Highlights { get; set; } = new();
    public bool IsEmailSent { get; set; }
    public string EmailMessage { get; set; } = string.Empty;
}

public class SubscribeNotificationRequestDto
{
    public Guid ScholarshipId { get; set; }
    public string Email { get; set; } = string.Empty;
}
