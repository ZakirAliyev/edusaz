using System;

namespace Edusaz.Application.Dtos;

public class RegisterDto
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
}

public class LoginDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class TokenDto
{
    public string AccessToken { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public string Role { get; set; } = "Student";
}

public class AdminCreateUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Student";
    public Guid? UniversityId { get; set; }
    public string? Status { get; set; } = "Active";
}

public class AdminUpdateUserDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public Guid? UniversityId { get; set; }
    public string? Password { get; set; }
    public string? Status { get; set; }
}
