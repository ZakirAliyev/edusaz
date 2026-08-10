using System;

namespace Edusaz.Application.Dtos;

public class TeamMemberDto
{
    public Guid Id { get; set; }
    public Guid? UniversityId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";

    public bool CanViewPrograms { get; set; } = true;
    public bool CanCreatePrograms { get; set; } = true;
    public bool CanEditPrograms { get; set; } = true;
    public bool CanDeletePrograms { get; set; } = true;

    public bool CanViewScholarships { get; set; } = true;
    public bool CanCreateScholarships { get; set; } = true;
    public bool CanEditScholarships { get; set; } = true;
    public bool CanDeleteScholarships { get; set; } = true;

    public bool CanViewCampaigns { get; set; } = true;
    public bool CanCreateCampaigns { get; set; } = true;
    public bool CanEditCampaigns { get; set; } = true;
    public bool CanDeleteCampaigns { get; set; } = true;

    public bool CanEditProfile { get; set; } = true;
    public DateTime CreatedDate { get; set; }
}

public class CreateTeamMemberDto
{
    public Guid? UniversityId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Admissions Officer";
    public string Status { get; set; } = "Active";

    public bool CanViewPrograms { get; set; } = true;
    public bool CanCreatePrograms { get; set; } = true;
    public bool CanEditPrograms { get; set; } = true;
    public bool CanDeletePrograms { get; set; } = true;

    public bool CanViewScholarships { get; set; } = true;
    public bool CanCreateScholarships { get; set; } = true;
    public bool CanEditScholarships { get; set; } = true;
    public bool CanDeleteScholarships { get; set; } = true;

    public bool CanViewCampaigns { get; set; } = true;
    public bool CanCreateCampaigns { get; set; } = true;
    public bool CanEditCampaigns { get; set; } = true;
    public bool CanDeleteCampaigns { get; set; } = true;

    public bool CanEditProfile { get; set; } = true;
}
