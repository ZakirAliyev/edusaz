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
public class CountriesController : ControllerBase
{
    private readonly ICountryService _countryService;

    public CountriesController(ICountryService countryService)
    {
        _countryService = countryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string lang = "en")
    {
        var result = await _countryService.GetAllCountriesAsync(lang);
        return Ok(ApiResponse<List<CountryDto>>.SuccessResponse(result));
    }

    [HttpGet("{idOrCode}")]
    public async Task<IActionResult> GetByIdOrCode(string idOrCode, [FromQuery] string lang = "en")
    {
        var result = await _countryService.GetCountryByCodeOrIdAsync(idOrCode, lang);
        if (result == null) return NotFound(ApiResponse<CountryDto>.ErrorResponse("Country not found", 404));
        return Ok(ApiResponse<CountryDto>.SuccessResponse(result));
    }

    [HttpGet("{id}/universities")]
    public async Task<IActionResult> GetUniversities(Guid id, [FromQuery] string lang = "en")
    {
        var result = await _countryService.GetUniversitiesByCountryIdAsync(id, lang);
        return Ok(ApiResponse<List<UniversityDto>>.SuccessResponse(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCountryDto dto)
    {
        try
        {
            var result = await _countryService.CreateCountryAsync(dto);
            return Ok(ApiResponse<CountryDto>.SuccessResponse(result, "Country created successfully", 201));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<CountryDto>.ErrorResponse(ex.Message, 400));
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateCountryDto dto)
    {
        try
        {
            var result = await _countryService.UpdateCountryAsync(id, dto);
            return Ok(ApiResponse<CountryDto>.SuccessResponse(result, "Country updated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<CountryDto>.ErrorResponse(ex.Message, 400));
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _countryService.DeleteCountryAsync(id);
        if (!result) return NotFound(ApiResponse<bool>.ErrorResponse("Country not found", 404));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Country deleted successfully"));
    }
}
