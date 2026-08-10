using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class ScholarshipSubscription : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid ScholarshipId { get; set; }
    public Scholarship Scholarship { get; set; } = null!;

    public string Email { get; set; } = string.Empty;
    public string Type { get; set; } = "EligibilityCheck"; // "EligibilityCheck" or "Notification"
    public int MatchScore { get; set; }
    public string AnalysisSummary { get; set; } = string.Empty;
    public string RequirementBreakdown { get; set; } = string.Empty;
    public bool IsEmailSent { get; set; } = true;
}
