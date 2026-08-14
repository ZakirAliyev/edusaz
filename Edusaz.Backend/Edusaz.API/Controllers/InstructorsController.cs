using System;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InstructorsController : ControllerBase
{
    private readonly IInstructorService _instructorService;

    public InstructorsController(IInstructorService instructorService)
    {
        _instructorService = instructorService;
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] InstructorRegisterDto dto)
    {
        var success = await _instructorService.RegisterInstructorAsync(dto);
        if (success)
            return Ok(ApiResponse<string>.SuccessResponse("Instructor registered successfully."));
        return BadRequest(ApiResponse<string>.ErrorResponse("Registration failed. Email may already be in use."));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] InstructorLoginDto dto)
    {
        var token = await _instructorService.LoginInstructorAsync(dto);
        if (token == null)
            return Unauthorized(ApiResponse<TokenDto>.ErrorResponse("Invalid credentials or not an instructor account.", 401));
        return Ok(ApiResponse<TokenDto>.SuccessResponse(token, "Instructor login successful."));
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile([FromQuery] string? email)
    {
        var targetEmail = email ?? User.Identity?.Name ?? "";
        var profile = await _instructorService.GetProfileAsync(targetEmail);
        if (profile == null)
            return NotFound(ApiResponse<string>.ErrorResponse("Instructor profile not found."));
        return Ok(ApiResponse<InstructorProfileDto>.SuccessResponse(profile));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromQuery] string? email, [FromBody] UpdateInstructorProfileDto dto)
    {
        var targetEmail = email ?? User.Identity?.Name ?? "";
        var updated = await _instructorService.UpdateProfileAsync(targetEmail, dto);
        return Ok(ApiResponse<InstructorProfileDto>.SuccessResponse(updated, "Profile updated successfully."));
    }

    // ── Courses ───────────────────────────────────────────────────────────────

    [HttpGet("my-courses")]
    public async Task<IActionResult> GetMyCourses([FromQuery] string? email)
    {
        var targetEmail = email ?? User.Identity?.Name ?? "";
        var courses = await _instructorService.GetMyCoursesAsync(targetEmail);
        return Ok(ApiResponse<object>.SuccessResponse(courses));
    }

    [HttpGet("courses/{id}")]
    public async Task<IActionResult> GetCourse(Guid id)
    {
        var course = await _instructorService.GetCourseByIdAsync(id);
        if (course == null) return NotFound(ApiResponse<string>.ErrorResponse("Course not found."));
        return Ok(ApiResponse<CourseDetailDto>.SuccessResponse(course));
    }

    [HttpPost("courses")]
    public async Task<IActionResult> CreateCourse([FromQuery] string? email, [FromBody] CreateCourseDto dto)
    {
        var targetEmail = email ?? User.Identity?.Name ?? "";
        var course = await _instructorService.CreateCourseAsync(targetEmail, dto);
        return Ok(ApiResponse<CourseDetailDto>.SuccessResponse(course, "Course created successfully."));
    }

    [HttpPut("courses/{id}")]
    public async Task<IActionResult> UpdateCourse(Guid id, [FromQuery] string? email, [FromBody] UpdateCourseDto dto)
    {
        var targetEmail = email ?? User.Identity?.Name ?? "";
        var course = await _instructorService.UpdateCourseAsync(targetEmail, id, dto);
        if (course == null) return NotFound(ApiResponse<string>.ErrorResponse("Course not found or access denied."));
        return Ok(ApiResponse<CourseDetailDto>.SuccessResponse(course, "Course updated successfully."));
    }

    [HttpDelete("courses/{id}")]
    public async Task<IActionResult> DeleteCourse(Guid id, [FromQuery] string? email)
    {
        var targetEmail = email ?? User.Identity?.Name ?? "";
        var success = await _instructorService.DeleteCourseAsync(targetEmail, id);
        if (!success) return NotFound(ApiResponse<string>.ErrorResponse("Course not found or access denied."));
        return Ok(ApiResponse<string>.SuccessResponse("Course deleted successfully."));
    }

    [HttpPut("courses/{id}/publish")]
    public async Task<IActionResult> PublishCourse(Guid id, [FromQuery] string? email, [FromQuery] bool publish = true)
    {
        var targetEmail = email ?? User.Identity?.Name ?? "";
        var success = await _instructorService.PublishCourseAsync(targetEmail, id, publish);
        if (!success) return NotFound(ApiResponse<string>.ErrorResponse("Course not found or access denied."));
        return Ok(ApiResponse<string>.SuccessResponse(publish ? "Course published." : "Course unpublished."));
    }

    // ── Students & Analytics ──────────────────────────────────────────────────

    [HttpGet("courses/{id}/students")]
    public async Task<IActionResult> GetCourseStudents(Guid id, [FromQuery] string? email)
    {
        var targetEmail = email ?? User.Identity?.Name ?? "";
        var students = await _instructorService.GetCourseStudentsAsync(targetEmail, id);
        return Ok(ApiResponse<object>.SuccessResponse(students));
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics([FromQuery] string? email)
    {
        var targetEmail = email ?? User.Identity?.Name ?? "";
        var analytics = await _instructorService.GetAnalyticsAsync(targetEmail);
        return Ok(ApiResponse<InstructorAnalyticsDto>.SuccessResponse(analytics));
    }
}
