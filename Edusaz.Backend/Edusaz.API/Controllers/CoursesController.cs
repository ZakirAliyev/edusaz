using System;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly IInstructorService _instructorService;

    public CoursesController(IInstructorService instructorService)
    {
        _instructorService = instructorService;
    }

    /// <summary>
    /// Public: Get all published courses
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetCourses(
        [FromQuery] string? lang,
        [FromQuery] string? category,
        [FromQuery] string? search)
    {
        var courses = await _instructorService.GetPublishedCoursesAsync(lang, category, search);
        return Ok(ApiResponse<object>.SuccessResponse(courses));
    }

    /// <summary>
    /// Public: Get published course by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourse(Guid id, [FromQuery] string lang = "en")
    {
        var course = await _instructorService.GetPublishedCourseByIdAsync(id, lang);
        if (course == null)
            return NotFound(ApiResponse<string>.ErrorResponse("Course not found."));
        return Ok(ApiResponse<CourseDetailDto>.SuccessResponse(course));
    }
}
