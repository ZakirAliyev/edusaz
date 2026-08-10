using System;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PartnershipsController : ControllerBase
{
    private readonly IPartnershipService _partnershipService;

    public PartnershipsController(IPartnershipService partnershipService)
    {
        _partnershipService = partnershipService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePartnershipApplicationDto dto)
    {
        try
        {
            var result = await _partnershipService.CreatePartnershipApplicationAsync(dto);
            return Ok(ApiResponse<PartnershipApplicationResponseDto>.SuccessResponse(result, "Partnership application submitted successfully", 201));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<PartnershipApplicationResponseDto>.ErrorResponse(ex.Message, 400));
        }
    }
}
