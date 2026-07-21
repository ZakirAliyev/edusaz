using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class Language : BaseEntity
{
    public string Code { get; set; } // e.g., "en", "az", "ru"
    public string Name { get; set; } // e.g., "English", "Azerbaijani"
    public bool IsActive { get; set; } = true;
}
