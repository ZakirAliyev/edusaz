using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var success = await _authService.RegisterAsync(dto);
        if (success) return Ok(ApiResponse<string>.SuccessResponse("User registered successfully."));
        return BadRequest(ApiResponse<string>.ErrorResponse("Registration failed."));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var token = await _authService.LoginAsync(dto);
        if (token == null) return Unauthorized(ApiResponse<TokenDto>.ErrorResponse("Invalid credentials.", 401));
        return Ok(ApiResponse<TokenDto>.SuccessResponse(token, "Login successful."));
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile([FromQuery] string? email)
    {
        var targetEmail = email ?? User.Identity?.Name ?? "student@edusaz.com";
        var profile = await _authService.GetUserProfileAsync(targetEmail);
        return Ok(ApiResponse<UserProfileDto>.SuccessResponse(profile!, "User profile fetched successfully"));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromQuery] string? email, [FromBody] UpdateUserProfileDto dto)
    {
        var targetEmail = email ?? dto.Email ?? User.Identity?.Name ?? "student@edusaz.com";
        var updated = await _authService.UpdateUserProfileAsync(targetEmail, dto);
        return Ok(ApiResponse<UserProfileDto>.SuccessResponse(updated, "User profile updated successfully"));
    }
}
