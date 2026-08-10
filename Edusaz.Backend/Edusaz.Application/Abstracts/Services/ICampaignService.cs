using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface ICampaignService
{
    Task<List<CampaignDto>> GetAllCampaignsAsync(string lang = "en", Guid? universityId = null);
    Task<CampaignDto?> GetCampaignByIdAsync(Guid id, string lang = "en");
    Task<CampaignDto> CreateCampaignAsync(CreateCampaignDto dto);
    Task<CampaignDto> UpdateCampaignAsync(Guid id, CreateCampaignDto dto);
    Task<bool> DeleteCampaignAsync(Guid id);
}
