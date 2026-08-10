using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class ProgramTranslation : BaseEntity
{
    public Guid ProgramId { get; set; }
    public Program Program { get; set; }

    public Guid LanguageId { get; set; }
    public Language Language { get; set; }

    public string Title { get; set; }
    public string Description { get; set; }
}
