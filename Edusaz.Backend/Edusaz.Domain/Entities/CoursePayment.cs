using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class CoursePayment : BaseEntity
{
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }

    public string UserEmail { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;

    // ePoint transaction info
    public string EpointOrderId { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;

    public decimal Amount { get; set; } = 0;
    public string Currency { get; set; } = "AZN";

    // Status: Pending | Paid | Refunded | Cancelled | Failed
    public string Status { get; set; } = "Pending";

    // RefundStatus: None | Requested | Processing | Refunded | Rejected
    public string RefundStatus { get; set; } = "None";

    public DateTime? PaidAt { get; set; }
    public DateTime? RefundRequestedAt { get; set; }
    public DateTime? RefundedAt { get; set; }
    public string? RefundNote { get; set; }
}
