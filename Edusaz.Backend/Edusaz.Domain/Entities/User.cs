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
    public double Gpa { get; set; } = 3.6;
    public string EnglishScore { get; set; } = "IELTS 6.5";
    public string DegreeLevel { get; set; } = "Bachelor";
    public string DesiredField { get; set; } = "Computer Science";
    
    // UniversityAdmin ownership
    public Guid? UniversityId { get; set; }
    //
}
