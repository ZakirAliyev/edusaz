using System;

namespace Edusaz.Application.Dtos;

public class CreatePartnershipApplicationDto
{
    public string InstitutionName { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Country { get; set; }
    public string? Message { get; set; }
}

public class PartnershipApplicationResponseDto
{
    public Guid Id { get; set; }
    public string InstitutionName { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool ApplicantEmailSent { get; set; } = true;
    public bool AdminEmailSent { get; set; } = true;
    public string AdminEmail { get; set; } = "bd7bl34lt@code.edu.az";
    public string Message { get; set; } = string.Empty;
}
