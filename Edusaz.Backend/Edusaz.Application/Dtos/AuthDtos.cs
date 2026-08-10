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
