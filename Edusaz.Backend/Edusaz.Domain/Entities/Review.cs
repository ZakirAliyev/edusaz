using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class Review : BaseEntity
{
    public Guid? UniversityId { get; set; }
    public University? University { get; set; }

    public Guid? CourseId { get; set; }
    public Course? Course { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public string AuthorName { get; set; } = string.Empty;
    public string AuthorAvatar { get; set; } = string.Empty;
    public int Rating { get; set; } = 5; // 1-5
    public string Comment { get; set; } = string.Empty;
}
