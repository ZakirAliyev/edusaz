using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface IScholarshipService
{
    Task<List<ScholarshipDto>> GetAllScholarshipsAsync(string lang = "en", Guid? countryId = null, Guid? universityId = null);
    Task<ScholarshipDto?> GetScholarshipByIdAsync(Guid id, string lang = "en");
    Task<ScholarshipDto> CreateScholarshipAsync(CreateScholarshipDto dto);
    Task<ScholarshipDto> UpdateScholarshipAsync(Guid id, CreateScholarshipDto dto);
    Task<bool> DeleteScholarshipAsync(Guid id);
    Task<CheckEligibilityResponseDto> CheckEligibilityAsync(CheckEligibilityRequestDto dto);
    Task<bool> SubscribeNotificationAsync(SubscribeNotificationRequestDto dto);
}
