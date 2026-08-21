using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScholarshipsController : ControllerBase
{
    private readonly IScholarshipService _scholarshipService;

    public ScholarshipsController(IScholarshipService scholarshipService)
    {
        _scholarshipService = scholarshipService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string lang = "en", [FromQuery] Guid? countryId = null, [FromQuery] Guid? universityId = null)
    {
        try
        {
            var result = await _scholarshipService.GetAllScholarshipsAsync(lang, countryId, universityId);
            return Ok(ApiResponse<List<ScholarshipDto>>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<ScholarshipDto>>.ErrorResponse($"[Scholarships Error]: {ex.Message} -> {ex.InnerException?.Message}", 500));
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, [FromQuery] string lang = "en")
    {
        try
        {
            var result = await _scholarshipService.GetScholarshipByIdAsync(id, lang);
            if (result == null) return NotFound(ApiResponse<ScholarshipDto>.ErrorResponse("Scholarship not found", 404));
            return Ok(ApiResponse<ScholarshipDto>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<ScholarshipDto>.ErrorResponse($"[Scholarship Detail Error]: {ex.Message}", 500));
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateScholarshipDto dto)
    {
        try
        {
            var result = await _scholarshipService.CreateScholarshipAsync(dto);
            return Ok(ApiResponse<ScholarshipDto>.SuccessResponse(result, "Scholarship created successfully", 201));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<ScholarshipDto>.ErrorResponse(ex.Message, 400));
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateScholarshipDto dto)
    {
        try
        {
            var result = await _scholarshipService.UpdateScholarshipAsync(id, dto);
            return Ok(ApiResponse<ScholarshipDto>.SuccessResponse(result, "Scholarship updated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<ScholarshipDto>.ErrorResponse(ex.Message, 400));
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _scholarshipService.DeleteScholarshipAsync(id);
        if (!result) return NotFound(ApiResponse<bool>.ErrorResponse("Scholarship not found", 404));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Scholarship deleted successfully"));
    }

    [HttpPost("check-eligibility")]
    public async Task<IActionResult> CheckEligibility([FromBody] CheckEligibilityRequestDto dto)
    {
        try
        {
            var result = await _scholarshipService.CheckEligibilityAsync(dto);
            return Ok(ApiResponse<CheckEligibilityResponseDto>.SuccessResponse(result, "Eligibility evaluated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<CheckEligibilityResponseDto>.ErrorResponse(ex.Message, 400));
        }
    }

    [HttpPost("subscribe-notification")]
    public async Task<IActionResult> SubscribeNotification([FromBody] SubscribeNotificationRequestDto dto)
    {
        try
        {
            var result = await _scholarshipService.SubscribeNotificationAsync(dto);
            return Ok(ApiResponse<bool>.SuccessResponse(result, "Notification subscription saved successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<bool>.ErrorResponse(ex.Message, 400));
        }
    }
}
