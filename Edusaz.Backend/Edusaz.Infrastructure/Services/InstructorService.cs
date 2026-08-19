using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Edusaz.Infrastructure.Services;

public class InstructorService : IInstructorService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly EdusazDbContext _context;
    private readonly IConfiguration _configuration;

    public InstructorService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        EdusazDbContext context,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _configuration = configuration;
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    public async Task<bool> RegisterInstructorAsync(InstructorRegisterDto dto)
    {
        // Create user
        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded) return false;

        await _userManager.AddToRoleAsync(user, "Instructor");

        // Create linked instructor profile
        var instructor = new Instructor
        {
            UserId = user.Id,
            DisplayName = string.IsNullOrEmpty(dto.DisplayName) ? $"{dto.FirstName} {dto.LastName}" : dto.DisplayName,
            Expertise = dto.Expertise,
            IsApproved = true
        };

        _context.Instructors.Add(instructor);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<TokenDto?> LoginInstructorAsync(InstructorLoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return null;

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded) return null;

        // Verify instructor profile exists
        var instructor = await _context.Instructors.FirstOrDefaultAsync(i => i.UserId == user.Id);
        if (instructor == null) return null;

        return GenerateToken(user, "Instructor");
    }

    private TokenDto GenerateToken(User user, string role)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:SecretKey"] ?? "edusaz_super_secret_key_1234567890"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiration = DateTime.UtcNow.AddDays(7);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiration,
            signingCredentials: creds);

        return new TokenDto
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            Expiration = expiration,
            Role = role
        };
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    public async Task<InstructorProfileDto?> GetProfileAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return null;

        var instructor = await _context.Instructors
            .Include(i => i.Courses)
            .FirstOrDefaultAsync(i => i.UserId == user.Id);

        if (instructor == null) return null;

        return MapToProfileDto(user, instructor);
    }

    public async Task<InstructorProfileDto> UpdateProfileAsync(string email, UpdateInstructorProfileDto dto)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) throw new Exception("User not found");

        var instructor = await _context.Instructors
            .Include(i => i.Courses)
            .FirstOrDefaultAsync(i => i.UserId == user.Id);

        if (instructor == null) throw new Exception("Instructor profile not found");

        if (dto.DisplayName != null) instructor.DisplayName = dto.DisplayName;
        if (dto.Bio != null) instructor.Bio = dto.Bio;
        if (dto.Expertise != null) instructor.Expertise = dto.Expertise;
        if (dto.AvatarUrl != null) instructor.AvatarUrl = dto.AvatarUrl;
        if (dto.Website != null) instructor.Website = dto.Website;
        if (dto.LinkedIn != null) instructor.LinkedIn = dto.LinkedIn;
        if (dto.YouTube != null) instructor.YouTube = dto.YouTube;

        await _context.SaveChangesAsync();
        return MapToProfileDto(user, instructor);
    }

    private InstructorProfileDto MapToProfileDto(User user, Instructor instructor)
    {
        return new InstructorProfileDto
        {
            Id = instructor.Id,
            UserId = instructor.UserId,
            Email = user.Email ?? "",
            FirstName = user.FirstName,
            LastName = user.LastName,
            DisplayName = instructor.DisplayName,
            Bio = instructor.Bio,
            Expertise = instructor.Expertise,
            AvatarUrl = instructor.AvatarUrl,
            Website = instructor.Website,
            LinkedIn = instructor.LinkedIn,
            YouTube = instructor.YouTube,
            IsApproved = instructor.IsApproved,
            TotalStudents = instructor.TotalStudents,
            Rating = instructor.Rating,
            TotalReviews = instructor.TotalReviews,
            TotalRevenue = instructor.TotalRevenue,
            TotalCourses = instructor.Courses?.Count ?? 0
        };
    }

    // ── Course CRUD ───────────────────────────────────────────────────────────

    public async Task<List<CourseListDto>> GetMyCoursesAsync(string email)
    {
        var instructor = await GetInstructorByEmail(email);
        if (instructor == null) return new List<CourseListDto>();

        var courses = await _context.Courses
            .Include(c => c.Enrollments)
            .Where(c => c.InstructorId == instructor.Id && !c.IsDeleted)
            .OrderByDescending(c => c.CreatedDate)
            .ToListAsync();

        return courses.Select(MapToCourseListDto).ToList();
    }

    public async Task<CourseDetailDto?> GetCourseByIdAsync(Guid courseId)
    {
        var course = await _context.Courses
            .Include(c => c.Instructor).ThenInclude(i => i.User)
            .Include(c => c.Sections.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.Lectures.Where(l => !l.IsDeleted))
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

        if (course == null) return null;
        return MapToCourseDetailDto(course);
    }

    public async Task<CourseDetailDto> CreateCourseAsync(string email, CreateCourseDto dto)
    {
        var instructor = await GetInstructorByEmail(email);
        if (instructor == null) throw new Exception("Instructor not found");

        var course = new Course
        {
            InstructorId = instructor.Id,
            Title = dto.Title,
            Description = dto.Description,
            ShortDescription = dto.ShortDescription,
            WhatYouLearn = dto.WhatYouLearn,
            Requirements = dto.Requirements,
            Category = dto.Category,
            SubCategory = dto.SubCategory,
            Tags = dto.Tags,
            Language = dto.Language,
            Level = dto.Level,
            Price = dto.Price,
            DiscountPrice = dto.DiscountPrice,
            Currency = dto.Currency,
            IsFree = dto.IsFree,
            ThumbnailUrl = dto.ThumbnailUrl,
            PreviewVideoUrl = dto.PreviewVideoUrl,
            IsPublished = false,
            IsApproved = true
        };

        // Add sections & lectures
        if (dto.Sections != null)
        {
            var order = 0;
            foreach (var sectionDto in dto.Sections)
            {
                var section = new CourseSection
                {
                    Title = sectionDto.Title,
                    Description = sectionDto.Description,
                    Order = order++
                };
                var lectOrder = 0;
                foreach (var lectDto in sectionDto.Lectures)
                {
                    section.Lectures.Add(new CourseLecture
                    {
                        Title = lectDto.Title,
                        Description = lectDto.Description,
                        VideoUrl = lectDto.VideoUrl,
                        ResourceUrl = lectDto.ResourceUrl,
                        DurationMinutes = lectDto.DurationMinutes,
                        Order = lectOrder++,
                        IsFree = lectDto.IsFree,
                        LectureType = lectDto.LectureType
                    });
                }
                course.Sections.Add(section);
            }
        }

        // Add translations
        if (dto.Translations != null)
        {
            foreach (var (langCode, trans) in dto.Translations)
            {
                course.Translations.Add(new CourseTranslation
                {
                    LanguageCode = langCode,
                    Title = trans.Title,
                    Description = trans.Description,
                    ShortDescription = trans.ShortDescription,
                    WhatYouLearn = trans.WhatYouLearn,
                    Requirements = trans.Requirements
                });
            }
        }

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return (await GetCourseByIdAsync(course.Id))!;
    }

    public async Task<CourseDetailDto?> UpdateCourseAsync(string email, Guid courseId, UpdateCourseDto dto)
    {
        var instructor = await GetInstructorByEmail(email);
        if (instructor == null) return null;

        var course = await _context.Courses
            .Include(c => c.Sections).ThenInclude(s => s.Lectures)
            .Include(c => c.Translations)
            .FirstOrDefaultAsync(c => c.Id == courseId && c.InstructorId == instructor.Id);

        if (course == null) return null;

        course.Title = dto.Title;
        course.Description = dto.Description;
        course.ShortDescription = dto.ShortDescription;
        course.WhatYouLearn = dto.WhatYouLearn;
        course.Requirements = dto.Requirements;
        course.Category = dto.Category;
        course.SubCategory = dto.SubCategory;
        course.Tags = dto.Tags;
        course.Language = dto.Language;
        course.Level = dto.Level;
        course.Price = dto.Price;
        course.DiscountPrice = dto.DiscountPrice;
        course.Currency = dto.Currency;
        course.IsFree = dto.IsFree;
        course.ThumbnailUrl = dto.ThumbnailUrl;
        course.PreviewVideoUrl = dto.PreviewVideoUrl;
        course.IsPublished = dto.IsPublished;

        // Update translations
        if (dto.Translations != null)
        {
            _context.CourseTranslations.RemoveRange(course.Translations);
            foreach (var (langCode, trans) in dto.Translations)
            {
                course.Translations.Add(new CourseTranslation
                {
                    CourseId = course.Id,
                    LanguageCode = langCode,
                    Title = trans.Title,
                    Description = trans.Description,
                    ShortDescription = trans.ShortDescription,
                    WhatYouLearn = trans.WhatYouLearn,
                    Requirements = trans.Requirements
                });
            }
        }

        await _context.SaveChangesAsync();
        return await GetCourseByIdAsync(course.Id);
    }

    public async Task<bool> DeleteCourseAsync(string email, Guid courseId)
    {
        var instructor = await GetInstructorByEmail(email);
        if (instructor == null) return false;

        var course = await _context.Courses.FirstOrDefaultAsync(
            c => c.Id == courseId && c.InstructorId == instructor.Id);

        if (course == null) return false;

        course.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> PublishCourseAsync(string email, Guid courseId, bool publish)
    {
        var instructor = await GetInstructorByEmail(email);
        if (instructor == null) return false;

        var course = await _context.Courses.FirstOrDefaultAsync(
            c => c.Id == courseId && c.InstructorId == instructor.Id);

        if (course == null) return false;

        course.IsPublished = publish;
        await _context.SaveChangesAsync();
        return true;
    }

    // ── Students & Analytics ──────────────────────────────────────────────────

    public async Task<List<CourseEnrollmentDto>> GetCourseStudentsAsync(string email, Guid courseId)
    {
        var instructor = await GetInstructorByEmail(email);
        if (instructor == null) return new List<CourseEnrollmentDto>();

        var enrollments = await _context.CourseEnrollments
            .Where(e => e.CourseId == courseId && !e.IsDeleted)
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync();

        return enrollments.Select(e => new CourseEnrollmentDto
        {
            Id = e.Id,
            StudentEmail = e.StudentEmail,
            StudentName = e.StudentName,
            PricePaid = e.PricePaid,
            EnrolledAt = e.EnrolledAt,
            Status = e.Status,
            Progress = e.Progress
        }).ToList();
    }

    public async Task<InstructorAnalyticsDto> GetAnalyticsAsync(string email)
    {
        var instructor = await GetInstructorByEmail(email);
        if (instructor == null)
            return new InstructorAnalyticsDto();

        var courses = await _context.Courses
            .Include(c => c.Enrollments)
            .Where(c => c.InstructorId == instructor.Id && !c.IsDeleted)
            .ToListAsync();

        var allEnrollments = courses.SelectMany(c => c.Enrollments).ToList();
        var totalRevenue = allEnrollments.Sum(e => e.PricePaid);

        var topCourses = courses
            .OrderByDescending(c => c.TotalStudents)
            .Take(5)
            .Select(c => new CourseAnalyticsDto
            {
                CourseId = c.Id,
                CourseTitle = c.Title,
                Enrollments = c.Enrollments.Count,
                Revenue = c.Enrollments.Sum(e => e.PricePaid),
                Rating = c.Rating
            }).ToList();

        // Generate 6-month revenue chart
        var monthlyRevenue = new List<MonthlyRevenueDto>();
        for (int i = 5; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddMonths(-i);
            var monthEnrollments = allEnrollments
                .Where(e => e.EnrolledAt.Year == date.Year && e.EnrolledAt.Month == date.Month)
                .ToList();
            monthlyRevenue.Add(new MonthlyRevenueDto
            {
                Month = date.ToString("MMM yyyy"),
                Revenue = monthEnrollments.Sum(e => e.PricePaid),
                Enrollments = monthEnrollments.Count
            });
        }

        return new InstructorAnalyticsDto
        {
            TotalCourses = courses.Count,
            PublishedCourses = courses.Count(c => c.IsPublished),
            TotalStudents = allEnrollments.Count,
            TotalRevenue = totalRevenue,
            AverageRating = courses.Any(c => c.Rating > 0) ? courses.Where(c => c.Rating > 0).Average(c => c.Rating) : 0,
            TotalReviews = courses.Sum(c => c.ReviewCount),
            TopCourses = topCourses,
            MonthlyRevenue = monthlyRevenue
        };
    }

    // ── Public Endpoints ──────────────────────────────────────────────────────

    public async Task<List<CourseListDto>> GetPublishedCoursesAsync(string? lang, string? category, string? search)
    {
        var query = _context.Courses
            .Include(c => c.Instructor).ThenInclude(i => i.User)
            .Include(c => c.Enrollments)
            .Include(c => c.Translations)
            .Where(c => c.IsPublished && c.IsApproved && !c.IsDeleted);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(c => c.Category.ToLower().Contains(category.ToLower()));

        if (!string.IsNullOrEmpty(search))
            query = query.Where(c => c.Title.ToLower().Contains(search.ToLower()) ||
                                      c.ShortDescription.ToLower().Contains(search.ToLower()));

        var courses = await query.OrderByDescending(c => c.TotalStudents).ToListAsync();

        if (!string.IsNullOrEmpty(lang) && lang != "en")
        {
            return courses.Select(c =>
            {
                var trans = c.Translations.FirstOrDefault(t => t.LanguageCode == lang);
                var dto = MapToCourseListDto(c);
                if (trans != null)
                {
                    if (!string.IsNullOrWhiteSpace(trans.Title)) dto.Title = trans.Title;
                    if (!string.IsNullOrWhiteSpace(trans.ShortDescription)) dto.ShortDescription = trans.ShortDescription;
                }
                return dto;
            }).ToList();
        }

        return courses.Select(MapToCourseListDto).ToList();
    }

    public async Task<CourseDetailDto?> GetPublishedCourseByIdAsync(Guid courseId, string lang)
    {
        var course = await _context.Courses
            .Include(c => c.Instructor).ThenInclude(i => i.User)
            .Include(c => c.Sections.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.Lectures.Where(l => !l.IsDeleted))
            .Include(c => c.Enrollments)
            .Include(c => c.Translations)
            .FirstOrDefaultAsync(c => c.Id == courseId && c.IsPublished && !c.IsDeleted);

        if (course == null) return null;

        var dto = MapToCourseDetailDto(course);

        if (!string.IsNullOrEmpty(lang) && lang != "en")
        {
            var trans = course.Translations.FirstOrDefault(t => t.LanguageCode == lang);
            if (trans != null)
            {
                dto.Title = trans.Title;
                dto.Description = trans.Description;
                dto.ShortDescription = trans.ShortDescription;
                dto.WhatYouLearn = trans.WhatYouLearn;
                dto.Requirements = trans.Requirements;
            }
        }

        return dto;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Instructor?> GetInstructorByEmail(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return null;
        return await _context.Instructors.FirstOrDefaultAsync(i => i.UserId == user.Id);
    }

    private CourseListDto MapToCourseListDto(Course c)
    {
        return new CourseListDto
        {
            Id = c.Id,
            Title = c.Title,
            ShortDescription = c.ShortDescription,
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
            Rating = c.Rating,
            ReviewCount = c.ReviewCount,
            TotalLectures = c.TotalLectures,
            InstructorName = c.Instructor?.DisplayName ?? "",
            InstructorAvatar = c.Instructor?.AvatarUrl ?? "",
            CreatedDate = c.CreatedDate
        };
    }

    private CourseDetailDto MapToCourseDetailDto(Course c)
    {
        var dto = new CourseDetailDto
        {
            Id = c.Id,
            Title = c.Title,
            ShortDescription = c.ShortDescription,
            Description = c.Description,
            WhatYouLearn = c.WhatYouLearn,
            Requirements = c.Requirements,
            Category = c.Category,
            SubCategory = c.SubCategory,
            Tags = c.Tags,
            Level = c.Level,
            Language = c.Language,
            Price = c.Price,
            DiscountPrice = c.DiscountPrice,
            IsFree = c.IsFree,
            ThumbnailUrl = c.ThumbnailUrl,
            PreviewVideoUrl = c.PreviewVideoUrl,
            IsPublished = c.IsPublished,
            IsFeatured = c.IsFeatured,
            TotalStudents = c.Enrollments?.Count ?? c.TotalStudents,
            Rating = c.Rating,
            ReviewCount = c.ReviewCount,
            TotalLectures = c.TotalLectures,
            InstructorName = c.Instructor?.DisplayName ?? "",
            InstructorAvatar = c.Instructor?.AvatarUrl ?? "",
            CreatedDate = c.CreatedDate,
            Sections = c.Sections?
                .OrderBy(s => s.Order)
                .Select(s => new CourseSectionDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Description = s.Description,
                    Order = s.Order,
                    Lectures = s.Lectures?
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
                        }).ToList() ?? new List<CourseLectureDto>()
                }).ToList() ?? new List<CourseSectionDto>()
        };
        return dto;
    }
}
