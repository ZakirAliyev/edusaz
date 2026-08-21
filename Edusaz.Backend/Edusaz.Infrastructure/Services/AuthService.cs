using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Edusaz.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly EdusazDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(
        UserManager<User> userManager, 
        SignInManager<User> signInManager, 
        RoleManager<Role> roleManager,
        EdusazDbContext context, 
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _context = context;
        _configuration = configuration;
    }

    public async Task<bool> RegisterAsync(RegisterDto registerDto)
    {
        var existing = await _userManager.FindByEmailAsync(registerDto.Email);
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
                return false;
            }
        }

        var user = new User
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            FirstName = string.IsNullOrWhiteSpace(registerDto.FirstName) ? registerDto.Email.Split('@')[0] : registerDto.FirstName,
            LastName = registerDto.LastName ?? "",
            Country = "Azərbaycan",
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new Exception($"Qeydiyyat xətası: {errors}");
        }

        var assignedRole = "Student";
        if (!await _roleManager.RoleExistsAsync(assignedRole))
        {
            await _roleManager.CreateAsync(new Role { Name = assignedRole });
        }
        await _userManager.AddToRoleAsync(user, assignedRole);

        return true;
    }

    public async Task<TokenDto> LoginAsync(LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null) return null!;

        if (user.IsDeleted)
            return null!;

        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
        if (!result.Succeeded) return null!;

        return await GenerateTokenAsync(user);
    }

    private async Task<TokenDto> GenerateTokenAsync(User user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var mainRole = roles.FirstOrDefault() ?? "Student";

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Role, mainRole),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("firstName", user.FirstName ?? ""),
            new Claim("lastName", user.LastName ?? "")
        };

        // Add UniversityId claim for UniversityAdmin
        if (mainRole == "UniversityAdmin" && user.UniversityId.HasValue)
        {
            claims.Add(new Claim("universityId", user.UniversityId.Value.ToString()));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"] ?? "edusaz_super_secret_key_1234567890"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiration = DateTime.UtcNow.AddDays(7);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiration,
            signingCredentials: creds
        );

        return new TokenDto
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            Expiration = expiration,
            Role = mainRole
        };
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return null;

        // Fetch real user activities from database
        var subs = await _context.ScholarshipSubscriptions
            .Include(s => s.Scholarship)
            .Where(s => s.Email == user.Email || s.UserId == user.Id)
            .OrderByDescending(s => s.CreatedDate)
            .Take(10)
            .ToListAsync();

        var activities = subs.Select(s => new UserActivityDto
        {
            Title = s.Scholarship?.Name ?? "Təqaüd Analizi",
            Description = s.Type == "EligibilityCheck" 
                ? $"{s.MatchScore}% Uyğunluq analizi aparıldı" 
                : "E-poçt bildirişi aktivləşdirildi",
            Date = s.CreatedDate
        }).ToList();

        var roles = await _userManager.GetRolesAsync(user);

        return new UserProfileDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? "",
            Phone = user.PhoneNumber ?? "",
            Country = user.Country ?? "",
            Gpa = user.Gpa,
            EnglishScore = user.EnglishScore ?? "",
            DegreeLevel = user.DegreeLevel ?? "",
            DesiredField = user.DesiredField ?? "",
            ScholarshipCount = subs.Count,
            Activities = activities,
            Role = roles.FirstOrDefault() ?? "Student",
            ProfileImageUrl = user.ProfileImageUrl ?? ""
        };
    }

    public async Task<UserProfileDto> UpdateUserProfileAsync(string email, UpdateUserProfileDto dto)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            throw new Exception("İstifadəçi tapılmadı.");

        if (!string.IsNullOrEmpty(dto.FirstName)) user.FirstName = dto.FirstName;
        if (!string.IsNullOrEmpty(dto.LastName)) user.LastName = dto.LastName;
        if (!string.IsNullOrEmpty(dto.Phone)) user.PhoneNumber = dto.Phone;
        if (!string.IsNullOrEmpty(dto.Country)) user.Country = dto.Country;
        if (dto.Gpa.HasValue && dto.Gpa.Value > 0) user.Gpa = dto.Gpa.Value;
        if (!string.IsNullOrEmpty(dto.EnglishScore)) user.EnglishScore = dto.EnglishScore;
        if (!string.IsNullOrEmpty(dto.DegreeLevel)) user.DegreeLevel = dto.DegreeLevel;
        if (!string.IsNullOrEmpty(dto.DesiredField)) user.DesiredField = dto.DesiredField;
        if (!string.IsNullOrEmpty(dto.ProfileImageUrl)) user.ProfileImageUrl = dto.ProfileImageUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);

        return (await GetUserProfileAsync(email))!;
    }
}
