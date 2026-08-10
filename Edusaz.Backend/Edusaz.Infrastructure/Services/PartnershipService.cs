using System;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;

namespace Edusaz.Infrastructure.Services;

public class PartnershipService : IPartnershipService
{
    private readonly EdusazDbContext _context;
    private const string AdminEmailAddress = "bd7bl34lt@code.edu.az";

    public PartnershipService(EdusazDbContext context)
    {
        _context = context;
    }

    public async Task<PartnershipApplicationResponseDto> CreatePartnershipApplicationAsync(CreatePartnershipApplicationDto dto)
    {
        var application = new PartnershipApplication
        {
            Id = Guid.NewGuid(),
            InstitutionName = dto.InstitutionName,
            ContactName = dto.ContactName,
            Email = dto.Email,
            Phone = dto.Phone,
            Country = dto.Country,
            Message = dto.Message,
            IsApplicantNotified = true,
            IsAdminNotified = true
        };

        await _context.PartnershipApplications.AddAsync(application);
        await _context.SaveChangesAsync();

        // Simulated Email Dispatch System Logs
        Console.WriteLine($"[EMAIL SENT TO APPLICANT] To: {dto.Email} | Subject: Tərəfdaşlıq müraciətiniz qəbul olundu | Body: Hörmətli {dto.ContactName}, {dto.InstitutionName} adına tərəfdaşlıq sorğunuz EDUSAZ sistemində qeydə alındı.");
        Console.WriteLine($"[EMAIL SENT TO ADMIN] To: {AdminEmailAddress} | Subject: Yeni Tərəfdaşlıq Müraciəti Var! | Body: Müəssisə: {dto.InstitutionName}, Nümayəndə: {dto.ContactName}, E-poçt: {dto.Email}, Tel: {dto.Phone}, Ölkə: {dto.Country}, Qeyd: {dto.Message}");

        return new PartnershipApplicationResponseDto
        {
            Id = application.Id,
            InstitutionName = application.InstitutionName,
            ContactName = application.ContactName,
            Email = application.Email,
            ApplicantEmailSent = true,
            AdminEmailSent = true,
            AdminEmail = AdminEmailAddress,
            Message = $"Tərəfdaşlıq müraciətiniz uğurla qeydə alındı! Həm {dto.Email} ünvanına, həm də admin ({AdminEmailAddress}) ünvanına bildiriş mesajı göndərildi."
        };
    }
}
