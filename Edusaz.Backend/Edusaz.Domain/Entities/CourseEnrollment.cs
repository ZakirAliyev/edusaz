using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class CourseEnrollment : BaseEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public string StudentEmail { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public decimal PricePaid { get; set; } = 0;
    public string Currency { get; set; } = "USD";
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Active"; // Active | Completed | Refunded
    public double Progress { get; set; } = 0; // 0-100 percent
}
