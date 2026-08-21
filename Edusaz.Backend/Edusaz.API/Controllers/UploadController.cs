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

    [HttpPost("multiple")]
    public async Task<IActionResult> UploadMultiple([FromForm] IFormFileCollection files, [FromQuery] string folder = "universities")
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(ApiResponse<string>.ErrorResponse("Heç bir fayl seçilməyib.", 400));
        }

        try
        {
            var uploadedFiles = new List<object>();
            var scheme = Request.Scheme;
            var host = Request.Host.Value;

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    using var stream = file.OpenReadStream();
                    var relativePath = await _fileService.UploadFileAsync(stream, file.FileName, folder);
                    var fullUrl = $"{scheme}://{host}{relativePath}";
                    
                    uploadedFiles.Add(new
                    {
                        fileUrl = fullUrl,
                        relativeUrl = relativePath,
                        fileName = file.FileName,
                        fileSize = file.Length
                    });
                }
            }

            return Ok(ApiResponse<object>.SuccessResponse(uploadedFiles, $"{uploadedFiles.Count} fayl uğurla wwwroot qovluğuna yükləndi."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.ErrorResponse($"Toplu yüklənmə xətası: {ex.Message}", 500));
        }
    }
}
