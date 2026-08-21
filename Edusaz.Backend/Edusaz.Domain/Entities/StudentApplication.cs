using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class StudentApplication : BaseEntity
{
    public Guid UniversityId { get; set; }
    public University? University { get; set; }

    public Guid? ProgramId { get; set; }
    public Program? ProgramRef { get; set; }

    public Guid? CourseId { get; set; }
    public Course? Course { get; set; }

    public string StudentName { get; set; } = string.Empty;
    public string OriginCountry { get; set; } = string.Empty;
    public string CountryFlag { get; set; } = "🌐";
    public string ProgramName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int MatchScore { get; set; } = 95;
    public string Status { get; set; } = "Applied"; // Applied, Accepted, Rejected, Under Review
    public string Initials { get; set; } = "S";
    public string Color { get; set; } = "#7A5CFF";
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
}
