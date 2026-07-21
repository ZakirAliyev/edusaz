using System;
using Microsoft.AspNetCore.Identity;

namespace Edusaz.Domain.Entities;

public class User : IdentityUser<Guid>
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    
    // Track timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
    
    // Custom user fields
    public string? ProfileImageUrl { get; set; }
    public string? Country { get; set; }
}
