using System;
using System.IO;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Wrappers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IFileService _fileService;

    public UploadController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string folder = "universities")
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<string>.ErrorResponse("Fayl seçilməyib.", 400));
        }

        try
        {
            using var stream = file.OpenReadStream();
            var relativePath = await _fileService.UploadFileAsync(stream, file.FileName, folder);
            
            var scheme = Request.Scheme;
            var host = Request.Host.Value;
            var fullUrl = $"{scheme}://{host}{relativePath}";

            var responseData = new
            {
                fileUrl = fullUrl,
                relativeUrl = relativePath,
                fileName = file.FileName,
                fileSize = file.Length,
                contentType = file.ContentType
            };

            return Ok(ApiResponse<object>.SuccessResponse(responseData, "Fayl uğurla wwwroot qovluğuna yükləndi."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.ErrorResponse($"Yüklənmə xətası: {ex.Message}", 500));
        }
    }
}
