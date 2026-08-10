using System;
using System.Collections.Generic;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class Program : BaseEntity
{
    public Guid UniversityId { get; set; }
    public University University { get; set; }

    public string DegreeLevel { get; set; } // Bachelor, Master, PhD, Diploma
    public string FieldOfStudy { get; set; }
    public string Duration { get; set; } // e.g. "4 Years"
    public string TuitionFee { get; set; } // e.g. "$5,000/yr"
    public string LanguageOfInstruction { get; set; }
    public string StudyMode { get; set; } // Full-time, Part-time, Online
    public string EntryRequirements { get; set; }
    public string ApplicationDeadline { get; set; }

    public ICollection<ProgramTranslation> Translations { get; set; } = new List<ProgramTranslation>();
}
