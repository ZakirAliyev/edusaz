using System;
using System.Collections.Generic;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class Scholarship : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;

    public Guid? CountryId { get; set; }
    public Country? CountryRef { get; set; }

    public Guid? UniversityId { get; set; }
    public University? UniversityRef { get; set; }

    public string Status { get; set; } = "Open"; // Open, Closed
    public string Amount { get; set; } = string.Empty; // Full Funding, Full Stipend, €750-€1,200/mo
    public string Deadline { get; set; } = string.Empty;
    public string Eligible { get; set; } = string.Empty;
    public string Places { get; set; } = string.Empty;
    public string ButtonType { get; set; } = "check"; // check, notify

    public ICollection<ScholarshipTranslation> Translations { get; set; } = new List<ScholarshipTranslation>();
}
