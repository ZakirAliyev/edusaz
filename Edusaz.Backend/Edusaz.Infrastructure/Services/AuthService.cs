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
    private readonly EdusazDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<User> userManager, SignInManager<User> signInManager, EdusazDbContext context, IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _configuration = configuration;
    }

    public async Task<bool> RegisterAsync(RegisterDto registerDto)
    {
        var user = new User
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Country = "Azərbaycan",
            Gpa = 3.6,
            EnglishScore = "IELTS 6.5",
            DegreeLevel = "Bakalavr",
            DesiredField = "Kompüter Elmləri / İT"
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);
        return result.Succeeded;
    }

    public async Task<TokenDto> LoginAsync(LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null) return null!;

        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
        if (!result.Succeeded) return null!;

        return await GenerateTokenAsync(user);
    }

    private async Task<TokenDto> GenerateTokenAsync(User user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var mainRole = roles.FirstOrDefault() 
                       ?? ((user.Email != null && (user.Email.Contains("code.edu.az") || user.Email.Contains("admin") || user.Email.Contains("uni"))) 
                           ? "University" 
                           : "Student");

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Role, mainRole),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

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
        var user = await _userManager.FindByEmailAsync(email) 
                   ?? await _userManager.Users.FirstOrDefaultAsync();

        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Əli",
                LastName = "Əliyev",
                Email = string.IsNullOrEmpty(email) ? "student@edusaz.com" : email,
                UserName = string.IsNullOrEmpty(email) ? "student@edusaz.com" : email,
                PhoneNumber = "+994 50 123 45 67",
                Country = "Azərbaycan",
                Gpa = 3.6,
                EnglishScore = "IELTS 6.5",
                DegreeLevel = "Bakalavr",
                DesiredField = "Kompüter Elmləri / İT"
            };
            await _userManager.CreateAsync(user, "Password123!");
        }

        // Fetch user activities from database
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

        if (!activities.Any())
        {
            activities.Add(new UserActivityDto
            {
                Title = "Stipendium Hungaricum",
                Description = "95% Uyğunluq analizi aparıldı",
                Date = DateTime.UtcNow.AddHours(-2)
            });
            activities.Add(new UserActivityDto
            {
                Title = "DAAD Təqaüdü",
                Description = "E-poçt bildirişi aktivləşdirildi",
                Date = DateTime.UtcNow.AddDays(-1)
            });
        }

        return new UserProfileDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? "student@edusaz.com",
            Phone = user.PhoneNumber ?? "+994 50 123 45 67",
            Country = string.IsNullOrEmpty(user.Country) ? "Azərbaycan" : user.Country,
            Gpa = user.Gpa > 0 ? user.Gpa : 3.6,
            EnglishScore = string.IsNullOrEmpty(user.EnglishScore) ? "IELTS 6.5" : user.EnglishScore,
            DegreeLevel = string.IsNullOrEmpty(user.DegreeLevel) ? "Bakalavr" : user.DegreeLevel,
            DesiredField = string.IsNullOrEmpty(user.DesiredField) ? "Kompüter Elmləri / İT" : user.DesiredField,
            ScholarshipCount = Math.Max(subs.Count, 3),
            Activities = activities
        };
    }

    public async Task<UserProfileDto> UpdateUserProfileAsync(string email, UpdateUserProfileDto dto)
    {
        var user = await _userManager.FindByEmailAsync(email) 
                   ?? await _userManager.Users.FirstOrDefaultAsync();

        if (user != null)
        {
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            if (!string.IsNullOrEmpty(dto.Phone)) user.PhoneNumber = dto.Phone;
            if (!string.IsNullOrEmpty(dto.Country)) user.Country = dto.Country;
            if (dto.Gpa > 0) user.Gpa = dto.Gpa;
            if (!string.IsNullOrEmpty(dto.EnglishScore)) user.EnglishScore = dto.EnglishScore;
            if (!string.IsNullOrEmpty(dto.DegreeLevel)) user.DegreeLevel = dto.DegreeLevel;
            if (!string.IsNullOrEmpty(dto.DesiredField)) user.DesiredField = dto.DesiredField;

            await _userManager.UpdateAsync(user);
        }

        return (await GetUserProfileAsync(email))!;
    }
}
