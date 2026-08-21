using System;
using System.Collections.Generic;

namespace Edusaz.Application.Dtos;

// ── Instructor Registration / Login ──────────────────────────────────────────

public class InstructorRegisterDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Expertise { get; set; } = string.Empty;
}

public class InstructorLoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// ── Instructor Profile ────────────────────────────────────────────────────────

public class InstructorProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Expertise { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string LinkedIn { get; set; } = string.Empty;
    public string YouTube { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public int TotalStudents { get; set; }
    public double Rating { get; set; }
    public int TotalReviews { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalCourses { get; set; }
}

public class UpdateInstructorProfileDto
{
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? Expertise { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Website { get; set; }
    public string? LinkedIn { get; set; }
    public string? YouTube { get; set; }
}

// ── Course DTOs ────────────────────────────────────────────────────────────────

public class CourseLectureDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public string ResourceUrl { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int Order { get; set; }
    public bool IsFree { get; set; }
    public string LectureType { get; set; } = "Video";
}

public class CourseSectionDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; }
    public List<CourseLectureDto> Lectures { get; set; } = new();
}

public class CourseListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal DiscountPrice { get; set; }
    public bool IsFree { get; set; }
    public string ThumbnailUrl { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public bool IsFeatured { get; set; }
    public int TotalStudents { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public int TotalLectures { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public string InstructorAvatar { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}

public class CourseDetailDto : CourseListDto
{
    public string Description { get; set; } = string.Empty;
    public string WhatYouLearn { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string PreviewVideoUrl { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;
    public List<CourseSectionDto> Sections { get; set; } = new();
    public Dictionary<string, CourseTranslationInputDto> Translations { get; set; } = new();
}

public class CreateCourseDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string WhatYouLearn { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
    public string Language { get; set; } = "az";
    public string Level { get; set; } = "Beginner";
    public decimal Price { get; set; }
    public decimal DiscountPrice { get; set; }
    public string Currency { get; set; } = "AZN";
    public bool IsFree { get; set; }
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string PreviewVideoUrl { get; set; } = string.Empty;
    public string? InstructorName { get; set; }
    public string? BaseLanguageCode { get; set; }
    public bool IsPublished { get; set; } = true;
    public List<CourseLectureDto>? VideoLectures { get; set; }
    public List<CourseSectionDto>? Sections { get; set; }
    public Dictionary<string, CourseTranslationInputDto>? Translations { get; set; }
}

public class UpdateCourseDto : CreateCourseDto
{
}

public class CourseTranslationInputDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string WhatYouLearn { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
}

// ── Analytics ──────────────────────────────────────────────────────────────────

public class InstructorAnalyticsDto
{
    public int TotalCourses { get; set; }
    public int PublishedCourses { get; set; }
    public int TotalStudents { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public List<CourseAnalyticsDto> TopCourses { get; set; } = new();
    public List<MonthlyRevenueDto> MonthlyRevenue { get; set; } = new();
}

public class CourseAnalyticsDto
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int Enrollments { get; set; }
    public decimal Revenue { get; set; }
    public double Rating { get; set; }
}

public class MonthlyRevenueDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Enrollments { get; set; }
}

public class CourseEnrollmentDto
{
    public Guid Id { get; set; }
    public string StudentEmail { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public decimal PricePaid { get; set; }
    public DateTime EnrolledAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public double Progress { get; set; }
}
