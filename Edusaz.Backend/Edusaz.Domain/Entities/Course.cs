using System;
using Edusaz.Domain.Entities.Common;

namespace Edusaz.Domain.Entities;

public class Course : BaseEntity
{
    public Guid InstructorId { get; set; }
    public Instructor Instructor { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string WhatYouLearn { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
    public string Language { get; set; } = "en";
    public string Level { get; set; } = "Beginner"; // Beginner | Intermediate | Advanced | All

    public decimal Price { get; set; } = 0;
    public decimal DiscountPrice { get; set; } = 0;
    public string Currency { get; set; } = "USD";
    public bool IsFree { get; set; } = false;

    public string ThumbnailUrl { get; set; } = string.Empty;
    public string PreviewVideoUrl { get; set; } = string.Empty;

    public bool IsPublished { get; set; } = false;
    public bool IsApproved { get; set; } = true;
    public bool IsFeatured { get; set; } = false;

    public int TotalStudents { get; set; } = 0;
    public double Rating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;
    public int TotalLectures { get; set; } = 0;
    public int TotalDurationMinutes { get; set; } = 0;

    public ICollection<CourseSection> Sections { get; set; } = new List<CourseSection>();
    public ICollection<CourseTranslation> Translations { get; set; } = new List<CourseTranslation>();
    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
}
