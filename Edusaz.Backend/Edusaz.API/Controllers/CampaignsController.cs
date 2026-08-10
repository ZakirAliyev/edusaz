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
public class CampaignsController : ControllerBase
{
    private readonly ICampaignService _campaignService;

    public CampaignsController(ICampaignService campaignService)
    {
        _campaignService = campaignService;
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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCampaignDto dto)
    {
        var result = await _campaignService.CreateCampaignAsync(dto);
        return Ok(ApiResponse<CampaignDto>.SuccessResponse(result));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateCampaignDto dto)
    {
        var result = await _campaignService.UpdateCampaignAsync(id, dto);
        return Ok(ApiResponse<CampaignDto>.SuccessResponse(result));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _campaignService.DeleteCampaignAsync(id);
        if (!success) return NotFound(ApiResponse<bool>.ErrorResponse("Campaign not found.", 404));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Campaign deleted successfully."));
    }
}
