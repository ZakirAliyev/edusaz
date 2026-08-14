using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class Instructor : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string DisplayName { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Expertise { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string LinkedIn { get; set; } = string.Empty;
    public string YouTube { get; set; } = string.Empty;

    public bool IsApproved { get; set; } = true;
    public int TotalStudents { get; set; } = 0;
    public double Rating { get; set; } = 0;
    public int TotalReviews { get; set; } = 0;
    public decimal TotalRevenue { get; set; } = 0;

    public ICollection<Course> Courses { get; set; } = new List<Course>();
}
