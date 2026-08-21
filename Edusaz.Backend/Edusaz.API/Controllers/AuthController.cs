using System;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Edusaz.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Edusaz.Infrastructure.Contexts;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly EdusazDbContext _context;

    public AuthController(
        IAuthService authService, 
        UserManager<User> userManager, 
        RoleManager<Role> roleManager,
        EdusazDbContext context)
    {
        _authService = authService;
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
    }

    [HttpGet("/api/system/sync-db")]
    public async Task<IActionResult> SyncDatabase()
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""UniversityId"" uuid;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""ProfileImageUrl"" text;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""Country"" text;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""DegreeLevel"" text;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""DesiredField"" text;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""EnglishScore"" text;
                ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""Gpa"" double precision;
                ALTER TABLE ""Reviews"" ADD COLUMN IF NOT EXISTS ""UniversityId"" uuid;
                ALTER TABLE ""Reviews"" ADD COLUMN IF NOT EXISTS ""AuthorName"" text;
                ALTER TABLE ""Reviews"" ADD COLUMN IF NOT EXISTS ""AuthorAvatar"" text;
                ALTER TABLE ""Reviews"" ALTER COLUMN ""CourseId"" DROP NOT NULL;
                ALTER TABLE ""Reviews"" ALTER COLUMN ""UserId"" DROP NOT NULL;
                ALTER TABLE ""StudentApplications"" ADD COLUMN IF NOT EXISTS ""CourseId"" uuid;
                CREATE TABLE IF NOT EXISTS ""UniversityMedias"" (
                    ""Id"" uuid PRIMARY KEY,
                    ""UniversityId"" uuid NOT NULL,
                    ""MediaType"" text NOT NULL,
                    ""Url"" text NOT NULL,
                    ""OrderIndex"" integer NOT NULL DEFAULT 0,
                    ""CreatedDate"" timestamp with time zone NOT NULL DEFAULT now(),
                    ""LastUpdatedDate"" timestamp with time zone NOT NULL DEFAULT now(),
                    ""DeletedDate"" timestamp with time zone,
                    ""IsDeleted"" boolean NOT NULL DEFAULT false
                );
            ");

            string[] roles = new[] { "SuperAdmin", "Admin", "UniversityAdmin", "Teacher", "CourseCenter", "Student" };
            foreach (var r in roles)
            {
                if (!await _roleManager.RoleExistsAsync(r))
                {
                    await _roleManager.CreateAsync(new Role { Name = r });
                }
            }

            return Ok(new { success = true, message = "Database schema & roles synchronized successfully!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message });
        }
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

        try
        {
            var success = await _authService.RegisterAsync(dto);
            if (success) return Ok(ApiResponse<string>.SuccessResponse("Qeydiyyat uğurla tamamlandı."));
            return BadRequest(ApiResponse<string>.ErrorResponse("Qeydiyyat zamanı xəta baş verdi. Zəhmət olmasa məlumatlarınızı yoxlayın."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.ErrorResponse(ex.Message));
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var token = await _authService.LoginAsync(dto);
        if (token == null) return Unauthorized(ApiResponse<TokenDto>.ErrorResponse("Invalid credentials.", 401));
        return Ok(ApiResponse<TokenDto>.SuccessResponse(token, "Login successful."));
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile([FromQuery] string? email)
    {
        var targetEmail = email ?? User.Identity?.Name;
        if (targetEmail == null) return Unauthorized();
        var profile = await _authService.GetUserProfileAsync(targetEmail);
        if (profile == null) return NotFound(ApiResponse<string>.ErrorResponse("User not found", 404));
        return Ok(ApiResponse<UserProfileDto>.SuccessResponse(profile, "User profile fetched successfully"));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromQuery] string? email, [FromBody] UpdateUserProfileDto dto)
    {
        var targetEmail = email ?? dto.Email ?? User.Identity?.Name;
        if (targetEmail == null) return Unauthorized();
        var updated = await _authService.UpdateUserProfileAsync(targetEmail, dto);
        return Ok(ApiResponse<UserProfileDto>.SuccessResponse(updated, "User profile updated successfully"));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var targetEmail = dto.Email ?? User.Identity?.Name;
        if (string.IsNullOrEmpty(targetEmail)) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(targetEmail);
        if (user == null) return NotFound(ApiResponse<string>.ErrorResponse("İstifadəçi tapılmadı.", 404));

        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 4)
        {
            return BadRequest(ApiResponse<string>.ErrorResponse("Yeni şifrə ən azı 4 simvol olmalıdır."));
        }

        if (!string.IsNullOrEmpty(dto.CurrentPassword))
        {
            var changeResult = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            if (!changeResult.Succeeded)
            {
                var errors = string.Join("; ", changeResult.Errors.Select(e => e.Description));
                return BadRequest(ApiResponse<string>.ErrorResponse($"Cari şifrə yanlışdır: {errors}"));
            }
        }
        else
        {
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetResult = await _userManager.ResetPasswordAsync(user, resetToken, dto.NewPassword);
            if (!resetResult.Succeeded)
            {
                var errors = string.Join("; ", resetResult.Errors.Select(e => e.Description));
                return BadRequest(ApiResponse<string>.ErrorResponse($"Şifrə yenilənmə xətası: {errors}"));
            }
        }

        return Ok(ApiResponse<string>.SuccessResponse("Şifrəniz uğurla dəyişdirildi! 🔒"));
    }


    // ── Admin Endpoints ────────────────────────────────────────────────────────

    [Authorize(Roles = "SuperAdmin")]
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? role)
    {
        var usersQuery = _userManager.Users.Where(u => !u.IsDeleted).AsQueryable();
        var usersList = await usersQuery.OrderByDescending(u => u.CreatedAt).ToListAsync();
        
        var universities = await _context.Universities
            .Include(u => u.Translations)
            .ToDictionaryAsync(u => u.Id, u => u.Translations.FirstOrDefault()?.Name ?? "Universitet");

        var result = new System.Collections.Generic.List<UserProfileDto>();

        foreach (var u in usersList)
        {
            var roles = await _userManager.GetRolesAsync(u);
            var mainRole = roles.FirstOrDefault() ?? "Student";

            if (role != null && !string.Equals(mainRole, role, StringComparison.OrdinalIgnoreCase))
                continue;

            string? uniName = null;
            if (u.UniversityId.HasValue && universities.TryGetValue(u.UniversityId.Value, out var uName))
            {
                uniName = uName;
            }

            result.Add(new UserProfileDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? "",
                Role = mainRole,
                Phone = u.PhoneNumber,
                Country = u.Country ?? "",
                UniversityId = u.UniversityId,
                UniversityName = uniName,
                Status = "Active",
                CreatedAt = u.CreatedAt
            });
        }

        return Ok(ApiResponse<System.Collections.Generic.List<UserProfileDto>>.SuccessResponse(result));
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPost("admin-create")]
    public async Task<IActionResult> AdminCreateUser([FromBody] AdminCreateUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(ApiResponse<string>.ErrorResponse("Email və şifrə mütləq daxil edilməlidir."));

        var normalizedEmail = dto.Email.Trim().ToLower();
        var existing = await _userManager.FindByEmailAsync(normalizedEmail);
        if (existing != null)
        {
            if (existing.IsDeleted)
            {
                var delRes = await _userManager.DeleteAsync(existing);
                if (!delRes.Succeeded)
                {
                    _context.Users.Remove(existing);
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Bu email ünvanı ilə artıq istifadəçi qeydiyyatdan keçib."));
            }
        }

        var user = new User
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            FirstName = string.IsNullOrWhiteSpace(dto.FirstName) ? normalizedEmail.Split('@')[0] : dto.FirstName.Trim(),
            LastName = dto.LastName?.Trim() ?? "",
            UniversityId = dto.UniversityId,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return BadRequest(ApiResponse<string>.ErrorResponse($"İstifadəçi yaradılarkən xəta: {errors}"));
        }

        var assignedRole = string.IsNullOrWhiteSpace(dto.Role) ? "Student" : dto.Role;
        if (!await _roleManager.RoleExistsAsync(assignedRole))
            await _roleManager.CreateAsync(new Role { Name = assignedRole });

        await _userManager.AddToRoleAsync(user, assignedRole);

        // If Teacher or Course Center, create Instructor profile entity
        if (assignedRole.Equals("Teacher", StringComparison.OrdinalIgnoreCase) || 
            assignedRole.Equals("CourseCenter", StringComparison.OrdinalIgnoreCase))
        {
            var instructor = new Instructor
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                DisplayName = $"{user.FirstName} {user.LastName}".Trim(),
                Bio = assignedRole.Equals("CourseCenter", StringComparison.OrdinalIgnoreCase) ? "Tədris Mərkəzi" : "Təlimçi / Müəllim",
                IsApproved = true
            };
            _context.Instructors.Add(instructor);
            await _context.SaveChangesAsync();
        }

        return Ok(ApiResponse<string>.SuccessResponse("Hesab uğurla yaradıldı!"));
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPut("users/{id}")]
    public async Task<IActionResult> AdminUpdateUser(Guid id, [FromBody] AdminUpdateUserDto dto)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return NotFound(ApiResponse<string>.ErrorResponse("İstifadəçi tapılmadı"));

        if (!string.IsNullOrEmpty(dto.FirstName)) user.FirstName = dto.FirstName.Trim();
        if (!string.IsNullOrEmpty(dto.LastName)) user.LastName = dto.LastName.Trim();
        if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
        {
            user.Email = dto.Email.Trim().ToLower();
            user.UserName = dto.Email.Trim().ToLower();
        }
        if (dto.UniversityId.HasValue) user.UniversityId = dto.UniversityId;

        if (!string.IsNullOrEmpty(dto.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            await _userManager.ResetPasswordAsync(user, token, dto.Password);
        }

        await _userManager.UpdateAsync(user);

        if (!string.IsNullOrEmpty(dto.Role))
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            
            if (!await _roleManager.RoleExistsAsync(dto.Role))
                await _roleManager.CreateAsync(new Role { Name = dto.Role });
                
            await _userManager.AddToRoleAsync(user, dto.Role);
        }

        return Ok(ApiResponse<string>.SuccessResponse("Məlumatlar uğurla yeniləndi"));
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> AdminDeleteUser(Guid id)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return NotFound(ApiResponse<string>.ErrorResponse("İstifadəçi tapılmadı"));

        var emailLower = (user.Email ?? "").ToLower().Trim();
        if (emailLower == "superadmin@edu.saz" || emailLower == "superadmin@edusaz.com")
        {
            return BadRequest(ApiResponse<string>.ErrorResponse("SuperAdmin hesabı silinə bilməz!"));
        }

        // Clean up linked instructor records
        var instructors = await _context.Instructors.Where(i => i.UserId == user.Id).ToListAsync();
        if (instructors.Any()) _context.Instructors.RemoveRange(instructors);

        // Nullify foreign keys in reviews if any
        var reviews = await _context.Reviews.Where(r => r.UserId == user.Id).ToListAsync();
        foreach (var r in reviews) r.UserId = null;

        // Remove user roles
        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Any())
        {
            await _userManager.RemoveFromRolesAsync(user, roles);
        }

        // Hard delete user from AspNetUsers so email is immediately freed up for re-registration
        var delRes = await _userManager.DeleteAsync(user);
        if (!delRes.Succeeded)
        {
            _context.Users.Remove(user);
        }
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<string>.SuccessResponse("Hesab uğurla silindi və email yenidən qeydiyyat üçün azad edildi."));
    }

    [HttpGet("/api/system/clean-all-users")]
    [HttpPost("/api/system/clean-all-users")]
    public async Task<IActionResult> CleanAllUsersExceptSuperAdmin()
    {
        try
        {
            var usersToDelete = await _userManager.Users
                .Where(u => u.Email != "superadmin@edu.saz" && u.Email != "superadmin@edusaz.com")
                .ToListAsync();

            int count = usersToDelete.Count;
            foreach (var user in usersToDelete)
            {
                var instructors = await _context.Instructors.Where(i => i.UserId == user.Id).ToListAsync();
                if (instructors.Any()) _context.Instructors.RemoveRange(instructors);

                var reviews = await _context.Reviews.Where(r => r.UserId == user.Id).ToListAsync();
                foreach (var r in reviews) r.UserId = null;

                var roles = await _userManager.GetRolesAsync(user);
                if (roles.Any()) await _userManager.RemoveFromRolesAsync(user, roles);

                var delRes = await _userManager.DeleteAsync(user);
                if (!delRes.Succeeded)
                {
                    _context.Users.Remove(user);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, deletedCount = count, message = $"SuperAdmin xaricində bütün {count} istifadəçi/admin bazadan tam silindi." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }
}
