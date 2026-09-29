using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Edusaz.API.Security;
using Edusaz.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgramsController : ControllerBase
{
    private readonly IProgramService _programService;
    private readonly EdusazDbContext _context;

    public ProgramsController(IProgramService programService, EdusazDbContext context)
    {
        _programService = programService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string lang = "en",
        [FromQuery] Guid? countryId = null,
        [FromQuery] string? field = null,
        [FromQuery] string? search = null,
        [FromQuery] Guid? universityId = null)
    {
        try
        {
            var result = await _programService.GetAllProgramsAsync(lang, countryId, field, search, universityId);
            return Ok(ApiResponse<List<ProgramDto>>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<ProgramDto>>.ErrorResponse($"[Programs Error]: {ex.Message} -> {ex.InnerException?.Message}", 500));
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, [FromQuery] string lang = "en")
    {
        try
        {
            var result = await _programService.GetProgramByIdAsync(id, lang);
            if (result == null) return NotFound(ApiResponse<ProgramDto>.ErrorResponse("Program not found", 404));
            return Ok(ApiResponse<ProgramDto>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<ProgramDto>.ErrorResponse($"[Program Detail Error]: {ex.Message}", 500));
        }
    }

    [Authorize(Roles = AccessRoles.UniversityStaff)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProgramDto dto)
    {
        if (!await User.CanManageUniversityAsync(_context, dto.UniversityId)) return Forbid();

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

    [Authorize(Roles = AccessRoles.UniversityStaff)]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateProgramDto dto)
    {
        if (!await CanManageAsync(id) || !await User.CanManageUniversityAsync(_context, dto.UniversityId)) return Forbid();

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

    [Authorize(Roles = AccessRoles.UniversityStaff)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!await CanManageAsync(id)) return Forbid();

        var result = await _programService.DeleteProgramAsync(id);
        if (!result) return NotFound(ApiResponse<bool>.ErrorResponse("Program not found", 404));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Program deleted successfully"));
    }

    /// <summary>SuperAdmin, or the admin of the university this record belongs to.</summary>
    private async Task<bool> CanManageAsync(Guid id)
    {
        if (User.IsSuperAdmin()) return true;
        var universityId = await _context.Programs.Where(x => x.Id == id).Select(x => x.UniversityId).FirstOrDefaultAsync();
        return await User.CanManageUniversityAsync(_context, universityId);
    }
}
