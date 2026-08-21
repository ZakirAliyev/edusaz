using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Edusaz.Infrastructure.Services;

public class EmailNotificationService : IEmailNotificationService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(IConfiguration configuration, ILogger<EmailNotificationService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendCourseApplicationEmailsAsync(
        string studentName,
        string studentEmail,
        string studentPhone,
        string originCountry,
        string courseTitle,
        string? instructorName,
        string? instructorEmail,
        bool isSuperAdminCreated)
    {
        var superAdminEmail = _configuration["EmailSettings:SuperAdminEmail"] ?? "superadmin@edu.saz";

        // 1. Email to Student
        if (!string.IsNullOrWhiteSpace(studentEmail))
        {
            var studentSubject = $"🎓 Müraciətiniz Qəbul Olundu: {courseTitle}";
            var studentBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;'>
                    <div style='background: linear-gradient(135deg, #7A5CFF, #6366f1); padding: 20px; border-radius: 12px; text-align: center; color: white;'>
                        <h1 style='margin: 0; font-size: 24px;'>EduSaz Kurs Platforması</h1>
                    </div>
                    <div style='background: white; padding: 24px; border-radius: 12px; margin-top: 16px; border: 1px solid #e2e8f0;'>
                        <h2 style='color: #0f172a; margin-top: 0;'>Hörmətli {studentName},</h2>
                        <p style='color: #334155; line-height: 1.6;'>
                            <strong>""{courseTitle}""</strong> kursuna etdiyiniz müraciət uğurla qeydə alındı! 🎉
                        </p>
                        <div style='background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;'>
                            <p style='margin: 4px 0; color: #475569;'><strong>Kurs:</strong> {courseTitle}</p>
                            <p style='margin: 4px 0; color: #475569;'><strong>Tələbə:</strong> {studentName}</p>
                            <p style='margin: 4px 0; color: #475569;'><strong>Tarix:</strong> {DateTime.UtcNow:dd.MM.yyyy HH:mm} UTC</p>
                            <p style='margin: 4px 0; color: #10b981;'><strong>Status:</strong> Qeydə Alındı (Applied)</p>
                        </div>
                        <p style='color: #64748b; font-size: 14px;'>
                            Müəllim və admin heyəti müraciətinizi nəzərdən keçirir. Əlavə sualınız olarsa, bizimlə əlaqə saxlaya bilərsiniz.
                        </p>
                    </div>
                </div>";

            await SendEmailAsync(studentEmail, studentSubject, studentBody);
        }

        // 2. Email to SuperAdmin
        var adminSubject = $"🚀 Yeni Kurs Müraciəti: {courseTitle} — {studentName}";
        var adminBody = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; border-radius: 16px; color: #f1f5f9;'>
                <h2 style='color: #38bdf8; margin-top: 0;'>🛡️ SuperAdmin Bildirişi: Yeni Kurs Müraciəti</h2>
                <div style='background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);'>
                    <p style='margin: 6px 0;'><strong>Kurs:</strong> {courseTitle}</p>
                    <p style='margin: 6px 0;'><strong>Tələbə:</strong> {studentName}</p>
                    <p style='margin: 6px 0;'><strong>E-poçt:</strong> {studentEmail}</p>
                    <p style='margin: 6px 0;'><strong>Telefon:</strong> {studentPhone}</p>
                    <p style='margin: 6px 0;'><strong>Mənşə Ölkə:</strong> {originCountry}</p>
                    <p style='margin: 6px 0;'><strong>Müəllif:</strong> {(isSuperAdminCreated ? "SuperAdmin" : instructorName ?? "Müəllim")}</p>
                    <p style='margin: 6px 0;'><strong>Tarix:</strong> {DateTime.UtcNow:dd.MM.yyyy HH:mm} UTC</p>
                </div>
            </div>";

        await SendEmailAsync(superAdminEmail, adminSubject, adminBody);

        // 3. Email to Teacher / Course Center (if not SuperAdmin-created)
        if (!isSuperAdminCreated && !string.IsNullOrWhiteSpace(instructorEmail) && instructorEmail != superAdminEmail)
        {
            var instructorSubject = $"🎓 Kursunuza Yeni Tələbə Müraciət Etdi: {courseTitle}";
            var instructorBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;'>
                    <div style='background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px; text-align: center; color: white;'>
                        <h2 style='margin: 0;'>Müəllim Paneli Bildirişi</h2>
                    </div>
                    <div style='background: white; padding: 24px; border-radius: 12px; margin-top: 16px; border: 1px solid #e2e8f0;'>
                        <h3 style='color: #0f172a; margin-top: 0;'>Hörmətli {instructorName ?? "Müəllim"},</h3>
                        <p style='color: #334155;'>
                            Sizin <strong>""{courseTitle}""</strong> kursunuza yeni tələbə müraciət etmişdir!
                        </p>
                        <div style='background: #f1f5f9; padding: 16px; border-radius: 8px;'>
                            <p style='margin: 4px 0;'><strong>Tələbə:</strong> {studentName}</p>
                            <p style='margin: 4px 0;'><strong>E-poçt:</strong> {studentEmail}</p>
                            <p style='margin: 4px 0;'><strong>Telefon:</strong> {studentPhone}</p>
                            <p style='margin: 4px 0;'><strong>Mənşə:</strong> {originCountry}</p>
                        </div>
                    </div>
                </div>";

            await SendEmailAsync(instructorEmail, instructorSubject, instructorBody);
        }
    }

    public async Task SendUniversityApplicationEmailsAsync(
        string studentName,
        string studentEmail,
        string studentPhone,
        string originCountry,
        string universityName,
        string? programName,
        string? universityAdminEmail)
    {
        var superAdminEmail = _configuration["EmailSettings:SuperAdminEmail"] ?? "superadmin@edu.saz";

        // Student confirmation
        if (!string.IsNullOrWhiteSpace(studentEmail))
        {
            var studentSubject = $"🏛️ Universitet Müraciətiniz Qəbul Olundu: {universityName}";
            var studentBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px;'>
                    <h2 style='color: #0f172a;'>Hörmətli {studentName},</h2>
                    <p style='color: #334155;'>
                        <strong>{universityName}</strong> {(string.IsNullOrEmpty(programName) ? "" : $"({programName})")} müəssisəsinə müraciətiniz qeydə alındı! 🎉
                    </p>
                </div>";

            await SendEmailAsync(studentEmail, studentSubject, studentBody);
        }

        // SuperAdmin notification
        var adminSubject = $"🚀 Yeni Universitet Müraciəti: {universityName} — {studentName}";
        var adminBody = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: white;'>
                <h2>Yeni Universitet Müraciəti</h2>
                <p>Universitet: {universityName}</p>
                <p>İxtisas: {programName}</p>
                <p>Tələbə: {studentName} ({studentEmail}, {studentPhone})</p>
            </div>";

        await SendEmailAsync(superAdminEmail, adminSubject, adminBody);

        // University Admin notification
        if (!string.IsNullOrWhiteSpace(universityAdminEmail))
        {
            var uniSubject = $"🎓 Universitetinizə Yeni Tələbə Müraciət Etdi: {studentName}";
            var uniBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;'>
                    <h2>Yeni Tələbə Müraciəti</h2>
                    <p>Tələbə: {studentName} ({studentEmail}, {studentPhone})</p>
                    <p>İxtisas: {programName ?? "Ümumi"}</p>
                </div>";

            await SendEmailAsync(universityAdminEmail, uniSubject, uniBody);
        }
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var host = _configuration["EmailSettings:SmtpHost"];
            var portStr = _configuration["EmailSettings:SmtpPort"];
            var user = _configuration["EmailSettings:SmtpUser"];
            var pass = _configuration["EmailSettings:SmtpPass"];
            var fromEmail = _configuration["EmailSettings:FromEmail"] ?? "no-reply@edusaz.com";

            if (!string.IsNullOrWhiteSpace(host) && int.TryParse(portStr, out int port))
            {
                using var client = new SmtpClient(host, port)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(user, pass)
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, "EduSaz Platform"),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("[EMAIL SENT] Successfully dispatched to {ToEmail}: {Subject}", toEmail, subject);
            }
            else
            {
                _logger.LogInformation("[EMAIL DISPATCH SIMULATED] To: {ToEmail} | Subject: {Subject}", toEmail, subject);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[EMAIL DISPATCH WARNING] Could not send live email to {ToEmail}: {Message}", toEmail, ex.Message);
        }
    }
}
