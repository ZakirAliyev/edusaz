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
public class TeamMembersController : ControllerBase
{
    private readonly ITeamMemberService _teamMemberService;

    public TeamMembersController(ITeamMemberService teamMemberService)
    {
        _teamMemberService = teamMemberService;
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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamMemberDto dto)
    {
        var result = await _teamMemberService.CreateTeamMemberAsync(dto);
        return Ok(ApiResponse<TeamMemberDto>.SuccessResponse(result, "Team member created successfully.", 201));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateTeamMemberDto dto)
    {
        var result = await _teamMemberService.UpdateTeamMemberAsync(id, dto);
        return Ok(ApiResponse<TeamMemberDto>.SuccessResponse(result, "Team member updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _teamMemberService.DeleteTeamMemberAsync(id);
        if (!success) return NotFound(ApiResponse<bool>.ErrorResponse("Team member not found.", 404));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Team member deleted successfully."));
    }
}
