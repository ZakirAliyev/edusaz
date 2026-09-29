using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
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

    /// <summary>
    /// Files are served back from our own domain, so only inert media/document types are accepted
    /// (no .html/.svg/.js that a browser would execute).
    /// </summary>
    public static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif",
        ".mp4", ".webm", ".mov",
        ".mp3", ".wav", ".ogg", ".m4a",
        ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".zip", ".rar"
    };

    public static bool IsAllowedExtension(string? fileName) =>
        AllowedExtensions.Contains(Path.GetExtension(fileName ?? ""));

    /// <summary>Keeps a client-supplied name to letters, digits and underscores.</summary>
    public static string SafeName(string? value, string fallback)
    {
        var cleaned = Regex.Replace(value ?? "", @"[^A-Za-z0-9_]", "_").Trim('_');
        if (cleaned.Length > 60) cleaned = cleaned[..60];
        return string.IsNullOrEmpty(cleaned) ? fallback : cleaned;
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

        if (!IsAllowedExtension(originalFileName))
            throw new ArgumentException("Bu fayl növü dəstəklənmir.");

        // The folder comes from the query string: never let it climb out of /uploads.
        folder = SafeName(folder?.ToLowerInvariant(), "misc");
        var uploadsFolder = Path.Combine(webRoot, "uploads", folder);
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        var safeOriginalName = SafeName(Path.GetFileNameWithoutExtension(originalFileName), "file");

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
