using System;
using System.Collections.Generic;

namespace Edusaz.Application.Dtos;

public class MonthlyStatDto
{
    public string Month { get; set; } = string.Empty;
    public int Views { get; set; }
    public int Applications { get; set; }
}

public class CountryOriginStatDto
{
    public string Country { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;
    public int Count { get; set; }
    public int Percentage { get; set; }
}

public class ProgramStatDto
{
    public string Title { get; set; } = string.Empty;
    public int Count { get; set; }
    public int Percentage { get; set; }
}

public class AnalyticsDto
{
    public Guid UniversityId { get; set; }
    public string UniversityName { get; set; } = string.Empty;
    public int TotalViews { get; set; }
    public int TotalApplications { get; set; }
    public int AcceptedApplications { get; set; }
    public int AcceptanceRate { get; set; }
    public List<MonthlyStatDto> MonthlyStats { get; set; } = new();
    public List<CountryOriginStatDto> TopCountries { get; set; } = new();
    public List<ProgramStatDto> TopPrograms { get; set; } = new();
}

public class StudentLeadDto
{
    public Guid Id { get; set; }
    public Guid UniversityId { get; set; }
    public Guid? CourseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;
    public string Program { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Match { get; set; } = "95%";
    public string MatchType { get; set; } = "high";
    public string Status { get; set; } = "Applied"; // Applied, Accepted, Rejected, Under Review
    public string Time { get; set; } = "2 saat əvvəl";
    public string Initials { get; set; } = "A";
    public string Color { get; set; } = "#7A5CFF";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UpdateLeadStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class CreateStudentLeadDto
{
    public Guid UniversityId { get; set; }
    public Guid? ProgramId { get; set; }
    public Guid? CourseId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string OriginCountry { get; set; } = string.Empty;
    public string CountryFlag { get; set; } = "🌐";
    public string ProgramName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int MatchScore { get; set; } = 80;
}
