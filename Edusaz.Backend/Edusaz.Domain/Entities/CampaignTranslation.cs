using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class CampaignTranslation : BaseEntity
{
    public Guid CampaignId { get; set; }
    public Campaign Campaign { get; set; } = null!;

    public Guid LanguageId { get; set; }
    public Language Language { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
