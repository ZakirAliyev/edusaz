using System.IO;
using System.Threading.Tasks;

namespace Edusaz.Application.Abstracts.Services;

public interface IFileService
{
    Task<string> UploadFileAsync(Stream fileStream, string originalFileName, string folder = "universities");
    bool DeleteFile(string fileRelativePath);
}
