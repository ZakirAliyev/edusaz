using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UniversitiesController : ControllerBase
{
    private readonly IUniversityService _universityService;

    public UniversitiesController(IUniversityService universityService)
    {
        _universityService = universityService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string lang = "en", [FromQuery] Guid? countryId = null)
    {
        try
        {
            var result = await _universityService.GetAllUniversitiesAsync(lang, countryId);
            return Ok(ApiResponse<List<UniversityDto>>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<UniversityDto>>.ErrorResponse($"[Universities Error]: {ex.Message} -> {ex.InnerException?.Message}", 500));
        }
    }

    [HttpGet("fix-db-schema")]
    public async Task<IActionResult> FixDbSchema([FromServices] Edusaz.Infrastructure.Contexts.EdusazDbContext db)
    {
        try
        {
            await db.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""Universities"" ADD COLUMN IF NOT EXISTS ""Images"" text[] DEFAULT ('{}'::text[]);
                ALTER TABLE ""Universities"" ADD COLUMN IF NOT EXISTS ""VideoUrls"" text[] DEFAULT ('{}'::text[]);
                ALTER TABLE ""Programs"" ALTER COLUMN ""UniversityId"" DROP NOT NULL;
                ALTER TABLE ""Scholarships"" ALTER COLUMN ""UniversityId"" DROP NOT NULL;
            ");
            return Ok(new { success = true, message = "DB schema verified and updated successfully!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, [FromQuery] string lang = "en")
    {
        try
        {
            var result = await _universityService.GetUniversityByIdAsync(id, lang);
            if (result == null) return NotFound(ApiResponse<UniversityDto>.ErrorResponse("University not found", 404));
            return Ok(ApiResponse<UniversityDto>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<UniversityDto>.ErrorResponse($"[University Detail Error]: {ex.Message}", 500));
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUniversityDto dto)
    {
        try
        {
            var result = await _universityService.CreateUniversityAsync(dto);
            return Ok(ApiResponse<UniversityDto>.SuccessResponse(result, "University created successfully", 201));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<UniversityDto>.ErrorResponse(ex.Message, 400));
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateUniversityDto dto)
    {
        try
        {
            var result = await _universityService.UpdateUniversityAsync(id, dto);
            return Ok(ApiResponse<UniversityDto>.SuccessResponse(result, "University updated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<UniversityDto>.ErrorResponse(ex.Message, 400));
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _universityService.DeleteUniversityAsync(id);
        if (!result) return NotFound(ApiResponse<bool>.ErrorResponse("University not found", 404));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "University deleted successfully"));
    }

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var result = await _universityService.ApproveUniversityAsync(id);
        if (!result) return NotFound(ApiResponse<bool>.ErrorResponse("University not found", 404));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "University approved successfully"));
    }
}
