using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly EdusazDbContext _context;

    public ReviewsController(EdusazDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? universityId = null, [FromQuery] Guid? courseId = null)
    {
        var query = _context.Reviews.AsQueryable();

        if (universityId.HasValue && universityId.Value != Guid.Empty)
        {
            query = query.Where(r => r.UniversityId == universityId.Value && !r.IsDeleted);
        }
        else if (courseId.HasValue && courseId.Value != Guid.Empty)
        {
            query = query.Where(r => r.CourseId == courseId.Value && !r.IsDeleted);
        }
        else
        {
            query = query.Where(r => !r.IsDeleted);
        }

        var reviews = await query
            .OrderByDescending(r => r.CreatedDate)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                UniversityId = r.UniversityId,
                CourseId = r.CourseId,
                AuthorName = !string.IsNullOrEmpty(r.AuthorName) ? r.AuthorName : "Anonim İstifadəçi",
                AuthorAvatar = r.AuthorAvatar ?? "",
                Rating = r.Rating > 0 ? r.Rating : 5,
                Comment = r.Comment ?? "",
                CreatedDate = r.CreatedDate
            })
            .ToListAsync();

        return Ok(ApiResponse<List<ReviewDto>>.SuccessResponse(reviews));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Comment))
        {
            return BadRequest(ApiResponse<ReviewDto>.ErrorResponse("Rəy mətni daxil edilməlidir.", 400));
        }

        var review = new Review
        {
            Id = Guid.NewGuid(),
            UniversityId = dto.UniversityId,
            CourseId = dto.CourseId,
            AuthorName = !string.IsNullOrWhiteSpace(dto.AuthorName) ? dto.AuthorName.Trim() : "Tələbə",
            AuthorAvatar = dto.AuthorAvatar ?? "",
            Rating = Math.Clamp(dto.Rating, 1, 5),
            Comment = dto.Comment.Trim(),
            CreatedDate = DateTime.UtcNow,
            IsDeleted = false
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        var result = new ReviewDto
        {
            Id = review.Id,
            UniversityId = review.UniversityId,
            CourseId = review.CourseId,
            AuthorName = review.AuthorName,
            AuthorAvatar = review.AuthorAvatar,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedDate = review.CreatedDate
        };

        return Ok(ApiResponse<ReviewDto>.SuccessResponse(result, "Rəyiniz uğurla əlavə edildi!", 201));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            return NotFound(ApiResponse<bool>.ErrorResponse("Review tapılmadı", 404));

        review.IsDeleted = true;
        review.DeletedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Rəy silindi"));
    }
}
