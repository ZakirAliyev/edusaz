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
public class UniversitiesController : ControllerBase
{
    private readonly IUniversityService _universityService;

    public UniversitiesController(IUniversityService universityService)
    {
        _universityService = universityService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string lang = "en")
    {
        var result = await _universityService.GetAllUniversitiesAsync(lang);
        return Ok(ApiResponse<List<UniversityDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, [FromQuery] string lang = "en")
    {
        var result = await _universityService.GetUniversityByIdAsync(id, lang);
        if (result == null) return NotFound(ApiResponse<UniversityDto>.ErrorResponse("University not found", 404));
        return Ok(ApiResponse<UniversityDto>.SuccessResponse(result));
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
}
