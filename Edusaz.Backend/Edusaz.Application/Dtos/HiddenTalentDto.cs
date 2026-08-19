using System;
using System.Collections.Generic;

namespace Edusaz.Application.Dtos;

public class CreateHiddenTalentDto
{
    // 1. Personal
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Age { get; set; }
    public string? CityCountry { get; set; }
    public string? SocialLinks { get; set; }

    // 2. Skill
    public string SkillName { get; set; } = string.Empty;
    public string? ExperienceDuration { get; set; }
    public string? SkillLevel { get; set; }
    public string? WhereUsed { get; set; }
    public string? WhatCreated { get; set; }

    // 3. Idea
    public string? IdeaDescription { get; set; }
    public string? ProblemSolved { get; set; }
    public string? TargetAudience { get; set; }
    public string? CurrentProgress { get; set; }
    public string? MainGoal { get; set; }
    public string? DynamicCategoryQuestion { get; set; }
    public string? DynamicCategoryAnswer { get; set; }

    // 4. Files
    public string? VoiceNoteUrl { get; set; }
    public string? VideoUrl { get; set; }
    public string? UploadedFilesJson { get; set; }

    // 5. Investment
    public string? EstimatedInvestment { get; set; }
    public string? CustomInvestmentAmount { get; set; }
    public string? NeededSupportTypes { get; set; }
    public string? OtherNeeds { get; set; }

    // 6. Team
    public string? TeamStatus { get; set; }
    public int? TeamSize { get; set; }
    public string? TeamRoles { get; set; }
    public string? TeamNotes { get; set; }

    // 7. Future
    public string? OneYearVision { get; set; }
    public string? WantIncome { get; set; }
    public string? WantBusiness { get; set; }
    public string? UltimateAmbition { get; set; }
}

public class HiddenTalentListDto
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
    public string Status { get; set; } = "New";
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? CityCountry { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public string? SkillLevel { get; set; }
    public string? IdeaDescription { get; set; }
    public string? EstimatedInvestment { get; set; }
    public bool HasVoiceNote => !string.IsNullOrEmpty(VoiceNoteUrl);
    public string? VoiceNoteUrl { get; set; }
    public string? VideoUrl { get; set; }
    public int FilesCount { get; set; }
}

public class HiddenTalentDetailDto
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime LastUpdatedDate { get; set; }
    public string Status { get; set; } = "New";
    public string? AdminNotes { get; set; }

    // Personal
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Age { get; set; }
    public string? CityCountry { get; set; }
    public string? SocialLinks { get; set; }

    // Skill
    public string SkillName { get; set; } = string.Empty;
    public string? ExperienceDuration { get; set; }
    public string? SkillLevel { get; set; }
    public string? WhereUsed { get; set; }
    public string? WhatCreated { get; set; }

    // Idea
    public string? IdeaDescription { get; set; }
    public string? ProblemSolved { get; set; }
    public string? TargetAudience { get; set; }
    public string? CurrentProgress { get; set; }
    public string? MainGoal { get; set; }
    public string? DynamicCategoryQuestion { get; set; }
    public string? DynamicCategoryAnswer { get; set; }

    // Media
    public string? VoiceNoteUrl { get; set; }
    public string? VideoUrl { get; set; }
    public string? UploadedFilesJson { get; set; }

    // Investment
    public string? EstimatedInvestment { get; set; }
    public string? CustomInvestmentAmount { get; set; }
    public string? NeededSupportTypes { get; set; }
    public string? OtherNeeds { get; set; }

    // Team
    public string? TeamStatus { get; set; }
    public int? TeamSize { get; set; }
    public string? TeamRoles { get; set; }
    public string? TeamNotes { get; set; }

    // Future
    public string? OneYearVision { get; set; }
    public string? WantIncome { get; set; }
    public string? WantBusiness { get; set; }
    public string? UltimateAmbition { get; set; }
}

public class UpdateTalentStatusDto
{
    public string Status { get; set; } = "Reviewing";
    public string? AdminNotes { get; set; }
}

public class TalentFileUploadResultDto
{
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string FileType { get; set; } = string.Empty;
}
