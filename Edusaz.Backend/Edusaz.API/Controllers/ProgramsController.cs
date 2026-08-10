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
public class ProgramsController : ControllerBase
{
    private readonly IProgramService _programService;

    public ProgramsController(IProgramService programService)
    {
        _programService = programService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string lang = "en",
        [FromQuery] Guid? countryId = null,
        [FromQuery] string? field = null,
        [FromQuery] string? search = null,
        [FromQuery] Guid? universityId = null)
    {
        var result = await _programService.GetAllProgramsAsync(lang, countryId, field, search, universityId);
        return Ok(ApiResponse<List<ProgramDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, [FromQuery] string lang = "en")
    {
        var result = await _programService.GetProgramByIdAsync(id, lang);
        if (result == null) return NotFound(ApiResponse<ProgramDto>.ErrorResponse("Program not found", 404));
        return Ok(ApiResponse<ProgramDto>.SuccessResponse(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProgramDto dto)
    {
        try
        {
            var result = await _programService.CreateProgramAsync(dto);
            return Ok(ApiResponse<ProgramDto>.SuccessResponse(result, "Program created successfully", 201));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<ProgramDto>.ErrorResponse(ex.Message, 400));
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateProgramDto dto)
    {
        try
        {
            var result = await _programService.UpdateProgramAsync(id, dto);
            return Ok(ApiResponse<ProgramDto>.SuccessResponse(result, "Program updated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<ProgramDto>.ErrorResponse(ex.Message, 400));
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _programService.DeleteProgramAsync(id);
        if (!result) return NotFound(ApiResponse<bool>.ErrorResponse("Program not found", 404));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Program deleted successfully"));
    }
}
