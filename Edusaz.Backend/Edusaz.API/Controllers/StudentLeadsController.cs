using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentLeadsController : ControllerBase
{
    private readonly EdusazDbContext _context;
    private readonly IEmailNotificationService _emailNotificationService;

    public StudentLeadsController(EdusazDbContext context, IEmailNotificationService emailNotificationService)
    {
        _context = context;
        _emailNotificationService = emailNotificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? universityId = null, [FromQuery] Guid? courseId = null)
    {
        var query = _context.StudentApplications.AsQueryable();

        if (universityId.HasValue && universityId.Value != Guid.Empty)
        {
            query = query.Where(a => a.UniversityId == universityId.Value);
        }

        if (courseId.HasValue && courseId.Value != Guid.Empty)
        {
            query = query.Where(a => a.CourseId == courseId.Value);
        }

        var apps = await query
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => new StudentLeadDto
            {
                Id = a.Id,
                UniversityId = a.UniversityId,
                CourseId = a.CourseId,
                Name = a.StudentName,
                Origin = a.OriginCountry,
                Flag = a.CountryFlag,
                Program = a.ProgramName,
                Email = a.Email,
                Phone = a.Phone,
                Match = $"{a.MatchScore}%",
                MatchType = a.MatchScore >= 90 ? "high" : "medium",
                Status = a.Status,
                Time = GetRelativeTime(a.AppliedAt),
                Initials = a.Initials,
                Color = a.Color,
                CreatedAt = a.AppliedAt
            })
            .ToListAsync();

        return Ok(ApiResponse<List<StudentLeadDto>>.SuccessResponse(apps));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStudentLeadDto dto)
    {
        if (dto == null)
            return BadRequest(ApiResponse<StudentLeadDto>.ErrorResponse("Request body is empty", 400));

        var initials = "";
        if (!string.IsNullOrWhiteSpace(dto.StudentName))
        {
            var parts = dto.StudentName.Trim().Split(' ');
            initials = parts.Length >= 2
                ? $"{parts[0][0]}{parts[^1][0]}".ToUpper()
                : dto.StudentName[..Math.Min(2, dto.StudentName.Length)].ToUpper();
        }

        var colors = new[] { "#7A5CFF", "#10b981", "#f59e0b", "#ef4444", "#3b82f6" };
        var color = colors[new Random().Next(colors.Length)];

        var app = new StudentApplication
        {
            Id = Guid.NewGuid(),
            UniversityId = dto.UniversityId,
            ProgramId = dto.ProgramId,
            CourseId = dto.CourseId,
            StudentName = dto.StudentName ?? string.Empty,
            OriginCountry = dto.OriginCountry ?? string.Empty,
            CountryFlag = dto.CountryFlag ?? "🌐",
            ProgramName = dto.ProgramName ?? string.Empty,
            Email = dto.Email ?? string.Empty,
            Phone = dto.Phone ?? string.Empty,
            MatchScore = dto.MatchScore > 0 ? dto.MatchScore : 80,
            Status = "Applied",
            Initials = initials,
            Color = color,
            AppliedAt = DateTime.UtcNow
        };

        _context.StudentApplications.Add(app);
        await _context.SaveChangesAsync();

        // Asynchronous Email Dispatch (Student, SuperAdmin, and Instructor/University)
        _ = Task.Run(async () =>
        {
            try
            {
                if (dto.CourseId.HasValue && dto.CourseId.Value != Guid.Empty)
                {
                    var course = await _context.Courses
                        .Include(c => c.Instructor).ThenInclude(i => i.User)
                        .FirstOrDefaultAsync(c => c.Id == dto.CourseId.Value);

                    bool isSuperAdmin = course == null || 
                                        course.Instructor == null || 
                                        string.IsNullOrWhiteSpace(course.Instructor.DisplayName) || 
                                        course.Instructor.DisplayName.ToLower().Contains("superadmin") || 
                                        course.Instructor.DisplayName.ToLower().Contains("edusaz");

                    string? instructorEmail = course?.Instructor?.User?.Email;
                    string? instructorName = course?.Instructor?.DisplayName ?? $"{course?.Instructor?.User?.FirstName} {course?.Instructor?.User?.LastName}".Trim();

                    await _emailNotificationService.SendCourseApplicationEmailsAsync(
                        studentName: dto.StudentName ?? "Tələbə",
                        studentEmail: dto.Email ?? "",
                        studentPhone: dto.Phone ?? "",
                        originCountry: dto.OriginCountry ?? "Azərbaycan",
                        courseTitle: course?.Title ?? dto.ProgramName ?? "Kurs",
                        instructorName: instructorName,
                        instructorEmail: instructorEmail,
                        isSuperAdminCreated: isSuperAdmin
                    );
                }
                else if (dto.UniversityId != Guid.Empty)
                {
                    var uni = await _context.Universities
                        .Include(u => u.Translations)
                        .FirstOrDefaultAsync(u => u.Id == dto.UniversityId);

                    string uniName = uni?.Translations?.FirstOrDefault()?.Name ?? "Universitet";

                    await _emailNotificationService.SendUniversityApplicationEmailsAsync(
                        studentName: dto.StudentName ?? "Tələbə",
                        studentEmail: dto.Email ?? "",
                        studentPhone: dto.Phone ?? "",
                        originCountry: dto.OriginCountry ?? "Azərbaycan",
                        universityName: uniName,
                        programName: dto.ProgramName,
                        universityAdminEmail: null
                    );
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL DISPATCH ERROR]: {ex.Message}");
            }
        });

        var result = new StudentLeadDto
        {
            Id = app.Id,
            UniversityId = app.UniversityId,
            CourseId = app.CourseId,
            Name = app.StudentName,
            Origin = app.OriginCountry,
            Flag = app.CountryFlag,
            Program = app.ProgramName,
            Email = app.Email,
            Phone = app.Phone,
            Match = $"{app.MatchScore}%",
            MatchType = app.MatchScore >= 90 ? "high" : "medium",
            Status = app.Status,
            Time = "İndi",
            Initials = app.Initials,
            Color = app.Color,
            CreatedAt = app.AppliedAt
        };

        return Ok(ApiResponse<StudentLeadDto>.SuccessResponse(result, "Müraciət uğurla göndərildi!", 201));
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateLeadStatusDto dto)
    {
        var lead = await _context.StudentApplications.FindAsync(id);
        if (lead == null)
            return NotFound(ApiResponse<StudentLeadDto>.ErrorResponse("Lead not found in Database", 404));

        lead.Status = dto.Status;
        await _context.SaveChangesAsync();

        var result = new StudentLeadDto
        {
            Id = lead.Id,
            UniversityId = lead.UniversityId,
            Name = lead.StudentName,
            Origin = lead.OriginCountry,
            Flag = lead.CountryFlag,
            Program = lead.ProgramName,
            Email = lead.Email,
            Phone = lead.Phone,
            Match = $"{lead.MatchScore}%",
            MatchType = lead.MatchScore >= 90 ? "high" : "medium",
            Status = lead.Status,
            Time = GetRelativeTime(lead.AppliedAt),
            Initials = lead.Initials,
            Color = lead.Color,
            CreatedAt = lead.AppliedAt
        };

        return Ok(ApiResponse<StudentLeadDto>.SuccessResponse(result, "Status updated in Database successfully"));
    }

    private static string GetRelativeTime(DateTime dt)
    {
        var span = DateTime.UtcNow - dt;
        if (span.TotalHours < 1) return $"{Math.Max(1, (int)span.TotalMinutes)} dəqiqə əvvəl";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours} saat əvvəl";
        return $"{(int)span.TotalDays} gün əvvəl";
    }
}
