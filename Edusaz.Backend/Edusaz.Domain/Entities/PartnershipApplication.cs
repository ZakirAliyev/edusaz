using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class PartnershipApplication : BaseEntity
{
    public string InstitutionName { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Country { get; set; }
    public string? Message { get; set; }
    public bool IsApplicantNotified { get; set; } = true;
    public bool IsAdminNotified { get; set; } = true;
}
