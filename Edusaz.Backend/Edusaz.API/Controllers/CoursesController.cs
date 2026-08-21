using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.AI;
using Edusaz.Application.Abstracts.Repositories.Languages;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Application.Wrappers;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly EdusazDbContext _context;
    private readonly ITranslationAIService _translationAiService;
    private readonly ILanguageReadRepository _languageReadRepository;
    private readonly UserManager<User> _userManager;

    public CoursesController(
        EdusazDbContext context,
        ITranslationAIService translationAiService,
        ILanguageReadRepository languageReadRepository,
        UserManager<User> userManager)
    {
        _context = context;
        _translationAiService = translationAiService;
        _languageReadRepository = languageReadRepository;
        _userManager = userManager;
    }

    /// <summary>
    /// Get courses with optional language translation, category, and search filter
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetCourses(
        [FromQuery] string? lang = "az",
        [FromQuery] string? category = null,
        [FromQuery] string? search = null)
    {
        var query = _context.Courses
            .Include(c => c.Instructor).ThenInclude(i => i.User)
            .Include(c => c.Translations)
            .Include(c => c.Enrollments)
            .Include(c => c.Sections.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.Lectures.Where(l => !l.IsDeleted))
            .Where(c => !c.IsDeleted)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category) && category != "All" && category != "Hamısı")
        {
            query = query.Where(c => c.Category.ToLower() == category.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(s) || 
                                     c.ShortDescription.ToLower().Contains(s) ||
                                     c.Category.ToLower().Contains(s) ||
                                     (c.Instructor != null && c.Instructor.DisplayName.ToLower().Contains(s)));
        }

        var list = await query.OrderByDescending(c => c.CreatedDate).ToListAsync();

        var dtos = list.Select(c =>
        {
            string title = c.Title;
            string shortDesc = c.ShortDescription;

            if (!string.IsNullOrEmpty(lang))
            {
                var trans = c.Translations.FirstOrDefault(t => t.LanguageCode == lang);
                if (trans != null)
                {
                    if (!string.IsNullOrWhiteSpace(trans.Title)) title = trans.Title;
                    if (!string.IsNullOrWhiteSpace(trans.ShortDescription)) shortDesc = trans.ShortDescription;
                }
            }

            int totalLectures = c.Sections?.Sum(s => s.Lectures?.Count ?? 0) ?? c.TotalLectures;

            return new CourseListDto
            {
                Id = c.Id,
                Title = title,
                ShortDescription = shortDesc,
                Category = c.Category,
                Level = c.Level,
                Language = c.Language,
                Price = c.Price,
                DiscountPrice = c.DiscountPrice,
                IsFree = c.IsFree,
                ThumbnailUrl = c.ThumbnailUrl,
                IsPublished = c.IsPublished,
                IsFeatured = c.IsFeatured,
                TotalStudents = c.Enrollments?.Count ?? c.TotalStudents,
                Rating = c.Rating > 0 ? c.Rating : 5.0,
                ReviewCount = c.ReviewCount,
                TotalLectures = totalLectures,
                InstructorName = !string.IsNullOrWhiteSpace(c.Instructor?.DisplayName) 
                    ? c.Instructor.DisplayName 
                    : (c.Instructor?.User != null ? $"{c.Instructor.User.FirstName} {c.Instructor.User.LastName}".Trim() : "EduSaz Academy"),
                InstructorAvatar = !string.IsNullOrWhiteSpace(c.Instructor?.AvatarUrl) ? c.Instructor.AvatarUrl : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                CreatedDate = c.CreatedDate
            };
        }).ToList();

        return Ok(ApiResponse<List<CourseListDto>>.SuccessResponse(dtos));
    }

    /// <summary>
    /// Get course details by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourse(Guid id, [FromQuery] string? lang = "az")
    {
        var course = await _context.Courses
            .Include(c => c.Instructor).ThenInclude(i => i.User)
            .Include(c => c.Translations)
            .Include(c => c.Enrollments)
            .Include(c => c.Sections.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.Lectures.Where(l => !l.IsDeleted))
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (course == null)
            return NotFound(ApiResponse<string>.ErrorResponse("Kurs tapılmadı.", 404));

        string title = course.Title;
        string desc = course.Description;
        string shortDesc = course.ShortDescription;
        string whatYouLearn = course.WhatYouLearn;
        string requirements = course.Requirements;

        if (!string.IsNullOrEmpty(lang))
        {
            var trans = course.Translations.FirstOrDefault(t => t.LanguageCode == lang);
            if (trans != null)
            {
                if (!string.IsNullOrWhiteSpace(trans.Title)) title = trans.Title;
                if (!string.IsNullOrWhiteSpace(trans.Description)) desc = trans.Description;
                if (!string.IsNullOrWhiteSpace(trans.ShortDescription)) shortDesc = trans.ShortDescription;
                if (!string.IsNullOrWhiteSpace(trans.WhatYouLearn)) whatYouLearn = trans.WhatYouLearn;
                if (!string.IsNullOrWhiteSpace(trans.Requirements)) requirements = trans.Requirements;
            }
        }

        var translationDict = course.Translations.ToDictionary(
            t => t.LanguageCode,
            t => new CourseTranslationInputDto
            {
                Title = t.Title,
                Description = t.Description,
                ShortDescription = t.ShortDescription,
                WhatYouLearn = t.WhatYouLearn,
                Requirements = t.Requirements
            }
        );

        int totalLectures = course.Sections?.Sum(s => s.Lectures?.Count ?? 0) ?? course.TotalLectures;

        var dto = new CourseDetailDto
        {
            Id = course.Id,
            Title = title,
            Description = desc,
            ShortDescription = shortDesc,
            WhatYouLearn = whatYouLearn,
            Requirements = requirements,
            Category = course.Category,
            SubCategory = course.SubCategory,
            Tags = course.Tags,
            Level = course.Level,
            Language = course.Language,
            Price = course.Price,
            DiscountPrice = course.DiscountPrice,
            IsFree = course.IsFree,
            ThumbnailUrl = course.ThumbnailUrl,
            PreviewVideoUrl = course.PreviewVideoUrl,
            IsPublished = course.IsPublished,
            IsFeatured = course.IsFeatured,
            TotalStudents = course.Enrollments?.Count ?? course.TotalStudents,
            Rating = course.Rating > 0 ? course.Rating : 5.0,
            ReviewCount = course.ReviewCount,
            TotalLectures = totalLectures,
            InstructorName = !string.IsNullOrWhiteSpace(course.Instructor?.DisplayName) 
                ? course.Instructor.DisplayName 
                : (course.Instructor?.User != null ? $"{course.Instructor.User.FirstName} {course.Instructor.User.LastName}".Trim() : "EduSaz Academy"),
            InstructorAvatar = !string.IsNullOrWhiteSpace(course.Instructor?.AvatarUrl) ? course.Instructor.AvatarUrl : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            CreatedDate = course.CreatedDate,
            Translations = translationDict,
            Sections = course.Sections
                .OrderBy(s => s.Order)
                .Select(s => new CourseSectionDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Description = s.Description,
                    Order = s.Order,
                    Lectures = s.Lectures
                        .OrderBy(l => l.Order)
                        .Select(l => new CourseLectureDto
                        {
                            Id = l.Id,
                            Title = l.Title,
                            Description = l.Description,
                            VideoUrl = l.VideoUrl,
                            ResourceUrl = l.ResourceUrl,
                            DurationMinutes = l.DurationMinutes,
                            Order = l.Order,
                            IsFree = l.IsFree,
                            LectureType = l.LectureType
                        }).ToList()
                }).ToList()
        };

        return Ok(ApiResponse<CourseDetailDto>.SuccessResponse(dto));
    }

    /// <summary>
    /// Create new course with sections, video lectures and 31-language auto-translation
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(ApiResponse<string>.ErrorResponse("Kursun adı mütləqdir.", 400));

        // 1. Ensure instructor exists
        var instructor = await _context.Instructors.FirstOrDefaultAsync(i => !i.IsDeleted);
        if (instructor == null)
        {
            var user = await _userManager.FindByEmailAsync("superadmin@edusaz.com") ?? await _userManager.Users.FirstOrDefaultAsync();
            if (user == null)
            {
                user = new User
                {
                    UserName = "admin@edusaz.com",
                    Email = "admin@edusaz.com",
                    FirstName = "EduSaz",
                    LastName = "Academy"
                };
                await _userManager.CreateAsync(user, "Admin12345!");
            }

            instructor = new Instructor
            {
                UserId = user.Id,
                DisplayName = !string.IsNullOrWhiteSpace(dto.InstructorName) ? dto.InstructorName : "EduSaz Academy",
                Bio = "Rəsmi EduSaz Tədris Mərkəzi",
                Expertise = "Təhsil & Texnologiya",
                IsApproved = true
            };
            _context.Instructors.Add(instructor);
            await _context.SaveChangesAsync();
        }
        else if (!string.IsNullOrWhiteSpace(dto.InstructorName) && instructor.DisplayName != dto.InstructorName)
        {
            instructor.DisplayName = dto.InstructorName;
        }

        var course = new Course
        {
            InstructorId = instructor.Id,
            Title = dto.Title.Trim(),
            Description = dto.Description ?? string.Empty,
            ShortDescription = dto.ShortDescription ?? string.Empty,
            WhatYouLearn = dto.WhatYouLearn ?? string.Empty,
            Requirements = dto.Requirements ?? string.Empty,
            Category = !string.IsNullOrWhiteSpace(dto.Category) ? dto.Category.Trim() : "Ümumi Təhsil",
            SubCategory = dto.SubCategory ?? string.Empty,
            Tags = dto.Tags ?? string.Empty,
            Language = dto.Language ?? "az",
            Level = dto.Level ?? "Bütün Səviyyələr",
            Price = dto.Price,
            DiscountPrice = dto.DiscountPrice,
            Currency = dto.Currency ?? "AZN",
            IsFree = dto.IsFree || dto.Price == 0,
            ThumbnailUrl = dto.ThumbnailUrl ?? string.Empty,
            PreviewVideoUrl = dto.PreviewVideoUrl ?? string.Empty,
            IsPublished = dto.IsPublished,
            IsApproved = true,
            Rating = 5.0,
            ReviewCount = 1
        };

        // Add Lectures / Sections
        var section = new CourseSection
        {
            Title = "1. Kurs Dərsləri və Video Dərslikləri",
            Description = "Bütün video dərslər və materiallar",
            Order = 1
        };

        if (dto.VideoLectures != null && dto.VideoLectures.Any())
        {
            int order = 1;
            foreach (var vl in dto.VideoLectures)
            {
                section.Lectures.Add(new CourseLecture
                {
                    Title = !string.IsNullOrWhiteSpace(vl.Title) ? vl.Title : $"Dərs {order}",
                    Description = vl.Description ?? string.Empty,
                    VideoUrl = vl.VideoUrl ?? string.Empty,
                    ResourceUrl = vl.ResourceUrl ?? string.Empty,
                    DurationMinutes = vl.DurationMinutes > 0 ? vl.DurationMinutes : 15,
                    Order = order++,
                    IsFree = vl.IsFree,
                    LectureType = "Video"
                });
            }
            course.Sections.Add(section);
            course.TotalLectures = section.Lectures.Count;
            course.TotalDurationMinutes = section.Lectures.Sum(l => l.DurationMinutes);
        }
        else if (dto.Sections != null && dto.Sections.Any())
        {
            int sOrder = 1;
            foreach (var sDto in dto.Sections)
            {
                var s = new CourseSection
                {
                    Title = sDto.Title,
                    Description = sDto.Description,
                    Order = sOrder++
                };
                int lOrder = 1;
                foreach (var lDto in sDto.Lectures)
                {
                    s.Lectures.Add(new CourseLecture
                    {
                        Title = lDto.Title,
                        Description = lDto.Description,
                        VideoUrl = lDto.VideoUrl,
                        ResourceUrl = lDto.ResourceUrl,
                        DurationMinutes = lDto.DurationMinutes > 0 ? lDto.DurationMinutes : 15,
                        Order = lOrder++,
                        IsFree = lDto.IsFree,
                        LectureType = lDto.LectureType ?? "Video"
                    });
                }
                course.Sections.Add(s);
            }
            course.TotalLectures = course.Sections.Sum(s => s.Lectures.Count);
            course.TotalDurationMinutes = course.Sections.Sum(s => s.Lectures.Sum(l => l.DurationMinutes));
        }

        // Add 31 Languages Translations
        var languages = await _languageReadRepository.GetAllAsync(x => x.IsActive && !x.IsDeleted);
        var baseLangCode = dto.BaseLanguageCode ?? "az";

        // Base Translation
        course.Translations.Add(new CourseTranslation
        {
            LanguageCode = baseLangCode,
            Title = course.Title,
            Description = course.Description,
            ShortDescription = course.ShortDescription,
            WhatYouLearn = course.WhatYouLearn,
            Requirements = course.Requirements
        });

        // 31-Language Auto Translation
        foreach (var l in languages.Where(x => x.Code != baseLangCode))
        {
            try
            {
                string transTitle = await _translationAiService.TranslateAsync(course.Title, l.Name);
                string transDesc = !string.IsNullOrWhiteSpace(course.Description)
                    ? await _translationAiService.TranslateAsync(course.Description, l.Name)
                    : string.Empty;

                course.Translations.Add(new CourseTranslation
                {
                    LanguageCode = l.Code,
                    Title = !string.IsNullOrWhiteSpace(transTitle) ? transTitle : course.Title,
                    Description = !string.IsNullOrWhiteSpace(transDesc) ? transDesc : course.Description,
                    ShortDescription = course.ShortDescription,
                    WhatYouLearn = course.WhatYouLearn,
                    Requirements = course.Requirements
                });
            }
            catch
            {
                course.Translations.Add(new CourseTranslation
                {
                    LanguageCode = l.Code,
                    Title = course.Title,
                    Description = course.Description,
                    ShortDescription = course.ShortDescription,
                    WhatYouLearn = course.WhatYouLearn,
                    Requirements = course.Requirements
                });
            }
        }

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return await GetCourse(course.Id, baseLangCode);
    }

    /// <summary>
    /// Update existing course with video lectures and 31-language auto-translation
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] UpdateCourseDto dto)
    {
        var course = await _context.Courses
            .Include(c => c.Instructor)
            .Include(c => c.Translations)
            .Include(c => c.Sections).ThenInclude(s => s.Lectures)
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (course == null)
            return NotFound(ApiResponse<string>.ErrorResponse("Kurs tapılmadı.", 404));

        course.Title = dto.Title?.Trim() ?? course.Title;
        course.Description = dto.Description ?? course.Description;
        course.ShortDescription = dto.ShortDescription ?? course.ShortDescription;
        course.WhatYouLearn = dto.WhatYouLearn ?? course.WhatYouLearn;
        course.Requirements = dto.Requirements ?? course.Requirements;
        if (!string.IsNullOrWhiteSpace(dto.Category)) course.Category = dto.Category.Trim();
        if (!string.IsNullOrWhiteSpace(dto.SubCategory)) course.SubCategory = dto.SubCategory;
        if (!string.IsNullOrWhiteSpace(dto.Level)) course.Level = dto.Level;
        if (!string.IsNullOrWhiteSpace(dto.Language)) course.Language = dto.Language;
        course.Price = dto.Price;
        course.DiscountPrice = dto.DiscountPrice;
        course.Currency = dto.Currency ?? course.Currency;
        course.IsFree = dto.IsFree || dto.Price == 0;
        if (!string.IsNullOrWhiteSpace(dto.ThumbnailUrl)) course.ThumbnailUrl = dto.ThumbnailUrl;
        if (!string.IsNullOrWhiteSpace(dto.PreviewVideoUrl)) course.PreviewVideoUrl = dto.PreviewVideoUrl;
        course.IsPublished = dto.IsPublished;

        if (course.Instructor != null && !string.IsNullOrWhiteSpace(dto.InstructorName))
        {
            course.Instructor.DisplayName = dto.InstructorName;
        }

        // Update Video Lectures
        if (dto.VideoLectures != null)
        {
            _context.CourseLectures.RemoveRange(course.Sections.SelectMany(s => s.Lectures));
            _context.CourseSections.RemoveRange(course.Sections);

            var section = new CourseSection
            {
                CourseId = course.Id,
                Title = "1. Kurs Dərsləri və Video Dərslikləri",
                Description = "Bütün video dərslər və materiallar",
                Order = 1
            };

            int order = 1;
            foreach (var vl in dto.VideoLectures)
            {
                section.Lectures.Add(new CourseLecture
                {
                    Title = !string.IsNullOrWhiteSpace(vl.Title) ? vl.Title : $"Dərs {order}",
                    Description = vl.Description ?? string.Empty,
                    VideoUrl = vl.VideoUrl ?? string.Empty,
                    ResourceUrl = vl.ResourceUrl ?? string.Empty,
                    DurationMinutes = vl.DurationMinutes > 0 ? vl.DurationMinutes : 15,
                    Order = order++,
                    IsFree = vl.IsFree,
                    LectureType = "Video"
                });
            }
            course.Sections.Add(section);
            course.TotalLectures = section.Lectures.Count;
            course.TotalDurationMinutes = section.Lectures.Sum(l => l.DurationMinutes);
        }

        // Update 31 Languages Translations
        _context.CourseTranslations.RemoveRange(course.Translations);

        var languages = await _languageReadRepository.GetAllAsync(x => x.IsActive && !x.IsDeleted);
        var baseLangCode = dto.BaseLanguageCode ?? "az";

        course.Translations.Add(new CourseTranslation
        {
            LanguageCode = baseLangCode,
            Title = course.Title,
            Description = course.Description,
            ShortDescription = course.ShortDescription,
            WhatYouLearn = course.WhatYouLearn,
            Requirements = course.Requirements
        });

        foreach (var l in languages.Where(x => x.Code != baseLangCode))
        {
            try
            {
                string transTitle = await _translationAiService.TranslateAsync(course.Title, l.Name);
                string transDesc = !string.IsNullOrWhiteSpace(course.Description)
                    ? await _translationAiService.TranslateAsync(course.Description, l.Name)
                    : string.Empty;

                course.Translations.Add(new CourseTranslation
                {
                    LanguageCode = l.Code,
                    Title = !string.IsNullOrWhiteSpace(transTitle) ? transTitle : course.Title,
                    Description = !string.IsNullOrWhiteSpace(transDesc) ? transDesc : course.Description,
                    ShortDescription = course.ShortDescription,
                    WhatYouLearn = course.WhatYouLearn,
                    Requirements = course.Requirements
                });
            }
            catch
            {
                course.Translations.Add(new CourseTranslation
                {
                    LanguageCode = l.Code,
                    Title = course.Title,
                    Description = course.Description,
                    ShortDescription = course.ShortDescription,
                    WhatYouLearn = course.WhatYouLearn,
                    Requirements = course.Requirements
                });
            }
        }

        await _context.SaveChangesAsync();
        return await GetCourse(course.Id, baseLangCode);
    }

    /// <summary>
    /// Delete course by ID
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        if (course == null)
            return NotFound(ApiResponse<string>.ErrorResponse("Kurs tapılmadı.", 404));

        course.IsDeleted = true;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Kurs uğurla silindi."));
    }
}
