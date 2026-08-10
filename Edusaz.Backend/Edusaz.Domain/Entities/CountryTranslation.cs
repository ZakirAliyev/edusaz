using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class CountryTranslation : BaseEntity
{
    public Guid CountryId { get; set; }
    public Country Country { get; set; } = null!;

    public Guid LanguageId { get; set; }
    public Language Language { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
}
