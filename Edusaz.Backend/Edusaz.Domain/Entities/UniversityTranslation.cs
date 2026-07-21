using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class UniversityTranslation : BaseEntity
{
    public Guid UniversityId { get; set; }
    public University University { get; set; }

    public Guid LanguageId { get; set; }
    public Language Language { get; set; }

    public string Name { get; set; }
    public string Description { get; set; }
    public string City { get; set; }
}
