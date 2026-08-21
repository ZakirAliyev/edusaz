using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class UniversityMedia : BaseEntity
{
    public Guid UniversityId { get; set; }
    public string MediaType { get; set; } = "Image"; // "Image" or "Video"
    public string Url { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
}
