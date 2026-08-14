using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface IInstructorService
{
    // Auth
    Task<bool> RegisterInstructorAsync(InstructorRegisterDto dto);
    Task<TokenDto?> LoginInstructorAsync(InstructorLoginDto dto);

    // Profile
    Task<InstructorProfileDto?> GetProfileAsync(string email);
    Task<InstructorProfileDto> UpdateProfileAsync(string email, UpdateInstructorProfileDto dto);

    // Course CRUD
    Task<List<CourseListDto>> GetMyCoursesAsync(string email);
    Task<CourseDetailDto?> GetCourseByIdAsync(Guid courseId);
    Task<CourseDetailDto> CreateCourseAsync(string email, CreateCourseDto dto);
    Task<CourseDetailDto?> UpdateCourseAsync(string email, Guid courseId, UpdateCourseDto dto);
    Task<bool> DeleteCourseAsync(string email, Guid courseId);
    Task<bool> PublishCourseAsync(string email, Guid courseId, bool publish);

    // Students & Analytics
    Task<List<CourseEnrollmentDto>> GetCourseStudentsAsync(string email, Guid courseId);
    Task<InstructorAnalyticsDto> GetAnalyticsAsync(string email);

    // Public
    Task<List<CourseListDto>> GetPublishedCoursesAsync(string? lang, string? category, string? search);
    Task<CourseDetailDto?> GetPublishedCourseByIdAsync(Guid courseId, string lang);
}
