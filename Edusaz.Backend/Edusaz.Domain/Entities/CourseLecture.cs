using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class CourseLecture : BaseEntity
{
    public Guid SectionId { get; set; }
    public CourseSection Section { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public string ResourceUrl { get; set; } = string.Empty;
    public int DurationMinutes { get; set; } = 0;
    public int Order { get; set; } = 0;
    public bool IsFree { get; set; } = false;
    public string LectureType { get; set; } = "Video"; // Video | Article | Quiz
}
