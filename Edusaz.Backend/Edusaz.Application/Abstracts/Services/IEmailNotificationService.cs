using System;
using System.Threading.Tasks;

namespace Edusaz.Application.Abstracts.Services;

public interface IEmailNotificationService
{
    Task SendCourseApplicationEmailsAsync(
        string studentName,
        string studentEmail,
        string studentPhone,
        string originCountry,
        string courseTitle,
        string? instructorName,
        string? instructorEmail,
        bool isSuperAdminCreated);

    Task SendUniversityApplicationEmailsAsync(
        string studentName,
        string studentEmail,
        string studentPhone,
        string originCountry,
        string universityName,
        string? programName,
        string? universityAdminEmail);
}
