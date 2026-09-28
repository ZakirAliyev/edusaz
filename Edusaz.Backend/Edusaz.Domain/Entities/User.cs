using System;
using Microsoft.AspNetCore.Identity;

namespace Edusaz.Domain.Entities;

public class User : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    
    // Track timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
    
    // Custom user fields
    public string? ProfileImageUrl { get; set; }
    public string? Country { get; set; } = "Azerbaijan";
    // Academic fields start empty — the student fills them in (placeholder values here showed up as real data).
    public double Gpa { get; set; } = 0;
    public string EnglishScore { get; set; } = string.Empty;
    public string DegreeLevel { get; set; } = string.Empty;
    public string DesiredField { get; set; } = string.Empty;
    
    // UniversityAdmin ownership
    public Guid? UniversityId { get; set; }
    //
}
