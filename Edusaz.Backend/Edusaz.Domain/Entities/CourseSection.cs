using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class CourseSection : BaseEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; } = 0;

    public ICollection<CourseLecture> Lectures { get; set; } = new List<CourseLecture>();
}
