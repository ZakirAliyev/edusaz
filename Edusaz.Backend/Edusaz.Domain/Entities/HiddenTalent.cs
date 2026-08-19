using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class HiddenTalent : BaseEntity
{
    // Status: New, Reviewing, Contacted, Partnered, Archived
    public string Status { get; set; } = "New";
    public string? AdminNotes { get; set; }

    // 1. Personal Info
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Age { get; set; }
    public string? CityCountry { get; set; }
    public string? SocialLinks { get; set; }

    // 2. Skill Info
    public string SkillName { get; set; } = string.Empty;
    public string? ExperienceDuration { get; set; }
    public string? SkillLevel { get; set; } // Yeni başlayıram, Başlanğıc, Orta, Yaxşı, Peşəkar, Çox yüksək səviyyə
    public string? WhereUsed { get; set; }
    public string? WhatCreated { get; set; }

    // 3. Idea Info
    public string? IdeaDescription { get; set; }
    public string? ProblemSolved { get; set; }
    public string? TargetAudience { get; set; }
    public string? CurrentProgress { get; set; }
    public string? MainGoal { get; set; }
    public string? DynamicCategoryQuestion { get; set; }
    public string? DynamicCategoryAnswer { get; set; }

    // 4. Files & Media
    public string? VoiceNoteUrl { get; set; }
    public string? VideoUrl { get; set; }
    public string? UploadedFilesJson { get; set; } // JSON list of file metadata

    // 5. Investment & Resources
    public string? EstimatedInvestment { get; set; } // Bilmirəm, 0-500 AZN, etc., or Custom
    public string? CustomInvestmentAmount { get; set; }
    public string? NeededSupportTypes { get; set; } // JSON array of support strings
    public string? OtherNeeds { get; set; }

    // 6. Team & Collaboration
    public string? TeamStatus { get; set; } = "Solo"; // Tək işləyirəm, Dostlarım var, Komandamız var, Şirkətimiz var, Digər
    public int? TeamSize { get; set; }
    public string? TeamRoles { get; set; }
    public string? TeamNotes { get; set; }

    // 7. Future Vision
    public string? OneYearVision { get; set; }
    public string? WantIncome { get; set; } // Bəli, Xeyr, Hələ qərar verməmişəm
    public string? WantBusiness { get; set; } // Bəli, Xeyr, Bilmirəm
    public string? UltimateAmbition { get; set; }
}
