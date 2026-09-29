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
public class CampaignsController : ControllerBase
{
    private readonly ICampaignService _campaignService;
    private readonly EdusazDbContext _context;

    public CampaignsController(ICampaignService campaignService, EdusazDbContext context)
    {
        _campaignService = campaignService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string lang = "en", [FromQuery] Guid? universityId = null)
    {
        var result = await _campaignService.GetAllCampaignsAsync(lang, universityId);
        return Ok(ApiResponse<List<CampaignDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, [FromQuery] string lang = "en")
    {
        var result = await _campaignService.GetCampaignByIdAsync(id, lang);
        if (result == null) return NotFound(ApiResponse<CampaignDto>.ErrorResponse("Campaign not found.", 404));
        return Ok(ApiResponse<CampaignDto>.SuccessResponse(result));
    }

    [Authorize(Roles = AccessRoles.UniversityStaff)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCampaignDto dto)
    {
        if (!await User.CanManageUniversityAsync(_context, dto.UniversityId)) return Forbid();

        var result = await _campaignService.CreateCampaignAsync(dto);
        return Ok(ApiResponse<CampaignDto>.SuccessResponse(result));
    }

    [Authorize(Roles = AccessRoles.UniversityStaff)]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateCampaignDto dto)
    {
        if (!await CanManageAsync(id) || !await User.CanManageUniversityAsync(_context, dto.UniversityId)) return Forbid();

        var result = await _campaignService.UpdateCampaignAsync(id, dto);
        return Ok(ApiResponse<CampaignDto>.SuccessResponse(result));
    }

    [Authorize(Roles = AccessRoles.UniversityStaff)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!await CanManageAsync(id)) return Forbid();

        var success = await _campaignService.DeleteCampaignAsync(id);
        if (!success) return NotFound(ApiResponse<bool>.ErrorResponse("Campaign not found.", 404));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Campaign deleted successfully."));
    }

    /// <summary>SuperAdmin, or the admin of the university this record belongs to.</summary>
    private async Task<bool> CanManageAsync(Guid id)
    {
        if (User.IsSuperAdmin()) return true;
        var universityId = await _context.Campaigns.Where(x => x.Id == id).Select(x => x.UniversityId).FirstOrDefaultAsync();
        return await User.CanManageUniversityAsync(_context, universityId);
    }
}
