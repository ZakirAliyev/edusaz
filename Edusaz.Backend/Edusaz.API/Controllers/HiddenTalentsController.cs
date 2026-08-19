using System;
using System.IO;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HiddenTalentsController : ControllerBase
{
    private readonly IHiddenTalentService _talentService;
    private readonly IWebHostEnvironment _env;

    public HiddenTalentsController(IHiddenTalentService talentService, IWebHostEnvironment env)
    {
        _talentService = talentService;
        _env = env;
    }

    /// <summary>
    /// Public: Submit a hidden talent / idea application
    /// </summary>
    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] CreateHiddenTalentDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Ad və Soyad mütləq daxil edilməlidir.", 400));
            }

            if (string.IsNullOrWhiteSpace(dto.Phone) && string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Əlaqə üçün ən azı telefon nömrəsi və ya e-mail daxil edilməlidir.", 400));
            }

            if (string.IsNullOrWhiteSpace(dto.SkillName))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Bacarığınız və ya istedadınız haqqında qısa məlumat daxil edin.", 400));
            }

            var result = await _talentService.SubmitTalentAsync(dto);
            return Ok(ApiResponse<HiddenTalentDetailDto>.SuccessResponse(result, "Bacarığınız və ideyanız uğurla göndərildi! Sizinlə tezliklə əlaqə saxlayacağıq.", 201));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.ErrorResponse(ex.Message, 400));
        }
    }

    /// <summary>
    /// Public/Admin: Upload audio recording, image, video or document
    /// </summary>
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<string>.ErrorResponse("Fayl seçilməyib.", 400));
        }

        try
        {
            var webRoot = _env.WebRootPath;
            if (string.IsNullOrEmpty(webRoot))
            {
                webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
            }

            var uploadsFolder = Path.Combine(webRoot, "uploads", "talents");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var ext = Path.GetExtension(file.FileName);
            var safeOriginalName = Path.GetFileNameWithoutExtension(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid():N}_{safeOriginalName}{ext}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/talents/{uniqueFileName}";

            var result = new TalentFileUploadResultDto
            {
                FileName = file.FileName,
                FileUrl = fileUrl,
                FileSizeBytes = file.Length,
                FileType = file.ContentType
            };

            return Ok(ApiResponse<TalentFileUploadResultDto>.SuccessResponse(result, "Fayl uğurla yükləndi."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.ErrorResponse($"Fayl yüklənərkən xəta baş verdi: {ex.Message}", 500));
        }
    }

    /// <summary>
    /// Admin: Get all submissions with filters
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search)
    {
        var list = await _talentService.GetAllSubmissionsAsync(status, search);
        return Ok(ApiResponse<object>.SuccessResponse(list));
    }

    /// <summary>
    /// Admin: Get submission detail by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await _talentService.GetSubmissionByIdAsync(id);
        if (item == null)
        {
            return NotFound(ApiResponse<string>.ErrorResponse("Müraciət tapılmadı.", 404));
        }
        return Ok(ApiResponse<HiddenTalentDetailDto>.SuccessResponse(item));
    }

    /// <summary>
    /// Admin: Update status or admin notes
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTalentStatusDto dto)
    {
        var success = await _talentService.UpdateStatusAsync(id, dto);
        if (!success)
        {
            return NotFound(ApiResponse<string>.ErrorResponse("Müraciət tapılmadı.", 404));
        }
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Status uğurla yeniləndi."));
    }

    /// <summary>
    /// Admin: Delete submission
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _talentService.DeleteSubmissionAsync(id);
        if (!success)
        {
            return NotFound(ApiResponse<string>.ErrorResponse("Müraciət tapılmadı.", 404));
        }
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Müraciət silindi."));
    }
}
