using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class ScholarshipTranslation : BaseEntity
{
    public Guid ScholarshipId { get; set; }
    public Scholarship Scholarship { get; set; } = null!;

    public Guid LanguageId { get; set; }
    public Language Language { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Eligible { get; set; } = string.Empty;
}
