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
public class TeamMembersController : ControllerBase
{
    private readonly ITeamMemberService _teamMemberService;
    private readonly EdusazDbContext _context;

    public TeamMembersController(ITeamMemberService teamMemberService, EdusazDbContext context)
    {
        _teamMemberService = teamMemberService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? universityId = null)
    {
        var result = await _teamMemberService.GetTeamMembersAsync(universityId);
        return Ok(ApiResponse<List<TeamMemberDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _teamMemberService.GetByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<TeamMemberDto>.ErrorResponse("Team member not found.", 404));
        return Ok(ApiResponse<TeamMemberDto>.SuccessResponse(result));
    }

    [Authorize(Roles = AccessRoles.UniversityStaff)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamMemberDto dto)
    {
        if (!await User.CanManageUniversityAsync(_context, dto.UniversityId)) return Forbid();

        var result = await _teamMemberService.CreateTeamMemberAsync(dto);
        return Ok(ApiResponse<TeamMemberDto>.SuccessResponse(result, "Team member created successfully.", 201));
    }

    [Authorize(Roles = AccessRoles.UniversityStaff)]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateTeamMemberDto dto)
    {
        if (!await CanManageAsync(id) || !await User.CanManageUniversityAsync(_context, dto.UniversityId)) return Forbid();

        var result = await _teamMemberService.UpdateTeamMemberAsync(id, dto);
        return Ok(ApiResponse<TeamMemberDto>.SuccessResponse(result, "Team member updated successfully."));
    }

    [Authorize(Roles = AccessRoles.UniversityStaff)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!await CanManageAsync(id)) return Forbid();

        var success = await _teamMemberService.DeleteTeamMemberAsync(id);
        if (!success) return NotFound(ApiResponse<bool>.ErrorResponse("Team member not found.", 404));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Team member deleted successfully."));
    }

    /// <summary>SuperAdmin, or the admin of the university this record belongs to.</summary>
    private async Task<bool> CanManageAsync(Guid id)
    {
        if (User.IsSuperAdmin()) return true;
        var universityId = await _context.TeamMembers.Where(x => x.Id == id).Select(x => x.UniversityId).FirstOrDefaultAsync();
        return await User.CanManageUniversityAsync(_context, universityId);
    }
}
