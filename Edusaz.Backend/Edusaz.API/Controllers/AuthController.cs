using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Edusaz.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly Microsoft.AspNetCore.Identity.UserManager<User> _userManager;

    public AuthController(IAuthService authService, Microsoft.AspNetCore.Identity.UserManager<User> userManager)
    {
        _authService = authService;
        _userManager = userManager;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(ApiResponse<string>.ErrorResponse("E-poçt və şifrə daxil edilməlidir."));
        }

        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing != null)
        {
            return BadRequest(ApiResponse<string>.ErrorResponse("Bu e-poçt ünvanı ilə artıq qeydiyyatdan keçilib. Zəhmət olmasa daxil olun."));
        }

        var success = await _authService.RegisterAsync(dto);
        if (success) return Ok(ApiResponse<string>.SuccessResponse("Qeydiyyat uğurla tamamlandı."));
        return BadRequest(ApiResponse<string>.ErrorResponse("Qeydiyyat zamanı xəta baş verdi. Zəhmət olmasa məlumatlarınızı yoxlayın."));
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
