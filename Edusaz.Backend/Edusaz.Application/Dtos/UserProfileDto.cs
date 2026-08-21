using System;
using System.Collections.Generic;

namespace Edusaz.Application.Dtos;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Country { get; set; }
    public double? Gpa { get; set; }
    public string? EnglishScore { get; set; }
    public string? DegreeLevel { get; set; }
    public string? DesiredField { get; set; }
    public int ScholarshipCount { get; set; }
    public List<UserActivityDto> Activities { get; set; } = new();
    public string Role { get; set; } = "Student";
    public string? ProfileImageUrl { get; set; }
}

public class UserActivityDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}

public class UpdateUserProfileDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Country { get; set; }
    public double? Gpa { get; set; }
    public string? EnglishScore { get; set; }
    public string? DegreeLevel { get; set; }
    public string? DesiredField { get; set; }
    public string? ProfileImageUrl { get; set; }
}
