using System;
using System.IO;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Microsoft.AspNetCore.Hosting;

namespace Edusaz.Infrastructure.Services;

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _env;

    public FileService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string originalFileName, string folder = "universities")
    {
        if (fileStream == null || fileStream.Length == 0)
            throw new ArgumentException("Fayl seçilməyib və ya boşdur.");

        var webRoot = _env.WebRootPath;
        if (string.IsNullOrEmpty(webRoot))
        {
            webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
        }

        var uploadsFolder = Path.Combine(webRoot, "uploads", folder);
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        var safeOriginalName = Path.GetFileNameWithoutExtension(originalFileName)
            .Replace(" ", "_")
            .Replace("-", "_");

        var uniqueFileName = $"{Guid.NewGuid():N}_{safeOriginalName}{ext}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(stream);
        }

        return $"/uploads/{folder}/{uniqueFileName}";
    }

    public bool DeleteFile(string fileRelativePath)
    {
        if (string.IsNullOrEmpty(fileRelativePath)) return false;

        var webRoot = _env.WebRootPath;
        if (string.IsNullOrEmpty(webRoot))
        {
            webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
        }

        var cleanPath = fileRelativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine(webRoot, cleanPath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return true;
        }

        return false;
    }
}
