using System;

namespace Edusaz.Application.Dtos;

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid? UniversityId { get; set; }
    public Guid? CourseId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorAvatar { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}

public class CreateReviewDto
{
    public Guid? UniversityId { get; set; }
    public Guid? CourseId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string AuthorAvatar { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public string Comment { get; set; } = string.Empty;
}
