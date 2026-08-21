using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class Review : BaseEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public int Rating { get; set; } // 1-5
    public string Comment { get; set; } = string.Empty;
}
