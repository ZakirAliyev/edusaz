using System;
using System.Collections.Generic;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class Country : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string DefaultName { get; set; } = string.Empty;
    public string DefaultLabel { get; set; } = string.Empty;
    public string FlagEmoji { get; set; } = string.Empty;
    public int UniversityCount { get; set; }
    public string AverageCost { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<CountryTranslation> Translations { get; set; } = new List<CountryTranslation>();
    public ICollection<University> Universities { get; set; } = new List<University>();
    public ICollection<Scholarship> Scholarships { get; set; } = new List<Scholarship>();
}
